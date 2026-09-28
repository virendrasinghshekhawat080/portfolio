// Browser speech services may end recognition after every utterance. Retry naturally,
// but never silently retry after a denied permission or an unavailable microphone.
export const FATAL_SPEECH_ERRORS = new Set([
  'not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported',
]);

export function retrySpeech(error, consecutiveFailures = 0) {
  if (FATAL_SPEECH_ERRORS.has(error)) return { retry: false, delay: 0 };
  if (error === 'no-speech' || error === 'aborted' || !error) {
    return { retry: true, delay: 450 };
  }
  if (consecutiveFailures >= 5) return { retry: false, delay: 0 };
  return { retry: true, delay: Math.min(12000, 1000 * 2 ** Math.max(0, consecutiveFailures - 1)) };
}
