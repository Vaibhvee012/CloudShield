# Phase 10 summary: AI and API ownership

Status: complete for the items below. Verified against a local database with seeded
test data, not against a live AWS account (Phase 9 is still open).

## What was wrong (from the 10.1 audit)
- No AI endpoint was scoped to the signed-in user. Every user's resources, findings and
  remediations were sent to Gemini and returned.
- The same gap existed in /api/resources, /api/findings, /api/remediation and /api/security.
- A global scheduler synced the platform owner's AWS account into rows with no owner,
  and every user could see them.
- Resource names and descriptions went into prompts unfenced.
- No rate limit, no Gemini timeout, unbounded prompt size.
- No audit logging.

## What was changed
| Area | Change |
|---|---|
| Ownership | lib/ownership.ts filters everything through AWSConnection.userId; requireUserId guard |
| AI context | buildSecurityContext(userId); capped to 25 findings and 50 resources, sorted by real severity, text sanitized |
| AI endpoints | explain and remediation return 404 for findings the user does not own |
| Data endpoints | resources, findings, remediation and security scoped to the user |
| Legacy data | Global scheduler and awsSyncJob removed; no unowned rows in the local database |
| Prompt safety | Untrusted data fenced in <data> tags, angle brackets stripped, length caps, off-topic refusal |
| Reliability | Per-user AI rate limit (10 per minute), 20s Gemini timeout, 429/503/504 mapping, model name from GEMINI_MODEL |
| Dashboard insight | NO_CONNECTION and NO_DATA states without calling Gemini; 5 minute per-user cache |
| Advisory only | Verified read-only AWS calls, no execute path, responses carry advisory: true |
| Audit log | AuditLog model; logged: AI calls, connect/sync/disconnect, register/login, denied access |
| Audit API | GET /api/audit-logs, user-scoped, paged, validated filters |

## How it was verified
Regression suite: `npm run check:isolation` (49 checks, needs the server running locally).
It creates throwaway users with fake connections, checks every data endpoint and AI
endpoint for cross-user leaks, checks 401/404 behaviour, rate limiting and audit rows, and
deletes its own data. It refuses to run against a non-local database.

Manually confirmed: dashboard AI insight with real Gemini on the owner's data; friendly
failure with an invalid GEMINI_MODEL.

## Not yet verified
- Chat, explain and remediation with real Gemini on real data (the suite never calls Gemini).
- Live AWS connection and sync (Phase 9).
- Behaviour with more than one real tenant under load.

## Known limits
- Rate limit and insight cache are in memory: reset on restart, not shared across instances.
- Prompt-injection defences reduce the risk but do not remove it.
- AI output is plain text; the dashboard shows raw markdown characters.

## Deferred
| Item | Where |
|---|---|
| Rate limit on /auth/login and /auth/register | Phase 12 |
| Re-check the user still exists on each request (deleted users keep a 1 day token) | Phase 12 |
| Single score formula (securityScoreService.ts still uses 25/15/10/5) | Phase 11 |
| Wire AI Assistant page to /api/ai/chat; render AI markdown safely | Phase 11 |
| Audit Logs page backed by /api/audit-logs | Phase 11 |
| Redirect to login on 401; send ?refresh=1 from Refresh insight | Phase 11 |
| ExternalId on AssumeRole; stop requiring platform AWS keys at boot | Phase 9 / 13 |
| Delete dead code: legacy global sync functions, empty aiService.ts, stale api.ts or api.js | Phase 13 |
| prisma/seed.ts creates unowned rows and deletes tables: do not run it | Phase 12 |