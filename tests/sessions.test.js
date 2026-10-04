import { it, expect } from 'vitest';
import { SessionStore } from '../server/sessions.js';
it('isolates session ownership without revealing another user’s session', () => {
  const store = new SessionStore();
  const s = store.create('alice');
  expect(store.get(s.id, 'bob')).toBeNull();
  expect(store.get(s.id, 'alice')).toBe(s);
});
it('expires inactive sessions and aborts their work', () => {
  let now = 0;
  const store = new SessionStore({ now: () => now, inactivityMs: 1000, lifetimeMs: 3000 });
  const s = store.create('alice');
  now = 1001;
  expect(store.get(s.id, 'alice')).toBeNull();
  expect(s.abort.signal.aborted).toBe(true);
});
it('applies absolute expiry even while activity refreshes inactivity', () => {
  let now = 0;
  const store = new SessionStore({ now: () => now, inactivityMs: 1000, lifetimeMs: 3000 });
  const s = store.create('alice');
  for (now = 800; now < 3000; now += 800) expect(store.get(s.id, 'alice')).toBe(s);
  expect(store.get(s.id, 'alice')).toBeNull();
});
