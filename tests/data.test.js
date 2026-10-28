import test from 'node:test';
import assert from 'node:assert/strict';
import { validateData } from '../src/data/validate.js';
import { PLACES } from '../src/data/places.js';
import { STAYS } from '../src/data/stays.js';
import { FOOD } from '../src/data/food.js';
import { CITY_LIST } from '../src/data/cities.js';

test('planner data passes schema and reference checks', () => {
  assert.deepEqual(validateData(), []);
});

test('every city has places, stays and food, and sample content is labelled', () => {
  for (const c of CITY_LIST) {
    assert.ok(PLACES.filter((p) => p.cityId === c.id).length >= 16, `${c.id} places`);
    assert.ok(STAYS.filter((s) => s.cityId === c.id).length >= 5, `${c.id} stays`);
    assert.ok(FOOD.filter((f) => f.cityId === c.id).length >= 8, `${c.id} food`);
  }
  STAYS.forEach((s) => assert.equal(s.sample, true));
  FOOD.forEach((f) => assert.equal(f.sample, true));
  PLACES.filter((p) => /\(example/.test(p.name)).forEach((p) => assert.equal(p.sample, true));
});

test('data validation catches broken references', () => {
  const bad = validateData({ areas: [], places: [{ id: 'x', areaId: 'nope', cityId: 'jaipur', tags: [] }], stays: [], food: [] });
  assert.ok(bad.some((m) => /unknown area/.test(m)));
});
