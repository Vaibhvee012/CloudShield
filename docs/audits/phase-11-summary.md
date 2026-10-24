# Phase 11 summary: frontend and dashboard completion

Status: complete for the items below. Verified by build, lint and manual
click-through against a local backend with seeded and real data, not against
a live scan of a fresh AWS account (Phase 9 is still open).

## What was wrong (from the 11.0 audit)
- The Dashboard started with made-up numbers and kept them when the API failed.
  It also had a fake score history, fake activity feed, "Auto remediation" card
  and several hardcoded claims such as "Systems operational".
- Two API files existed. TypeScript checked api.ts while Vite ran api.js.
- No 401 handling, no Sign out, role fell back to "Administrator".
- The backend reported a score of 100 for users with no data.
- No empty states; error messages from the server were thrown away.
- AI Assistant used a client-side keyword matcher, not the AI backend.
- Audit Logs and Settings were placeholders with fake controls.
- Sidebar always said "System Protected"; the layout had no mobile mode.

## What was changed
| Area | Change |
|---|---|
| API layer | One api.ts client: server error messages, network error message, 401 clears the session and redirects to login with a notice |
| Auth | Sign out (app header and landing nav), session-expired notice, token debug logs removed |
| Backend | /api/security returns state (NOT_CONNECTED, NO_DATA, READY) and a null score when there is nothing to score |
| Shared UI | useApiData hook, PageLoading, PageError (with retry), PageEmpty, ConnectionEmpty |
| Dashboard | Real loading, empty and error states; severity chart from real data; real recent activity from the audit log; AI insight with safe rendering and a working forced refresh; fake sections removed |
| Resources, Findings, Remediation, Security Score | Shared states; empty messages depend on whether AWS is connected and scanned; Security Score no longer shows 0 or Critical for new users |
| AI Assistant | Answers via POST /api/ai/chat; disabled until AWS is connected and scanned; rate limit and server errors shown in the chat; safe markdown rendering |
| Audit Logs | Real events from /api/audit-logs, outcome and activity filters, load more |
| Settings | Removed fake toggles and status; real account details; read-only list of AWS connections |
| Layout | Mobile drawer menu, responsive header, sidebar status reflects the real account state |
| Public pages | Working landing page plus starter Platform, Security and Documentation pages |
| Quality | tsc build and eslint both clean (including the React hooks rules) |

## How it was verified
- `npm run build` and `npm run lint` pass with no errors or warnings.
- Backend regression suite `npm run check:isolation`: 50 checks, including
  the new /security state check.
- Manual: new account versus data-owner account on every page, server-down
  error and retry, garbage token redirect, sign out, phone-width layout.

## Not yet verified
- No automated frontend tests exist yet (Phase 12).
- Behaviour with a fresh, real AWS connection and first scan (Phase 9).
- Real-device mobile testing (only browser device emulation).
- Gemini quality and limits under sustained use.

## Known limits
- The sidebar status re-checks on every page change (one extra small request).
- The AI assistant answers each question on its own (no conversation memory).
- The Findings page lists findings but has no detail view or filters.
- The landing page dashboard mock shows sample numbers without a label.
- The production bundle is one 800 kB file.

## Deferred
| Item | Where |
|---|---|
| Change password and a /auth/me endpoint | Own list / Phase 12 |
| Disconnect an AWS account from the UI; connect flow polish | Phase 9 |
| Rate limit on /auth/login and /auth/register; re-check the user exists on every request | Phase 12 |
| Frontend tests (Vitest and Testing Library) and end-to-end flows | Phase 12 |
| Finding detail page and filters | Own list |
| Expand the Platform, Security and Documentation pages; label the landing mock as sample data | Own list |
| Remove dead code: securityScoreService.ts (different score weights), legacy global sync functions, empty aiService.ts, old getDashboardInsight in ai.controller.ts, check-isolation helper scripts | Phase 13 |
| Code splitting, deployment config, README and screenshots | Phase 13 |