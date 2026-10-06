export const RUBRIC = Object.freeze({
  version: 'v1',
  caps: { filler: 25, pace: 25, pause: 20, posture: 30 },
  minWords: 50,
  minDurationMs: 30000,
  minCoverage: 0.8,
  pace: [110, 180],
});
export const clamp = (value, low = 0, high = 1) => Math.max(low, Math.min(high, value));
export const isFiller = (text) => /^(um|uh)$/i.test(text.replace(/[^a-z]/gi, ''));

export function liveScore(events) {
  const deductions = { filler: 0, pace: 0, pause: 0, posture: 0 };
  const seen = new Set();
  for (const event of events) {
    if (seen.has(event.id) || !(event.category in deductions)) continue;
    seen.add(event.id);
    deductions[event.category] += ['pace', 'posture'].includes(event.category) ? 2 : 1;
  }
  for (const key in deductions) deductions[key] = Math.min(RUBRIC.caps[key], deductions[key]);
  return { score: 100 - Object.values(deductions).reduce((a, b) => a + b, 0), deductions };
}

export function postureCoverage(samples, startMs, endMs) {
  let validMs = 0,
    deviationMs = 0;
  for (let i = 0; i < samples.length; i++) {
    const sample = samples[i];
    const end = Math.min(endMs, samples[i + 1]?.timeMs ?? sample.timeMs + 100, sample.timeMs + 250);
    const span = Math.max(0, end - Math.max(startMs, sample.timeMs));
    if (sample.valid) {
      validMs += span;
      if (sample.deviation) deviationMs += span;
    }
  }
  return { validMs, deviationMs, coverage: clamp(validMs / Math.max(1, endMs - startMs)) };
}

export function provisionalScore({ events, turns, poseSamples, liveReady }) {
  const words = turns.reduce(
    (count, turn) => count + turn.text.trim().split(/\s+/).filter(Boolean).length,
    0,
  );
  const startMs = turns[0]?.startMs ?? 0;
  const endMs = turns.at(-1)?.endMs ?? 0;
  const supported =
    liveReady &&
    words >= RUBRIC.minWords &&
    endMs - startMs >= RUBRIC.minDurationMs &&
    postureCoverage(poseSamples, startMs, endMs).coverage >= RUBRIC.minCoverage;
  return { ...liveScore(events), score: supported ? liveScore(events).score : null };
}

export function finalScore({ words = [], poseSamples = [], durationMs = 0 }) {
  const canonical = words
    .filter(
      (w) =>
        Number.isFinite(w.startMs) &&
        Number.isFinite(w.endMs) &&
        w.endMs >= w.startMs &&
        w.startMs >= 0 &&
        w.endMs <= durationMs + 250,
    )
    .sort((a, b) => a.startMs - b.startMs);
  const startMs = canonical[0]?.startMs ?? 0;
  const endMs = canonical.at(-1)?.endMs ?? 0;
  const deliveryMs = Math.max(0, endMs - startMs);
  const fillers = canonical.filter((w) => isFiller(w.text));
  const pauses = [];
  for (let i = 1; i < canonical.length; i++) {
    const previous = canonical[i - 1];
    const gap = canonical[i].startMs - previous.endMs;
    if (gap > 3000)
      pauses.push({
        id: `pause-${i}`,
        category: 'pause',
        startMs: previous.endMs,
        endMs: canonical[i].startMs,
        excessMs: gap - 3000,
      });
  }
  const windows = [];
  for (let start = startMs; start + 20000 <= endMs; start += 20000) {
    const count = canonical.filter((w) => w.startMs >= start && w.startMs < start + 20000).length;
    const wpm = count * 3;
    windows.push({ startMs: start, endMs: start + 20000, wpm, outside: wpm < 110 || wpm > 180 });
  }
  // Verify that word annotation coverage is coherent rather than treating absent timing as a perfect score.
  const timedWords = canonical.length;
  const pose = postureCoverage(poseSamples, startMs, endMs);
  const fillerRate = (fillers.length * 60000) / Math.max(1, deliveryMs);
  const factors = {
    filler: clamp((fillerRate - 1) / 5),
    pace: windows.length ? windows.filter((w) => w.outside).length / windows.length : 0,
    pause: clamp(pauses.reduce((sum, p) => sum + p.excessMs, 0) / Math.max(1, 0.15 * deliveryMs)),
    posture: clamp(pose.deviationMs / Math.max(1, 0.3 * pose.validMs)),
  };
  const penalties = Object.fromEntries(
    Object.entries(factors).map(([key, factor]) => [key, RUBRIC.caps[key] * factor]),
  );
  const reasons = [];
  if (deliveryMs < RUBRIC.minDurationMs) reasons.push('Speak for at least 30 seconds.');
  if (timedWords < RUBRIC.minWords) reasons.push('At least 50 timestamped words are needed.');
  if (!words.length || canonical.length / words.length < RUBRIC.minCoverage)
    reasons.push('Speech timing covered less than 80% of the transcript.');
  if (pose.coverage < RUBRIC.minCoverage)
    reasons.push('Posture tracking covered less than 80% of your delivery.');
  const score = reasons.length
    ? null
    : Math.round(clamp(100 - Object.values(penalties).reduce((a, b) => a + b, 0), 0, 100));
  return {
    version: RUBRIC.version,
    score,
    penalties,
    factors,
    reasons,
    coverage: {
      speech: words.length ? canonical.length / words.length : 0,
      posture: pose.coverage,
    },
    metrics: {
      wordCount: timedWords,
      deliveryMs,
      wpm: (canonical.length * 60000) / Math.max(1, deliveryMs),
      fillers: fillers.length,
      fillerRate,
      pauses: pauses.length,
      postureDeviationPercent: (100 * pose.deviationMs) / Math.max(1, pose.validMs),
    },
    events: [
      ...fillers.map((w, i) => ({
        id: `filler-${i}`,
        category: 'filler',
        startMs: w.startMs,
        endMs: w.endMs,
        text: w.text,
      })),
      ...pauses,
    ],
    windows,
  };
}
