import { describe, it, expect } from 'vitest';
import {
  measurements,
  calibrate,
  deviation,
  PostureFilter,
  EpisodeTracker,
} from '../shared/posture.js';

function pose(aspect = 1) {
  const points = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 1 }));
  const set = (i, x, y) => Object.assign(points[i], { x: 0.5 + x / aspect, y });
  set(0, 0, 0.25);
  set(11, -0.15, 0.4);
  set(12, 0.15, 0.4);
  set(23, -0.12, 0.75);
  set(24, 0.12, 0.75);
  return points;
}
describe('camera geometry and calibration', () => {
  it('produces the same measurements at different camera aspect ratios', () => {
    const square = measurements(pose(), 'standing', 1);
    const wide = measurements(pose(16 / 9), 'standing', 16 / 9);
    for (const key of Object.keys(square)) expect(wide[key]).toBeCloseTo(square[key]);
  });
  it('excludes cropped, occluded, malformed and side-on observations', () => {
    const points = pose();
    points[11].visibility = 0.2;
    expect(measurements(points, 'seated')).toBeNull();
    points[11].visibility = 1;
    points[0].y = NaN;
    expect(measurements(points, 'seated')).toBeNull();
    points[0].y = -0.1;
    expect(measurements(points, 'seated')).toBeNull();
    points[0].y = 0.25;
    points[11].x = points[12].x;
    expect(measurements(points, 'seated')).toBeNull();
  });
  it('rejects insufficient or moving calibration, accepts a stable baseline', () => {
    const m = measurements(pose(), 'standing');
    expect(() => calibrate([m])).toThrow(/visible/);
    expect(() =>
      calibrate(Array.from({ length: 30 }, (_, i) => ({ ...m, headY: i % 2 ? -0.2 : -0.8 }))),
    ).toThrow(/movement/);
    expect(calibrate(Array(30).fill(m))).toEqual(m);
  });
  it('detects head lowering in both positions and standing torso lean', () => {
    const neutral = measurements(pose(), 'standing');
    for (const mode of ['standing', 'seated']) {
      expect(deviation(neutral, neutral, mode).deviation).toBe(false);
      expect(deviation({ ...neutral, headY: neutral.headY + 0.3 }, neutral, mode).deviation).toBe(
        true,
      );
      expect(deviation({ ...neutral, headX: neutral.headX + 0.1 }, neutral, mode).deviation).toBe(
        false,
      );
    }
    expect(deviation({ ...neutral, torsoAngle: 22 }, neutral, 'standing').deviation).toBe(true);
    expect(deviation({ ...neutral, shoulderWidth: 0.1 }, neutral, 'standing').valid).toBe(false);
  });
});
describe('stable posture feedback', () => {
  const sample = (magnitude) => ({
    valid: true,
    deviation: magnitude > 1,
    magnitude,
    hint: 'Sustained lean',
  });
  it('ignores short movements, warns on sustained leaning, then recovers', () => {
    const filter = new PostureFilter();
    let result;
    for (let t = 0; t <= 1000; t += 100) result = filter.update(sample(1.8), t);
    expect(result.deviation).toBe(false);
    for (let t = 1100; t <= 3000; t += 100) result = filter.update(sample(0), t);
    expect(result.deviation).toBe(false);
    for (let t = 3100; t <= 6200; t += 100) result = filter.update(sample(1.8), t);
    expect(result.deviation).toBe(true);
    for (let t = 6300; t <= 8500; t += 100) result = filter.update(sample(0), t);
    expect(result.deviation).toBe(false);
  });
  it('does not bridge tracking gaps or keep stale warnings after loss', () => {
    const filter = new PostureFilter();
    filter.update(sample(2), 0);
    expect(filter.update(sample(2), 4000).deviation).toBe(false);
    for (let t = 4100; t <= 6500; t += 100) filter.update(sample(2), t);
    expect(filter.update({ valid: false }, 6600).deviation).toBe(false);
    expect(filter.update(sample(2), 6700).deviation).toBe(false);
    const tracker = new EpisodeTracker();
    tracker.update({ valid: true, deviation: true, timeMs: 0 });
    tracker.update({ valid: true, deviation: true, timeMs: 4000 });
    expect(tracker.events).toHaveLength(0);
  });
});
