import { randomUUID } from 'node:crypto';
export class SessionStore {
  constructor({
    now = Date.now,
    inactivityMs = 3600000,
    lifetimeMs = 7200000,
    onDelete = () => {},
  } = {}) {
    this.sessions = new Map();
    this.now = now;
    this.inactivityMs = inactivityMs;
    this.lifetimeMs = lifetimeMs;
    this.onDelete = onDelete;
  }
  create(owner) {
    const existing = [...this.sessions.values()].filter((s) => s.owner === owner);
    if (existing.length >= 3 || this.sessions.size >= 100)
      throw Object.assign(new Error('Finish or clear your existing practice session first.'), {
        statusCode: 429,
      });
    const now = this.now();
    const session = {
      id: randomUUID(),
      owner,
      created: now,
      touched: now,
      status: 'idle',
      report: { stages: {}, score: null },
      abort: new AbortController(),
      resources: new Set(),
      messages: [],
    };
    this.sessions.set(session.id, session);
    return session;
  }
  expired(s) {
    return this.now() - s.touched >= this.inactivityMs || this.now() - s.created >= this.lifetimeMs;
  }
  get(id, owner) {
    const s = this.sessions.get(id);
    if (!s || s.owner !== owner) return null;
    if (this.expired(s)) {
      this.delete(id);
      return null;
    }
    s.touched = this.now();
    return s;
  }
  delete(id) {
    const s = this.sessions.get(id);
    if (!s) return;
    s.abort.abort();
    for (const close of s.resources) {
      try {
        close();
      } catch {}
    }
    this.sessions.delete(id);
    this.onDelete(s);
  }
  sweep() {
    for (const s of this.sessions.values()) if (this.expired(s)) this.delete(s.id);
  }
  close() {
    for (const id of [...this.sessions.keys()]) this.delete(id);
  }
}
