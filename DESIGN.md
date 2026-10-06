---
name: Stagecraft
description: A private speaking practice studio with three perspectives and one useful next step.
colors:
  green: '#194c3d'
  green-hover: '#103b2e'
  pine-field: '#173f33'
  mint: '#dbefdf'
  mint-highlight: '#c4e6c8'
  mint-hover: '#c6dfca'
  ink: '#172d27'
  muted: '#57675e'
  page: '#f7f8f5'
  paper: '#fff'
  surface: '#eef2ec'
  line: '#d8dfd7'
  field-border: '#aebdaf'
  field-border-hover: '#6e8876'
  focus: '#39795c'
  field-placeholder: '#617466'
  pine-text: '#f4f9f2'
  pine-muted: '#d0e1d5'
  pine-line: '#537562'
  mint-text: '#415b49'
  step-active: '#dbe8d9'
  red: '#9e342c'
  red-hover: '#7f251f'
  error-text: '#8c2f25'
  error-surface: '#faeae5'
  success-text: '#275637'
  success-surface: '#e1efde'
  warning-text: '#6d5a24'
  media: '#162921'
  media-label: '#183b2f'
  media-label-text: '#eaf4e8'
typography:
  display:
    fontFamily: 'Sora Variable, sans-serif'
    fontSize: 'clamp(3.4rem, 7vw, 5.65rem)'
    fontWeight: 550
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  display-mobile:
    fontFamily: 'Sora Variable, sans-serif'
    fontSize: 'clamp(3rem, 12vw, 4.4rem)'
    fontWeight: 550
    lineHeight: 1.04
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Sora Variable, sans-serif'
    fontSize: 'clamp(1.9rem, 3.2vw, 2.6rem)'
    fontWeight: 550
    lineHeight: 1.3
    letterSpacing: '-0.035em'
  studio-headline:
    fontFamily: 'Sora Variable, sans-serif'
    fontSize: '1.85rem'
    fontWeight: 550
    lineHeight: 1.2
    letterSpacing: '-0.035em'
  title:
    fontFamily: 'Source Sans 3 Variable, Segoe UI, sans-serif'
    fontSize: '1.2rem'
    fontWeight: 650
    lineHeight: 1.4
  body:
    fontFamily: 'Source Sans 3 Variable, Segoe UI, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: 'Source Sans 3 Variable, Segoe UI, sans-serif'
    fontSize: '0.9rem'
    fontWeight: 600
  button:
    fontFamily: 'Source Sans 3 Variable, Segoe UI, sans-serif'
    fontSize: '0.93rem'
    fontWeight: 600
  metric:
    fontFamily: 'Source Sans 3 Variable, Segoe UI, sans-serif'
    fontSize: '1.7rem'
    fontWeight: 600
rounded:
  evidence: '5px'
  compact: '6px'
  field: '7px'
  button: '8px'
  media: '10px'
  radius: '12px'
spacing:
  gap-sm: '8px'
  gap: '10px'
  inset-sm: '12px'
  inset-md: '16px'
  inset-lg: '20px'
  section-sm: '24px'
  panel: '26px'
  section-md: '28px'
  section-lg: '36px'
  gutter: '40px'
  feature: '48px'
  section-mobile: '60px'
components:
  button-primary:
    backgroundColor: '{colors.green}'
    textColor: '{colors.paper}'
    typography: '{typography.button}'
    rounded: '{rounded.button}'
    padding: '11px 19px'
  button-primary-hover:
    backgroundColor: '{colors.green-hover}'
  button-secondary:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    typography: '{typography.button}'
    rounded: '{rounded.button}'
    padding: '11px 19px'
  button-secondary-hover:
    backgroundColor: '{colors.surface}'
  button-stop:
    backgroundColor: '{colors.red}'
    textColor: '{colors.paper}'
    typography: '{typography.button}'
    rounded: '{rounded.button}'
    padding: '11px 19px'
  button-stop-hover:
    backgroundColor: '{colors.red-hover}'
  button-text:
    backgroundColor: 'transparent'
    textColor: '{colors.green}'
    padding: '12px 4px'
  field:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.field}'
    padding: '11px 13px'
    width: '100%'
  navigation-link:
    textColor: '{colors.muted}'
    padding: '10px 0'
  evidence-link:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.green}'
    rounded: '{rounded.evidence}'
    padding: '6px 10px'
  panel:
    backgroundColor: '{colors.paper}'
    textColor: '{colors.ink}'
    rounded: '{rounded.radius}'
    padding: '{spacing.panel}'
  score-panel:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.ink}'
    rounded: '{rounded.radius}'
    padding: '25px'
  review-tab:
    backgroundColor: 'transparent'
    textColor: '{colors.muted}'
    rounded: '{rounded.compact}'
    padding: '10px 16px'
  review-tab-selected:
    backgroundColor: '{colors.mint}'
    textColor: '{colors.green}'
---

# Design System: Stagecraft

## Overview

**Creative North Star: "Campus arts festival identity"**

Generous geometric lettering, strong pine fields, and clear program-like sequencing give Stagecraft a recognizable public voice. The studio carries that identity into quiet, light task surfaces where writing, recording, and reflection stay readable. The owner chose direct implementation in code; this document captures the finished implementation rather than a separate approved comp.

The system is minimal, elegant, and approachable for students and everyday speaking practice. Solid color, restrained corners, thin dividers, and clear state changes do the visual work. There is no decorative glass, gradient treatment, or shipping raster artwork; self-hosted fonts, the SVG favicon, and Lucide SVG icons support the interface.

**Key Characteristics:**

- Geometric Sora headings paired with readable Source Sans 3 interface text.
- Pine identity fields with mint emphasis and neutral working surfaces.
- Flat panels, thin borders, and restrained corners.
- Responsive task layouts with explicit evidence and privacy states.

## Colors

The palette joins deep green identity and pale mint emphasis with softly green-tinted neutrals. Frontmatter values are normative; names below describe their use.

### Primary

- **Pine Green** (`green`, `green-hover`): primary actions, links, active navigation, and meaningful meter fills.
- **Opening Pine** (`pine-field`): the public opening field and browser theme color. Its text uses `pine-text` and `pine-muted`; `pine-line` separates the review sequence.
- **Pale Mint** (`mint`, `mint-highlight`, `mint-hover`): selected review tabs, evidence links, score surfaces, and closing invitations. Highlight mint also supplies focus contrast on pine.

### Neutral

- **Green Ink** (`ink`): ordinary reading and task text; **Quiet Sage** (`muted`): explanations, captions, labels, and secondary navigation.
- **Soft Page** (`page`), **White Paper** (`paper`), and **Quiet Surface** (`surface`): page ground, working panels, and sidebar or notice layers.
- **Fine Divider** (`line`): panel borders and reading separators. Fields use the stronger `field-border`, becoming `field-border-hover` on hover.
- **Mint Ink** (`mint-text`): smaller copy on mint panels; **Active Step** (`step-active`): current progress item.
- **Focus Green** (`focus`): visible keyboard outlines on light surfaces; `field-placeholder` remains legible inside fields.
- **Media Ground** (`media`), **Media Label** (`media-label`, `media-label-text`): dark video containers and opaque preview annotations.

Error red is reserved for stopping recording and failed actions. Error, success, and connection warning have distinct text/surface roles (`red`, `red-hover`, `error-text`, `error-surface`, `success-text`, `success-surface`, `warning-text`); they are semantic states rather than additional brand accents.

**The State Color Rule.** Keep pine and mint attached to identity, actions, selection, and supported observations. Use red for stop/error states, and accompany state color with readable text.

## Typography

**Display Font:** Sora Variable (sans-serif fallback).
**Body Font:** Source Sans 3 Variable (Segoe UI, sans-serif fallback).

Both Latin variable WOFF2 files are self-hosted through Fontsource with `font-display: swap`. Sora uses the implemented weight range (100–800); Source Sans 3 uses (200–900). Geometric headings carry personality while the body family keeps long drafts and compact controls readable. There is no distinct mono family.

### Hierarchy

- **Display:** `display` for the home heading; at widths (600px) and below use `display-mobile`. About uses its own observed heading clamp (`clamp(3rem, 6.5vw, 5rem)`, line-height (1.1)), then (2.75rem) on mobile.
- **Headline:** `headline` for major public section headings; mobile sections settle at (1.9rem). Standard secondary headings use (1.55rem), weight (550), line-height (1.3).
- **Studio headline:** `studio-headline`; below (1280px) it becomes (1.7rem), below (800px) (1.75rem), and below (600px) (1.55rem).
- **Title:** `title` for ordinary third-level headings. Demonstration headings use Sora, weight (500), size (1.55rem), line-height (1.35).
- **Body:** `body`; root size is (17px), changing to (16px) at (600px). Descriptions and FAQ copy use an observed maximum of (65ch). Script text uses line-height (1.8); script-follow text uses (1.85).
- **Label and control:** `label` and `button`; ordinary interface copy stays sentence case. Only preview annotations use uppercase, small sizes, and gentle tracking.
- **Numbers:** `metric` for review metrics, with tabular numerals. Timers and scores also use tabular numerals; live score size is (2.7rem), final score (2.8rem), shrinking to (2.2rem) on mobile.

**The Two Voices Rule.** Use Sora for major headings and the wordmark, and Source Sans 3 for work, evidence, and controls. Do not turn small interface text into display typography.

## Layout

Public header/footer containers cap at (1280px); reading sections cap at (1200px). Large-screen gutters are (40px). Public full-width fields calculate their inset from the (1200px) content width. The studio uses a (228px) sticky sidebar and a fluid main column; workspace width caps at (1360px) with (36px) padding. Its script/setup split is (1.85fr / 1fr), with a minimum aside width of (250px) and a (30px) gap. Review uses (1.15fr / 1fr) with a (34px) gap. The spacing primitives above are extracted repeated measurements, not a replacement grid imposed on the existing CSS.

Responsive thresholds are maximum widths, applied in source order:

- **1280px:** public sections receive (40px) side margins; workspace padding reduces to (28px).
- **1050px:** sidebar shrinks to (195px); script/setup split stacks, supplementary unpanelled script advice hides; recording retains a (240px) aside. Public two-column section gaps tighten.
- **800px:** studio sidebar becomes a static top region and progress becomes a horizontally scrollable sequence. Recording/review stack; recording statistics form two columns. Public side insets reduce to (30px).
- **600px:** root type drops to (16px); public header wraps and navigation takes its own row. Public insets become (24px), studio workspace (18px). Launcher, reading columns, fields, and recording statistics stack. The three-part public sequence becomes vertical; selected controls keep their state cues.

Body supports a minimum width of (320px). Use `minmax(0, …)` and `min-width: 0` to let grids and fields shrink; preserve readable labels when columns collapse. Occasion links and public navigation gain a minimum (44px) interaction height on small screens.

Browser surfaces retain hash navigation (`#home`, `#about`, `#studio`, `#how-it-works`) and route-specific document titles. Recording requires desktop Chromium on localhost or HTTPS; small screens still expose public pages and script preparation. That capability boundary must be explained in copy rather than implied by decorative controls.

## Elevation & Depth

The interface is flat: no box shadows, blur, or gradient elevation vocabulary is implemented. Depth comes from white panels against the soft page, the slightly darker sidebar, mint state surfaces, and thin borders. Media remains a contained dark plane with opaque readable annotations.

**The Solid Surface Rule.** Establish hierarchy with color, spacing, and dividers. Do not add glass, unnecessary gradients, or decorative shadows to functional surfaces.

## Shapes

Buttons and notices have quiet corners (`button`, (8px)); fields and progress items use (`field`, (7px)); compact tabs and time chips use (`compact`, (6px)); evidence buttons and preview labels use (`evidence`, (5px)). Major panels use the shared radius (`radius`, (12px)). Launcher and video containers use (`media`, (10px)). Video clips to an observed (16:9) aspect ratio. Tiny waveform bars have (1px) corners; recording dots and spinners are circular. Borders are generally (1px), while selected tab underlines use (2px).

## Components

### Buttons

Quiet, direct actions with a minimum height of (46px), (10px) icon gap, and the `button` typography. Primary, secondary, stop, and text variants exist. Primary darkens on hover; secondary gains quiet-surface fill and a stronger border; stop darkens in red. Pressing a standard button moves it down (1px). Disabled buttons reduce opacity to (0.52) and use a not-allowed cursor. Text actions retain underlines rather than becoming anonymous icons.

Keyboard focus uses a (3px) outline with (4px) offset. It switches to mint on the dark public field; the white launcher restores green focus. Button background/color/transform transitions run (180ms) using the shared easing in the sidecar.

### Chips

Evidence links are mint, compact, and rounded; hover deepens mint. They seek a supported recording timestamp. Timeline chips are white, bordered, use tabular numerals, and turn mint on hover. Chips describe real evidence or actions; they do not imply a leaderboard or fabricated review.

### Cards / Containers

Functional panels are white with fine borders and shared major corners. Base studio padding is (26px), becoming (20px) on mobile. Feedback/audio containers use their observed (26px)/(28px) padding and reduce to (22px) on mobile. Neutral notices use (13px 16px) inset; errors and success banners pair semantic fill with readable text and alert/status roles. Do not convert all reading content into cards: public principles and FAQ entries use open layout and dividers.

### Inputs / Fields

White fields use stronger borders, restrained field corners, and (11px 13px) padding. Hover strengthens the border, focus uses pine plus the visible outline, and disabled inputs use the quiet surface. Textareas are vertically resizable with a minimum height of (300px), or (280px) on mobile. Labels stay visible; placeholder copy supplements them. Field errors appear in the existing semantic notice/banner system; there is no invented red field-outline variant.

Mode choices use native radios inside bordered (7px) containers; selection gives mint fill and a stronger green border. Cloud consent uses an explicit native checkbox, clear terms, and a local-practice explanation. AI-only controls become unavailable when the backend lacks configuration.

### Navigation

Public links are quiet at rest and pine on hover/current page. Current pages gain an underline (2px thick, (9px) offset). Studio progress is an ordered list, not a row of fake links: current steps have a mint-tinted field and `aria-current="step"`; completed steps show checks. Public review explorer tabs use roving keyboard focus and mint selected state. Script and review tabs use a green underline rather than an enclosing card.

### Practice and review

The topic launcher is a functional white field on the public pine opening. Occasion choices fill its topic; submitting carries that topic into studio preparation. The public review explorer always labels its text as an illustrative example. Its content changes with a short (220ms) vertical movement of (5px).

Camera preview is mirrored, including its tracking overlay; recorded playback is unmirrored. Audio review shows audio controls, visual review keeps playback muted, and combined review permits full playback. Preview status labels stay solid and readable. Native browser audio/video controls remain the playback surface.

Score panels are mint with large tabular numbers and a slim meter. A missing score displays an em dash and a reason. Live scores begin in **Collecting evidence**, become available only with sufficient usable speech and posture evidence, and remain provisional. Final scores come from the deterministic rubric, never an AI opinion. Missing evidence stays unavailable; camera observations cannot establish internal confidence.

Processing has explicit waiting/running/ready/retry/skipped text and a (750ms) linear spinner while running. Local recording and playback remain useful when AI is absent or fails. Gemini drafting, transcription, review, and coaching require a configured server-side key and quota. Optional cloud review requires consent before audio and selected images leave the browser; full video stays local. Coaching remains disabled until a combined report exists and uses neutral/mint conversation blocks plus an explicit error state.

All animations and transitions are removed under `prefers-reduced-motion: reduce`; scroll behavior becomes automatic. Do not use motion as the sole indicator of state. The reduced-transparency rule keeps media labels opaque.

## Do's and Don'ts

### Do:

- **Do** keep Sora headings and Source Sans 3 work text in their established roles.
- **Do** use flat solid surfaces, fine borders, and the established corner hierarchy.
- **Do** preserve visible focus, labeled fields, current-step cues, and reduced-motion behavior.
- **Do** show evidence availability, provisional scores, and local/cloud choices in readable text.
- **Do** let task layouts stack while retaining the primary action and supported playback.

### Don't:

- **Don't** add decorative glass, unnecessary gradients, or decorative shadows.
- **Don't** present illustrative excerpts as actual AI reviews or invent customer claims.
- **Don't** substitute a confidence judgment or invented number for missing evidence.
- **Don't** imply cloud processing is enabled before configuration and explicit media consent.
- **Don't** introduce raster hero artwork or new typography when extending this visual world.
