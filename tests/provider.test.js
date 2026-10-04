import { describe, it, expect } from 'vitest';
import {
  extractTranscript,
  seconds,
  GeminiProvider,
  publicProviderError,
} from '../server/gemini.js';
describe('Gemini adapter', () => {
  it('parses official word_info annotations and preserves fillers', () => {
    const input = {
      steps: [
        {
          type: 'model_output',
          content: [
            {
              type: 'text',
              text: 'um hello',
              annotations: [
                { type: 'word_info', text: 'um', start_offset: '0.100s', end_offset: '0.400s' },
                { type: 'word_info', text: 'hello', start_offset: '0.500s', end_offset: '0.850s' },
              ],
            },
          ],
        },
      ],
    };
    expect(extractTranscript(input)).toEqual({
      text: 'um hello',
      words: [
        { text: 'um', startMs: 100, endMs: 400 },
        { text: 'hello', startMs: 500, endMs: 850 },
      ],
    });
    expect(seconds('broken')).toBeNaN();
  });
  it('rejects transcription without word timing instead of manufacturing evidence', () => {
    expect(() => extractTranscript({ output_text: 'hello', steps: [] })).toThrow(/word timestamps/);
  });
  it('fails without a key and never substitutes a paid provider', () => {
    const provider = new GeminiProvider({});
    expect(() => provider.requireKey()).toThrow();
    expect(publicProviderError({ status: 429 })).toMatch(/quota/);
  });
  it('uses verbatim word-timed transcription and disables interaction storage', async () => {
    const provider = new GeminiProvider({ GEMINI_API_KEY: 'test-key' });
    let request;
    provider.run = (fn) => fn();
    provider.ai.interactions.create = async (value) => {
      request = value;
      return {
        steps: [
          {
            type: 'model_output',
            content: [
              {
                type: 'text',
                text: 'um',
                annotations: [
                  { type: 'word_info', text: 'um', start_offset: '0s', end_offset: '0.1s' },
                ],
              },
            ],
          },
        ],
      };
    };
    await provider.transcribe({ uri: 'test', mimeType: 'audio/wav' }, undefined, 1000);
    expect(request.store).toBe(false);
    expect(request.generation_config.transcription_config.mode).toEqual({
      type: 'verbatim',
      timestamp_granularities: ['word'],
    });
  });
});
