# Deployment trace

Inspected on October 7, 2026 against https://stagecraft-blush.vercel.app and this checkout.
This records source behavior and public observations; it does not establish the private Vercel
framework preset, function bundles, build overrides, environment values, or deployment revision.
No deployment code or remote settings were changed during this product update.

## Frontend

- `index.html` loads `src/main.js`; Vite builds the frontend into `dist/`.
- `pnpm build` first downloads the pose model and copies WASM from the installed MediaPipe version.
  These assets are ignored by Git and must be included by the production build.
- The public deployment returns compiled HTML with `/assets/` JavaScript and CSS. Its HTML response
  has Vercel cache headers and does not contain Fastify's security headers. This is evidence that
  the observed page is served as a static Vite build, rather than through Fastify's static handler.
- Public page navigation uses hashes, so Home, About, and Studio use the same HTML entrypoint.

## API and streaming

- `src/api.js` calls same-origin `/api` URLs and uses same-origin credentials for session cookies.
- In development, `vite.config.js` proxies `/api` requests and WebSocket upgrades to port 3000.
  The proxy is not part of the production build.
- `server/index.js` starts a persistent Fastify server and serves `dist/` locally. `server.mjs`
  is another listening entrypoint intended for Vercel's Fastify integration.
- `api/health.mjs` is an independent function. Its `aiConfigured` flag only checks whether an
  environment variable exists; it does not initialize Fastify or verify Gemini requests.
- `api/[...path].mjs` lazily builds Fastify and forwards HTTP requests to `app.server`. Its
  function-local cached app contains the in-memory session store, jobs, and quota counters.
- `server/app.js` implements draft generation, consented session creation, multipart analysis,
  report polling, streamed NDJSON chat, and session deletion. Analysis starts asynchronous work
  after returning HTTP 202. It needs a running backend to finish that work and retain reports.
- NDJSON chat is HTTP response streaming, separate from the transcription WebSocket.

## WebSockets and state

- `src/media.js` connects to same-origin `ws:`/`wss:` at
  `/api/sessions/:id/transcription`. Connection failure leaves local recording usable and final
  audio analysis available for retry when the HTTP backend is working.
- `server/app.js` explicitly skips WebSocket registration and the transcription route when
  `VERCEL` is set. The API fallback forwards HTTP requests, not WebSocket upgrades.
- Live transcription requires a persistent host that supports WebSockets. Serverless instance
  reuse is not durable storage for sessions, reports, background jobs, or quota accounting.
- Full video stays in the browser. Media consent, session ownership, cancellation, and provider
  cleanup remain unchanged by the product update.

## Observed public endpoints

| Probe                                    | Observed response                             |
| ---------------------------------------- | --------------------------------------------- |
| `GET /`                                  | HTTP 200; compiled static frontend            |
| `GET /api/health`                        | HTTP 200; `aiConfigured: true`                |
| `POST /api/scripts` with invalid `{}`    | HTTP 500; Vercel `FUNCTION_INVOCATION_FAILED` |
| `POST /api/sessions` without consent     | HTTP 500; Vercel `FUNCTION_INVOCATION_FAILED` |
| `GET /api/sessions/not-a-session/report` | HTTP 404; Vercel `NOT_FOUND`                  |

The two invalid POST probes should receive application validation errors without calling Gemini
or creating a session. The report probe should receive Fastify's JSON ownership/session error.
The observed responses indicate function startup and/or routing problems; public responses alone
cannot identify their root cause. No recordings, valid provider requests, or credentials were
submitted in these probes. Browser inspection confirmed the public Home and script-preparation UI.

## Before changing production deployment

Inspect the Vercel project's root directory, framework preset, build/output commands, deployed Git
revision, function runtime/import logs, and generated route table. Determine whether the project
is using static Vite plus `api/` functions or the Fastify entrypoint before choosing one routing
approach. Verify invalid input reaches Fastify validation and that a consented session remains
available across requests. Health alone cannot confirm that AI features work.

For the complete stateful workflow, the existing Docker deployment is the supported architectural
fit. A serverless redesign would also need durable session/job state and lifecycle changes; adding
rewrites alone would not address these constraints.
