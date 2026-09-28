import test from 'node:test';
import assert from 'node:assert/strict';
import { retrySpeech } from './continuity.js';

test('browser timeout and silence resume without another click', () => {
  assert.deepEqual(retrySpeech('', 0), { retry: true, delay: 450 });
  assert.deepEqual(retrySpeech('no-speech', 0), { retry: true, delay: 450 });
});
test('denied permissions and missing microphone never trigger silent retries', () => {
  for (const code of ['not-allowed', 'service-not-allowed', 'audio-capture', 'language-not-supported']) {
    assert.equal(retrySpeech(code, 0).retry, false);
  }
});
test('transient speech failures retry with backoff, not forever', () => {
  assert.deepEqual(retrySpeech('network', 1), { retry: true, delay: 1000 });
  assert.deepEqual(retrySpeech('network', 4), { retry: true, delay: 8000 });
  assert.deepEqual(retrySpeech('network', 5), { retry: false, delay: 0 });
});
