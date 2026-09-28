import test from 'node:test';
import assert from 'node:assert/strict';
import { openExternalTab, isSafeDestination } from './navigation.js';
test('voice links open in new tab and keep portfolio open', () => {
  const opened = [];
  const popup = { opener: {} };
  assert.equal(openExternalTab('https://wa.me/919521051315', (url, target) => { opened.push([url,target]); return popup; }), true);
  assert.deepEqual(opened, [['https://wa.me/919521051315','_blank']]);
  assert.equal(popup.opener, null);
});
test('blocked popups fall back to a clickable user-gesture link', () => {
  assert.equal(openExternalTab('https://github.com/', () => null), false);
});
test('unsafe schemes are never opened', () => {
  for (const x of ['javascript:alert(1)','data:text/html,foo','//evil.test','file:///private']) {
    assert.equal(isSafeDestination(x), false);
    assert.equal(openExternalTab(x, () => { throw Error('should not open'); }), false);
  }
});
