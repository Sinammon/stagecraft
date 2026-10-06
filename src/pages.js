import { icon } from './icons.js';

const brand = `<span class="brand-mark">${icon('sound')}</span><span>stagecraft<span class="brand-period">.</span></span>`;
const examples = {
  audio: {
    title: 'Find the rhythm in your words.',
    text: 'Listen without the picture. Notice where an idea lands, where you rush, and where a pause would help.',
    heading: 'A little space makes a difference.',
    excerpt:
      '“The thing I learned was simple. A small habit, repeated, can change how you approach something new.”',
    annotation: 'Try a breath after “simple” to give your next idea room.',
    icon: 'headphones',
  },
  video: {
    title: 'Let your delivery speak.',
    text: 'Watch a muted replay. Notice your posture, gestures, and movement without getting caught up in the words.',
    heading: 'Look at one thing at a time.',
    excerpt:
      'Head and shoulders in frame. Hands free to move. A natural position you can return to.',
    annotation: 'Compare your delivery with your own calibrated baseline.',
    icon: 'scan',
  },
  combined: {
    title: 'Turn reflection into a next step.',
    text: 'Bring sound and picture together. Explore the evidence with your AI coach and choose one useful thing to practice.',
    heading: 'Make your next take intentional.',
    excerpt: '“What should I practice next?”',
    annotation: 'Ask for a short exercise grounded in your completed review.',
    icon: 'chat',
  },
};

export function demoView(phase = 'audio') {
  const item = examples[phase] || examples.audio;
  return `<div class="demo-copy"><h3>${item.title}</h3><p>${item.text}</p></div><div class="demo-example"><span class="example-label">Illustrative example · not an actual AI review</span><h4>${item.heading}</h4><p class="demo-excerpt">${item.excerpt}</p><p class="demo-annotation">${icon(item.icon)}${item.annotation}</p></div>`;
}

function navigation(page) {
  return `<a class="skip-link" href="#page-content">Skip to content</a><header class="site-header"><a class="brand" href="#home" aria-label="Stagecraft home">${brand}</a><nav class="site-nav" aria-label="Main navigation"><a href="#home" ${page === 'home' ? 'aria-current="page"' : ''}>Home</a><a href="#how-it-works">How it works</a><a href="#about" ${page === 'about' ? 'aria-current="page"' : ''}>About us</a></nav><a class="button primary nav-cta" href="#studio">Open studio ${icon('external')}</a></header>`;
}

function footer() {
  return `<footer class="site-footer"><div><a class="brand" href="#home" aria-label="Stagecraft home">${brand}</a><p>For the things you want to say.</p></div><nav aria-label="Footer navigation"><a href="#home">Home</a><a href="#about">About us</a><a href="#studio">Speaking studio ${icon('external')}</a></nav><div class="footer-baseline"><span>Practice at your own pace.</span><span>Built for students and everyday speaking.</span></div></footer>`;
}

function endCard() {
  return `<section class="end-card"><div><h2>You have something to say.<br>Give it a practice run.</h2><p>No audience. No perfect first take. Just a place to start.</p></div><div><a class="button primary" href="#studio">Start a practice ${icon('arrow')}</a><p class="small-print">Up to 5 minutes · No account needed</p></div></section>`;
}

function home() {
  return `<section class="landing-hero"><div class="hero-copy"><h1>Make yourself<br><span>heard.</span></h1><p>A private space to find your words, practice your delivery, and feel ready for the moments that matter.</p></div><form id="practice-launcher" class="practice-launcher"><label for="practice-topic">What are you practicing for?</label><div class="launcher-input"><input id="practice-topic" maxlength="400" placeholder="A class presentation, a new idea, a conversation…"><button class="button primary hero-primary" id="enter" type="submit">Enter studio ${icon('arrow')}</button></div><div class="occasion-options" aria-label="Choose a practice occasion"><button type="button" data-topic="Introduce an idea to my class">Class presentation</button><button type="button" data-topic="Introduce myself to someone new">An introduction</button><button type="button" data-topic="Explain something I care about">An idea worth sharing</button></div></form><div class="hero-baseline"><span>${icon('clock')}Five minutes for your next step.</span><span>${icon('shield')}Full video stays on your device.</span><a href="#how-it-works">See how it works ${icon('down')}</a></div><ol class="hero-sequence" aria-label="Your review process"><li><span>01</span><div><strong>Listen.</strong><p>Find the rhythm in your voice.</p></div>${icon('headphones')}</li><li><span>02</span><div><strong>Watch.</strong><p>See what your delivery adds.</p></div>${icon('video')}</li><li><span>03</span><div><strong>Reflect.</strong><p>Choose one thing to practice next.</p></div>${icon('chat')}</li></ol></section><section class="how-section" id="how-it-works"><div class="section-heading"><h2>One talk.<br>Three fresh perspectives.</h2><p>Watching yourself speak can be a lot.<br>Start with one thing, then bring it all together.</p></div><div class="experience"><div class="experience-toolbar"><span>Explore the review process</span><div role="tablist" aria-label="Explore review stages">${['audio', 'video', 'combined'].map((phase, i) => `<button role="tab" id="demo-tab-${phase}" data-demo="${phase}" aria-controls="demo-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">${icon(examples[phase].icon)}${phase === 'audio' ? 'Listen' : phase === 'video' ? 'Watch' : 'Reflect'}</button>`).join('')}</div></div><div id="demo-panel" class="demo-panel" role="tabpanel" aria-labelledby="demo-tab-audio" tabindex="0">${demoView()}</div></div></section><section class="practice-principles"><div class="principles-intro"><h2>A little practice.<br>A little more you.</h2><p>A first draft is a starting point. Your next take is a chance to try something new.</p><a class="text-link" href="#studio">Find your starting point ${icon('arrow')}</a></div><div class="principle-list"><article><h3>Your words, first.</h3><p>Write your own script or turn a topic into a draft with Gemini. Edit it until it sounds like you.</p></article><article><h3>A baseline that fits you.</h3><p>Sit or stand. Calibrate to your natural posture. Feedback focuses on observable habits, without guessing how you feel.</p></article><article><h3>Clear about what’s shared.</h3><p>Practice locally or opt into AI review. Full video stays in your browser; AI uses audio and selected images with your consent.</p></article></div></section><section class="faq-section"><div><h2>Before your<br>first take.</h2><p>A few things worth knowing.</p></div><div class="faq-list">${[
    [
      'What do I need to get started?',
      'Use a desktop Chrome or Edge browser, a camera, a microphone, and an idea. Bring your own script or ask Gemini to draft one. Each practice can last up to five minutes. You can explore the site and prepare a script on mobile.',
    ],
    [
      'Does Stagecraft measure confidence?',
      'Stagecraft helps you reflect on observable speaking habits, including pace, pauses, and posture. A webcam cannot measure how confident you feel. Your practice score is a coaching aid, not a judgment of you.',
    ],
    [
      'Where does my recording go?',
      'The full video stays in your browser and is cleared when you reset or close the page. With your consent, audio and selected still frames go to Gemini for feedback. Google’s free service may use content for product improvement and human review. Use non-sensitive practice material.',
    ],
    [
      'Can I practice without AI?',
      'Yes. Write a script, record, and play back your practice locally. You do not need to consent to cloud processing for local recording. AI drafting, transcription, reviews, and coaching require a configured service and available quota.',
    ],
    [
      'Why might my overall score be unavailable?',
      'A score needs at least 30 seconds of delivery, 50 words with valid timestamps, and enough usable posture tracking. When evidence is missing, Stagecraft explains the limitation instead of inventing a score.',
    ],
  ]
    .map(([q, a]) => `<details><summary>${q}${icon('down')}</summary><p>${a}</p></details>`)
    .join('')}</div></section>${endCard()}`;
}

function about() {
  return `<section class="about-hero"><h1>Every voice<br>deserves a <span>stage.</span></h1><p>Speaking well is something you can practice.<br>One idea, one attempt, one useful next step.</p></section><section class="mission-section"><h2>The space between<br>having an idea<br>and saying it out loud.</h2><div><p>You might have a presentation coming up. Or a question you want to ask. Or something you care about that is harder to explain out loud.</p><p>Stagecraft gives you room to rehearse without an audience. Listen first, watch next, and notice one thing at a time. Bring the observations together when you’re ready.</p><p>The goal is a useful next attempt. Your voice doesn’t need to become someone else’s.</p><a class="text-link" href="#studio">Give yourself a practice run ${icon('arrow')}</a></div></section><section class="values-section"><h2>A better kind of feedback.</h2><div class="value-list">${[
    [
      'Useful, not judgmental.',
      'An observation should help you choose a next step. Feedback describes speaking habits without labeling your personality or assuming how you feel.',
    ],
    [
      'Evidence, not guesswork.',
      'Your score comes from a transparent rubric. Reviews link to moments in your recording when evidence is available. Missing data stays visible.',
    ],
    [
      'Room for your own style.',
      'There is no single way to sound compelling. Seated or standing, thoughtful or animated, practice should help your delivery support your message.',
    ],
  ]
    .map(([title, text]) => `<article><h3>${title}</h3><p>${text}</p></article>`)
    .join(
      '',
    )}</div></section><section class="about-note"><h2>Your voice.<br>Your choice.</h2><div><p>Gemini can help draft a script and explain your practice. Browser-based tracking notices changes in visible posture. Neither tells you how you feel or replaces your judgment.</p><p>Full video stays on your device. Audio and selected images are shared for AI feedback only when you opt in. Local recording is available without cloud review.</p><a class="text-link" href="https://ai.google.dev/gemini-api/terms" target="_blank" rel="noopener noreferrer">Read Gemini’s data terms ${icon('external')}</a></div></section>${endCard()}`;
}

export function publicPage(page) {
  return `<div class="public-site" id="${page}">${navigation(page)}<main id="page-content" tabindex="-1">${page === 'about' ? about() : home()}</main>${footer()}</div>`;
}
