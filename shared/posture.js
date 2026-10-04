import { clamp } from './scoring.js';
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
export function measurements(landmarks, mode) {
  const required = mode === 'standing' ? [0, 11, 12, 23, 24] : [0, 11, 12];
  if (
    !landmarks ||
    required.some(
      (i) =>
        !landmarks[i] || Math.min(landmarks[i].visibility ?? 0, landmarks[i].presence ?? 1) < 0.7,
    )
  )
    return null;
  const [nose, left, right] = [landmarks[0], landmarks[11], landmarks[12]];
  const width = Math.hypot(right.x - left.x, right.y - left.y);
  if (width < 0.06) return null;
  const center = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const shoulderAngle = (Math.atan2(right.y - left.y, Math.abs(right.x - left.x)) * 180) / Math.PI;
  const headX = (nose.x - center.x) / width,
    headY = (nose.y - center.y) / width;
  let torsoAngle = 0;
  if (mode === 'standing') {
    const hips = {
      x: (landmarks[23].x + landmarks[24].x) / 2,
      y: (landmarks[23].y + landmarks[24].y) / 2,
    };
    torsoAngle = (Math.atan2(center.x - hips.x, hips.y - center.y) * 180) / Math.PI;
  }
  return { shoulderAngle, headX, headY, torsoAngle };
}
export function calibrate(samples) {
  if (samples.length < 20)
    throw new Error(
      'Keep your head and shoulders visible for calibration. Standing practice also needs hips in frame.',
    );
  return Object.fromEntries(
    Object.keys(samples[0]).map((key) => [key, median(samples.map((s) => s[key]))]),
  );
}
export function deviation(measurement, baseline, mode) {
  if (!measurement || !baseline)
    return { valid: false, deviation: false, magnitude: 0, hint: 'Move into frame' };
  const shoulder = Math.abs(measurement.shoulderAngle - baseline.shoulderAngle) / 10;
  const head =
    Math.hypot(measurement.headX - baseline.headX, measurement.headY - baseline.headY) / 0.25;
  const torso = Math.abs(measurement.torsoAngle - baseline.torsoAngle) / 15;
  const magnitude = mode === 'standing' ? Math.max(torso, shoulder) : Math.max(head, shoulder);
  return {
    valid: true,
    deviation: magnitude > 1,
    magnitude: clamp(magnitude, 0, 3),
    hint: magnitude > 1 ? 'Alignment shifted from your baseline' : 'Aligned with your baseline',
  };
}
export class EpisodeTracker {
  constructor() {
    this.reset();
  }
  reset() {
    this.start = null;
    this.recovery = null;
    this.counted = false;
    this.lastValid = null;
    this.events = [];
  }
  update(sample) {
    if (!sample.valid) {
      this.close(this.lastValid);
      return null;
    }
    this.lastValid = sample.timeMs;
    if (sample.deviation) {
      this.recovery = null;
      this.start ??= sample.timeMs;
      if (!this.counted && sample.timeMs - this.start >= 2000) {
        this.counted = true;
        const event = {
          id: `posture-${this.start}`,
          category: 'posture',
          startMs: this.start,
          endMs: sample.timeMs,
        };
        this.events.push(event);
        return event;
      }
    } else if (this.start !== null) {
      this.recovery ??= sample.timeMs;
      if (sample.timeMs - this.recovery >= 1000) this.close(this.recovery);
    }
    if (this.counted) this.events.at(-1).endMs = sample.timeMs;
    return null;
  }
  close(endMs) {
    if (this.counted && endMs !== null) this.events.at(-1).endMs = endMs;
    this.start = null;
    this.recovery = null;
    this.counted = false;
  }
}
