import test from 'node:test';
import assert from 'node:assert/strict';
import { interpretVoice } from './intent.js';

const examples = [
  ['abot kholo', 'internal', '#about'],
  ['open about', 'internal', '#about'],
  ['a bot page', 'internal', '#about'],
  ['मेरे बारे में दिखाओ', 'internal', '#about'],
  ['mujhe projects dikhao', 'internal', '#projects'],
  ['skills dikhao', 'internal', '#skills'],
  ['contact page kholo', 'internal', '#/contact'],
  ['mere ko head phon dikhao', 'external', 'search=headphones'],
  ['electronics ke headphone dikhao', 'external', 'search=headphones'],
  ['MyStore me head phone dikhana', 'external', 'search=headphones'],
  ['हेडफोन दिखाओ', 'external', 'search=headphones'],
  ['electronic item dikhao', 'external', 'search=electronics'],
  ['mujhe laptop dikhao', 'external', 'search=laptop'],
  ['show products', 'external', '/products'],
  ['my store project', 'external', 'mystore-ecommerce-nine.vercel.app'],
  ['TaskFlow GitHub kholo', 'external', '/TaskFlow'],
  ['whatsapp kholo', 'external', 'wa.me'],
  ['whatapp', 'external', 'wa.me'],
  ['instrakm kholo', 'external', 'instagram.com'],
  ['teligram kholo', 'external', 't.me'],
  ['linkden', 'external', 'linkedin.com'],
  ['open instagram', 'external', 'instagram.com'],
  ['linkedin dikhao', 'external', 'linkedin.com'],
  ['resume kholo', 'external', '.pdf'],
  ['random unclear phrase', 'fallback', null],
];
for (const [phrase, kind, destination] of examples) {
  test(`recognizes: ${phrase}`, () => {
    const result = interpretVoice(phrase);
    assert.equal(result.kind, kind);
    if (destination) assert.ok((result.hash || result.url).includes(destination), JSON.stringify(result));
  });
}
