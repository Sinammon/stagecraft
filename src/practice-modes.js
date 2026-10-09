// Keep mode identity separate from seated/standing posture settings.
export const practiceModes = [
  {
    id: 'guided',
    title: 'Guided practice',
    description: 'Keep your script close. Find your rhythm.',
  },
  {
    id: 'memorization',
    title: 'Memorization test',
    description: 'Learn your script. Speak from a few key ideas.',
  },
];

export function memorizationDuration(value) {
  const minutes = Number(value);
  return Number.isInteger(minutes) && minutes >= 1 && minutes <= 30 ? minutes : null;
}
