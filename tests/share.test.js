import test from 'node:test';
import assert from 'node:assert/strict';
import { initialPrefs, setCity, setTraveller, setSize, toggleInterest, renameMember, setDetail } from '../src/lib/prefs.js';
import { encodePrefs, decodePrefs } from '../src/lib/share.js';
import { compose } from '../src/engine/composer.js';

function group() {
  let p = setSize(setTraveller(setCity(initialPrefs(), 'udaipur'), 'group'), 3);
  p = renameMember(p, 'm1', 'Asha & Ravi');
  p = toggleInterest(p, 'm1', 'heritage'); p = toggleInterest(p, 'm2', 'cafes'); p = toggleInterest(p, 'm3', 'lakes-sunsets');
  p = setDetail(p, 'budget', '2');
  return p;
}

test('a shared link round-trips to the same choices and the same plan', () => {
  const p = group();
  const back = decodePrefs(encodePrefs(p, { meetPeople: false }));
  assert.ok(back);
  assert.deepEqual(back.prefs.members, p.members);
  assert.deepEqual(back.prefs.details, p.details);
  assert.deepEqual(compose(back.prefs), compose(p));
});

test('bad or tampered links are ignored, not trusted', () => {
  assert.equal(decodePrefs('?c=atlantis&t=solo'), null);
  assert.equal(decodePrefs('?c=jaipur&t=pirate'), null);
  assert.equal(decodePrefs('?c=jaipur&t=solo&b=2&m=~'), null);
  assert.equal(decodePrefs('?c=jaipur&t=solo&b=2&m=~nightlife'), null);
  assert.equal(decodePrefs(''), null);
});
