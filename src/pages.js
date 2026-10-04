import { icon } from './icons.js';

const brand = `<span class="brand-mark">${icon('sound')}</span><span>stagecraft<span class="brand-period">.</span></span>`;
const bars = Array.from(
  { length: 35 },
  (_, i) =>
    `<i style="--bar:${12 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.36)) * 65}px;--delay:${i * -0.08}s"></i>`,
).join('');
const examples = {
  audio: {
    icon: 'headphones',
    label: 'Listen with fresh ears',
    title: 'Find the rhythm in your words.',
    text: 'Hear your pace, pauses, and filler words with the picture out of the way.',
    note: 'Audio-only review',
    pattern: `<div class="demo-wave">${bars}</div>`,
  },
  video: {
    icon: 'scan',
    label: 'See your presence',
    title: 'Let your delivery speak.',
    text: 'Watch a muted replay and notice your posture, gestures, and movement.',
    note: 'Muted video review',
    pattern: `<div class="demo-person">${icon('scan')}<span>See the full picture.</span></div>`,
  },
  combined: {
    icon: 'spark',
    label: 'Connect the dots',
    title: 'Turn reflection into a next step.',
    text: 'Bring sound and picture together, then explore actionable feedback with your AI coach.',
    note: 'Combined review & coaching',
    pattern: `<div class="demo-coach">${icon('chat')}<span>What should I practice next?</span>${icon('arrow')}</div>`,
  },
};

export function demoView(phase = 'audio') {
  const item = examples[phase] || examples.audio;
  return `<div class="demo-art" aria-hidden="true">${item.pattern}<span>${item.note}</span></div><div class="demo-copy"><span class="mini-label">${icon(item.icon)}${item.label}</span><h3>${item.title}</h3><p>${item.text}</p><span class="example-label">An introduction to the review experience</span></div>`;
}

function navigation(page) {
  return `<a class="skip-link" href="#page-content">Skip to content</a><header class="site-header glass"><a class="brand" href="#home" aria-label="Stagecraft home">${brand}</a><nav class="site-nav" aria-label="Main navigation"><a href="#home" ${page === 'home' ? 'aria-current="page"' : ''}>Home</a><a href="#how-it-works">How it works</a><a href="#about" ${page === 'about' ? 'aria-current="page"' : ''}>About us</a></nav><a class="button primary nav-cta" href="#studio">Open studio ${icon('external')}</a></header>`;
}

function footer() {
  return `<footer class="site-footer"><div><a class="brand" href="#home" aria-label="Stagecraft home">${brand}</a><p>A little practice. A little more you.</p></div><nav aria-label="Footer navigation"><a href="#home">Home</a><a href="#about">About us</a><a href="#studio">Speaking studio ${icon('external')}</a></nav><div class="footer-baseline"><span>Stagecraft · Made for your next moment.</span><span>Your voice. Your pace. Your progress.</span></div></footer>`;
}

function endCard() {
  return `<section class="end-card glass"><span class="glass-icon">${icon('mic')}</span><h2>Your next great talk<br>starts with a little practice.</h2><p>Bring an idea. Find your rhythm. Take the next step.</p><a class="button primary" href="#studio">Start a practice ${icon('arrow')}</a><span class="small-print">Up to 5 minutes per session · No account needed</span></section>`;
}

function home() {
  return `<section class="landing-hero"><div class="hero-copy"><span class="hero-badge glass">${icon('spark')} A little practice. A clearer voice.</span><h1>Make yourself<br><span>heard.</span></h1><p>A quiet space to practice your talk, see what works, and feel more prepared for your next moment.</p><div class="hero-actions"><button class="button primary hero-primary" id="enter">Enter studio ${icon('arrow')}</button><a class="button hero-secondary" href="#how-it-works">See how it works ${icon('down')}</a></div><div class="hero-details"><span>${icon('clock')}Five-minute sessions</span><span>${icon('shield')}Video stays on your device</span></div></div><div class="hero-art" aria-label="Illustration of a glass microphone surrounded by the three review perspectives" role="img"><div class="orbit orbit-one"></div><div class="orbit orbit-two"></div><div class="glass-lens"><div class="lens-shine"></div><div class="mic-sculpture"><div class="mic-capsule"><div class="mic-grille"></div><span class="mic-light"></span></div><div class="mic-cradle"></div><div class="mic-stem"></div><div class="mic-base"></div></div></div><div class="float-note note-voice glass">${icon('sound')}<div><strong>Your voice, in focus</strong><span>Listen. Notice. Improve.</span></div></div><div class="float-note note-presence glass">${icon('scan')}<span>Find your presence</span></div><div class="float-note note-coach glass">${icon('spark')}<span>One thoughtful next step</span></div><span class="art-caption">A space to grow into your voice.</span></div></section><section class="occasion-strip" aria-label="Practice occasions"><span>For the moments that matter</span><div><span>Class presentations</span><span class="occasion-divider" aria-hidden="true">·</span><span>Big ideas</span><span class="occasion-divider" aria-hidden="true">·</span><span>Team updates</span><span class="occasion-divider" aria-hidden="true">·</span><span>Everyday conversations</span></div></section><section class="how-section" id="how-it-works"><div class="section-heading"><p class="eyebrow">A fresh perspective</p><h2>One talk.<br>Three ways to grow.</h2><p>It’s easier to improve when you know what to notice.<br>Take your practice one perspective at a time.</p></div><div class="perspective-cards">${[
    [
      'headphones',
      '01',
      'Hear the difference.',
      'Listen back without distractions. Explore your pace, pauses, and the little words in between.',
      'blue',
    ],
    [
      'scan',
      '02',
      'See your presence.',
      'Watch your muted recording. Notice how your posture and movement support your message.',
      'purple',
    ],
    [
      'spark',
      '03',
      'Find your next step.',
      'Bring it all together. Ask your AI coach questions and leave with something specific to practice.',
      'peach',
    ],
  ]
    .map(
      ([symbol, number, title, text, color]) =>
        `<article class="perspective-card glass ${color}"><div class="card-top"><span class="glass-icon">${icon(symbol)}</span><span>${number}</span></div><h3>${title}</h3><p>${text}</p></article>`,
    )
    .join(
      '',
    )}</div><div class="experience glass"><div class="experience-toolbar"><div>${icon('sound')} The practice experience</div><div role="tablist" aria-label="Explore review stages">${['audio', 'video', 'combined'].map((phase, i) => `<button role="tab" id="demo-tab-${phase}" data-demo="${phase}" aria-controls="demo-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${phase === 'audio' ? 'Listen' : phase === 'video' ? 'Watch' : 'Reflect'}</button>`).join('')}</div></div><div id="demo-panel" class="demo-panel" role="tabpanel" aria-labelledby="demo-tab-audio" tabindex="0">${demoView()}</div></div></section><section class="principle-strip"><div><span class="glass-icon">${icon('edit')}</span><h3>Your words. Your starting point.</h3><p>Bring your own script or turn a topic into a first draft with Gemini.</p></div><div><span class="glass-icon">${icon('sliders')}</span><h3>Practice that fits you.</h3><p>Sit or stand. Calibrate to your natural posture. Focus on progress at your pace.</p></div><div><span class="glass-icon">${icon('shield')}</span><h3>Clear about what’s shared.</h3><p>Full video stays local. AI feedback uses audio and selected images after your consent.</p></div></section><section class="faq-section"><div class="section-heading"><p class="eyebrow">Before your first take</p><h2>A few good questions.</h2></div><div class="faq-list">${[
    [
      'What do I need to get started?',
      'A desktop Chrome or Edge browser, a camera, a microphone, and an idea. Bring your own script or use Gemini to help draft one. Each practice can last up to five minutes.',
    ],
    [
      'Does Stagecraft measure confidence?',
      'Stagecraft helps you reflect on observable speaking habits, including pace, pauses, and posture. A webcam cannot measure how confident you feel. Your practice score is a coaching aid, not a judgment of you.',
    ],
    [
      'Where does my recording go?',
      'The full video stays in your browser. With your consent, audio and selected still frames are sent to Gemini for feedback. Google’s free service may use content for product improvement and human review. Use non-sensitive practice material.',
    ],
    [
      'Can I practice without AI?',
      'Yes. With the local app running, you can write a script, record, track posture, and play back your practice without a Gemini key. AI scripts, transcription, summaries, and chat need a configured key and available quota.',
    ],
  ]
    .map(([q, a]) => `<details><summary>${q}${icon('down')}</summary><p>${a}</p></details>`)
    .join('')}</div></section>${endCard()}`;
}

function about() {
  return `<section class="about-hero"><span class="hero-badge glass">${icon('heart')} About Stagecraft</span><h1>Every voice<br>deserves a <span>stage.</span></h1><p>We believe speaking well is something you can practice.<br>One idea, one attempt, one small improvement at a time.</p></section><section class="mission-grid"><div class="mission-art glass" aria-hidden="true"><div class="mission-orb">${icon('sound')}</div><span class="mission-caption">Less pressure.<br>More possibility.</span><div class="mission-rings"></div></div><div class="mission-copy"><p class="eyebrow">Why we’re here</p><h2>The space between<br>“I have an idea”<br>and saying it out loud.</h2><p>A good idea deserves to be heard. But watching yourself speak can feel overwhelming: your words, your voice, your movement, all at once.</p><p>Stagecraft creates room to notice one thing at a time. Listen first. Watch next. Then bring the two together with practical feedback you can take into your next attempt.</p><a class="text-link" href="#how-it-works">Explore the practice process ${icon('arrow')}</a></div></section><section class="values-section"><div class="section-heading"><p class="eyebrow">What we believe</p><h2>Built around your progress.</h2></div><div class="perspective-cards">${[
    [
      'heart',
      'Coaching with care.',
      'Feedback should give you a next step, not a label. We focus on observable habits and useful suggestions, without making assumptions about who you are.',
    ],
    [
      'eye',
      'Clarity over guesswork.',
      'A score should have a reason. Speech and posture measurements support the feedback, and missing evidence is shown instead of pretending to know.',
    ],
    [
      'access',
      'Room for your own style.',
      'There is no single way to sound compelling. Seated or standing, thoughtful or animated, the aim is to help your delivery support your message.',
    ],
  ]
    .map(
      ([symbol, title, text]) =>
        `<article class="perspective-card glass"><span class="glass-icon">${icon(symbol)}</span><h3>${title}</h3><p>${text}</p></article>`,
    )
    .join(
      '',
    )}</div></section><section class="about-note glass"><span class="glass-icon">${icon('shield')}</span><div><p class="eyebrow">A thoughtful use of AI</p><h2>You bring the voice.<br>Technology brings another perspective.</h2><p>Gemini helps draft scripts and explain your practice. Browser-based tracking notices posture changes. Neither replaces your judgment or tells you how you feel. Full video stays on your device; audio and selected images are shared for AI feedback only after the disclosure in the studio.</p><a class="text-link" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Read Gemini’s data terms ${icon('external')}</a></div></section>${endCard()}`;
}

export function publicPage(page) {
  return `<div class="public-site" id="${page}">${navigation(page)}<main id="page-content" tabindex="-1">${page === 'about' ? about() : home()}</main>${footer()}</div>`;
}
