import './style.css';
import { icon } from './icons.js';
import { publicPage, demoView } from './pages.js';
import { api, post, streamChat } from './api.js';
import { PracticeMedia } from './media.js';
import { escape, wordCount, readingTime } from './text.js';
import { loadDraft, saveDraft } from './draft.js';
import { scriptView as prepareView, setupView as sceneView } from './studio-views.js';
import { parseReport } from '../shared/reports.js';

const formatTime = (ms) =>
  `${String(Math.floor(ms / 60000)).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')}`;
const $ = (id) => document.getElementById(id);
const state = {
  screen: 'welcome',
  script: '',
  scriptTab: 'write',
  topic: '',
  audience: 'My classmates',
  duration: 2,
  mode: 'seated',
  consent: false,
  sessionId: null,
  media: null,
  recording: null,
  report: null,
  phase: 'audio',
  health: null,
  error: '',
  success: '',
  busy: false,
  calibrated: false,
  camera: false,
  cameraStatus: '',
  transcript: '',
  interim: '',
  chat: [],
  ...loadDraft(),
};
let generation = 0,
  tick,
  poll,
  chatController;

function progress() {
  return {
    welcome: -1,
    script: 0,
    setup: 1,
    recording: 2,
    processing: 3,
    review: { audio: 3, video: 4, combined: 5 }[state.phase],
  }[state.screen];
}
let currentPage =
  location.hash === '#about' ? 'about' : location.hash === '#studio' ? 'studio' : 'home';
if (currentPage === 'studio') state.screen = 'script';

function render() {
  document.title =
    currentPage === 'about'
      ? 'About us — Stagecraft'
      : currentPage === 'home'
        ? 'Stagecraft — Make yourself heard'
        : 'Speaking studio — Stagecraft';
  if (currentPage !== 'studio') {
    $('app').innerHTML = publicPage(currentPage);
    bindPublic();
    return;
  }
  const active = progress();
  $('app').innerHTML =
    `<div class="app-shell"><aside class="sidebar"><div class="brand"><span class="brand-mark">${icon('sound')}</span>stagecraft.</div><nav class="studio-site-links" aria-label="Website navigation"><a href="#home">${icon('home')}<span>Home</span></a><a href="#about">${icon('info')}<span>About us</span></a></nav><nav aria-label="Practice progress"><p class="sidebar-label">Your practice</p><ol class="steps">${['Prepare your script', 'Set the scene', 'Record your talk', 'Listen back', 'Watch your delivery', 'Bring it together'].map((label, i) => `<li class="step ${i === active ? 'active' : i < active ? 'done' : ''}" ${i === active ? 'aria-current="step"' : ''}><span class="step-number">${i < active ? icon('check') : String(i + 1).padStart(2, '0')}</span><span class="step-text">${label}</span></li>`).join('')}</ol></nav><div class="sidebar-bottom"><strong>A little practice. A better talk.</strong><p>One session, three perspectives. Focus on your next improvement.</p></div></aside><div class="shell-main"><header class="topbar"><div class="topbar-title">Your workspace <span aria-hidden="true"> / </span> <strong>Speaking studio</strong></div><span class="connection ${state.health && !state.health.aiConfigured ? 'connection-warning' : ''}">${icon(state.health?.aiConfigured ? 'spark' : 'shield')} ${state.health ? (state.health.aiConfigured ? 'AI review available' : 'Local practice · AI unavailable') : 'Connecting to studio'}</span></header><main class="workspace" id="workspace" aria-busy="${state.busy}">${state.error ? `<div class="error-banner" role="alert">${escape(state.error)}</div>` : ''}${state.success ? `<div class="success-banner" role="status">${escape(state.success)}</div>` : ''}${{ script: scriptView, setup: setupView, recording: recordingView, processing: processingView, review: reviewView }[state.screen]()}</main></div>`;
  bind();
  if (state.screen === 'recording' || (state.screen === 'setup' && state.camera)) attachPreview();
  document
    .querySelectorAll('[data-question]')
    .forEach(
      (button) => (button.disabled = Boolean(chatController) || !state.report?.stages?.combined),
    );
  if (state.screen === 'review') bindPlayer();
  if (innerWidth <= 800) {
    const activeStep = document.querySelector('.step.active');
    const navigation = document.querySelector('.steps')?.parentElement;
    if (activeStep && navigation)
      navigation.scrollLeft = activeStep.offsetLeft - navigation.offsetLeft - 8;
  }
}
function head(label, title, description, pill = '') {
  return `<div class="page-head"><div><h1>${title}</h1><p>${description}</p></div>${pill ? `<span class="pill">${icon('clock')}${pill}</span>` : ''}</div>`;
}
function scriptView() {
  return prepareView(state, head);
}
function previewMarkup(recording = false) {
  return `<div class="video-box preview"><video id="preview" autoplay muted playsinline aria-label="Mirrored camera preview"></video><canvas id="pose-overlay" aria-hidden="true"></canvas>${!state.camera ? `<div class="video-placeholder">${icon('video')}<p>Your camera preview will appear here</p></div>` : ''}<span class="preview-tag">${recording ? 'PRACTICE IN PROGRESS' : 'CAMERA PREVIEW'}</span><div class="preview-bottom"><span class="tracking-label" id="tracking">${state.calibrated ? 'Calibrated to your baseline' : 'Calibrate your neutral posture'}</span><div class="level-bars" id="level-bars" aria-label="Microphone activity">${Array.from({ length: 12 }, () => '<span></span>').join('')}</div></div></div>`;
}
function setupView() {
  return sceneView(state, head, previewMarkup);
}
function recordingView() {
  return `${head('03 / Your practice run', 'Take a breath. You’ve got this.', 'Focus on your message. The live practice score is provisional; the final review checks the complete recording.')}<div class="recording-grid"><section class="recording-main">${previewMarkup(true)}<div class="recording-toolbar"><span class="timer"><i class="recording-dot" aria-hidden="true"></i><span id="timer">00:00</span><small>/ 05:00</small></span><button class="button stop" id="stop-recording">${icon('stop')}Finish practice</button></div><section class="script-follow"><p class="content-label">Your script</p><p>${escape(state.script)}</p></section><section class="panel" style="margin-top:20px;padding:22px"><h3>Live transcript</h3><div class="transcript" id="transcript" aria-live="off">${state.sessionId ? 'Your words will appear as the transcript is finalized.' : 'Local practice. Your audio stays in this browser; live transcription is off.'}</div></section></section><aside class="recording-aside"><div class="score-panel"><p class="content-label">Live practice score</p><div class="score-value"><strong id="live-score">—</strong><span id="score-state">Collecting evidence</span></div><div class="score-meter" aria-hidden="true"><span id="score-progress" style="transform:scaleX(0)"></span></div><p id="score-explanation">A score appears when speech and posture provide enough usable evidence.</p></div><div class="live-stats"><div class="stat-row"><span>Filler words</span><strong id="filler-count">—</strong></div><div class="stat-row"><span>Pace · words/min</span><strong id="pace-value">—</strong></div><div class="stat-row"><span>Posture</span><strong id="posture-value">${state.calibrated ? 'Tracking' : 'Unavailable'}</strong></div><div class="stat-row"><span>Voice activity</span><strong id="voice-value">Listening</strong></div></div><p class="inline-status" id="live-status" role="status" style="margin-top:16px">${state.sessionId ? 'Preparing live transcription…' : 'Local recording · cloud processing is off.'}</p></aside></div>`;
}
function processingView() {
  const stages = state.report?.stages || {};
  const stageItem = (key, label) => {
    const status =
      state.report?.stageStatus?.[key] ||
      ((key === 'transcript' ? state.report?.transcript : stages[key]) ? 'complete' : 'waiting');
    const symbol =
      status === 'running'
        ? '<span class="spinner"></span>'
        : icon(status === 'complete' ? 'check' : 'clock');
    return `<li>${symbol}<span>${label}</span><small>${{ waiting: 'Waiting', running: 'In progress', complete: 'Ready', failed: 'Retry needed', skipped: 'Needs earlier stage' }[status]}</small></li>`;
  };
  return `${head('Review / Processing', 'Your practice is taking shape.', 'Your recording is ready. Gemini is preparing each perspective; free-tier quotas can add a wait.')}<section class="processing"><span class="icon-box">${icon('sound')}</span><h2>Three perspectives, one useful next step.</h2><p>We’ll check the complete transcript before calculating your final score.</p><ul class="processing-list">${[
    ['transcript', 'Word-timed audio transcription'],
    ['audio', 'Audio-only review'],
    ['video', 'Visual delivery review'],
    ['combined', 'Combined coaching report'],
  ]
    .map(([key, label]) => stageItem(key, label))
    .join(
      '',
    )}</ul>${state.report?.error ? `<p class="notice error">${escape(state.report.error)}</p>` : ''}<div class="actions"><button class="button secondary" id="view-playback">Listen while you wait</button><button class="text-button" id="reset">Cancel & clear session</button></div></section>`;
}
function feedbackMarkup(stage) {
  const report = state.report?.stages?.[stage];
  if (!report)
    return `<section class="feedback"><span class="icon-box">${icon(stage === 'audio' ? 'mic' : stage === 'video' ? 'video' : 'chat')}</span><h2 style="margin-top:16px">${state.report?.status === 'processing' ? 'Your review is on its way.' : 'Your recording is ready.'}</h2><p>${escape(state.report?.error || 'AI feedback is unavailable. You can still play your recording and reflect on your delivery.')}</p>${state.report?.status !== 'processing' && state.report?.status !== 'local' ? '<button class="button secondary" id="retry-analysis" style="margin-top:20px">Retry AI analysis</button>' : state.report?.status === 'local' ? '<p class="notice">Try one change in your next take. You can listen and watch as often as you like.</p>' : '<p class="notice">You can keep listening while the review finishes.</p>'}</section>`;
  return `<section class="feedback"><h2>${stage === 'audio' ? 'Listen for your rhythm.' : stage === 'video' ? 'Notice how you show up.' : 'Turn reflection into practice.'}</h2><p>${escape(report.summary)}</p>${[
    ['strengths', 'What’s working'],
    ['improvements', 'Try this next'],
  ]
    .map(
      ([key, label]) =>
        `<div class="feedback-section"><h3>${label}</h3>${report[key]
          .map(
            (item) =>
              `<article class="feedback-item"><h4>${escape(item.title)}</h4><p>${escape(item.detail)}</p>${item.evidenceIds
                .map((id) => {
                  const e = state.report.evidence.find((e) => e.id === id);
                  return e
                    ? `<button class="evidence-link" data-seek="${e.startMs}">At ${formatTime(e.startMs)}</button>`
                    : '';
                })
                .join('')}</article>`,
          )
          .join('')}</div>`,
    )
    .join(
      '',
    )}${report.limitations.length ? `<div class="limitations"><strong>Keep in mind</strong>${report.limitations.map((text) => `<p>${escape(text)}</p>`).join('')}</div>` : ''}</section>`;
}
function rubricMarkup() {
  const score = state.report?.score;
  return `<details class="rubric"><summary>How your practice score works</summary><p>This is a transparent practice rubric, not a confidence assessment. The final score normalizes your complete delivery and can differ from the live score.</p><ul><li>Fillers: up to 25 points; “um” and “uh” only.</li><li>Pace: up to 25 points for 20-second windows outside 110–180 words/min.</li><li>Long pauses: up to 20 points for internal silence exceeding 3 seconds.</li><li>Posture: up to 30 points for sustained deviation from your calibrated baseline.</li></ul>${score ? `<p>Final deductions: fillers ${score.penalties.filler.toFixed(1)}, pace ${score.penalties.pace.toFixed(1)}, pauses ${score.penalties.pause.toFixed(1)}, posture ${score.penalties.posture.toFixed(1)}. Posture coverage: ${Math.round(score.coverage.posture * 100)}%.</p>${score.reasons.length ? `<p>${escape(score.reasons.join(' '))}</p>` : ''}` : '<p>An overall score needs 30 seconds, 50 timestamped words, and enough usable tracking data.</p>'}</details>`;
}
function chatMarkup() {
  return `<section class="chat"><div class="chat-head"><span class="icon-box">${icon('chat')}</span><div><h3>Your speaking coach</h3><p>A conversation grounded in this practice run.</p></div></div><div class="chat-messages" id="chat-messages" role="log" aria-label="Coaching conversation">${state.chat.length ? state.chat.map((m) => `<div class="chat-message ${m.role}" >${escape(m.text)}</div>`).join('') : '<div class="chat-message">Choose one habit to practice next. Ask about an observation, or request a short exercise.</div>'}</div><div class="chat-suggestions"><button data-question="What is the single most useful thing to practice next?">What should I practice next?</button><button data-question="Give me a two-minute exercise for my biggest improvement area.">Give me a short exercise</button></div><form class="chat-form" id="chat-form"><label class="sr-only" for="chat-input">Ask your speaking coach</label><input id="chat-input" maxlength="2000" placeholder="Ask about your delivery…" required ${!state.report?.stages?.combined ? 'disabled' : ''}><button class="button primary" id="chat-send" ${!state.report?.stages?.combined ? 'disabled' : ''}>Send</button></form></section>`;
}
function reviewView() {
  const stage = state.phase,
    score = state.report?.score,
    recording = state.recording;
  const metrics = score?.metrics;
  const visual = state.report?.visualMetrics;
  const title = {
    audio: 'Hear your talk with fresh ears.',
    video: 'Let your delivery speak for itself.',
    combined: 'Bring your practice into focus.',
  }[stage];
  const desc = {
    audio: 'Audio only. Notice the rhythm, pauses, and clarity of your message.',
    video: 'Video only. Watch your movement without the sound competing for attention.',
    combined: 'Watch the full recording, explore your feedback, and decide what to practice next.',
  }[stage];
  const events = (state.report?.evidence || []).filter((e) =>
    stage === 'audio'
      ? ['filler', 'pause'].includes(e.category)
      : stage === 'video'
        ? e.category === 'posture'
        : e.category !== 'frame',
  );
  return `${head(`Review / ${stage === 'audio' ? '01' : stage === 'video' ? '02' : '03'}`, title, desc, formatTime(recording.payload.durationMs))}<nav class="stage-nav" aria-label="Review stages">${[
    ['audio', 'mic', 'Listen back'],
    ['video', 'video', 'Watch delivery'],
    ['combined', 'chat', 'Bring it together'],
  ]
    .map(
      ([key, ico, label], i) =>
        `<button class="stage-tab ${stage === key ? 'active' : ''}" data-phase="${key}" aria-current="${stage === key ? 'step' : 'false'}">${icon(ico)}${i + 1}. ${label}</button>`,
    )
    .join(
      '',
    )}</nav>${stage === 'combined' ? `<div class="final-score"><div><strong>${score?.score ?? '—'}</strong>${score?.score !== null && score?.score !== undefined ? '<small> / 100</small>' : ''}</div><div><h3>${score?.score !== null && score?.score !== undefined ? 'Your final practice score' : 'Overall score unavailable'}</h3><p>${score?.score !== null && score?.score !== undefined ? `Live score: ${recording.live.score ?? 'unavailable'}. Final analysis checks word timing and normalizes delivery length.` : escape(score?.reasons?.join(' ') || 'A completed, sufficiently supported analysis is needed.')}</p></div></div>` : ''}<div class="review-grid"><section>${stage === 'audio' ? `<div class="audio-stage"><p class="content-label">Your recording · audio only</p><div class="waveform" aria-hidden="true">${recording.waveform.map((level) => `<span style="--h:${4 + level * 60}px"></span>`).join('')}</div><audio id="review-player" controls src="${recording.audioUrl}" aria-label="Audio-only practice playback"></audio></div>` : `<div class="video-box"><video id="review-player" controls playsinline ${stage === 'video' ? 'muted' : ''} src="${recording.videoUrl}" aria-label="${stage === 'video' ? 'Muted visual' : 'Combined audio-video'} practice playback"></video></div>`}<p class="media-caption">${stage === 'video' ? 'Sound stays off in this stage. Playback is unmirrored, as your audience would see you.' : stage === 'audio' ? 'Listen for the rhythm of your words, the space between ideas, and variation in your voice.' : 'Full video is played from your browser; it has not been uploaded.'}</p><div class="metrics-grid">${stage === 'video' ? metric('Tracked delivery', visual ? `${Math.round(visual.coverage * 100)}%` : '—', 'Usable pose coverage') + metric('Alignment shift', visual ? `${Math.round(visual.deviationPercent)}%` : '—', 'Of tracked time') + metric('Practice mode', recording.payload.mode === 'seated' ? 'Seated' : 'Standing', 'Your selected setup') : metric('Delivery pace', metrics ? `${Math.round(metrics.wpm)}` : '—', 'Words per minute') + metric('Filler words', metrics ? metrics.fillers : '—', '“Um” and “uh”') + metric('Long pauses', metrics ? metrics.pauses : '—', 'Internal gaps over 3 s')}</div>${
    events.length
      ? `<section class="timeline"><h3>Moments to revisit</h3><div class="timeline-items">${events
          .slice(0, 30)
          .map(
            (e) =>
              `<button data-seek="${e.startMs}">${formatTime(e.startMs)} · ${escape({ filler: 'Filler', pause: 'Pause', posture: 'Alignment shift' }[e.category] || e.category)}</button>`,
          )
          .join('')}</div></section>`
      : ''
  }${stage === 'combined' ? rubricMarkup() + chatMarkup() : `<details class="rubric"><summary>${stage === 'audio' ? 'Read the complete transcript' : 'How posture feedback is measured'}</summary><p>${stage === 'audio' ? escape(state.report?.transcript || 'The transcript will appear after Gemini finishes audio processing.') : 'Measurements compare visible head, shoulder, and torso alignment with your neutral baseline. Low-visibility frames are excluded; this does not measure your internal confidence.'}</p></details>`}${state.report?.cleanupWarning ? `<p class="notice error">${escape(state.report.cleanupWarning)}</p>` : ''}<div class="review-actions"><button class="button secondary" id="reset">${icon('reset')}New practice</button>${stage !== 'combined' ? `<button class="button primary" data-phase="${stage === 'audio' ? 'video' : 'combined'}">${stage === 'audio' ? 'Watch my delivery' : 'Bring it together'}</button>` : ''}</div></section>${feedbackMarkup(stage)}</div><p class="footer-note">${icon('shield')}Your local recording is cleared when you reset or close this page. Google’s data-use terms apply to cloud processing.</p>`;
}
function metric(label, value, note) {
  return `<div class="metric"><span class="label">${label}</span><strong>${value}</strong><small>${note}</small></div>`;
}

function bind() {
  const on = (id, event, fn) => $(id)?.addEventListener(event, fn);
  on('back-welcome', 'click', () => navigate('welcome'));
  on('write-tab', 'click', () => {
    state.scriptTab = 'write';
    render();
    $('write-tab')?.focus();
  });
  on('generate-tab', 'click', () => {
    state.scriptTab = 'generate';
    render();
    $('generate-tab')?.focus();
  });
  on('script', 'input', (event) => {
    state.script = event.target.value;
    const count = wordCount(state.script);
    $('word-count').textContent = `${count} words`;
    $('estimated').textContent = readingTime(state.script);
    $('draft-status').textContent = saveDraft(state)
      ? 'Draft kept in this tab.'
      : 'Draft is in memory. Browser storage is unavailable.';
    state.success = '';
    document.querySelector('.success-banner')?.remove();
    $('to-setup').disabled = count < 3 || state.busy;
  });
  on('topic', 'input', (e) => {
    state.topic = e.target.value;
    saveDraft(state);
  });
  on('audience', 'input', (e) => {
    state.audience = e.target.value;
    saveDraft(state);
  });
  on('duration', 'change', (e) => {
    state.duration = Number(e.target.value);
    saveDraft(state);
  });
  on('generate-form', 'submit', async (event) => {
    event.preventDefault();
    if (state.busy) return;
    state.busy = true;
    state.error = '';
    state.success = '';
    render();
    try {
      const result = await post('/api/scripts', {
        topic: state.topic,
        audience: state.audience,
        duration: state.duration,
      });
      if (
        typeof result.script !== 'string' ||
        !result.script.trim() ||
        result.script.length > 15000
      )
        throw new Error('The draft was incomplete. Try generating it again.');
      state.script = result.script;
      saveDraft(state);
      state.success = 'Your draft is ready. Read it out loud and make it your own.';
    } catch (e) {
      state.error = e.message;
    } finally {
      state.busy = false;
      render();
      if (state.success) $('script')?.focus();
    }
  });
  for (const [id, other] of [
    ['write-tab', 'generate-tab'],
    ['generate-tab', 'write-tab'],
  ]) {
    on(id, 'keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const target =
        event.key === 'Home' ? 'write-tab' : event.key === 'End' ? 'generate-tab' : other;
      state.scriptTab = target === 'write-tab' ? 'write' : 'generate';
      render();
      $(target)?.focus();
    });
  }
  on('to-setup', 'click', () => navigate('setup'));
  on('back-script', 'click', async () => {
    await state.media?.dispose();
    state.camera = false;
    state.calibrated = false;
    navigate('script');
  });
  on('enable-camera', 'click', () => enableCamera());
  on('calibrate', 'click', calibrateCamera);
  on('start-recording', 'click', startRecording);
  on('stop-recording', 'click', () => stopRecording());
  on('consent', 'change', (event) => {
    state.consent = event.target.checked;
    $('start-recording').disabled = !state.camera || state.busy;
    render();
  });
  document.querySelectorAll('input[name="mode"]').forEach((input) =>
    input.addEventListener('change', () => {
      state.mode = input.value;
      state.calibrated = false;
      if (state.media) {
        state.media.mode = state.mode;
        state.media.baseline = null;
      }
      $('tracking').textContent = 'Calibrate your neutral posture';
      $('framing-hint').textContent =
        state.mode === 'standing'
          ? 'Include your head, shoulders, and hips in frame. Stay quiet during calibration.'
          : 'Keep your head and both shoulders visible. Stay quiet during calibration.';
      $('calibration-status').textContent = 'Practice mode changed. Calibrate again.';
    }),
  );
  on('view-playback', 'click', () => {
    state.phase = 'audio';
    navigate('review');
  });
  on('retry-analysis', 'click', () => analyze());
  on('reset', 'click', reset);
  document.querySelectorAll('[data-phase]').forEach((button) =>
    button.addEventListener('click', () => {
      state.phase = button.dataset.phase;
      navigate('review');
    }),
  );
  document.querySelectorAll('[data-seek]').forEach((button) =>
    button.addEventListener('click', () => {
      const player = $('review-player');
      if (player) {
        player.currentTime = Number(button.dataset.seek) / 1000;
        player.play().catch(() => {});
      }
    }),
  );
  on('chat-form', 'submit', (event) => {
    event.preventDefault();
    askCoach($('chat-input').value);
  });
  document
    .querySelectorAll('[data-question]')
    .forEach((button) => button.addEventListener('click', () => askCoach(button.dataset.question)));
}
function navigate(screen) {
  if (screen === 'welcome') return void goPage('home');
  state.error = '';
  state.success = '';
  state.screen = screen;
  render();
  const heading = document.querySelector('main h1');
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
  window.scrollTo({ top: 0, behavior: 'instant' });
}
function attachPreview() {
  const video = $('preview');
  if (!video || !state.media?.stream) return;
  state.media.video = video;
  video.srcObject = state.media.stream;
  video.play().catch(() => {});
  if (state.screen === 'setup') void fillDevices();
}
async function fillDevices() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const settings = state.media?.stream
    ?.getTracks()
    .map((t) => ({ kind: t.kind, id: t.getSettings().deviceId }));
  for (const [id, kind, type] of [
    ['camera-device', 'videoinput', 'video'],
    ['audio-device', 'audioinput', 'audio'],
  ]) {
    const select = $(id);
    if (!select) return;
    select.innerHTML = devices
      .filter((d) => d.kind === kind)
      .map(
        (d, i) =>
          `<option value="${escape(d.deviceId)}" ${settings?.find((s) => s.kind === type)?.id === d.deviceId ? 'selected' : ''}>${escape(d.label || `${type} ${i + 1}`)}</option>`,
      )
      .join('');
    select.onchange = () =>
      enableCamera({ videoId: $('camera-device').value, audioId: $('audio-device').value });
  }
}
async function enableCamera(devices = {}) {
  if (state.busy) return;
  state.busy = true;
  state.error = '';
  state.cameraStatus = 'Requesting device access…';
  render();
  try {
    await state.media?.dispose();
    state.calibrated = false;
    state.media = new PracticeMedia({
      onPoseReady: () => {
        state.cameraStatus = 'Camera ready · posture model loaded';
        if ($('camera-status')) $('camera-status').textContent = state.cameraStatus;
      },
      onLevel: updateLevel,
      onPose: updatePose,
      onAudio: (data) => {
        updateLevel(data.rms);
        if ($('voice-value')) $('voice-value').textContent = data.active ? 'Speaking' : 'Quiet';
      },
      onScore: updateScore,
      onTranscript: (text, final) => {
        if (final) {
          state.transcript += `${text} `;
          state.interim = '';
        } else state.interim = text;
        if ($('transcript'))
          $('transcript').innerHTML =
            `${escape(state.transcript)} <em>${escape(state.interim)}</em>`;
      },
      onLive: (message) => {
        const field = $('live-status') || $('camera-status');
        if (field) field.textContent = message;
      },
      onStarted: () => {
        tick = setInterval(() => {
          if ($('timer'))
            $('timer').textContent = formatTime(performance.now() - state.media.startedAt);
        }, 200);
      },
      onInterrupt: (message) => {
        if (state.screen === 'recording') void stopRecording(message);
      },
    });
    state.media.mode = state.mode;
    await state.media.prepare($('preview'), devices);
    state.camera = true;
    state.cameraStatus = 'Camera and microphone ready';
  } catch (error) {
    state.camera = false;
    state.error =
      error.name === 'NotAllowedError'
        ? 'Camera or microphone access was denied. Allow access in your browser, then try again.'
        : error.name === 'NotFoundError'
          ? 'No camera or microphone was found. Connect both devices and try again.'
          : error.message;
    await state.media?.dispose();
  } finally {
    state.busy = false;
    render();
  }
}
async function calibrateCamera() {
  if (state.busy) return;
  state.busy = true;
  state.error = '';
  render();
  try {
    await state.media.calibrate(state.mode);
    state.calibrated = true;
  } catch (e) {
    state.error = e.message;
  } finally {
    state.busy = false;
    render();
  }
}
function updateLevel(rms) {
  const level = Math.min(1, rms * 12);
  if ($('mic-meter')) $('mic-meter').style.transform = `scaleX(${level})`;
  document
    .querySelectorAll('#level-bars span')
    .forEach((bar, i) => bar.classList.toggle('on', i < level * 12));
}
function updatePose(data) {
  if ($('tracking')) $('tracking').textContent = data.hint;
  if ($('posture-value'))
    $('posture-value').textContent = !data.valid
      ? 'Unavailable'
      : data.deviation
        ? 'Shifted'
        : 'Aligned';
  const canvas = $('pose-overlay'),
    video = $('preview');
  if (!canvas || !video) return;
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 360;
  const c = canvas.getContext('2d');
  c.clearRect(0, 0, canvas.width, canvas.height);
  if (!data.landmarks) return;
  const points = data.landmarks;
  c.strokeStyle = data.deviation ? '#edcb88' : '#c8f17d';
  c.lineWidth = 2;
  for (const [a, b] of [
    [11, 12],
    [11, 23],
    [12, 24],
    [23, 24],
  ]) {
    if (state.mode === 'seated' && (a > 12 || b > 12)) continue;
    if ((points[a]?.visibility || 0) < 0.7 || (points[b]?.visibility || 0) < 0.7) continue;
    c.beginPath();
    c.moveTo(points[a].x * canvas.width, points[a].y * canvas.height);
    c.lineTo(points[b].x * canvas.width, points[b].y * canvas.height);
    c.stroke();
  }
  for (const i of state.mode === 'standing' ? [0, 11, 12, 23, 24] : [0, 11, 12]) {
    if ((points[i]?.visibility || 0) < 0.7) continue;
    c.beginPath();
    c.arc(points[i].x * canvas.width, points[i].y * canvas.height, 4, 0, Math.PI * 2);
    c.fillStyle = '#c8f17d';
    c.fill();
  }
}
function updateScore(score) {
  if ($('live-score')) $('live-score').textContent = score.score ?? '—';
  if ($('score-progress'))
    $('score-progress').style.transform = `scaleX(${(score.score ?? 0) / 100})`;
  if ($('score-state'))
    $('score-state').textContent =
      score.score === null ? 'Collecting evidence' : '/ 100 · provisional';
  if ($('score-explanation'))
    $('score-explanation').textContent =
      score.score !== null
        ? 'A provisional running score. Final analysis checks word timing and may change it.'
        : state.sessionId
          ? 'A score needs 50 finalized words, 30 seconds of speech, and 80% usable posture tracking.'
          : 'Local practice has no live transcript. Listen and watch your recording for your next step.';
  if ($('filler-count'))
    $('filler-count').textContent = state.media?.liveReady ? score.fillers : '—';
  if ($('pace-value'))
    $('pace-value').textContent =
      state.media?.liveReady && score.elapsed > 5000 ? Math.round(score.pace) : '—';
}
async function startRecording() {
  if (state.busy || !state.camera) return;
  state.busy = true;
  state.error = '';
  try {
    const cloud = state.consent && state.health?.aiConfigured;
    const session = cloud ? await post('/api/sessions', { cloudConsent: true }) : null;
    if (cloud && typeof session?.id !== 'string')
      throw new Error('The practice session could not be created. Please try again.');
    state.sessionId = session?.id || null;
    state.transcript = '';
    state.interim = '';
    state.busy = false;
    navigate('recording');
    state.media.start(state.sessionId, Boolean(state.sessionId));
  } catch (e) {
    if (state.sessionId)
      void api(`/api/sessions/${state.sessionId}`, { method: 'DELETE' }).catch(() => {});
    state.sessionId = null;
    state.screen = 'setup';
    state.busy = false;
    state.error = e.message;
    render();
  }
}
async function stopRecording(message = '') {
  if (state.busy || !state.media?.running) return;
  state.busy = true;
  clearInterval(tick);
  const stop = $('stop-recording');
  if (stop) {
    stop.disabled = true;
    stop.textContent = 'Saving recording…';
  }
  try {
    state.recording = await state.media.stop();
    state.camera = false;
    state.busy = false;
    state.screen = 'processing';
    render();
    if (message) state.cameraStatus = message;
    await analyze();
  } catch (e) {
    state.busy = false;
    state.error = e.message;
    render();
  }
}
async function analyze() {
  if (!state.recording) return;
  if (!state.sessionId) {
    state.report = {
      status: 'local',
      stages: {},
      error:
        'This was a local practice. Listen and watch your recording, then choose something to try next. Opt into AI review during setup for a future take.',
    };
    state.phase = 'audio';
    state.screen = 'review';
    render();
    return;
  }
  clearTimeout(poll);
  const token = ++generation;
  state.report = { ...state.report, status: 'processing', error: null };
  state.screen = 'processing';
  render();
  const data = new FormData();
  data.append('payload', JSON.stringify(state.recording.payload));
  data.append('audio', state.recording.audioBlob, 'practice.wav');
  try {
    await api(`/api/sessions/${state.sessionId}/analyze`, { method: 'POST', body: data });
    await pollReport(token);
  } catch (e) {
    if (token !== generation) return;
    state.report = { ...state.report, status: 'failed', error: e.message };
    state.phase = 'audio';
    state.screen = 'review';
    render();
  }
}
async function pollReport(token) {
  if (token !== generation || !state.sessionId) return;
  try {
    const result = parseReport(await api(`/api/sessions/${state.sessionId}/report`));
    if (token !== generation) return;
    const signature = JSON.stringify([
      result.status,
      Object.keys(result.stages || {}),
      result.error,
      result.cleanupWarning,
      result.stageStatus,
    ]);
    const previous = JSON.stringify([
      state.report?.status,
      Object.keys(state.report?.stages || {}),
      state.report?.error,
      state.report?.cleanupWarning,
      state.report?.stageStatus,
    ]);
    state.report = result;
    if (result.status !== 'processing') {
      if (state.screen === 'processing') {
        state.phase = 'audio';
        state.screen = 'review';
      }
      render();
      return;
    }
    if (signature !== previous && state.screen === 'processing') render();
    if (signature !== previous && state.screen === 'review') {
      const player = $('review-player'),
        position = player?.currentTime,
        playing = player && !player.paused;
      render();
      if ($('review-player')) {
        $('review-player').currentTime = position || 0;
        if (playing)
          $('review-player')
            .play()
            .catch(() => {});
      }
    }
    poll = setTimeout(() => pollReport(token), 2500);
  } catch (e) {
    if (token !== generation) return;
    state.report = { ...state.report, status: 'failed', error: e.message };
    if (state.screen === 'processing') state.screen = 'review';
    render();
  }
}
function bindPlayer() {
  const player = $('review-player');
  if (!player) return;
  if (state.phase === 'video') {
    player.muted = true;
    player.volume = 0;
    player.addEventListener('volumechange', () => {
      if (!player.muted) player.muted = true;
      if (player.volume !== 0) player.volume = 0;
    });
  }
}
async function askCoach(message) {
  if (!message?.trim() || chatController || !state.report?.stages?.combined) return;
  state.chat.push({ role: 'user', text: message.trim() }, { role: 'assistant', text: '' });
  const index = state.chat.length - 1;
  chatController = new AbortController();
  const token = generation;
  render();
  $('chat-send').disabled = true;
  $('chat-input').disabled = true;
  document.querySelectorAll('[data-question]').forEach((button) => (button.disabled = true));
  try {
    await streamChat(
      state.sessionId,
      message,
      (text) => {
        if (token !== generation) return;
        state.chat[index].text += text;
        const messages = $('chat-messages');
        if (messages) {
          messages.lastElementChild.textContent = state.chat[index].text;
          messages.scrollTop = messages.scrollHeight;
        }
      },
      chatController.signal,
    );
  } catch (e) {
    if (token === generation && e.name !== 'AbortError') {
      state.chat.push({ role: 'error', text: e.message });
    }
  } finally {
    chatController = null;
    if (token === generation) {
      render();
      $('chat-input')?.focus();
    }
  }
}
async function reset() {
  generation++;
  clearTimeout(poll);
  clearInterval(tick);
  chatController?.abort();
  await state.media?.dispose();
  const id = state.sessionId;
  state.sessionId = null;
  if (id) {
    try {
      await api(`/api/sessions/${id}`, { method: 'DELETE' });
    } catch {}
  }
  if (state.recording) {
    URL.revokeObjectURL(state.recording.videoUrl);
    URL.revokeObjectURL(state.recording.audioUrl);
  }
  Object.assign(state, {
    screen: 'script',
    recording: null,
    report: null,
    success: '',
    media: null,
    error: '',
    camera: false,
    calibrated: false,
    busy: false,
    chat: [],
    phase: 'audio',
    consent: false,
    transcript: '',
    interim: '',
  });
  render();
}
function bindPublic() {
  $('practice-launcher')?.addEventListener('submit', (event) => {
    event.preventDefault();
    const topic = $('practice-topic').value.trim();
    if (topic) {
      state.topic = topic;
      state.scriptTab = 'generate';
      saveDraft(state);
    }
    void goPage('studio');
  });
  document.querySelectorAll('[data-topic]').forEach((button) =>
    button.addEventListener('click', () => {
      $('practice-topic').value = button.dataset.topic;
      $('practice-topic').focus();
    }),
  );
  const tabs = [...document.querySelectorAll('[data-demo]')];
  const select = (button) => {
    for (const tab of tabs) {
      tab.setAttribute('aria-selected', String(tab === button));
      tab.tabIndex = tab === button ? 0 : -1;
    }
    $('demo-panel').innerHTML = demoView(button.dataset.demo);
    $('demo-panel').setAttribute('aria-labelledby', button.id);
  };
  tabs.forEach((button, index) => {
    button.addEventListener('click', () => select(button));
    button.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? tabs.length - 1
            : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
      select(tabs[next]);
      tabs[next].focus();
    });
  });
}
let routeGeneration = 0;
async function goPage(next, updateHistory = true, section = '') {
  if (currentPage === 'studio' && (state.screen === 'recording' || state.busy)) {
    history.replaceState(null, '', '#studio');
    state.error =
      state.screen === 'recording'
        ? 'Finish your practice before leaving the studio.'
        : 'Please wait for the current studio action to finish.';
    render();
    return;
  }
  const token = ++routeGeneration;
  if (currentPage === 'studio' && next !== 'studio' && state.camera) {
    await state.media?.dispose();
    state.camera = false;
    state.calibrated = false;
  }
  if (token !== routeGeneration) return;
  currentPage = next;
  if (next === 'studio' && state.screen === 'welcome') state.screen = 'script';
  state.error = '';
  if (updateHistory) history.pushState(null, '', `#${next}`);
  render();
  const target = section ? $(section) : null;
  if (target) target.scrollIntoView({ behavior: 'instant', block: 'start' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
  const heading = document.querySelector('main h1');
  if (!section && heading) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}
window.addEventListener('hashchange', () => {
  const hash = location.hash;
  if (hash === '#page-content') return;
  const next = hash === '#about' ? 'about' : hash === '#studio' ? 'studio' : 'home';
  void goPage(next, false, hash === '#how-it-works' ? 'how-it-works' : '');
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && state.screen === 'recording')
    void stopRecording('Practice stopped because this tab became hidden.');
});
window.addEventListener('pagehide', () => {
  state.media?.dispose();
  if (state.sessionId)
    void fetch(`/api/sessions/${state.sessionId}`, { method: 'DELETE', keepalive: true });
  if (state.recording) {
    URL.revokeObjectURL(state.recording.videoUrl);
    URL.revokeObjectURL(state.recording.audioUrl);
  }
});
render();
if (location.hash === '#how-it-works')
  requestAnimationFrame(() => $('how-it-works')?.scrollIntoView());
api('/api/health')
  .then((health) => {
    state.health = health;
    if (state.screen === 'welcome' || state.screen === 'script' || state.screen === 'setup')
      render();
  })
  .catch(() => {
    state.error = 'The studio backend is unavailable. Start the app with pnpm dev or pnpm start.';
    render();
  });
