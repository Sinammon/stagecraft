# Stagecraft

A browser-first public-speaking practice studio built with HTML, CSS, JavaScript, MediaPipe, Fastify, and Gemini. Full video remains on the device. Gemini receives audio and selected still frames for the three review stages.

## Run locally

Requires Node.js 22.12+ (Node 24 LTS recommended) and pnpm.

```powershell
pnpm install
pnpm models:download
Copy-Item .env.example .env
# Edit .env and set GEMINI_API_KEY from Google AI Studio.
pnpm dev
```

Open http://localhost:5173. Camera permissions work on localhost; any remote deployment requires HTTPS. You can write a script and record locally without a key; AI generation, transcription, feedback, and chat require the key. Missing AI never produces fake feedback or a verified score.

Create the free API key at https://aistudio.google.com/apikey. Keep it in `.env` on the server, never in frontend code. Do not send your key in chat or commit `.env`.

Production build:

```powershell
pnpm build
pnpm start
```

Open http://localhost:3000. The server serves the compiled frontend. The initial MVP supports desktop Chrome and Edge, English, one speaker, five-minute recordings, and seated or standing calibration. Node service restarts lose temporary reports; the page's existing local playback remains usable.

## Gemini configuration

`@google/genai` provides the Interactions API, Files API, and Live API. Defaults, configurable through `.env`:

- `GEMINI_MODEL=gemini-3.5-flash-lite`: script generation, audio/image reviews, combined review, and streamed text chat.
- `GEMINI_TRANSCRIBE_MODEL=gemini-3.5-transcribe`: verbatim final transcription with `word_info` timestamps.
- `GEMINI_LIVE_MODEL=gemini-3.5-transcribe-live`: 16-bit, mono, 16 kHz PCM, verbatim text streaming.

Availability and free quotas depend on your Google project. These are the model names documented at implementation time; a 404 explains how to configure another available model. The final transcription adapter specifically requires a dedicated transcription model returning word annotations; do not substitute a general model's estimated timestamps.

Read your active request, token, and daily quotas in Google AI Studio, then set `GEMINI_RPM`, `GEMINI_TPM`, and `GEMINI_RPD`. The sample values are conservative application limits, not a claim about Google's quotas. Quotas are shared by the project and this application cannot see usage from other applications. Non-live requests are serialized. Live connections reserve a five-minute token budget. 429s never trigger a paid fallback; transient server errors receive one retry. Chat history is bounded.

## Privacy and lifecycle

The user acknowledges the cloud-processing disclosure before a session is created. This is a prototype for non-sensitive practice material. Google's unpaid-service terms permit product improvement and human review and instruct users not to submit sensitive, confidential, or personal information; regional exceptions apply. Evaluate https://ai.google.dev/gemini-api/terms before accepting identifiable recordings from real users. Application cleanup does not promise confidential or zero-retention processing by Google.

- Combined video is never accepted by the backend. It stays in a browser Blob until reset or page close.
- Audio and at most 20 resized JPEG frames are submitted for analysis.
- Uploaded Gemini audio is explicitly deleted in `finally`; failed deletion is disclosed. Gemini Files also have an automatic expiry.
- Non-live Interactions use `store:false`. Chat uses application-held report/history, not provider-side conversation IDs.
- The backend does not log recordings, transcripts, API keys, or request bodies.
- Sessions use HttpOnly, SameSite=Strict guest cookies and expire after 60 minutes of inactivity or two hours total. Reset/delete aborts queued work and closes active live connections.
- In-memory session and quota limits apply to one server instance. This is not a production multi-instance service.

## Measurement and scoring

The live score starts at 100 and is explicitly provisional. Posture/audio capture operate independently; lost tracking or live transcription does not stop recording. Only finalized utterances create filler deductions. Live word timing and pace are approximate; final word annotations replace them. Only standalone `um` and `uh` are scored as fillers.

The final rubric is deterministic and versioned as `v1` in `shared/scoring.js`:

`round(100 - 25F - 25R - 20P - 30B)`

Factors are clamped to 0–1. F is `(fillers/minute - 1)/5`; R is the fraction of complete 20-second windows outside 110–180 WPM; P is silence exceeding three seconds divided by 15% of first-to-last-word delivery time; B is posture deviation time divided by 30% of valid tracked time. Leading/trailing silence is excluded. Missing timing, fewer than 50 words, less than 30 seconds of delivery, or less than 80% pose coverage produces no overall score.

Pose tracking uses the Lite model in a CPU Web Worker, one inference in flight, 320-pixel-wide input, and adaptive 5–10 Hz sampling. Calibration takes five seconds. Standing requires visible hips and shoulders; seated uses head displacement and shoulder tilt. Confidence below 0.7 excludes the observation. Two seconds of sustained deviation produces one event, with one second of recovery before rearming. Webcam geometry is approximate and not an assessment of internal confidence. Baseline angles and rubric thresholds require validation with real users.

Pitchy estimates pitch periodicity, not intelligibility. Audio level and pitch-variation measurements are descriptive and are not directly scored. Silence detection during recording is an RMS heuristic; final pauses use canonical word gaps. Rhetorical pauses and natural movement may be appropriate despite rubric deductions.

## Architecture

The interface uses a Liquid Glass-inspired web design with translucent materials, system typography, and Lucide icons. Home (`#home`), About Us (`#about`), and the speaking studio (`#studio`) share the same application; page navigation preserves the current script and review in memory. The Home page includes a keyboard-accessible review explorer and FAQ. Reduced-motion and reduced-transparency preferences are supported, with opaque material fallbacks where browser blur is unavailable.

`src/pages.js` contains the public pages, `src/glass.css` defines the visual theme, and `src/icons.js` centralizes the tree-shaken Lucide icons. The microphone illustration is CSS artwork and requires no remote image or font service. Design references: [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials) and [Lucide](https://lucide.dev/guide/lucide).

- `src/`: workflow UI, capture controller, posture worker, acoustic worker, safe API/chat rendering.
- `shared/`: scoring and calibration/episode logic shared with the backend.
- `server/`: ownership, validation, bounded Gemini jobs, stage isolation, media cleanup, live relay, chat.
- `public/`: matching MediaPipe WASM/model, audio worklet, and favicon.

Routes: `POST /api/scripts`, `POST /api/sessions`, `WS /api/sessions/:id/transcription`, `POST /api/sessions/:id/analyze`, `GET /api/sessions/:id/report`, `POST /api/sessions/:id/chat`, `DELETE /api/sessions/:id`.

Analysis accepts multipart fields `payload` (validated JSON) and `audio` (mono 16 kHz PCM WAV). The payload contains recording duration, posture mode, valid/deviation pose samples, posture episodes, timestamped frames, and acoustic summaries. Duplicate processing/completed submissions return the existing job. Partial jobs retain completed stages and can retry failed stages with the local audio. Chat is NDJSON with `{text}`, `{done:true}`, or `{error}` records.

Reports contain summary, strengths, improvements, limitations, and allowlisted evidence IDs. Audio review receives no visual data; video review receives no speech data; combined review receives derived reports and evidence. Gemini never determines the score. Dynamic text is escaped or assigned with `textContent`.

## Checks

```powershell
pnpm test
pnpm build
pnpm test:e2e
```

Browser tests use installed Microsoft Edge with fake camera/microphone devices. Install Edge, or update `playwright.config.js` to use your installed Chromium channel. They test actual browser MediaRecorder/AudioWorklet capture, offline playback, muted video, reset, quota errors, keyboard access, and narrow layouts. Backend/provider tests use explicit test doubles and never call the paid or free live API.

Real-device and credentialed Gemini checks are still required before a public release: seated/standing calibration, speech with accents/noise, five-minute synchronization, connectivity loss, actual project quotas, model response shape, provider deletion, and AI advice accuracy. The target of 90% filler precision, 80% recall, and evidence alignment under 250 ms requires an annotated evaluation dataset; it is not implied by automated unit tests.

## Deploy

Use the included Dockerfile for the single Node service, with a reverse proxy/platform providing HTTPS and WebSocket support. Set `HOST=0.0.0.0`, `APP_ORIGIN` to the exact HTTPS origin, `SECURE_COOKIES=true`, and server-side Gemini secrets. The server trusts only the configured origin. No deployment or public upload is performed by the local setup.

```powershell
docker build -t stagecraft .
docker run --env-file .env -e HOST=0.0.0.0 -p 3000:3000 stagecraft
```

Do not scale to multiple instances without shared sessions, a distributed quota limiter, and durable cancellable jobs. Accounts, persistent cloud video, history, and mobile/Safari recording are outside this MVP.
