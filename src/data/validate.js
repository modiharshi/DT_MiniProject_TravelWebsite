// Schema and reference checks for the planner data. Returns a list of problems (empty = valid).
import { AREAS } from './areas.js';
import { PLACES } from './places.js';
import { STAYS } from './stays.js';
import { FOOD } from './food.js';
import { CITY_LIST } from './cities.js';
import { INTERESTS } from './interests.js';

export const CATEGORIES = ['landmark', 'fort', 'palace', 'temple', 'market', 'cafe', 'food-walk', 'nature', 'viewpoint', 'museum', 'activity', 'craft', 'garden'];
export const BEST_TIMES = ['morning', 'afternoon', 'evening', 'any'];
export const STAY_TYPES = ['hostel', 'homestay', 'hotel', 'heritage', 'cottage'];
export const MEALS = ['breakfast', 'lunch', 'snack', 'dinner'];
export const DIETS = ['veg', 'nonveg', 'jain'];

export function validateData(d = { areas: AREAS, places: PLACES, stays: STAYS, food: FOOD }) {
  const bad = [];
  const cities = new Set(CITY_LIST.map((c) => c.id));
  const dupes = (list, what) => {
    const seen = new Set();
    list.forEach((x) => { if (seen.has(x.id)) bad.push(`${what}: duplicate id ${x.id}`); seen.add(x.id); });
  };
  [['area', d.areas], ['place', d.places], ['stay', d.stays], ['food', d.food]].forEach(([w, l]) => dupes(l, w));
  const areas = new Map(d.areas.map((a) => [a.id, a]));

  d.areas.forEach((a) => {
    if (!cities.has(a.cityId)) bad.push(`area ${a.id}: unknown city ${a.cityId}`);
    a.near.forEach((n) => {
      const o = areas.get(n);
      if (!o) bad.push(`area ${a.id}: unknown neighbour ${n}`);
      else if (o.cityId !== a.cityId) bad.push(`area ${a.id}: neighbour ${n} is in another city`);
      else if (!o.near.includes(a.id)) bad.push(`area ${a.id}: neighbour ${n} does not list it back`);
    });
  });
  for (const c of cities) if (d.areas.filter((a) => a.cityId === c).length < 4) bad.push(`city ${c}: fewer than 4 areas`);

  const inRange = (v, lo, hi) => Number.isInteger(v) && v >= lo && v <= hi;
  d.places.forEach((p) => {
    const a = areas.get(p.areaId);
    if (!a) return bad.push(`place ${p.id}: unknown area ${p.areaId}`);
    if (a.cityId !== p.cityId) bad.push(`place ${p.id}: city does not match its area`);
    if (!CATEGORIES.includes(p.category)) bad.push(`place ${p.id}: category ${p.category}`);
    if (!BEST_TIMES.includes(p.bestTime)) bad.push(`place ${p.id}: bestTime ${p.bestTime}`);
    if (!inRange(p.costTier, 1, 3)) bad.push(`place ${p.id}: costTier`);
    if (!inRange(p.walkingLevel, 1, 3)) bad.push(`place ${p.id}: walkingLevel`);
    if (!inRange(p.durationMins, 15, 240)) bad.push(`place ${p.id}: durationMins`);
    if (!p.name || !p.description) bad.push(`place ${p.id}: missing name or description`);
    if (!p.sampleNotes?.length) bad.push(`place ${p.id}: no sample note`);
    if (typeof p.sample !== 'boolean') bad.push(`place ${p.id}: sample flag`);
    const city = CITY_LIST.find((c) => c.id === p.cityId);
    const offered = new Set(city.interests.map((i) => i.id));
    const mine = p.tags.filter((t) => INTERESTS[t]);
    if (!mine.length) bad.push(`place ${p.id}: no interest tag`);
    mine.forEach((t) => { if (!offered.has(t)) bad.push(`place ${p.id}: tag ${t} is not offered in ${p.cityId}`); });
  });
  d.stays.forEach((s) => {
    const a = areas.get(s.areaId);
    if (!a || a.cityId !== s.cityId) bad.push(`stay ${s.id}: bad area/city`);
    if (!STAY_TYPES.includes(s.type)) bad.push(`stay ${s.id}: type`);
    if (!inRange(s.costTier, 1, 3)) bad.push(`stay ${s.id}: costTier`);
  });
  d.food.forEach((f) => {
    const a = areas.get(f.areaId);
    if (!a || a.cityId !== f.cityId) bad.push(`food ${f.id}: bad area/city`);
    if (!inRange(f.costTier, 1, 3)) bad.push(`food ${f.id}: costTier`);
    if (!f.diet.length || f.diet.some((x) => !DIETS.includes(x))) bad.push(`food ${f.id}: diet`);
    if (f.diet.includes('jain') && !f.diet.includes('veg')) bad.push(`food ${f.id}: jain must also be veg`);
    if (!f.mealSlot.length || f.mealSlot.some((x) => !MEALS.includes(x))) bad.push(`food ${f.id}: mealSlot`);
  });

  // an interest card must have content behind it
  CITY_LIST.forEach((c) => c.interests.forEach((i) => {
    const n = d.places.filter((p) => p.cityId === c.id && p.tags.includes(i.id)).length;
    if (n < 2) bad.push(`city ${c.id}: interest ${i.id} has only ${n} place(s)`);
  }));
  return bad;
}
