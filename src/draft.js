const key = 'stagecraft.draft.v1';

export function loadDraft() {
  try {
    const value = JSON.parse(sessionStorage.getItem(key));
    if (!value || typeof value.script !== 'string' || value.script.length > 15000) return {};
    return {
      script: value.script,
      topic: typeof value.topic === 'string' ? value.topic.slice(0, 400) : '',
      audience: typeof value.audience === 'string' ? value.audience.slice(0, 150) : 'My classmates',
      duration: [1, 2, 3, 4, 5].includes(value.duration) ? value.duration : 2,
      focus: typeof value.focus === 'string' ? value.focus.slice(0, 240) : '',
    };
  } catch {
    return {};
  }
}

export function saveDraft({ script, topic, audience, duration, focus = '' }) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ script, topic, audience, duration, focus }));
    return true;
  } catch {
    return false;
  }
}
