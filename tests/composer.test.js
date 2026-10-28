import test from 'node:test';
import assert from 'node:assert/strict';
import { CITY_LIST } from '../src/data/cities.js';
import { PLACE_BY_ID } from '../src/data/places.js';
import { STAY_BY_ID } from '../src/data/stays.js';
import { FOOD_BY_ID } from '../src/data/food.js';
import { AREA_BY_ID } from '../src/data/areas.js';
import {
  initialPrefs, setCity, setTraveller, setSize, setSeniors, toggleInterest, renameMember, setDetail,
} from '../src/lib/prefs.js';
import { compose, swapStop, balanceDay, tally, interestSupport, planCoverage, dayCoverage, stopLimit } from '../src/engine/composer.js';

const FOOD_ART = { jaipur: ['street-food', 'art-crafts'], mumbai: ['street-food', 'art-galleries'], udaipur: ['cafes', 'art-crafts'], manali: ['local-food', 'offbeat'] };

function make(cityId, { type = 'solo', size, seniors = false, picks, days = 3, budget = '2', pace = 'balanced', food = 'any', low = false } = {}) {
  let p = setTraveller(setCity(initialPrefs(), cityId), type);
  if (size) p = setSize(p, size);
  if (seniors) p = setSeniors(p, true);
  const lists = picks || [FOOD_ART[cityId]];
  p.members.forEach((m, i) => (lists[i] || lists[0]).forEach((id) => { p = toggleInterest(p, m.id, id); }));
  p = setDetail(setDetail(setDetail(setDetail(setDetail(p, 'days', days), 'budget', budget), 'pace', pace), 'food', food), 'lowWalking', low);
  return p;
}
const stops = (plan) => plan.days.flatMap((d) => d.items.filter((i) => i.type === 'stop').map((i) => PLACE_BY_ID[i.placeId]));
const meals = (plan) => plan.days.flatMap((d) => d.items.filter((i) => i.type === 'meal'));

for (const city of CITY_LIST) {
  const id = city.id;
  test(`${id}: 3 days at the lowest budget, food + art, stays within the ceiling and has food every day`, () => {
    const prefs = make(id, { budget: '1' });
    const plan = compose(prefs);
    assert.equal(plan.ok, true, JSON.stringify(plan.constraints));
    assert.equal(plan.days.length, 3);
    stops(plan).forEach((p) => assert.ok(p.costTier <= 1, `${p.id} is tier ${p.costTier}`));
    assert.ok(STAY_BY_ID[plan.stay].costTier <= 1);
    meals(plan).forEach((m) => assert.ok(FOOD_BY_ID[m.foodId].costTier <= 1));
    plan.days.forEach((d) => assert.ok(d.items.some((i) => i.type === 'meal' && i.foodId), `day ${d.index + 1} has no food`));
  });

  test(`${id}: same-day stops come from at most two neighbouring areas, no duplicates, no empty days`, () => {
    for (const pace of ['relaxed', 'balanced', 'packed']) {
      const plan = compose(make(id, { pace, budget: '3' }));
      const seen = new Set();
      plan.days.forEach((d) => {
        const sIds = d.items.filter((i) => i.type === 'stop').map((i) => i.placeId);
        assert.ok(sIds.length >= 2, `empty-ish day (${pace})`);
        sIds.forEach((x) => { assert.ok(!seen.has(x), `duplicate ${x}`); seen.add(x); });
        const areas = [...new Set(sIds.map((x) => PLACE_BY_ID[x].areaId))];
        assert.ok(areas.length <= 2);
        if (areas.length === 2) assert.ok(AREA_BY_ID[areas[0]].near.includes(areas[1]));
      });
    }
  });

  test(`${id}: veg and Jain preferences never produce a non-matching meal`, () => {
    for (const diet of ['veg', 'jain']) {
      const plan = compose(make(id, { food: diet, budget: '3', days: 4 }));
      assert.ok(plan.days.length > 0);
      meals(plan).forEach((m) => assert.ok(FOOD_BY_ID[m.foodId].diet.includes(diet), `${m.foodId} for ${diet}`));
    }
  });

  test(`${id}: solo plans only use solo-friendly stops and lean to hostels or homestays`, () => {
    const plan = compose(make(id, { type: 'solo', budget: '2' }));
    stops(plan).forEach((p) => assert.equal(p.soloFriendly, true));
    assert.ok(['hostel', 'homestay'].includes(STAY_BY_ID[plan.stay].type));
  });

  test(`${id}: family with seniors stays at the relaxed limit and senior-friendly`, () => {
    const prefs = make(id, { type: 'family', size: 4, seniors: true, pace: 'packed', budget: '3' });
    assert.equal(stopLimit(prefs), 3);
    const plan = compose(prefs);
    assert.ok(plan.days.length > 0);
    plan.days.forEach((d) => assert.ok(d.items.filter((i) => i.type === 'stop').length <= 3));
    stops(plan).forEach((p) => { assert.equal(p.seniorFriendly, true); assert.ok(p.walkingLevel <= 2); });
    assert.equal(STAY_BY_ID[plan.stay].seniorFriendly, true);
    plan.days.forEach((d) => assert.ok(d.items.some((i) => i.type === 'rest'), 'family days include a rest break'));
  });

  test(`${id}: a group of five with different interests gets a matching stop each`, () => {
    const ids = city.interests.map((i) => i.id);
    const picks = [0, 1, 2, 3, 4].map((i) => [ids[i % ids.length]]);
    let prefs = make(id, { type: 'group', size: 5, picks, budget: '3', days: 3 });
    ['Asha', 'Ravi', 'Meera', 'Kabir', 'Isha'].forEach((n, i) => { prefs = renameMember(prefs, prefs.members[i].id, n); });
    const plan = compose(prefs);
    const cov = planCoverage(plan, prefs);
    prefs.members.forEach((m) => assert.ok(cov[m.id] > 0, `${m.name} has no stop: ${JSON.stringify(cov)} / ${plan.notes}`));
  });

  test(`${id}: 3 days to 2 days regenerates a valid plan`, () => {
    const three = compose(make(id, { days: 3, budget: '3' }));
    const two = compose(make(id, { days: 2, budget: '3' }));
    assert.equal(two.ok, true);
    assert.equal(two.days.length, 2);
    two.days.forEach((d) => assert.ok(d.items.some((i) => i.type === 'stop')));
    assert.notEqual(three.days.length, two.days.length);
  });

  test(`${id}: every interest shown has at least one eligible place`, () => {
    const prefs = make(id, { budget: '3' });
    const support = interestSupport(id, prefs);
    city.interests.forEach((i) => assert.ok(support[i.id] > 0, `${i.id} has no eligible place`));
  });

  test(`${id}: times never overlap and stay in order within a day`, () => {
    const plan = compose(make(id, { pace: 'packed', budget: '3' }));
    plan.days.forEach((d) => d.items.forEach((it, i) => {
      assert.ok(it.end > it.start);
      if (i) assert.ok(it.start >= d.items[i - 1].end, `overlap on day ${d.index + 1}`);
    }));
  });

  test(`${id}: Not this one swaps within the same day, keeps rules and avoids duplicates`, () => {
    const prefs = make(id, { budget: '3', pace: 'balanced' });
    const plan = compose(prefs);
    let tried = 0;
    for (const d of plan.days) for (const it of d.items.filter((x) => x.type === 'stop')) {
      const res = swapStop(plan, d.index, it.placeId, prefs);
      tried += 1;
      if (!res.ok) continue;
      const ids = stops(res.plan).map((p) => p.id);
      assert.equal(new Set(ids).size, ids.length);
      assert.ok(!ids.includes(it.placeId));
      assert.ok(res.plan.days[d.index].areaIds.length <= 2);
      return;
    }
    assert.fail(`no stop could be swapped (${tried} tried)`);
  });
}

test('determinism: the same choices always give the same plan; changing city leaves nothing stale', () => {
  const a = compose(make('jaipur'));
  assert.deepEqual(a, compose(make('jaipur')));
  const u = compose(setCity(make('jaipur', { picks: [['heritage']] }), 'udaipur'));
  stops(u).forEach((p) => assert.equal(p.cityId, 'udaipur'));
  assert.equal(STAY_BY_ID[u.stay].cityId, 'udaipur');
});

test('when there is not enough data the plan says so and offers a relaxation that works', () => {
  const prefs = make('manali', { days: 5, budget: '1', pace: 'packed', type: 'family', size: 3, seniors: true });
  const plan = compose(prefs);
  assert.equal(plan.ok, false);
  const c = plan.constraints.find((x) => x.code === 'days');
  assert.ok(c, JSON.stringify(plan.constraints));
  assert.ok(c.relax.length > 0);
  assert.ok(plan.days.length < 5);
  const patched = { ...prefs, details: { ...prefs.details, ...c.relax[0].patch.details } };
  assert.equal(compose(patched).ok, true);
});

test('indicative tally counts tier points, not rupees, and splits shared costs for groups', () => {
  const prefs = make('jaipur', { type: 'group', size: 3, picks: [['heritage'], ['street-food'], ['cafes']], budget: '2' });
  const plan = compose(prefs);
  const t = tally(plan, prefs);
  assert.ok(t.total > 0 && t.ratio > 0 && t.ratio <= 1);
  assert.equal(t.people, 3);
  assert.ok(t.perPerson < t.total);
});

test('balance this day: when it succeeds the left-out member gains a stop and nobody loses theirs; when it cannot it says why', () => {
  const prefs = make('jaipur', { type: 'group', size: 3, picks: [['heritage'], ['street-food'], ['shopping']], budget: '3', days: 2 });
  const plan = compose(prefs);
  let sawOutcome = false;
  for (const d of plan.days) {
    const before = dayCoverage(d, prefs);
    const res = balanceDay(plan, d.index, prefs);
    if (Object.values(before).every((n) => n > 0)) { assert.equal(res.ok, false); sawOutcome = true; continue; }
    sawOutcome = true;
    if (res.ok) {
      const after = dayCoverage(res.plan.days[d.index], prefs);
      assert.ok(after[res.for.id] > 0, 'member now has a stop');
      prefs.members.forEach((m) => assert.ok(!before[m.id] || after[m.id] > 0, 'nobody lost their only stop'));
      const ids = stops(res.plan).map((p) => p.id);
      assert.equal(new Set(ids).size, ids.length);
    } else {
      assert.ok(res.message.length > 10);
    }
  }
  assert.ok(sawOutcome);
});
