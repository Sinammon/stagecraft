# Production polish implementation plan

1. Inspect the existing UI, media pipeline, API, scoring, provider integration, tests, and deployment.
2. Install Impeccable locally. Record confirmed product truth and a code-first visual direction.
3. Replace conflicting styles with a shared responsive system and self-hosted typography. Rebuild
   public pages around students and everyday speaking; retain navigation and product truth.
4. Improve studio preparation, capture, loading, review, and chat. Preserve drafts in this tab,
   support explicit local-only practice, and provide useful recovery paths.
5. Validate AI output and word timing, bound network requests and streaming parsing, retain safe
   output rendering, ownership, quotas, cancellation, stage isolation, and provider cleanup.
6. Add focused regressions for the changed behavior; run unit/API and browser tests, production
   build, layout and console checks, and credentialed provider checks when configuration exists.
7. Perform a bounded desktop/mobile inspection, Impeccable detector, independent finish review,
   and final design documentation. Review the complete diff and secret exclusions.
8. Commit focused changes, push the existing main branch, and verify the remote commit.

## Deployment boundary

The current WebSocket relay and background jobs require a persistent Node instance. A static Vercel
frontend must proxy the API to that service; in-process sessions are not a multi-instance store.
No deployment credentials or deployment project metadata are present in this checkout.

## Verification and handoff

- Implemented the students/everyday-speaking redesign, draft persistence, local-only recording,
  explicit cloud consent, response validation, stage progress, and streamed coaching recovery.
- Production build passed. 41 unit/API/provider tests and 11 Chromium browser tests passed.
- Desktop, mobile, and tablet fixture captures passed with zero unexpected browser errors.
  Fake camera and explicitly synthetic reports test interface behavior, not live Gemini accuracy.
- Production dependency audit reports no known vulnerabilities after updating @fastify/static.
- Impeccable's independent review matched the visual contract, requested a missing-evidence live
  score fix, then scored that fix resolved with disposition `ship`.
- Credentialed `pnpm test:ai` could not run: no Gemini key or server .env was discoverable in the
  local configuration. Real-device calibration, live transcription, and AI accuracy remain unverified.
- GitHub push is blocked by missing Git authentication. Local Git author name/email are also
  unconfigured; no identity or credentials were invented. Changes are staged for review and commit.
