# Heard design system

Heard is a browser-first speaking studio. The name and scalable speech-and-waveform mark draw on
the supplied brand reference. The interface is a focused workspace, with enough character to feel
welcoming and enough restraint to keep attention on the user's talk.

## Information architecture

- **Home** (`#home`): one promise, one topic launcher, a three-step overview, an illustrative review
  explorer, and a compact FAQ. No testimonials, invented results, or duplicate promotional CTAs.
- **Our approach** (`#about`): preparation, observable feedback, evidence, and plain-language privacy.
- **Studio** (`#studio`): three progress stages — Prepare, Practice, Review. Preparation offers manual
  writing and Gemini drafting. Practice includes device selection, seated/standing posture,
  optional calibration, explicit AI consent, and recording. Review has Listen, Watch, and Reflect
  modes for audio-only, muted video, and combined playback with coaching.

Hash navigation preserves draft/review state. Busy actions and recording protect against accidental
navigation. The old draft storage key is deliberately retained for existing users.

## Identity

- Name: **Heard**; wordmark: lowercase **heard**, Geist 750 with tight tracking.
- Mark: two speech frames enclosing five sound bars. Flat orange, scalable SVG, no raster dependency.
- Assets: `src/brand.js`, `public/heard-mark.svg`, `public/favicon.svg`.
- Canvas: `#faf9f6`; text: `#252622`; secondary text: `#6e7068`.
- Accent: `#ec572e`, used for the mark and small visual details.
- Serif accent text: `#a94a2b`; peach illustration field: `#f5e7dc`.
- Surfaces: white and `#f3f2ee`; borders: `#eaeaea`; evidence/score tint: `#edf2e9`.
- Errors: `#a53227` on `#fcece6`.

## Typography and components

Self-hosted Geist handles UI, forms, and feedback. Instrument Serif handles public page headlines,
illustrative excerpts, and preparation guidance. No remote font calls. Headings use tight tracking;
body text uses 1.65 line height. Public headlines have at most two deliberate lines on desktop.

Primary actions are charcoal with white text and 6px corners. Secondary actions are white with a
quiet border. Panels use 1px structural borders, 10px corners, and generous internal space. There
are no gradients or heavy shadows. Phosphor Bold SVG icons are bundled individually.

The script editor is the largest preparation surface. Guidance is secondary and removed on narrow
screens. Setup puts the camera first and optional settings alongside it. Recording puts Finish
practice next to the timer. Reviews keep playback, measured data, evidence, and feedback together.
Unavailable measurements stay explicit; illustrations never masquerade as live results.

## Interaction and accessibility

- Skip links on public pages and in the studio, semantic navigation, labeled form inputs.
- Visible focus, arrow/Home/End keyboard behavior for script and review-example tabs.
- Short status messages, persistent errors, disabled actions while work is in progress.
- Unchecked AI consent by default; provider data-use disclosure beside the opt-in.
- Muted video-only playback remains enforced. Full video stays local.
- Responsive layouts from 320px to desktop; supported recording remains desktop Chromium.
- Below-the-fold public sections reveal once through IntersectionObserver. Reduced motion bypasses
  entrance transitions and animated spinners. Camera overlays use opaque backgrounds, including
  reduced-transparency preference support.

## Scope

This redesign changes branding, layout, navigation presentation, and copy. API paths, scoring,
recording limits, quota rules, session ownership, and deployed backend lifecycle remain unchanged.
No public deployment is performed by the redesign.
