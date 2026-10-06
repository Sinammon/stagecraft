export default function handler(_request, response) {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(
    JSON.stringify({
      ok: true,
      aiConfigured: Boolean(process.env.GEMINI_API_KEY),
      models: {
        coaching: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
        transcription: process.env.GEMINI_TRANSCRIBE_MODEL || 'gemini-3.5-transcribe',
        live: process.env.GEMINI_LIVE_MODEL || 'gemini-3.5-transcribe-live',
      },
      maxDurationSeconds: 300,
    }),
  );
}
