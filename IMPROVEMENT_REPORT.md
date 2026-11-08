# OrbitX fixes and improvements

Reviewed: 2026-11-08. Application deployed from `9b439fd`; deployment notes
published in `0e855e0`.

OrbitX is live and its shared demo works. The next development effort should
prioritize backend authorization, user-specific storage, dependency updates and
request limits before enabling provider keys or collecting private user data.
Keep the existing landing-page design while addressing these issues.

## Verified deployment

| Item | Result |
| --- | --- |
| Website | https://orbitx-indol.vercel.app |
| Demo | https://orbitx-indol.vercel.app/dashboard?demo=true |
| Backend | https://orbitx-new-api-q5yf.onrender.com |
| Plans | Vercel Hobby; Render Free |
| Public routes | Homepage, dashboard and profile return HTTP 200 |
| API | Health, demo seeding, readiness and profile generation/read passed |
| Browser CORS | Production origin allowed; an unrelated origin rejected |
| Browser checks | Desktop/mobile landing, populated graph and shared profile render; no page errors observed |
| Demo graph | 24 nodes, 50 links; observed readiness 67.9 for Full Stack Developer |
| Provider configuration | Demo mode enabled; provider keys unconfigured |
| Build | Vercel production compilation, type checking and page generation succeeded |

This review combines source inspection, live smoke checks, browser checks,
small offline reproductions and an npm production dependency audit. It does
not establish live AI accuracy, multi-user safety, load capacity or successful
GitHub OAuth. No live paid inference or destructive database tests were run.

## Recommended order

P0 means address before admitting private user data or enabling metered AI.
P1 means address in the next reliability and correctness release.
P2 means improve product clarity, usability and maintainability afterward.

| ID | Priority | Fix | Main files |
| --- | --- | --- | --- |
| F01 | P0 | Update vulnerable dependencies and remove unused packages | `frontend/package.json`, `frontend/package-lock.json` |
| F02 | P0 | Enforce authentication and isolate each user's data | `backend/routes/*`, `backend/services/graph_service.py` |
| F03 | P0 | Add limits and apply demo mode consistently to AI | `backend/routes/chat.py`, `backend/services/{ai,chat,scoring,llm}_service.py` |
| F04 | P1 | Store graphs, certifications and profiles durably | `backend/services/graph_service.py`, `backend/routes/{certifications,profile}.py` |
| F05 | P1; before Neo4j | Remove database-wide destructive graph replacement | `backend/services/graph_service.py` |
| F06 | P1 | Complete OAuth/session handling and repair GitHub repo listing | `backend/routes/{auth,github}.py`, `backend/services/github_service.py` |
| F07 | P1 | Make profile IDs unique and add sharing controls | `backend/routes/profile.py` |
| F08 | P1 | Use consistent skill matching across readiness and roadmaps | `backend/routes/career.py`, `frontend/src/app/dashboard/page.tsx` |
| F09 | P1 | Keep slow provider calls off the API event loop | `backend/services/llm_service.py`, `backend/routes/chat.py` |
| F10 | P1 | Finish Vercel Git integration | Vercel project settings |
| F11 | P1 | Improve cold-start handling and mutation retries | `frontend/src/lib/api.ts`, dashboard and auth callback pages |
| F12 | P1 | Pin backend dependencies and add regression checks in CI | `backend/requirements.txt`, new CI configuration |
| F13 | P2 | Explain scoring, evidence and AI/fallback provenance honestly | Profile, Copilot, demo loader and market data |
| F14 | P2 | Improve graph readability and accessibility | Graph, tour and dashboard components |
| F15 | P2 | Finish backend branding and simplify model configuration | `backend/main.py`, `backend/services/{chat,llm}_service.py` |

## P0: security and user boundaries

### F01. Dependency audit needs action

`npm.cmd audit --omit=dev --json` flagged **19 dependency packages: 3 critical,
11 high and 5 moderate**. These counts include transitive packages. They are
package advisories, not proof that every reported attack is reachable in this
deployment. Some advisories concern Node server adapters, image optimization,
server actions or PDF APIs the current app may not use.

| Package | Locked version | Audit severity | Recommended action |
| --- | --- | --- | --- |
| Next.js | 14.2.35 | Critical | Move to a currently patched, supported release; the audit recommends 16.4.5, which requires a planned major-version migration |
| jsPDF | 2.5.2 | Critical | Upgrade with PDF export regression checks; the audit recommends 4.2.1 |
| next-auth | 4.24.13 | Critical | No frontend source imports were found; remove it if the custom FastAPI OAuth flow remains the chosen approach |
| Axios | 1.13.5 | High | Update to a patched version and verify authentication, errors and retries |
| @react-three/drei | 9.88.17 | High | Resolve its affected transitive dependencies with compatible upgrades; verify the graph and fonts |
| DOMPurify | 2.5.8, transitive | High | Resolve through the PDF dependency update and verify any HTML-processing paths |

Also review the audit's Lodash, PostCSS, redirect, multipart and source-map
findings. Refresh the lockfile intentionally, rerun the audit and production
build, and test graph interaction and PDF export. Avoid a blanket
`npm audit fix --force`, which can introduce breaking upgrades without validation.

### F02. The backend does not enforce a user boundary

[Auth](backend/routes/auth.py#L63) creates JWTs but `/auth/me` always returns
401. Protected-route dependencies and JWT verification were not found in the
graph, chat, career, certification or profile routes. The frontend sends a
Bearer token, but that alone does not establish backend authorization.

The [graph store](backend/services/graph_service.py#L7) and
[certification list](backend/routes/certifications.py#L13) are process-global.
Public demo seeding and repository analysis replace the shared graph. Two
visitors can therefore change the same data, and a profile can be generated
from another visitor's most recent graph. CORS does not stop direct HTTP clients.

Implement a verified current-user/session dependency, assign an owner to each
graph, certification and saved profile, and authorize every read and write.
Keep bundled demo data read-only or scoped to an isolated demo session.

**Acceptance:** user A cannot read or overwrite user B's data; an anonymous
request cannot access private data; opening the demo cannot reset a signed-in
user's graph.

### F03. Request limits and demo-mode handling are incomplete

[Skill extraction](backend/services/ai_service.py#L31) checks demo mode.
[Chat](backend/services/chat_service.py#L162) and
[what-if](backend/services/scoring_service.py#L68) can still reach a configured
provider. Adding a key while leaving `DEMO_MODE=true` can therefore activate
inference through public endpoints. No route-level request limiter was found.

Apply the demo/provider decision at one shared transport boundary. Add request
and input-size limits, bounded histories, per-user inference budgets, timeouts
and limits on repository analysis. Restrict provider selection to supported
values. Separate AI cache keys by model and mode so cached live results do not
bypass the intended demo behavior. Keep provider keys unset on the current
deployment until these controls are implemented.

**Acceptance:** with demo mode enabled and a dummy provider configured, every
AI route makes zero external inference requests; excessive traffic receives a
controlled 429 response; oversized inputs are rejected before processing.

## P1: data, correctness and reliability

### F04. Data disappears after process or instance replacement

Graphs and certifications live in memory; profile snapshots live in
`backend/data/profiles.json` on Render's ephemeral filesystem. Restarts,
redeployments and free-instance lifecycle events can lose these records.

Move owned application records to a persistent datastore with backups and
migrations. A relational store can cover profiles, certifications and graph
snapshots; Neo4j is optional if graph queries justify it. Verify persistence
before increasing worker count: separate workers currently have separate graphs.

**Acceptance:** saved data and share links survive a backend restart and deploy,
and concurrent requests see the same owned records.

### F05. Enabling Neo4j currently introduces destructive behavior

[Graph saving](backend/services/graph_service.py#L33) runs
`MATCH (n) DETACH DELETE n` before writing a graph. Reads are also database-wide.
This is inactive today because Neo4j is unset, but it is a blocker before
connecting any database containing valuable or unrelated data.

Scope records and queries by owner and graph ID, replace only that graph in a
transaction, and validate dynamic labels and relationship types. Handle database
failures explicitly instead of silently changing to a separate memory store.

**Acceptance:** replacing one graph leaves all other graphs intact; a failed
write rolls back rather than leaving a partially replaced graph.

### F06. OAuth and live GitHub listing need completion

[Repository listing](backend/routes/github.py#L26) calls `fetch_commit_count`
and `normalize_languages`, but neither function exists in `github_service.py`.
Their absence was reproduced offline. This path will fail when it is enabled.

The route accepts a GitHub token as a query parameter, and the OAuth response
returns a GitHub access token to the browser. The callback stores the app JWT in
localStorage and handles a code without checking OAuth state. Complete a
server-managed OAuth/session flow, validate state, keep GitHub tokens server-side
and implement `/auth/me` with verified token/session handling. For cross-site
cookies, design the CORS, SameSite and CSRF controls together; the current hosts
use different sites.

**Acceptance:** login, refresh, logout and session expiry work; malformed or
forged sessions are rejected; `/github/repos` succeeds with mocked GitHub data;
tokens do not appear in URLs or logs.

### F07. Shared profile IDs can collide

[Profile IDs](backend/routes/profile.py#L61) hash `username` plus whole seconds
and keep eight hex characters. Two requests for the same username during one
second produce the same slug; this was reproduced with a fixed clock. A later
write overwrites the earlier snapshot. The ID is predictable from its inputs.

Use a cryptographically random ID with sufficient entropy and a datastore
uniqueness constraint. Add explicit publish/revoke controls, ownership, retention
and optional expiry. Keep public snapshots separate from private records.

**Acceptance:** simultaneous generation yields different IDs; only the owner
can revoke a link; revoked or expired links return a clear result.

### F08. Readiness and roadmap disagree about existing skills

[Readiness](backend/routes/career.py#L41) expands implied skills and compares
names without case sensitivity. [Roadmap generation](backend/routes/career.py#L178)
uses exact membership against the original names. An isolated graph containing
only Next.js caused readiness to recognize JavaScript, React, CSS and HTML,
while the roadmap still listed those same skills as gaps.

Share one canonical skill resolver and gap-calculation function across readiness,
roadmaps, profiles and what-if. Document whether implied skills represent evidence
or an assumption. Also sequence dashboard demo seeding, graph loading and initial
readiness: [the current dashboard](frontend/src/app/dashboard/page.tsx#L127)
starts graph and career requests concurrently, which can briefly score an old
or empty graph.

**Acceptance:** the same graph and target role produce consistent gaps in all
views; a fresh demo displays the seeded graph's score without a stale result.

### F09. Slow synchronous calls can stall the API

[LLM transport](backend/services/llm_service.py#L113) uses synchronous
`httpx.Client` and `time.sleep`. Async routes such as chat call synchronous
services directly. When live inference is enabled, one slow call can block the
single-worker API event loop and delay health and graph requests.

Use asynchronous transport throughout the call chain, or move blocking work
into a bounded thread pool as an interim step. Reuse HTTP clients, set operation
deadlines and use bounded jobs for lengthy analyses. Scrub provider error bodies
before logging them.

**Acceptance:** a deliberately delayed model request does not stall `/health`;
cancellation and timeouts release resources cleanly.

### F10. Vercel automatic deployment is still unconnected

Render can read `riishcodes/orbitx`. Vercel's GitHub connection attempt still
failed after the permission update, so the frontend was published through a
clean Git archive and CLI upload. The live site works; pushing frontend changes
alone does not currently update it.

Connect the repository in the
[Vercel project's Git settings](https://vercel.com/riishs-projects-42df3a27/orbitx/settings/git),
verify the linked GitHub identity and installation access, and trigger a controlled
deployment. Retain root directory `frontend` and the configured API URL.

**Acceptance:** a harmless frontend change on `main` triggers the correct project
and deploys the corresponding commit. Private-preview access and exact CORS
origins should be configured deliberately.

### F11. Cold-start and retry behavior needs clearer handling

Render Free sleeps after idle periods. Dashboard calls use native `fetch`,
which bypasses the shared Axios timeout/retry logic. Failure messages tell public
visitors to start an API on port 8000. The [Axios interceptor](frontend/src/lib/api.ts#L33)
also retries network/5xx failures for all methods, including mutations; a lost
response can cause a successfully processed write to run again.

Add a visible backend-waking state, a bounded retry action and useful production
error text. Standardize timeout and error handling. Automatically retry safe
reads; give mutation requests idempotency keys or explicit retry rules.

**Acceptance:** a cold backend gives a useful waiting state and recovers;
repeating a request after a lost response does not duplicate a write.

### F12. Builds need reproducible dependencies and durable checks

`backend/requirements.txt` has no version pins. A future deploy can resolve a
different FastAPI, Pydantic, Neo4j or HTTP stack. No committed application test
suite or GitHub Actions workflow was found in the inspected source tree; the
deployment checks in this session were external verification.

Create reviewed dependency constraints or a lockfile and automated checks for
authorization, ownership, skill matching, profile collisions, demo-mode behavior,
builds and a small browser smoke flow. Include dependency and secret scanning.
Add structured logs and basic uptime/error monitoring without recording tokens
or private repository contents.

**Acceptance:** a clean checkout produces repeatable builds; the demonstrated
correctness and security regressions fail CI before deployment.

## P2: clarity and usability

### F13. Make evidence and confidence understandable

Profiles always set `verified: true`, while the Copilot prompt asks for exactly
`Confidence: 85%`. Market-demand values are bundled tables. The demo loader
simulates analysis stages rather than performing a new GitHub/AI analysis.
Readiness is a heuristic score, not a validated prediction of hiring success.

Label bundled demo data, inferred skills, deterministic fallbacks and generated
answers accurately. Replace the fixed confidence instruction with a described
evidence measure or omit the percentage. Show the scoring formula, data source
and last analysis time. Define what verification means before displaying that
claim on a recruiter profile.

### F14. Improve graph access and readability

The live graph renders correctly, but labels are small at the initial camera
distance. External font/icon assets can continue loading after the API data is
ready. Improve initial framing, label visibility and asset fallback behavior.
Offer an accessible list/table alternative with keyboard selection, and verify
the tour, panels and graph on mobile. Respect reduced-motion preferences for
the preloader and graph animation. Preserve the landing layout and branding.

### F15. Finish branding and simplify provider identity

Backend API titles, Copilot prompts/fallbacks and OpenRouter request metadata
still use `My Orbits`; the frontend uses OrbitX. Update displayed names while
preserving historical repository references and internal identifiers.

Clarify that `gemini`/`grok` select personas and extraction thresholds rather
than separate Google/xAI integrations. Model names, endpoint metadata and
fallback configuration should come from one documented configuration source.

## Suggested implementation sequence

1. Refresh/remove vulnerable dependencies and add meaningful regression checks.
2. Implement sessions, ownership and a separate demo-data boundary.
3. Add request limits, consistent AI policy and safe mutation handling.
4. Introduce persistent storage; repair profile IDs and GitHub/OAuth behavior.
5. Unify scoring and finish cold-start handling and asynchronous provider transport.
6. Connect Vercel Git deployment and establish repeatable CI and monitoring.
7. Improve evidence labels, graph accessibility and backend branding.

Enabling AI keys is a later configuration step after the access, isolation and
usage controls pass their acceptance checks. See [DEPLOYMENT.md](DEPLOYMENT.md)
for the current hosting configuration and manual deployment commands.
