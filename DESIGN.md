# Heard design system

Heard is a browser-first speaking studio. The name and scalable speech-and-waveform mark draw on
the supplied brand reference. The interface is a focused workspace, with enough character to feel
welcoming and enough restraint to keep attention on the user's talk.

## Information architecture

- **Home** (`#home`): a left-aligned mark, one promise, one topic launcher, and a three-step overview. No testimonials or invented results.
- **Our approach** (`#about`): preparation, observable feedback, evidence, plain-language privacy, the illustrative review explorer, and FAQ.
- **Studio** (`#studio`): three progress stages — Prepare, Practice, Review. Preparation offers manual
  writing and Gemini drafting. Practice includes device selection, seated/standing posture,
  optional calibration, required AI consent, adaptive talking-point cards after a first read-through, and recording. Review has Listen, Watch, and Reflect
  modes for audio-only, muted video, and combined playback with coaching.

Home, approach, and studio are separate visible pages with sticky hash navigation and browser-history support. The studio mount preserves draft, setup, and review state. Leaving active recording stops the take; leaving memorization cancels its countdown. The old draft storage key is retained for existing users.

## Identity

- Name: **Heard**; wordmark: lowercase **heard**, Geist 750 with tight tracking.
- Mark: two speech frames enclosing five sound bars. Flat orange, scalable SVG, no raster dependency.
- Assets: `src/brand.js`, `public/heard-mark.svg`, `public/favicon.svg`.
- Canvas: `#faf9f6`; text: `#252622`; secondary text: `#6e7068`.
- Accent: `#ec572e`, used for the mark and small visual details.
- Serif accent text: `#a94a2b`; the hero mark has no surrounding card, border, or background.
- Surfaces: white and `#f3f2ee`; borders: `#eaeaea`; evidence/score tint: `#edf2e9`.
- Errors: `#a53227` on `#fcece6`.

## Typography and components

Self-hosted Geist handles UI, forms, and feedback. Instrument Serif handles public page headlines,
illustrative excerpts, and preparation guidance. No remote font calls. Headings use tight tracking;
body text uses an 18px base and 1.65 line height. Secondary text stays at least approximately 15px. Public headlines have at most two deliberate lines on desktop.

Primary actions are charcoal with white text and 6px corners. Secondary actions are white with a
quiet border. Panels use 1px structural borders, 10px corners, and generous internal space. There
are no gradients or heavy shadows. Phosphor Bold SVG icons are bundled individually.

The script editor is the largest preparation surface. Guidance is secondary and removed on narrow
screens. Setup puts required AI consent before the mirrored camera and optional posture calibration. A confirmed read-through or first recorded take creates 3–8 AI talking-point cards; the next take shows cards with the full script available in a disclosure. Guided practice keeps the full script available. Memorization test prepares AI key points before a configurable 1–30 minute countdown; its speaking test hides the script and offers only 3–8 idea cues. Recall feedback appears in the audio review, accepting paraphrases. Recording puts Finish practice next to the timer. Reviews keep playback, measured data, evidence, and feedback together.
Unavailable measurements stay explicit; illustrations never masquerade as live results.

## Interaction and accessibility

- A page-wide skip link, semantic section navigation, and labeled form inputs.
- Visible focus, arrow/Home/End keyboard behavior for script and review-example tabs.
- Short status messages, persistent errors, disabled actions while work is in progress.
- Unchecked AI consent by default; provider data-use disclosure beside the required consent checkbox. Devices and recording are disabled until consent and AI availability are confirmed.
- Muted video-only playback remains enforced. Full video stays local.
- Responsive layouts from 320px to desktop; supported recording remains desktop Chromium.
- Below-the-fold public sections reveal once through IntersectionObserver. Reduced motion bypasses
  entrance transitions and animated spinners. Camera overlays use opaque backgrounds, including
  reduced-transparency preference support.

## Scope

The redesign adds dedicated pages, practice modes, recall feedback, and more stable posture tracking. It reuses the bounded, consent-checked `/api/flashcards` route and requires configured AI for session creation. Posture geometry accounts for image aspect ratio; calibration rejects unstable observations and feedback uses temporal smoothing. Webcam alignment remains approximate, requiring real-device validation. The scoring formula, recording limits, quota rules, session ownership, and deployed backend lifecycle remain unchanged. The original version is preserved on `main`; see README for restoration instructions.
No public deployment is performed by the redesign.
