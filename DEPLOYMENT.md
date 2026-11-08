# Host OrbitX on Vercel and Render

Use the private repository https://github.com/riishcodes/orbitx, branch `main`.
Grant both hosting integrations access to that repository. Use Vercel Hobby
for a personal demo and a Render Free Python web service for the backend.

## 1. Deploy the backend on Render

1. Open https://dashboard.render.com and select **New > Web Service**.
2. Connect your GitHub account and select `riishcodes/orbitx`, branch `main`.
3. Choose these settings:

| Setting | Value |
| --- | --- |
| Name | `orbitx-api`, or another available name |
| Language | Python 3 |
| Root directory | `backend` |
| Instance type | Free |
| Build command | `pip install -r requirements.txt` |
| Start command | `python -m uvicorn main:app --host 0.0.0.0 --port $PORT --workers 1` |
| Health check path | `/health` |

4. Add the following environment variables:

| Variable | Value |
| --- | --- |
| `PYTHON_VERSION` | `3.12.10` |
| `PYTHONUNBUFFERED` | `1` |
| `DEMO_MODE` | `true` |
| `AI_PROVIDER` | `openrouter` |
| `JWT_SECRET` | A freshly generated random secret |
| `CORS_ORIGINS` | Initially `http://localhost:3000`; replace in step 3 |

Leave `NEO4J_URI`, `OPENROUTER_API_KEY`, `OLLAMA_API_KEY`, GitHub OAuth secrets
and Notion secrets unset. No database is required for the demo.

5. Create the service and wait for deployment. Copy the actual HTTPS URL from
   Render. Open `<render-url>/health`; expect `{"status":"healthy"}`.

Alternatively, choose **New > Blueprint**, select this repository and its
`render.yaml`, and supply `CORS_ORIGINS` when prompted. The Blueprint generates
`JWT_SECRET` and selects the Free plan automatically. Choose one creation
method to avoid duplicate services.

## 2. Deploy the frontend on Vercel

1. Open https://vercel.com/new and import `riishcodes/orbitx`.
2. Choose your personal Hobby account, project name `orbitx` (or another
   available name), framework **Next.js**, and root directory `frontend`.
3. Use build command `npm run build`, install command `npm ci`, and leave the
   output directory at the Next.js default.
4. Add `NEXT_PUBLIC_API_URL` with the actual Render HTTPS URL from step 1,
   without a trailing slash. Set it for Production and Preview if deploying
   both environments. Never put secrets in a `NEXT_PUBLIC_` variable.
5. Deploy and copy the stable Vercel production URL from the project's Domains
   page. This API URL is compiled into the frontend; changes require redeployment.

## 3. Connect and verify

1. On Render, replace `CORS_ORIGINS` with the exact Vercel production origin,
   such as `https://orbitx.vercel.app`, using the actual assigned domain.
   Exclude paths and trailing slashes. Save and redeploy the backend.
2. Open the Vercel homepage, then `/dashboard?demo=true`. Verify the graph and
   readiness score load, and generate and open a shared profile link.
3. If you use a custom frontend domain, add its exact origin to the
   comma-separated `CORS_ORIGINS` list. Preview deployments also need their
   exact origins allowed to use the API.

## Demo limits

- Render Free sleeps after 15 idle minutes. The next request can take about a minute.
- Graphs and certifications are in memory; profile snapshots use ephemeral
  disk. They can disappear after a restart or redeployment.
- This is a shared demo with incomplete authorization and user isolation.
- Demo mode does not block every AI path: chat and what-if can call a configured
  provider. Keep provider keys unset until authorization, rate limits and
  consistent demo-mode handling are implemented.
- Local Ollama on your laptop is not accessible from Render.
- Vercel Hobby is for personal, non-commercial use; both free plans have usage limits.

Reference: [Render FastAPI deployment](https://render.com/docs/deploy-fastapi),
[Render Free limits](https://render.com/docs/free),
[Next.js on Vercel](https://vercel.com/docs/frameworks/full-stack/nextjs).
