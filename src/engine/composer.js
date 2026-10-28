// The Trip Composer: a rule-based planner. Plain functions, no React, no randomness, no network.
// Hard constraints (city, diet, budget ceiling, solo/group/senior flags, walking exclusions, areas per
// day) are filters and are never traded away for a better score. Soft preferences (interests, pace,
// traveller fit) only rank what is left. If no valid plan exists the result says which constraint
// failed and offers ways to relax it. It never invents a stop to fill a day.
import { AREAS, AREA_BY_ID } from '../data/areas.js';
import { PLACES } from '../data/places.js';
import { STAYS } from '../data/stays.js';
import { FOOD } from '../data/food.js';
import { INTERESTS } from '../data/interests.js';
import { CITIES } from '../data/cities.js';
import { memberLabel, validate } from '../lib/prefs.js';

export const DEFAULT_DATA = { areas: AREAS, areaById: AREA_BY_ID, places: PLACES, stays: STAYS, food: FOOD };

export const PACE_STOPS = { relaxed: 3, balanced: 4, packed: 5 };
const DAY_CAP_MIN = { relaxed: 390, balanced: 480, packed: 540 };
const SLOT_CAP = { morning: 3, afternoon: 3, evening: 2 };
const SLOT_START = { morning: 9 * 60, afternoon: 13 * 60 + 30, evening: 16 * 60 + 30 };
const SLOT_RANK = { morning: 0, any: 1, afternoon: 2, evening: 3 };
const TRAVEL = { same: 15, near: 30, far: 45 };
const LUNCH = { at: 12 * 60 + 30, mins: 60 };
const DINNER = { at: 19 * 60, mins: 75 };
const SNACK_MINS = 30;
const REST_MINS = 45;
const DAY_END = 22 * 60 + 30;
const MIN_STOPS = 2;

export const stopLimit = (prefs) => {
  let n = PACE_STOPS[prefs.details.pace] || 4;
  if (prefs.traveller === 'family') n = Math.min(n, 4);
  if (prefs.details.lowWalking) n = Math.min(n, 4);
  if (prefs.seniors) n = Math.min(n, PACE_STOPS.relaxed);
  return n;
};

// ---- hard constraints -------------------------------------------------------------------------
function rules(prefs) {
  return {
    budget: Number(prefs.details.budget),
    solo: prefs.traveller === 'solo',
    needsGroup: prefs.traveller === 'group' || prefs.traveller === 'family',
    seniors: !!prefs.seniors,
    gentle: !!prefs.details.lowWalking || !!prefs.seniors,
    diet: prefs.details.food,
  };
}

export function eligiblePlaces(prefs, data = DEFAULT_DATA, override = {}) {
  const r = { ...rules(prefs), ...override };
  return data.places.filter((p) => p.cityId === prefs.cityId
    && p.costTier <= r.budget
    && (!r.solo || p.soloFriendly)
    && (!r.needsGroup || p.groupFriendly)
    && (!r.seniors || p.seniorFriendly)
    && (!r.gentle || p.walkingLevel <= 2));
}

const dietOk = (item, diet) => (diet === 'veg' || diet === 'jain' ? item.diet.includes(diet) : true);

export function eligibleStays(prefs, data = DEFAULT_DATA) {
  const r = rules(prefs);
  return data.stays.filter((s) => s.cityId === prefs.cityId && s.costTier <= r.budget
    && (!r.solo || s.soloFriendly) && (!r.needsGroup || s.groupFriendly) && (!r.seniors || s.seniorFriendly));
}

export function eligibleFood(prefs, data = DEFAULT_DATA) {
  const r = rules(prefs);
  return data.food.filter((f) => f.cityId === prefs.cityId && f.costTier <= r.budget && dietOk(f, r.diet));
}

// An interest only deserves a card if the current city has at least one eligible place for it.
export function interestSupport(cityId, prefs, data = DEFAULT_DATA) {
  const base = { ...prefs, cityId };
  const places = eligiblePlaces(base, data);
  const out = {};
  for (const i of CITIES[cityId].interests) out[i.id] = places.filter((p) => p.tags.includes(i.id)).length;
  return out;
}

// ---- scoring ----------------------------------------------------------------------------------
const matchedMembers = (place, members) => members.filter((m) => m.interests.some((i) => place.tags.includes(i)));

function baseScore(place, prefs, extra = {}) {
  const members = prefs.members;
  const matched = matchedMembers(place, members);
  const depth = members.reduce((s, m) => s + m.interests.filter((i) => place.tags.includes(i)).length, 0) / members.length;
  let s = 10 * (matched.length / members.length) + 3 * depth;
  if (!matched.length) s += 0.5;
  if (prefs.traveller === 'solo' && place.tags.includes('social')) s += extra.meetPeople ? 4 : 0.5;
  if (prefs.details.lowWalking && place.walkingLevel === 1) s += 1.5;
  if (prefs.seniors && place.walkingLevel === 1) s += 1;
  if (prefs.details.pace === 'relaxed' && place.durationMins <= 60) s += 0.5;
  return s;
}

function scorer(prefs, extra) {
  const cache = new Map();
  return (p) => {
    if (!cache.has(p.id)) cache.set(p.id, baseScore(p, prefs, extra));
    return cache.get(p.id);
  };
}

const byScoreThenId = (score) => (a, b) => score(b) - score(a) || (a.id < b.id ? -1 : 1);

// ---- picking stops for one day ----------------------------------------------------------------
function pickStops(pool, limit, capMin, score, uncovered) {
  const bonus = (p) => (uncovered.size ? 6 * [...uncovered].filter((m) => m.interests.some((i) => p.tags.includes(i))).length : 0);
  const order = [...pool].sort((a, b) => score(b) + bonus(b) - score(a) - bonus(a) || (a.id < b.id ? -1 : 1));
  const out = [];
  const slots = { morning: 0, afternoon: 0, evening: 0 };
  let mins = 0;
  for (const p of order) {
    if (out.length >= limit) break;
    if (p.bestTime !== 'any' && slots[p.bestTime] >= SLOT_CAP[p.bestTime]) continue;
    if (mins + p.durationMins + TRAVEL.same > capMin) continue;
    out.push(p);
    if (p.bestTime !== 'any') slots[p.bestTime] += 1;
    mins += p.durationMins + TRAVEL.same;
  }
  return out;
}

function areaCombos(cityAreas) {
  const out = cityAreas.map((a) => [a.id]);
  for (const a of cityAreas) for (const n of a.near) if (a.id < n) out.push([a.id, n]);
  return out;
}

function planDays(prefs, pool, ctx) {
  const { days, limit, capMin, score, cityAreas } = ctx;
  const combos = areaCombos(cityAreas);
  const unused = new Map(pool.map((p) => [p.id, p]));
  const uncovered = new Set(prefs.members.length > 1 ? prefs.members : []);
  const chosen = [];
  for (let d = 0; d < days; d++) {
    let best = null;
    for (const combo of combos) {
      const here = [...unused.values()].filter((p) => combo.includes(p.areaId));
      const picks = pickStops(here, limit, capMin, score, uncovered);
      const value = picks.reduce((s, p) => s + score(p), 0) + (combo.length === 1 ? 0.01 : 0);
      if (!best || value > best.value + 1e-9) best = { combo, picks, value };
    }
    if (!best || !best.picks.length) { chosen.push({ combo: [], stops: [] }); continue; }
    best.picks.forEach((p) => {
      unused.delete(p.id);
      for (const m of [...uncovered]) if (m.interests.some((i) => p.tags.includes(i))) uncovered.delete(m);
    });
    const areas = [...new Set(best.picks.map((p) => p.areaId))];
    chosen.push({ combo: areas, stops: best.picks });
  }
  return { chosen, unused };
}

// ---- timeline for one day ---------------------------------------------------------------------
const nearOf = (data, a, b) => (a === b ? 'same' : data.areaById[a]?.near.includes(b) ? 'near' : 'far');
const fmt = (m) => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
export const formatTime = fmt;

export function buildTimeline(stops, prefs, data, score) {
  const sorted = [...stops].sort((a, b) => SLOT_RANK[a.bestTime] - SLOT_RANK[b.bestTime]
    || (a.areaId < b.areaId ? -1 : a.areaId > b.areaId ? 1 : 0) || score(b) - score(a));
  const gentle = prefs.traveller === 'family' || prefs.seniors || prefs.details.lowWalking;
  const items = [];
  let cursor = (prefs.details.pace === 'relaxed' || gentle ? 9.5 : 9) * 60;
  let prevArea = null;
  let lunch = false;
  let snack = false;
  const insertLunch = (area) => {
    const at = Math.max(cursor, LUNCH.at);
    items.push({ type: 'meal', slot: 'lunch', start: at, end: at + LUNCH.mins, nearArea: area });
    cursor = at + LUNCH.mins;
    lunch = true;
    if (gentle) { items.push({ type: 'rest', start: cursor, end: cursor + REST_MINS, nearArea: area }); cursor += REST_MINS; }
  };
  for (const s of sorted) {
    const travel = prevArea ? TRAVEL[nearOf(data, prevArea, s.areaId)] : 0;
    let start = cursor + travel;
    if (!lunch && (start >= LUNCH.at || s.bestTime === 'afternoon' || s.bestTime === 'evening')) {
      insertLunch(prevArea || s.areaId);
      start = cursor + travel;
    }
    const floor = s.bestTime === 'any' ? 0 : SLOT_START[s.bestTime];
    if (floor > start) {
      if (!snack && floor - start >= 60 && prefs.details.pace !== 'relaxed') {
        items.push({ type: 'meal', slot: 'snack', start: cursor + 10, end: cursor + 10 + SNACK_MINS, nearArea: prevArea || s.areaId });
        snack = true;
      }
      start = floor;
    }
    items.push({ type: 'stop', placeId: s.id, areaId: s.areaId, start, end: start + s.durationMins });
    cursor = start + s.durationMins;
    prevArea = s.areaId;
  }
  if (!lunch) insertLunch(prevArea);
  const dinnerAt = Math.max(cursor + 30, DINNER.at);
  items.push({ type: 'meal', slot: 'dinner', start: dinnerAt, end: dinnerAt + DINNER.mins, nearArea: prevArea });
  items.sort((a, b) => a.start - b.start);
  return { items, end: dinnerAt + DINNER.mins };
}

function fitDay(stops, prefs, data, score) {
  let kept = [...stops];
  let tl = buildTimeline(kept, prefs, data, score);
  while (tl.end > DAY_END && kept.length > MIN_STOPS) {
    kept = kept.filter((p) => p !== [...kept].sort((a, b) => score(a) - score(b))[0]);
    tl = buildTimeline(kept, prefs, data, score);
  }
  return { stops: kept, tl };
}

// ---- food ---------------------------------------------------------------------------------
function pickFood(slot, nearArea, dayAreas, foods, used, data, prefs) {
  const wantsStreet = prefs.members.some((m) => m.interests.includes('street-food'));
  const wantsLocal = prefs.members.some((m) => m.interests.includes('local-food'));
  const cands = foods.filter((f) => f.mealSlot.includes(slot));
  const rank = (f) => {
    const where = f.areaId === nearArea ? 0 : dayAreas.includes(f.areaId) ? 1 : nearOf(data, nearArea, f.areaId) === 'near' ? 2 : 3;
    const reuse = used[f.id] || 0;
    const taste = (wantsStreet && f.cuisineTags.includes('street') ? -0.5 : 0) + (wantsLocal && (f.cuisineTags.includes('thali') || f.cuisineTags.includes('regional')) ? -0.5 : 0);
    return reuse * 10 + where + taste + (f.mealSlot[0] === slot ? -0.2 : 0);
  };
  return [...cands].sort((a, b) => rank(a) - rank(b) || (a.id < b.id ? -1 : 1))[0] || null;
}

// ---- explanations ---------------------------------------------------------------------------
export function whyFits(place, prefs) {
  const label = (id) => CITIES[prefs.cityId].interests.find((i) => i.id === id)?.label || INTERESTS[id]?.label || id;
  const out = [];
  const matched = matchedMembers(place, prefs.members);
  if (matched.length) {
    const tags = [...new Set(matched.flatMap((m) => m.interests.filter((i) => place.tags.includes(i))))].map(label);
    if (prefs.members.length === 1) out.push(`Matches your ${tags.join(' and ')} ${tags.length > 1 ? 'picks' : 'pick'}`);
    else out.push(`${tags.join(' and ')}: picked by ${matched.map((m) => memberLabel(prefs, m)).join(', ')}`);
  } else {
    out.push('A general highlight in this area');
  }
  if (prefs.seniors && place.seniorFriendly) out.push('Senior-friendly');
  if ((prefs.details.lowWalking || prefs.seniors) && place.walkingLevel === 1) out.push('Easy on the legs');
  if (prefs.traveller === 'solo' && place.soloFriendly) out.push(place.tags.includes('social') ? 'Easy to meet people' : 'Comfortable on your own');
  if (prefs.traveller === 'group' && place.groupFriendly) out.push('Works for a group');
  return out;
}

const MOODS = {
  'lakes-sunsets': 'Lake day', heritage: 'Heritage day', shopping: 'Bazaar day', 'street-food': 'Street-food day', cafes: 'Slow café day',
  temples: 'Temple day', beaches: 'Seaside day', 'nature-adventure': 'Mountain day', 'art-crafts': 'Art and craft day',
  'art-galleries': 'Gallery day', nightlife: 'Night-owl day', offbeat: 'Wander day', 'local-food': 'Local-flavours day',
};
function moodOf(stops) {
  const tally = {};
  stops.forEach((s) => s.tags.forEach((t) => { if (MOODS[t]) tally[t] = (tally[t] || 0) + 1; }));
  const top = Object.entries(tally).sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0];
  const evening = stops.filter((s) => s.bestTime === 'evening' && s.tags.includes('shopping')).length;
  if (evening && top?.[0] === 'shopping') return 'Bazaar evening';
  return top ? MOODS[top[0]] : 'City day';
}

// ---- stay ---------------------------------------------------------------------------------
function chooseStay(prefs, usedAreas, data, meetPeople) {
  const stays = eligibleStays(prefs, data);
  const typeScore = (s) => {
    if (prefs.traveller === 'solo') return { hostel: 3, homestay: 2.5, hotel: 1, cottage: 1, heritage: 0.5 }[s.type] ?? 0;
    if (prefs.traveller === 'family' || prefs.seniors) return { hotel: 3, cottage: 2.5, heritage: 2.5, homestay: 2 }[s.type] ?? 0.5;
    return { hotel: 2, hostel: 2, homestay: 2, cottage: 1.5, heritage: 1.5 }[s.type] ?? 1;
  };
  const near = (s) => (usedAreas.includes(s.areaId) ? 2 : usedAreas.some((a) => nearOf(data, a, s.areaId) === 'near') ? 1 : 0);
  const rank = (s) => typeScore(s) + near(s) + (meetPeople && s.tags.includes('social') ? 1.5 : 0) + (s.tags.includes('comfort') && prefs.seniors ? 1 : 0);
  return [...stays].sort((a, b) => rank(b) - rank(a) || (a.id < b.id ? -1 : 1))[0] || null;
}

// ---- relax options ------------------------------------------------------------------------
export function relaxOptions(prefs, data, needMore = true) {
  const base = eligiblePlaces(prefs, data).length;
  const opts = [];
  const tryPatch = (label, patchDetails, patchTop = {}) => {
    const next = { ...prefs, ...patchTop, details: { ...prefs.details, ...patchDetails } };
    if (eligiblePlaces(next, data).length > base || !needMore) opts.push({ label, patch: { details: patchDetails, ...patchTop } });
  };
  if (prefs.details.lowWalking && !prefs.seniors) tryPatch('Turn off low walking', { lowWalking: false });
  if (Number(prefs.details.budget) < 3) tryPatch(`Allow ${'₹'.repeat(Number(prefs.details.budget) + 1)}`, { budget: String(Number(prefs.details.budget) + 1) });
  return opts;
}

// ---- compose ------------------------------------------------------------------------------
export function compose(prefs, data = DEFAULT_DATA, extra = {}) {
  const check = validate(prefs);
  const days = prefs.details.days;
  const cityAreas = data.areas.filter((a) => a.cityId === prefs.cityId);
  const empty = { cityId: prefs.cityId, requestedDays: days, days: [], stay: null, notes: [], rejected: [], meetPeople: !!extra.meetPeople };
  if (!check.valid) {
    return { ...empty, ok: false, constraints: [{ code: 'prefs', message: 'Some choices are still missing.', relax: [] }] };
  }
  const pool = eligiblePlaces(prefs, data);
  const foods = eligibleFood(prefs, data);
  const limit = stopLimit(prefs);
  const capMin = DAY_CAP_MIN[prefs.details.pace] * (prefs.seniors ? 0.9 : 1);
  const score = scorer(prefs, extra);

  const { chosen } = planDays(prefs, pool, { days, limit, capMin, score, cityAreas });
  const constraints = [];
  const notes = [];
  const firstBad = chosen.findIndex((c) => c.stops.length < MIN_STOPS);
  const usable = firstBad === -1 ? chosen : chosen.slice(0, firstBad);

  if (usable.length < days) {
    const n = usable.length;
    constraints.push({
      code: 'days',
      message: n === 0
        ? `With these choices there are not enough eligible places in ${CITIES[prefs.cityId].name} to plan even one day.`
        : `With these choices there are only enough eligible places in ${CITIES[prefs.cityId].name} for ${n} ${n === 1 ? 'day' : 'days'}, not ${days}.`,
      relax: [...(n > 0 ? [{ label: `Plan ${n} ${n === 1 ? 'day' : 'days'} instead`, patch: { details: { days: n } } }] : []), ...relaxOptions(prefs, data)],
    });
  }

  const usedFood = {};
  const plannedDays = [];
  for (let d = 0; d < usable.length; d++) {
    const { stops, tl } = fitDay(usable[d].stops, prefs, data, score);
    const dayAreas = [...new Set(stops.map((s) => s.areaId))];
    const items = tl.items.map((it) => {
      if (it.type === 'stop') return { ...it, why: whyFits(data.places.find((p) => p.id === it.placeId), prefs) };
      if (it.type === 'meal') {
        const f = pickFood(it.slot, it.nearArea, dayAreas, foods, usedFood, data, prefs);
        if (!f && it.slot === 'snack') return null; // a snack is optional, so skip it when nothing fits
        if (!f) {
          constraints.push({ code: 'food', message: `No ${it.slot} spot in ${CITIES[prefs.cityId].name} fits your diet and budget.`, relax: relaxOptions(prefs, data, false) });
          return { ...it, foodId: null };
        }
        usedFood[f.id] = (usedFood[f.id] || 0) + 1;
        return { ...it, foodId: f.id };
      }
      return it;
    }).filter(Boolean);
    plannedDays.push({ index: d, areaIds: dayAreas, mood: moodOf(stops), items });
  }

  const plan = { ...empty, days: plannedDays, notes, constraints, rejected: [] };
  if (prefs.members.length > 1) ensureCoverage(plan, prefs, data, score, notes);
  const usedAreas = [...new Set(plan.days.flatMap((d) => d.areaIds))];

  if (plan.days.length > 1) {
    const stay = chooseStay(prefs, usedAreas, data, extra.meetPeople);
    if (stay) plan.stay = stay.id;
    else constraints.push({ code: 'stay', message: `No stay in ${CITIES[prefs.cityId].name} fits your budget and traveller needs.`, relax: relaxOptions(prefs, data, false) });
  }
  if (Object.values(usedFood).some((n) => n > 1)) notes.push('Some food spots repeat because few options match your diet and budget.');
  if (prefs.traveller === 'group') for (const m of prefs.members) if (!planCoverage(plan, prefs, data)[m.id]) notes.push(`${memberLabel(prefs, m)} has no stop matching their picks. The available places did not allow it.`);

  plan.ok = !constraints.length && plan.days.length === days;
  plan.constraints = constraints;
  plan.achievedDays = plan.days.length;
  return plan;
}

// ---- group coverage -----------------------------------------------------------------------
export function planCoverage(plan, prefs, data = DEFAULT_DATA) {
  const out = Object.fromEntries(prefs.members.map((m) => [m.id, 0]));
  for (const d of plan.days) for (const it of d.items) if (it.type === 'stop') {
    const p = data.places.find((x) => x.id === it.placeId);
    for (const m of matchedMembers(p, prefs.members)) out[m.id] += 1;
  }
  return out;
}

export function dayCoverage(day, prefs, data = DEFAULT_DATA) {
  const out = Object.fromEntries(prefs.members.map((m) => [m.id, 0]));
  for (const it of day.items) if (it.type === 'stop') {
    const p = data.places.find((x) => x.id === it.placeId);
    for (const m of matchedMembers(p, prefs.members)) out[m.id] += 1;
  }
  return out;
}

const dayStopIds = (day) => day.items.filter((i) => i.type === 'stop').map((i) => i.placeId);
const inPlan = (plan) => new Set(plan.days.flatMap(dayStopIds));

function rebuildDay(plan, dayIndex, stops, prefs, data, score, foods, usedFoodElsewhere) {
  const { stops: kept, tl } = fitDay(stops, prefs, data, score);
  if (kept.length < stops.length) return null; // never silently drop the stop we just chose
  const dayAreas = [...new Set(kept.map((s) => s.areaId))];
  const used = { ...usedFoodElsewhere };
  const items = tl.items.map((it) => {
    if (it.type === 'stop') return { ...it, why: whyFits(data.places.find((p) => p.id === it.placeId), prefs) };
    if (it.type === 'meal') {
      const f = pickFood(it.slot, it.nearArea, dayAreas, foods, used, data, prefs);
      if (!f && it.slot === 'snack') return null;
      if (f) used[f.id] = (used[f.id] || 0) + 1;
      return { ...it, foodId: f ? f.id : null };
    }
    return it;
  }).filter(Boolean);
  return { index: dayIndex, areaIds: dayAreas, mood: moodOf(kept), items };
}

const foodUseExcept = (plan, dayIndex) => {
  const used = {};
  plan.days.forEach((d, i) => { if (i !== dayIndex) d.items.forEach((it) => { if (it.foodId) used[it.foodId] = (used[it.foodId] || 0) + 1; }); });
  return used;
};

function areasAllowed(dayAreas, candidateArea, data) {
  if (dayAreas.includes(candidateArea)) return true;
  return dayAreas.length === 1 && nearOf(data, dayAreas[0], candidateArea) === 'near';
}

function ensureCoverage(plan, prefs, data, score) {
  const pool = eligiblePlaces(prefs, data);
  const foods = eligibleFood(prefs, data);
  for (let pass = 0; pass < prefs.members.length; pass++) {
    const cov = planCoverage(plan, prefs, data);
    const lacking = prefs.members.find((m) => !cov[m.id]);
    if (!lacking) return;
    const taken = inPlan(plan);
    const cands = pool.filter((p) => !taken.has(p.id) && lacking.interests.some((i) => p.tags.includes(i))).sort(byScoreThenId(score));
    let done = false;
    for (const cand of cands) {
      for (const day of plan.days) {
        if (!areasAllowed(day.areaIds, cand.areaId, data)) continue;
        const ids = dayStopIds(day);
        const stops = ids.map((id) => data.places.find((p) => p.id === id));
        const dayCov = dayCoverage(day, prefs, data);
        // drop the lowest-scoring stop that no other member relies on
        const droppable = [...stops].sort((a, b) => score(a) - score(b)).find((s) => {
          const only = prefs.members.filter((m) => dayCov[m.id] === 1 && matchedMembers(s, [m]).length);
          return !only.length && planCoverageWithout(plan, prefs, data, s.id, lacking.id);
        });
        const limit = stopLimit(prefs);
        const next = stops.length < limit ? [...stops, cand] : droppable ? [...stops.filter((s) => s !== droppable), cand] : null;
        if (!next) continue;
        const rebuilt = rebuildDay(plan, day.index, next, prefs, data, score, foods, foodUseExcept(plan, day.index));
        if (!rebuilt) continue;
        plan.days[day.index] = rebuilt;
        done = true;
        break;
      }
      if (done) break;
    }
    if (!done) return;
  }
}

// would every currently covered member stay covered if a stop were removed?
function planCoverageWithout(plan, prefs, data, placeId, ignoreId) {
  const out = Object.fromEntries(prefs.members.map((m) => [m.id, 0]));
  for (const d of plan.days) for (const it of d.items) if (it.type === 'stop' && it.placeId !== placeId) {
    const p = data.places.find((x) => x.id === it.placeId);
    for (const m of matchedMembers(p, prefs.members)) out[m.id] += 1;
  }
  const before = planCoverage(plan, prefs, data);
  return prefs.members.every((m) => m.id === ignoreId || !before[m.id] || out[m.id] > 0);
}

// ---- editing ------------------------------------------------------------------------------
export function swapStop(plan, dayIndex, placeId, prefs, data = DEFAULT_DATA, extra = {}) {
  const score = scorer(prefs, extra);
  const day = plan.days[dayIndex];
  const old = data.places.find((p) => p.id === placeId);
  const taken = inPlan(plan);
  const rejected = new Set([...(plan.rejected || []), placeId]);
  const pool = eligiblePlaces(prefs, data);
  const shared = (p) => p.tags.filter((t) => old.tags.includes(t)).length;
  const compatible = (p) => p.bestTime === old.bestTime || p.bestTime === 'any' || old.bestTime === 'any';
  const cands = pool.filter((p) => !taken.has(p.id) && !rejected.has(p.id) && areasAllowed(day.areaIds, p.areaId, data) && compatible(p))
    .sort((a, b) => Number(b.areaId === old.areaId) - Number(a.areaId === old.areaId)
      || shared(b) - shared(a) || score(b) - score(a) || (a.id < b.id ? -1 : 1));
  const foods = eligibleFood(prefs, data);
  const others = dayStopIds(day).filter((id) => id !== placeId).map((id) => data.places.find((p) => p.id === id));
  for (const cand of cands) {
    const rebuilt = rebuildDay(plan, dayIndex, [...others, cand], prefs, data, score, foods, foodUseExcept(plan, dayIndex));
    if (!rebuilt) continue;
    const next = { ...plan, days: plan.days.map((d, i) => (i === dayIndex ? rebuilt : d)), rejected: [...rejected] };
    return { ok: true, plan: next, replaced: old, replacement: cand };
  }
  return { ok: false, plan, message: `No other place fits this slot in ${data.areaById[old.areaId].name} with your current choices.` };
}

export function balanceDay(plan, dayIndex, prefs, data = DEFAULT_DATA, extra = {}) {
  const score = scorer(prefs, extra);
  const day = plan.days[dayIndex];
  const cov = dayCoverage(day, prefs, data);
  const lacking = prefs.members.filter((m) => !cov[m.id]).sort((a, b) => a.id < b.id ? -1 : 1)[0];
  if (!lacking) return { ok: false, plan, message: 'This day already has something for everyone.' };
  const taken = inPlan(plan);
  const pool = eligiblePlaces(prefs, data);
  const cands = pool.filter((p) => !taken.has(p.id) && areasAllowed(day.areaIds, p.areaId, data) && lacking.interests.some((i) => p.tags.includes(i))).sort(byScoreThenId(score));
  const foods = eligibleFood(prefs, data);
  const stops = dayStopIds(day).map((id) => data.places.find((p) => p.id === id));
  for (const cand of cands) {
    const droppable = [...stops].sort((a, b) => score(a) - score(b)).find((s) => {
      const alone = prefs.members.filter((m) => cov[m.id] === 1 && matchedMembers(s, [m]).length);
      return !alone.length;
    });
    const next = stops.length < stopLimit(prefs) ? [...stops, cand] : droppable ? [...stops.filter((s) => s !== droppable), cand] : null;
    if (!next) continue;
    const rebuilt = rebuildDay(plan, dayIndex, next, prefs, data, score, foods, foodUseExcept(plan, dayIndex));
    if (!rebuilt) continue;
    return { ok: true, plan: { ...plan, days: plan.days.map((d, i) => (i === dayIndex ? rebuilt : d)) }, added: cand, for: lacking };
  }
  return { ok: false, plan, message: `Nothing nearby matches ${memberLabel(prefs, lacking)}'s picks without breaking another choice.` };
}

// ---- budget tracker -----------------------------------------------------------------------
// Tier points, not rupees: each stop, meal and night counts its tier (1 to 3). The ceiling is the
// chosen tier times the same number of items. It is an indicative guide, never a price.
export function tally(plan, prefs, data = DEFAULT_DATA) {
  const budget = Number(prefs.details.budget);
  let own = 0;
  let items = 0;
  const perDay = plan.days.map((d) => {
    let pts = 0;
    for (const it of d.items) {
      if (it.type === 'stop') { pts += data.places.find((p) => p.id === it.placeId).costTier; items += 1; }
      if (it.type === 'meal' && it.foodId) { pts += data.food.find((f) => f.id === it.foodId).costTier; items += 1; }
    }
    own += pts;
    return pts;
  });
  const stay = plan.stay ? data.stays.find((s) => s.id === plan.stay) : null;
  const nights = Math.max(0, plan.days.length - 1);
  const stayPts = stay ? stay.costTier * nights : 0;
  items += stay ? nights : 0;
  const total = own + stayPts;
  const ceiling = Math.max(1, budget * items);
  const people = prefs.traveller === 'group' || prefs.traveller === 'family' ? prefs.size : 1;
  return { perDay, own, stayPts, total, ceiling, ratio: Math.min(1, total / ceiling), people, perPerson: Math.round((own + stayPts / people) * 10) / 10 };
}

export const transportHint = (data, fromArea, toArea) => ({
  same: 'Same area: an easy walk or a short auto ride.',
  near: 'Neighbouring area: a short auto or cab ride. Check current traffic.',
  far: 'Allow extra travel time. Check current traffic.',
}[nearOf(data, fromArea, toArea)]);
