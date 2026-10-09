import { clamp } from './scoring.js';
const median = (values) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
export function measurements(landmarks, mode, aspect = 1) {
  const required = mode === 'standing' ? [0, 11, 12, 23, 24] : [0, 11, 12];
  if (
    !landmarks ||
    !Number.isFinite(aspect) ||
    aspect <= 0 ||
    required.some(
      (i) =>
        !landmarks[i] ||
        !Number.isFinite(landmarks[i].x) ||
        !Number.isFinite(landmarks[i].y) ||
        landmarks[i].x < 0 ||
        landmarks[i].x > 1 ||
        landmarks[i].y < 0 ||
        landmarks[i].y > 1 ||
        Math.min(landmarks[i].visibility ?? 0, landmarks[i].presence ?? 1) < 0.7,
    )
  )
    return null;
  // MediaPipe normalizes x and y independently. Restore a common image scale
  // before computing angles and distances, including on wide camera frames.
  const scaled = (i) => ({ x: landmarks[i].x * aspect, y: landmarks[i].y });
  const [nose, left, right] = [scaled(0), scaled(11), scaled(12)];
  const width = Math.hypot(right.x - left.x, right.y - left.y);
  if (Math.abs(right.x - left.x) < 0.06 * aspect) return null;
  const center = { x: (left.x + right.x) / 2, y: (left.y + right.y) / 2 };
  const shoulderAngle = (Math.atan2(right.y - left.y, Math.abs(right.x - left.x)) * 180) / Math.PI;
  const headX = (nose.x - center.x) / width,
    headY = (nose.y - center.y) / width;
  let torsoAngle = 0;
  if (mode === 'standing') {
    const hips = {
      x: ((landmarks[23].x + landmarks[24].x) / 2) * aspect,
      y: (landmarks[23].y + landmarks[24].y) / 2,
    };
    if (hips.y - center.y < 0.08) return null;
    torsoAngle = (Math.atan2(center.x - hips.x, hips.y - center.y) * 180) / Math.PI;
  }
  return { shoulderAngle, headX, headY, torsoAngle, shoulderWidth: width };
}
export function calibrate(samples) {
  if (samples.length < 20)
    throw new Error(
      'Keep your head and shoulders visible for calibration. Standing practice also needs hips in frame.',
    );
  if (samples.some((s) => Object.values(s).some((v) => !Number.isFinite(v))))
    throw new Error('Tracking was incomplete. Reframe and calibrate again.');
  const baseline = Object.fromEntries(
    Object.keys(samples[0]).map((key) => [key, median(samples.map((s) => s[key]))]),
  );
  const limits = { shoulderAngle: 4, headX: 0.1, headY: 0.1, torsoAngle: 5 };
  for (const [key, limit] of Object.entries(limits)) {
    const offsets = samples.map((s) => Math.abs(s[key] - baseline[key])).sort((a, b) => a - b);
    if (offsets[Math.floor(offsets.length * 0.8)] > limit)
      throw new Error(
        'Too much movement during calibration. Hold a comfortable upright position and try again.',
      );
  }
  return baseline;
}
export function deviation(measurement, baseline, mode) {
  if (!measurement || !baseline)
    return {
      valid: false,
      deviation: false,
      magnitude: 0,
      hint: !measurement
        ? 'Tracking unavailable — keep your head and shoulders in frame'
        : 'Calibrate your neutral posture',
    };
  const scale = measurement.shoulderWidth / baseline.shoulderWidth;
  if (scale < 0.65 || scale > 1.6)
    return {
      valid: false,
      deviation: false,
      magnitude: 0,
      hint: 'Face the camera and return to your calibration position',
    };
  const shoulder = Math.abs(measurement.shoulderAngle - baseline.shoulderAngle) / 12;
  // A lowered head relative to the shoulders is a slouch cue, not a direct
  // measurement of spinal curvature. Small head turns and upward looks are free.
  const headDrop = Math.max(0, measurement.headY - baseline.headY) / 0.2;
  const headLean = Math.abs(measurement.headX - baseline.headX) / 0.45;
  const torso = Math.abs(measurement.torsoAngle - baseline.torsoAngle) / 15;
  const magnitude = Math.max(headDrop, headLean, shoulder, mode === 'standing' ? torso : 0);
  return {
    valid: true,
    deviation: magnitude > 1,
    magnitude: clamp(magnitude, 0, 3),
    hint:
      magnitude > 1
        ? headDrop >= magnitude
          ? 'Your head has lowered — return to your upright baseline'
          : 'Sustained lean — return to your comfortable baseline'
        : 'Aligned with your baseline',
  };
}
export class PostureFilter {
  reset() {
    this.last = null;
    this.since = null;
    this.recovery = null;
    this.active = false;
    this.smoothed = null;
  }
  constructor() {
    this.reset();
  }
  update(sample, timeMs) {
    if (!sample.valid || !Number.isFinite(sample.magnitude) || !Number.isFinite(timeMs)) {
      this.reset();
      return { ...sample, valid: false, deviation: false };
    }
    if (this.last !== null && (timeMs - this.last > 500 || timeMs < this.last)) this.reset();
    const weight = this.last === null ? 1 : 1 - Math.exp(-(timeMs - this.last) / 250);
    this.smoothed =
      this.smoothed === null
        ? sample.magnitude
        : this.smoothed + weight * (sample.magnitude - this.smoothed);
    this.last = timeMs;
    if (!this.active) {
      if (this.smoothed > 1) {
        this.since ??= timeMs;
        if (timeMs - this.since >= 2000) this.active = true;
      } else this.since = null;
    } else if (this.smoothed < 0.8) {
      this.recovery ??= timeMs;
      if (timeMs - this.recovery >= 1000) {
        this.active = false;
        this.since = null;
        this.recovery = null;
      }
    } else this.recovery = null;
    return {
      ...sample,
      deviation: this.active,
      hint: this.active
        ? sample.deviation
          ? sample.hint
          : 'Returning to your baseline…'
        : 'Aligned with your baseline',
    };
  }
}
export class EpisodeTracker {
  constructor(onsetMs = 2000, recoveryMs = 1000) {
    this.onsetMs = onsetMs;
    this.recoveryMs = recoveryMs;
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
    if (this.lastValid !== null && sample.timeMs - this.lastValid > 500) this.close(this.lastValid);
    if (!sample.valid) {
      this.close(this.lastValid);
      return null;
    }
    this.lastValid = sample.timeMs;
    if (sample.deviation) {
      this.recovery = null;
      this.start ??= sample.timeMs;
      if (!this.counted && sample.timeMs - this.start >= this.onsetMs) {
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
      if (sample.timeMs - this.recovery >= this.recoveryMs) this.close(this.recovery);
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
