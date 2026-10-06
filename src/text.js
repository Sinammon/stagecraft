export const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );

export const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;

export function readingTime(text) {
  const count = wordCount(text);
  if (!count) return 'Add a few words to begin';
  const minutes = Math.ceil(count / 130);
  return `About ${minutes} ${minutes === 1 ? 'minute' : 'minutes'}${minutes > 5 ? ' · trim to fit the 5-minute limit' : ' at a comfortable pace'}`;
}
