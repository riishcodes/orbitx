# OrbitX Project and Deployment Context

This is the historical handoff from 2026-11-07. Git status, Git log and remote
refs are authoritative for subsequent publishing changes. See
[DEPLOYMENT.md](DEPLOYMENT.md) for the current hosting steps.

Last verified: 2026-11-07. This is a handoff of observed project state, not a
replacement for the user's current instructions or tool permission rules.

## Current Objective

Host OrbitX using **Vercel Hobby for the frontend and Render Free for the Python
backend**, without Cloudflare or Neo4j AuraDB for now.

The latest user requests are:

- Keep the original landing-page design and change the displayed name to OrbitX.
- Use the new repository: `https://github.com/riishcodes/orbitx.git`.
- Commit and push the app to that new repository. The user explicitly requested this, but it has not been executed.
- Create this context file so another AI agent can continue the work.

**Nothing has been committed, pushed, or publicly deployed by this assistant.**
The latest operation was creating this handoff. Do not report the website as live.

## Repository and Machine

| Item | Current State |
| --- | --- |
| Git/project root | `C:\Users\Riish\Downloads\Myorbits\orbitxnew` |
| Parent working folder | `C:\Users\Riish\Downloads\Myorbits` |
| Platform/shell | Windows, PowerShell 5.1 |
| Local branch | `main` |
| Current local HEAD | `402f8e7` (`Initial commit: My Orbits career intelligence platform`) |
| Current origin | `https://github.com/riishcodes/Myorbits.git` |
| Required new push target | `https://github.com/riishcodes/orbitx.git` |
| New repository visibility | **Private**, verified with GitHub CLI |
| New repository default branch | CLI reported an empty branch name; verify remote refs before pushing |

**Do not accidentally push to the old Myorbits origin.** The remote has not yet
been switched. Inspect the new repository before changing remotes or pushing.
If it has existing commits, do not force-push or discard its contents.

GitHub CLI is authenticated as `riishcodes`. There are many uncommitted app
changes, including work that existed before this session. Preserve that work.

Important untracked deployment files are `render.yaml`,
`frontend/.vercelignore`, `frontend/src/app/profile/page.tsx`, and this document.
The installed `.agents/` skill folder, `skills-lock.json`, and `DEMO_SCRIPT.md`
are also untracked; do not treat every untracked file as an application dependency.

## Application Architecture

| Layer | Implementation |
| --- | --- |
| Frontend | Next.js 14.2.35 App Router, React 18, TypeScript, Tailwind, Framer Motion |
| Graph rendering | Three.js / 3d-force-graph in the browser; SSR disabled for the graph |
| Client state/API | Zustand, Axios; `frontend/src/lib/api.ts` |
| Backend | FastAPI/Uvicorn; entrypoint `backend/main.py`, ASGI app `main:app` |
| AI transport | `httpx` requests to OpenRouter or Ollama |
| Graph storage | Process-global in-memory graph when `NEO4J_URI` is empty; optional Neo4j driver |
| Other storage | Profile snapshots in `backend/data/profiles.json`; certifications in an in-memory list |
| PDF exports | Browser-side html2canvas/jsPDF, not a backend PDF renderer |

The backend fetches/analyzes GitHub repository information, reads Notion data
when configured, constructs the skill graph, calculates readiness, produces
roadmaps/what-if results, handles Copilot messages, and creates shareable profiles.
Uploading the frontend alone does not provide these backend features.

There are no implemented WebSockets, SSE, scheduled jobs, or embedded GPU model
weights. APScheduler is declared but no running scheduler was found.

## Important Files

- `frontend/src/app/page.tsx`: restored original landing page and repository/demo actions.
- `frontend/src/app/dashboard/page.tsx`: graph dashboard; handles `?demo=true` and `?source=repo`.
- `frontend/src/app/dashboard/analytics/page.tsx`: analytics page.
- `frontend/src/app/profile/page.tsx`: current public profile page using a `slug` query parameter.
- `frontend/src/components/layout/DemoLoader.tsx`: original simulated demo-loading animation.
- `frontend/src/components/panels/CopilotPanel.tsx`: chat UI/persona selection.
- `frontend/src/lib/api.ts`: API base URL, timeout/retry handling, requests.
- `frontend/src/stores/graphStore.ts`: graph state; default analysis provider is now `openrouter`.
- `backend/config.py`: Pydantic settings; loads `backend/.env` during ordinary local startup.
- `backend/services/llm_service.py`: real provider transport, model fallbacks and availability checks.
- `backend/services/ai_service.py`: extraction, gap explanations and roadmap generation/fallbacks.
- `backend/services/chat_service.py`: Copilot prompts and fallback messages.
- `backend/services/scoring_service.py`: what-if calculations/provider calls.
- `backend/services/graph_service.py`: memory/Neo4j persistence.
- `backend/routes/career.py`: deterministic readiness scoring.
- `backend/routes/profile.py`: local-disk profile snapshots.
- `backend/seed_data.py` and `backend/services/market_data.py`: bundled demo/benchmark data.
- `render.yaml`, `frontend/next.config.js`, `frontend/.vercelignore`: deployment preparation.
- `RUNBOOK.md`: existing local and Vercel/Render instructions.

## Completed Changes

- Restored the exact pre-redesign landing source from local Webpack source maps, rather than resetting to the older Git commit.
- Verified that landing source differs from that recovered version only by replacing `My Orbits` with `OrbitX`.
- Preserved the original layout, fonts, animated orbits, preloader, feature tiles, repository input, and demo flow.
- Removed the replacement landing design, new logo component, new CSS tokens, and screenshot assets.
- Updated frontend display branding, including the demo loader, dashboard header, Copilot heading, profile page, PDF labels and filename.
- Kept real historical GitHub references and internal graph/storage identifiers intact.
- Patched Next.js and eslint-config-next from 14.2.0 to 14.2.35.
- Defaulted frontend analysis requests to OpenRouter instead of local Ollama.
- Added configurable backend `CORS_ORIGINS` instead of allowing every browser origin.
- Removed OAuth code/token-response logging and guarded unconfigured or demo-mode GitHub login.
- Added Render Free configuration and Vercel deployment safeguards.
- Synchronized `frontend/package-lock.json` with the current package manifest without running install scripts.

**Do not redesign the landing page again unless the user explicitly requests it.**
The redesign was cancelled by the user. Do not remove their earlier uncommitted
landing/demo/Copilot changes while cleaning up deployment work.

## Deployment Configuration

### Vercel Frontend

Use project root directory `frontend`, framework preset **Next.js**, build command
`npm run build`, and the framework-default output directory. Native Next.js
deployment is configured; `output: 'export'` is no longer set.

Set `NEXT_PUBLIC_API_URL` to the **actual HTTPS Render service URL** before the
Vercel build. Next.js compiles this value into browser JavaScript, so changing it
requires redeployment. The config rejects missing/localhost API URLs when
`VERCEL=1`.

Sharing currently generates `/profile?slug=...`. `next.config.js` redirects
legacy `/profile/:slug` links to the query-string route. The former dynamic
`frontend/src/app/profile/[slug]/page.tsx` is deleted in the worktree; its
replacement is untracked and must be included when publishing.

`frontend/.vercelignore` excludes local env files, dependencies, build output and
logs. `.vercel/` metadata is ignored by Git. Never put API keys in `NEXT_PUBLIC_`
variables or upload a local build containing a localhost API URL as a public
prebuilt deployment.

### Render Backend

`render.yaml` currently contains:

| Setting | Value |
| --- | --- |
| Service name | `my-orbits-api` (configuration name, not a verified live service) |
| Runtime / plan | Python / Free |
| Root directory | `backend` |
| Build | `pip install -r requirements.txt` |
| Start | `python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1` |
| Health check | `/health` |
| `PYTHON_VERSION` | `3.12.10` |
| `AI_PROVIDER` | `openrouter` |
| `DEMO_MODE` | `true` |
| `NEO4J_URI` | Empty |
| `JWT_SECRET` | Blueprint `generateValue: true` |
| `CORS_ORIGINS` | Blueprint `sync: false`; provide the exact frontend origin |

No Render service was created by this assistant. Refresh the service list before
creating anything; the user may have resources outside this session. A new
service can be named `orbitx-api`, but do not rename or overwrite an existing
unrelated resource or assume a hostname is available.

The new GitHub repository is private. Render/Vercel must have permission to read
that repository; do not make it public just to bypass an integration problem.

Use one backend worker while storage is process-local. After obtaining the
Vercel production URL, set `CORS_ORIGINS` on Render to that exact origin, without
a path/trailing slash. Do not broadly whitelist every `vercel.app` project.

## Authentication Status and Tools

- GitHub CLI authentication works for `riishcodes` and the new private repository was verified.
- Render CLI login completed, and `whoami` successfully verified the account.
- Render has one observed workspace named `My Workspace`; refresh `workspaces --output json` and use its returned ID.
- **Vercel CLI still reports logged out**, most recently checked when this file was created, despite the user being logged into the website.
- Vercel device-login attempts failed/expired. Start a fresh CLI login and have the user approve it; do not reuse old codes.

Vercel CLI is available through npm:

```powershell
npm exec --yes --package=vercel@65.12.1 -- vercel whoami --non-interactive
npm exec --yes --package=vercel@65.12.1 -- vercel login
```

Render CLI v2.36.0 was downloaded from the official `render-oss/cli` GitHub release
and its Windows archive checksum was verified. It is stored locally at:

```text
C:\Users\Riish\AppData\Local\Temp\kilo\orbitx-hosting\render.exe
```

Useful commands:

```powershell
& "C:\Users\Riish\AppData\Local\Temp\kilo\orbitx-hosting\render.exe" whoami --output json
& "C:\Users\Riish\AppData\Local\Temp\kilo\orbitx-hosting\render.exe" workspaces --output json
& "C:\Users\Riish\AppData\Local\Temp\kilo\orbitx-hosting\render.exe" services --output json
```

The normal `render blueprints` command currently exposes validation, not service
creation. Inspect `render ea blueprints --help` or use the Render dashboard/API
for provisioning; do not guess unsupported CLI commands.

No passwords, API keys, CLI tokens or device-authorization codes are included in
this document. Do not print authentication files or ask the user to paste keys
into chat. Keep all newly created hosting resources on the requested free plans.

## Local Preview and Validation

- Website: `http://localhost:3000/`.
- Demo: `http://localhost:3000/dashboard?demo=true`.
- Backend: `http://127.0.0.1:8000/health` and `/docs`.
- Both local servers are persistent tracked processes and were running at handoff.
- Use the background-process tool's `list` to discover current process IDs before managing them; do not assume saved IDs remain valid.

Frontend scripts are `npm run dev`, `npm run build`, `npm start`, and `npm run deploy`.
The running frontend uses a localhost API URL. The backend uses its existing
`backend/.venv/Scripts/python.exe` environment and Uvicorn.

**Windows environment caveat:** In PowerShell 5.1, assigning `''` to an environment
variable can remove it. Pydantic can then load the value from `backend/.env`.
The running local API reported `provider=openrouter`, `configured=true`, and
`demo_mode=true`; an attempted empty key override did not guarantee offline AI.
Local Neo4j settings were separately checked and were empty. Never assume an
empty shell assignment suppresses an existing dotenv secret.

Validation completed:

- Native Vercel-compatible production build passed: compilation, lint, type checks, page generation and build traces.
- Desktop 1440x900 and mobile 390x844 browser checks passed for restored layout, OrbitX branding, no horizontal overflow and repository-input validation.
- Landing restoration was compared programmatically with recovered pre-redesign source and matched after name-only replacement.
- Git diff whitespace check passed; Git emits normal LF/CRLF notices.
- One existing non-fatal hook warning remains in `KnowledgeGraph3D.tsx` around `visibleIds`/`useMemo` at lines 601/609.
- Browserslist data is old; the production build still succeeded.
- A publishable-source credential-pattern scan found no matches; Git tracked-env inspection found only `.env.example`.

Do not run a production build concurrently with a dev server using the same
`.next` directory. The preview was briefly stopped for the last build, then
restarted. Preserve or restart only this project's managed processes.

## Actual AI Behavior

The app is **hybrid**, not all live AI and not all hardcoded. An isolated audit
passed **22/22 mocked tests with zero unmocked network attempts**. Live provider
connectivity and credential validity were deliberately not tested.

| Feature | Behavior |
| --- | --- |
| Skill extraction, gap explanations, roadmap | `ai_service.py` skips live generation in demo mode and uses mappings/templates; live mode can call a configured provider and falls back on failure |
| Copilot chat | Can still call the provider in demo mode; its path does not apply the same demo guard |
| What-if | Can still call the provider in demo mode when context/provider are available; local arithmetic is a fallback |
| Readiness scoring | Deterministic calculation from graph inputs; sample graph yielded 67.9, empty graph 0 |
| Market demand and role requirements | Bundled lookup tables, not live job-market scraping |
| Demo graph | Bundled seed data, not a fresh GitHub/AI analysis |

Cache hits precede some demo-mode checks and can return previously generated
content. `configured=true` checks key presence, not successful inference.

OpenRouter really sends Bearer-authenticated chat-completion requests. The
configured default model is `google/gemma-4-26b-a4b-it:free`. **Gemma is not a
direct Gemini API integration.** The `gemini`/`grok` keys choose prompts, tones
or thresholds, not separate Google/xAI API keys. Do not silently change these
API persona identifiers during branding cleanup.

The planned public demo does not upload private provider keys. Adding one later
can activate chat/what-if even with demo mode enabled. Fix authorization,
rate-limiting and demo-mode consistency before exposing a metered provider key
through an unrestricted public API.

## Storage and Production Limitations

- No Neo4j is required for the current demo deployment.
- In-memory graphs/certifications and ephemeral profile JSON can disappear on restart, redeploy or Render Free sleep.
- Render Free sleeps after 15 minutes without traffic; the next request may take about a minute. Free instance hours are limited.
- Vercel Hobby is for personal, non-commercial use and has usage limits.
- The backend is a shared demo, not a secure multi-user product: routes lack consistent authorization and per-user data isolation; `/auth/me` remains unfinished.
- Neo4j graph saving currently deletes every node in the connected database before rewriting. Never connect a database containing unrelated data.
- The live `/github/repos` path references missing `fetch_commit_count`; review before enabling that flow.
- Local Ollama on the user's laptop is not reachable from a Render instance.

## Next Steps for the Continuing Agent

1. Confirm the user's current instruction, inspect Git status/remotes and the new private repository's refs. The requested publishing target is `riishcodes/orbitx`, not the existing Myorbits origin.
2. Finish Vercel CLI authorization for the user's personal Hobby account. Render CLI authorization is already verified, but refresh workspace/service state.
3. Review current diffs and include the app/deployment files, query-string profile replacement and this handoff in the intended commit. Do not stage secrets, runtime data, build caches or unrelated presentation edits indiscriminately.
4. Commit and push to the new repository using the user's explicit request and required one-shot Git confirmations. Do not force-push, alter global Git identity/settings, skip hooks or discard user work.
5. Grant the hosting integrations access to the private repo and create the Render Free Python service from the published code. Record the returned real URL/IDs, not a guessed hostname.
6. Set Vercel root `frontend` and production `NEXT_PUBLIC_API_URL` to the HTTPS Render URL, then deploy using the native Next.js configuration.
7. Update Render `CORS_ORIGINS` with the actual Vercel production origin and verify `/health`, demo graph loading, readiness and profile sharing against public URLs.
8. Report both real URLs and the demo/storage/free-plan limitations. Do not claim AI connectivity without a controlled, authorized live test.

Installed design skills remain under `.agents/skills/`: `apple-design`,
`emil-design-eng`, `make-interfaces-feel-better`, `impeccable`, and `hallmark`.
They are not runtime dependencies. Their installation does not authorize a new
redesign; the user explicitly asked to retain the old landing design.
These folders currently exist only in the local worktree unless deliberately
included in a later commit. An agent working from a fresh clone should not assume
they are present or install them merely to deploy the app.

Internal parallel agents were tried. The branding worker hit provider token-rate
limits and is no longer doing work; the AI verifier completed. Do not wait for
those workers or repeatedly retry them. No Agent Manager worktrees were created.
