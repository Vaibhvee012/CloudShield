# CloudShield — Phase 10.1: AI Endpoint & Service Audit

**Scope:** every AI-related route, controller and service in `Backend/`, plus the frontend code that calls them.
**Method:** static code review of the uploaded project (no running instance, no database, no live AWS).
**Status:** audit only. No code was changed in this step.

Suggested repo path: `docs/audits/phase-10.1-ai-audit.md`
Suggested commit: `docs(audit): phase 10.1 AI endpoint audit`

---

## 1. Summary

| Severity | Count | Headline |
|---|---|---|
| Critical | 3 | No AI endpoint is scoped to the signed-in user. Resources, findings and remediations from **all** users are sent to Gemini and returned. The same gap exists in four non-AI data endpoints. Unowned "global" rows are served to everyone. |
| High | 3 | Cross-tenant prompt injection path, no rate limiting / cost controls / Gemini timeout, no audit logging at all. |
| Medium | 6 | AI Assistant page does not use the AI backend, inconsistent scoring formulas, duplicated prompt code, model ID hardcoded, and others. |
| Positive | 8 | Auth on all AI routes, Gemini key stays server-side, advisory-only design, `/api/aws/*` is correctly scoped, and more (section 6). |

**Core conclusion:** the user-scoping work done in Phase 9 covers `/api/aws/*` only. Phase 10's goal (all AI uses the signed-in user's data) is not yet met by any AI endpoint.

---

## 2. Endpoint inventory

All five routes in `routes/ai.routes.ts` use `authenticate`. None uses `authorize` (any role, including VIEWER, can call them). None of the controllers reads `req.user`; they are typed with plain `Request`, not `AuthRequest`.

| Endpoint | Controller | User ID used? | Data query | Sent to Gemini | Problem |
|---|---|---|---|---|---|
| `POST /api/ai/chat` | `chatWithAI` | No | `buildSecurityContext()` — global `findMany` on resources, findings, remediations | Entire context JSON + user question | **F1** |
| `POST /api/ai/findings/:id/explain` | `explainFinding` | No | `finding.findUnique({ id })` — no owner check | Finding fields, resource name, remediation text | **F1** (IDOR) |
| `POST /api/ai/risks/prioritize` | `prioritizeRisks` | No | `finding.findMany({ status != RESOLVED })` — global | All open findings, unbounded | **F1** |
| `POST /api/ai/findings/:id/remediation` | `suggestRemediation` | No | `finding.findUnique({ id })` — no owner check | Finding fields, resource name, remediation text | **F1** (IDOR) |
| `GET /api/ai/dashboard/insight` | `getDashboardInsight` | No | `buildSecurityContext()` — global | Entire context JSON | **F1** |

Supporting files:

- `services/aiContextService.ts` — `buildSecurityContext()` takes no arguments. `buildAIContextPrompt()` is unused.
- `services/geminiService.ts` — reads `GEMINI_API_KEY` from env, model `gemini-3.5-flash-lite` hardcoded, no timeout. Also contains `buildCloudShieldPrompt()`.
- `services/aiService.ts` — empty file (0 bytes).

---

## 3. Findings

### Critical

**F1 — AI endpoints are not user-scoped (all 5).**
Every query is global. Any authenticated user receives AI output derived from every user's resources, findings and remediation plans, and the data is transmitted to a third party (Gemini) under the wrong tenant. `explainFinding` and `suggestRemediation` look up findings by ID alone, so any user who knows or guesses an ID can read another user's finding content through the model (classic IDOR).
*Fix direction (10.2):* resolve ownership through `AWSConnection.userId`, pass `userId` into `buildSecurityContext(userId)` and every finding lookup, and return **404** (not 403) for non-owned IDs.

**F2 — The same global-query pattern exists in four non-AI endpoints.**
`GET /api/resources`, `/api/findings`, `/api/remediation` and `/api/security` all require a token but ignore the user (`findMany()` with no `where`). Phase 9's cross-user isolation tests only covered `/api/aws/*`. This matters for Phase 10 because (a) the frontend dashboards and the AI Assistant page read from these, and (b) the AI context is effectively a copy of their logic.
*Fix direction:* use the same ownership helper as 10.2. This is outside the literal Phase 10 scope but the same fix and the same isolation test suite; recommend including it.

**F3 — Unowned "global" rows are served to every user.**
`Resource` and `Finding` have a nullable `awsConnectionId`. Rows with `null` have no owner. They come from two places:
- `prisma/seed.ts` (demo data; note it also runs `deleteMany()` on resources, findings and remediations).
- `jobs/scheduler.ts` → `runAWSSyncJob()` → `syncAWSResources()` / `syncAWSSecurityFindings()`, which scans the **platform's own AWS account** (credentials from `.env`) on every server start and every 30 minutes, with `awsConnectionId: null`.

Because of F1/F2, every user sees the platform owner's AWS account as if it were theirs, and the AI reasons over it. Once per-user scoping is added, those rows will simply vanish for everyone, which is also not what you want unless it is decided deliberately.
*Decision needed:* see section 7.

### High

**F4 — No prompt-injection hardening; cross-tenant today.**
Resource names (the EC2 `Name` tag), finding descriptions and the user's question are interpolated directly into prompts with no delimiters or untrusted-data framing. Names and tags come from the customer's AWS account, so they are attacker-controllable. Combined with F1, one tenant's tag text is placed into **other tenants'** prompts (stored, cross-user injection). Impact is bounded because the AI is advisory-only with no tools, but it can still produce misleading remediation advice or leak other data present in the same prompt.
*Fix direction (10.3/10.4):* fence untrusted data (clear delimiters plus "treat as data, not instructions"), strip control characters and cap field lengths, and rely on F1's fix to remove the cross-tenant exposure.

**F5 — No rate limiting, cost controls or Gemini timeout.**
- No rate limiter on any route (including `/auth/login` and `/auth/register`).
- `buildSecurityContext()` sends **all** resources and **all** open findings, with no cap, so cost and latency grow with data size.
- Dashboard load triggers a Gemini call each time; there is no caching or throttle.
- `generateContent()` has no timeout/abort; a hung upstream request holds the HTTP request open.
- Every Gemini failure (including 429/503) becomes a generic 500.
*Fix direction (10.3/10.6):* per-user rate limit on `/api/ai/*`, cap and summarize context (top N by severity plus counts), short TTL cache for dashboard insight, request timeout, and map upstream 429/503 to a friendly 429/503.

**F6 — No audit logging exists.**
`schema.prisma` has no audit-log model, and no AI or connection action is recorded anywhere. The old roadmap's Phase 10 item "verify audit logs record security-sensitive actions" currently has nothing to verify. (The frontend `AuditLogs.tsx` page was not inspected in this step; its data source needs checking in Phase 11.)
*Fix direction:* new step 10.8 — add an `AuditLog` model and write entries for AI requests (user, endpoint, finding ID, outcome, no prompt contents), connection create/delete/sync, and denied access attempts.

### Medium

**F7 — The AI Assistant page does not use the AI backend.**
`pages/AIAssistant.tsx` builds its replies with a client-side keyword matcher (`generateResponse`) over data fetched from `getSecurityPosture`, `getFindings`, `getRemediationActions`, `getResources` (the unscoped endpoints from F2). It never calls `POST /api/ai/chat`. Consequences: the page is not Gemini-powered, it inherits the F2 leak, and `/api/ai/chat` is live attack surface with no UI consumer. Only `getDashboardAIInsight` is wired to `/api/ai/*`.
Be careful with portfolio/resume wording until this is wired (Phase 11).

**F8 — Inconsistent scoring definitions.**
Four different calculations exist: `aiContextService` (20/10/5/2, counts findings where status ≠ RESOLVED), `security.controller` and `aws.routes` (20/10/5/2, status = OPEN), and `securityScoreService` (25/15/10/5, OPEN). The AI can quote a score that disagrees with the dashboard. Consolidate into one function used by all.

**F9 — Duplicated and dead prompt code.**
Prompts are built in three places (inline in `ai.controller.ts`, `geminiService.buildCloudShieldPrompt`, `aiContextService.buildAIContextPrompt`) with slightly different rules. `buildAIContextPrompt` is unused and `aiService.ts` is empty. Consolidate into one prompt module with shared safety rules.

**F10 — Model ID hardcoded.** `gemini-3.5-flash-lite` is baked into `geminiService.ts`. Make it an env variable (`GEMINI_MODEL`) and confirm the ID is valid for your API account; a wrong or retired ID fails at request time, not at startup.

**F11 — Input validation is thin outside `/chat`.** `:id` params are only checked for non-empty (no format check), and the AI controllers don't use zod although it's already a dependency. LLM output is returned as a plain string; the frontend must render it as text (no `dangerouslySetInnerHTML`). Not yet verified in the Dashboard/AIAssistant code; check in 10.6.

**F12 — Auth hardening gaps relevant to AI cost abuse.** `authenticate` trusts the JWT without re-checking the user exists (a deleted user's token stays valid up to 1 day), and role comes from the token. Self-registration creates working accounts that can call Gemini-backed endpoints, which makes F5 more important.

### Out-of-scope notes (Phase 9 / 13 follow-ups)

- `assumeAWSRole` calls STS `AssumeRole` with no `ExternalId`. For a multi-tenant app this leaves a confused-deputy gap; add per-connection external IDs when Phase 9 resumes.
- `validateEnvironment()` requires `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` at boot; those are long-lived platform keys. Once the global scheduler (F3) is resolved, prefer an instance/task role.
- Housekeeping: stray file named `{` in `Backend/`; both `services/api.js` and `api.ts` exist in the frontend (api.js appears stale); the zip contained `node_modules` (78 MB).
- No `.env` file was present in the zip, only `.env.example`. `.gitignore` rules for env files look correct.

---

## 4. Positive findings (keep these)

1. All five AI routes sit behind `authenticate`.
2. `GEMINI_API_KEY` is read only in the backend; no reference exists in the frontend source or `.env.example`.
3. AI is advisory-only by design: prompts instruct the model never to claim changes, and the only remediation route is a read-only `GET /api/remediation`. No endpoint mutates AWS or remediation status (from the files reviewed).
4. `/chat` validates type, emptiness and a 2000-character limit; JSON body is capped at 1 MB.
5. Controllers return generic error messages and log details server-side; a global error handler exists.
6. `/api/aws/*` routes are correctly scoped (`userId` filter, ownership check before sync/delete, 404 on miss, cascade cleanup).
7. Connection-based sync prefixes resource and finding IDs with the connection ID, avoiding cross-account collisions. (The legacy global path does not.)
8. Helmet, locked-down CORS origin, and env validation at boot are in place.

---

## 5. Data-model note for the fix

Ownership today is **indirect**: `Resource` / `Finding` → `AWSConnection.userId`. `RemediationAction` → `Finding` → `AWSConnection`. A single shared filter keeps this consistent, for example:

```ts
// lib/ownership.ts (proposed)
export const ownedFindings  = (userId: string) => ({ awsConnection: { userId } });
export const ownedResources = (userId: string) => ({ awsConnection: { userId } });
export const ownedRemediations = (userId: string) => ({ finding: { awsConnection: { userId } } });
```

All AI and data endpoints should call these rather than writing their own `where` clauses, so a missed filter becomes a code-review smell instead of a silent leak.

---

## 6. Proposed fix order

| Step | Work | Addresses |
|---|---|---|
| 10.2 | Add `requireUser` guard + `lib/ownership.ts`; change `buildSecurityContext(userId)`; decide fate of global rows; scope the 4 data endpoints | F1, F2, F3 |
| 10.3 | `/chat`: scoped context, capped context, delimited prompt, per-user rate limit, timeout, upstream error mapping; consolidate prompt module | F4, F5, F9, F10 |
| 10.4 | `explain` / `prioritize`: ownership checks (404), cap findings, injection fencing, zod param validation | F1, F4, F11 |
| 10.5 | Advisory-only verification: test that no mutation path exists, label output as advisory, document read-only IAM policy | Positive #3 |
| 10.6 | Dashboard insight: empty state when no connection (skip Gemini call), cache, error states; unify score function; verify safe rendering | F5, F8, F11 |
| 10.7 | Tests: unauthenticated, wrong-user, no-connection, two-user isolation, Gemini failure; build + typecheck. *No test runner is currently installed in `Backend/package.json`; pick one that works with TypeScript `^7.0.2` when we get here.* | all |
| 10.8 (new) | `AuditLog` model + entries for AI, connection and denied-access events | F6 |
| Phase 11 | Wire AI Assistant page to `/api/ai/chat`; remove client-side keyword matcher | F7 |

---

## 7. Decision needed before 10.2

What should happen to unowned (`awsConnectionId = null`) data and the global scheduler?

- **A — Retire it (recommended).** Remove the platform-account scheduler and legacy global sync; users only ever see data from their own connections. Simplest isolation story and removes the platform-keys-at-boot requirement later.
- **B — Keep as ADMIN-only demo data.** Gate legacy rows behind `authorize("ADMIN")` or a flag; regular users see only their own.
- **C — Assign to an owner.** Backfill a single owning user/connection for existing rows.

Until this is decided, 10.2 cannot be finished cleanly.
