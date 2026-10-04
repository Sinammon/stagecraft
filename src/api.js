export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    ...options,
    headers: {
      ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });
  if (response.status === 204) return null;
  const result = await response
    .json()
    .catch(() => ({ error: 'The server did not return a valid response.' }));
  if (!response.ok) throw new Error(result.error || 'The request failed.');
  return result;
}
export const post = (path, value) => api(path, { method: 'POST', body: JSON.stringify(value) });

export async function streamChat(id, message, onText, signal) {
  const response = await fetch(`/api/sessions/${id}/chat`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
    signal,
  });
  if (!response.ok) {
    const result = await response.json();
    throw new Error(result.error);
  }
  const reader = response.body.getReader(),
    decoder = new TextDecoder();
  let pending = '',
    done = false;
  try {
    while (true) {
      const result = await reader.read();
      pending += decoder.decode(result.value, { stream: !result.done });
      const lines = pending.split('\n');
      pending = lines.pop();
      for (const line of lines) {
        if (!line) continue;
        const item = JSON.parse(line);
        if (item.error) throw new Error(item.error);
        if (item.text) onText(item.text);
        if (item.done) done = true;
      }
      if (result.done) break;
    }
    if (!done) throw new Error('The coaching reply was interrupted. Try again.');
  } finally {
    reader.releaseLock();
  }
}
