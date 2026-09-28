import test from 'node:test';
import assert from 'node:assert/strict';
import { classifyUtterance, localReply, NO_NAME } from './conversation.js';

const samples = [
  ['about kholo', 'internal', '#about'],
  ['open WhatsApp', 'external', 'wa.me'],
  ['head phon dikhao', 'external', 'headphones'],
  ['Hardeep', 'unknown-name'],
  ['हरदीप', 'unknown-name'],
  ['React क्या है?', 'chat'],
  ['what is github', 'chat'],
  ['how are you', 'chat'],
  ['random broad question', 'chat'],
];
for (const [phrase, kind, urlPart] of samples) {
  test(`classifies ${phrase}`, () => {
    const value = classifyUtterance(phrase);
    assert.equal(value.kind, kind);
    if (urlPart) assert.ok((value.hash || value.url).includes(urlPart));
  });
}
test('unknown personal names are not invented', () => assert.equal(localReply('Hardeep'), NO_NAME));
test('greetings have a friendly offline response', () => assert.match(localReply('hello dost'), /नमस्ते/));

test('spoken close/off commands stop the assistant', () => { for (const value of ['बंद','ऑफ','voice off','stop listening','माइक बंद करो','stop voice','बंद कर दो']) assert.equal(classifyUtterance(value).kind, 'stop'); });
test('portfolio explanations remain answers, not navigation', () => {
  for (const value of ['experience में क्या क्या है', 'कौन कौन से प्रोजेक्ट बनाए हैं', 'about में क्या लिखा है']) assert.equal(classifyUtterance(value).kind, 'chat');
  assert.match(localReply('experience में क्या क्या है'), /Techno Derivation/);
  assert.match(localReply('कौन कौन से प्रोजेक्ट बनाए हैं'), /TaskFlow/);
});
test('website commands stay internal and social links stay external', () => {
  for (const [value, destination] of [['होम','#home'],['कॉन्टैक्ट','#/contact'],['एक्सपीरियंस','#experience']]) {
    const action = classifyUtterance(value); assert.equal(action.kind,'internal'); assert.equal(action.hash,destination);
  }
  for (const value of ['WhatsApp open','LinkedIn profile','GitHub kholo','Instagram kholo']) assert.equal(classifyUtterance(value).kind,'external');
});

test('normal recipe, Jaipur, Rajasthan district questions stay general AI chat', () => {
  for (const phrase of ['मटन बनाने की रेसिपी बताइए', 'चिकन की रेसिपी बताओ', 'जयपुर किस स्टेट में है?', 'राजस्थान में अभी कितने जिले हैं?', 'AI कैसे काम करती है?']) {
    assert.equal(classifyUtterance(phrase).kind, 'chat', phrase);
  }
});
