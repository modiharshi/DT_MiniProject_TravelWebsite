import test from 'node:test';
import assert from 'node:assert/strict';
import { CITY_LIST } from '../src/data/cities.js';
import { INTERESTS, MAX_PICKS } from '../src/data/interests.js';
import {
  initialPrefs, setCity, setTraveller, setSize, setSeniors, toggleInterest, renameMember, setDetail,
  validate, impactOfTraveller, impactOfSize,
} from '../src/lib/prefs.js';
import { groupOverlap } from '../src/lib/overlap.js';

const start = (cityId, type) => setTraveller(setCity(initialPrefs(), cityId), type);

test('every city lists only interests that exist in the catalogue, once each', () => {
  for (const c of CITY_LIST) {
    const ids = c.interests.map((i) => i.id);
    assert.ok(ids.length >= 5, `${c.id} has too few interests`);
    assert.equal(new Set(ids).size, ids.length, `${c.id} repeats an interest`);
    ids.forEach((id) => assert.ok(INTERESTS[id], `${c.id}: unknown ${id}`));
  }
});

test('solo keeps one member; group resizes 2..5; family has a single shared pick list', () => {
  let p = start('jaipur', 'solo');
  assert.equal(p.members.length, 1);
  p = setTraveller(p, 'group');
  assert.equal(p.members.length, 3);
  assert.equal(setSize(p, 9).members.length, 5);
  assert.equal(setSize(p, 0).members.length, 2);
  p = setTraveller(p, 'family');
  assert.equal(p.members.length, 1);
  assert.equal(setSize(p, 99).size, 6);
});

test('interests are limited to the city and capped', () => {
  let p = start('manali', 'solo');
  assert.equal(toggleInterest(p, 'm1', 'nightlife'), p, 'Manali has no nightlife');
  for (const id of ['nature-adventure', 'cafes', 'temples', 'offbeat', 'local-food', 'shopping']) p = toggleInterest(p, 'm1', id);
  assert.equal(p.members[0].interests.length, MAX_PICKS);
  p = toggleInterest(p, 'm1', 'cafes');
  assert.equal(p.members[0].interests.length, MAX_PICKS - 1);
});

test('changing city keeps picks that still exist and reports the ones that did not', () => {
  let p = start('jaipur', 'solo');
  for (const id of ['heritage', 'street-food', 'offbeat']) p = toggleInterest(p, 'm1', id);
  const u = setCity(p, 'udaipur');
  assert.deepEqual(u.members[0].interests, ['heritage']);
  assert.deepEqual(u.dropped.sort(), ['Offbeat', 'Street Food']);
  assert.equal(setCity(initialPrefs(), 'mumbai').dropped.length, 0);
});

test('switching away from group says what clears before it clears', () => {
  let p = start('mumbai', 'group');
  p = toggleInterest(p, 'm2', 'cafes');
  p = renameMember(p, 'm3', 'Asha');
  assert.equal(impactOfTraveller(p, 'solo').length, 1);
  assert.match(impactOfTraveller(p, 'solo')[0], /Traveller 2, Asha/);
  assert.equal(impactOfSize(p, 2).length, 1);
  assert.equal(impactOfSize(p, 4).length, 0);
  assert.equal(impactOfTraveller(p, 'group').length, 0);
  const solo = setTraveller(p, 'solo');
  assert.equal(solo.members.length, 1);
});

test('first member keeps their picks when the traveller type changes', () => {
  let p = start('udaipur', 'solo');
  p = toggleInterest(p, 'm1', 'lakes-sunsets');
  p = setTraveller(p, 'group');
  assert.deepEqual(p.members[0].interests, ['lakes-sunsets']);
  assert.deepEqual(setTraveller(p, 'family').members[0].interests, ['lakes-sunsets']);
});

test('seniors only apply to families', () => {
  assert.equal(setSeniors(start('jaipur', 'solo'), true).seniors, false);
  const f = setSeniors(start('jaipur', 'family'), true);
  assert.equal(f.seniors, true);
  assert.equal(setTraveller(f, 'solo').seniors, false);
});

test('validation: traveller, one pick each, unique names, budget', () => {
  let p = setCity(initialPrefs(), 'jaipur');
  assert.equal(validate(p).who.length, 1);
  p = setTraveller(p, 'group');
  p = renameMember(p, 'm1', 'Asha');
  p = renameMember(p, 'm2', 'asha');
  assert.match(validate(p).who[0], /share the name/);
  p = renameMember(p, 'm2', 'Ravi');
  assert.equal(validate(p).interests.length, 3);
  for (const m of ['m1', 'm2', 'm3']) p = toggleInterest(p, m, 'cafes');
  assert.equal(validate(p).interests.length, 0);
  assert.equal(validate(p).details[0].field, 'budget');
  p = setDetail(p, 'budget', '2');
  assert.equal(validate(p).valid, true);
});

test('details are clamped and ignore unknown values', () => {
  let p = start('mumbai', 'solo');
  assert.equal(setDetail(p, 'days', 9).details.days, 5);
  assert.equal(setDetail(p, 'days', 0).details.days, 1);
  assert.equal(setDetail(p, 'budget', '4'), p);
  assert.equal(setDetail(p, 'pace', 'frantic'), p);
  assert.equal(setDetail(p, 'food', 'jain').details.food, 'jain');
  assert.equal(setDetail(p, 'lowWalking', 1).details.lowWalking, true);
});

test('group overlap: shared, common, single and the meter', () => {
  const m = (id, interests) => ({ id, name: '', interests });
  const same = groupOverlap([m('a', ['x', 'y']), m('b', ['x', 'y'])]);
  assert.equal(same.meter, 100);
  assert.equal(same.tier, 'easy');
  assert.deepEqual(same.common.sort(), ['x', 'y']);

  const apart = groupOverlap([m('a', ['x']), m('b', ['y'])]);
  assert.equal(apart.meter, 0);
  assert.equal(apart.tier, 'lots');
  assert.equal(apart.shared.length, 0);
  assert.equal(apart.single.length, 2);

  const mixed = groupOverlap([m('a', ['x', 'y']), m('b', ['y', 'z']), m('c', [])]);
  assert.equal(mixed.activeCount, 2);
  assert.equal(mixed.meter, 33); // 1 shared of 3 distinct
  assert.deepEqual(mixed.shared.map((r) => r.id), ['y']);

  assert.equal(groupOverlap([m('a', ['x'])]).meter, null);
});
