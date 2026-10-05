# Agent guidance for Stagecraft

## Project and scope

Stagecraft is a browser-first public-speaking practice studio with script drafting, camera and microphone recording, posture tracking, and AI-assisted reviews.

Read [README.md](README.md) for setup, architecture, scoring, privacy, and deployment details. Treat the README and source code as the sources of truth; update the README when behavior or setup changes. A sibling directory may contain a separate project copy. Confirm the active project root before editing, and keep copies synchronized when the task requires it.

## Stack and code map

- JavaScript ES modules, HTML, CSS, and Vite for the browser app.
- Fastify for the API, Gemini for AI features, MediaPipe for pose tracking, and Pitchy for audio analysis.
- `src/`: user interface, API client, media capture, and analysis workers.
- `shared/`: scoring and posture logic shared with the backend.
- `server/`: API routes, validation, session ownership, Gemini jobs, and cleanup.
- `public/`: static assets, audio worklet, MediaPipe model, and WASM.
- `tests/`: Vitest unit and backend tests; `e2e/`: Playwright browser workflows.

Trace changes through the relevant UI, API, validation, and shared logic before editing.

## Setup and commands

Run commands from this repository root. Requires Node.js 22.12+ and pnpm.

| Task | Command |
| --- | --- |
| Install dependencies | `pnpm install` |
| Download the pose model and matching WASM | `pnpm models:download` |
| Start development servers | `pnpm dev` |
| Build the frontend into `dist/` | `pnpm build` |
| Start the production server locally | `pnpm start` |
| Run unit and backend tests | `pnpm test` |
| Run browser tests | `pnpm test:e2e` |

Copy `.env.example` to `.env` when configuring local AI features. Keep secrets in the server environment; never put them in frontend code or variables prefixed with `VITE_`. Recording and playback work without a Gemini key; AI features need a configured key and available quota.

Development runs Vite on port 5173 and Fastify on port 3000. Vite proxies `/api` and WebSocket traffic to Fastify during development.

## Deployment on Vercel

The project is deployed using Vercel. The current repository has no Vercel configuration, so inspect the Vercel project settings and deployment setup before changing production behavior. The README's Docker instructions describe a single-service deployment and may not match the Vercel setup.

- The built frontend expects same-origin `/api` routes and session cookies. Vite's proxy applies only during development.
- Check how the deployed backend handles API routes, transcription WebSockets, streamed chat, and analysis jobs before changing those paths.
- The current backend keeps sessions, jobs, and quota accounting in process memory. Preserve the deployed lifecycle assumptions and call out any serverless or multi-instance implications.
- The model and WASM assets are ignored by Git. Ensure the deployment build downloads or otherwise includes them before serving the app.
- Keep Gemini credentials in the backend runtime environment. Use the deployed site's exact origin for `APP_ORIGIN` and secure cookies over HTTPS.

## Data, AI, and scoring rules

- Full recorded video stays in the browser. After cloud-processing disclosure and consent, analysis sends audio and at most 20 resized still frames.
- Preserve session ownership checks, input limits, cancellation, expiry, provider-file cleanup, and visible failure states.
- Never log API keys, recordings, transcripts, or request bodies.
- Never invent transcripts, evidence, feedback, scores, or provider success. Missing AI must remain an explicit failure or unavailable state.
- Keep the live score provisional. Final scoring is deterministic in `shared/scoring.js`; Gemini does not determine the score. Insufficient evidence must produce no overall score.
- Keep audio-only and video-only reviews separated. Combined review uses derived reports and evidence.
- Render dynamic text safely with escaping or `textContent`.
- Webcam observations cannot measure internal confidence. Keep product claims aligned with observable measurements.
- Preserve quota limits and do not add automatic paid fallbacks.

## Working conventions

- Make focused changes using the existing modules and dependencies.
- Follow the existing Prettier style: single quotes, trailing commas, and a 100-character print width.
- Preserve hash navigation and script/review state across page changes.
- For UI changes, maintain keyboard access, visible focus, responsive layouts, and reduced-motion and reduced-transparency support.
- Keep MediaPipe WASM aligned with the installed package version.
- Update relevant documentation when commands, behavior, or deployment requirements change.

## Checks and handoff

Run checks relevant to the change: `pnpm test` for scoring/backend changes, `pnpm build` for frontend changes, and `pnpm test:e2e` for browser workflows. Recording or session changes should cover capture, playback, reset, and failure paths.

Playwright uses an installed Chromium binary when available; set `PLAYWRIGHT_EXECUTABLE_PATH` to override it. Browser tests use fake camera and microphone devices. Provider tests use test doubles, so they do not verify live Gemini behavior or quotas.

Passing automated checks does not confirm real-device capture, live Gemini behavior, or the Vercel deployment. In the handoff, state what changed, which checks ran, and any remaining limitations.
