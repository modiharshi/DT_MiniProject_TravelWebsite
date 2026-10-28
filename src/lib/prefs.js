// Traveller preferences: plain data plus pure functions, no React. Everything the planner asks
// for lives in one object so going Back never loses a choice, and so a change that invalidates a
// later choice can be described before it is applied.
import { CITIES } from '../data/cities.js';
import { INTERESTS, MAX_PICKS } from '../data/interests.js';

export const LIMITS = { groupMin: 2, groupMax: 5, familyMin: 2, familyMax: 6, nameMax: 14, daysMin: 1, daysMax: 5 };
export const BUDGETS = ['1', '2', '3'];
export const PACES = ['relaxed', 'balanced', 'packed'];
export const FOODS = ['veg', 'nonveg', 'jain', 'any'];
export const TRAVELLERS = ['solo', 'group', 'family'];

const blank = (n) => ({ id: `m${n}`, name: '', interests: [] });

export const initialPrefs = () => ({
  cityId: null,
  traveller: null,
  size: 1,
  seniors: false,
  members: [blank(1)],
  details: { days: 3, budget: null, pace: 'balanced', food: 'any', lowWalking: false },
  dropped: [], // labels of interests that did not carry over after a city change
});

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const cityHas = (cityId, interestId) => !!CITIES[cityId]?.interests.some((i) => i.id === interestId);

export const memberLabel = (prefs, member) => {
  if (prefs.traveller === 'solo') return 'You';
  if (prefs.traveller === 'family') return 'Your family';
  const i = prefs.members.findIndex((m) => m.id === member.id);
  return member.name.trim() || `Traveller ${i + 1}`;
};

// ---- impact: what a change would clear, said before it is applied ----------------------------
const hasContent = (m) => m.interests.length > 0 || m.name.trim() !== '';

export function impactOfTraveller(prefs, next) {
  if (!prefs.traveller || prefs.traveller === next) return [];
  const out = [];
  const lost = prefs.traveller === 'group' && next !== 'group' ? prefs.members.slice(1).filter(hasContent) : [];
  if (lost.length) out.push(`Names and picks for ${lost.map((m) => memberLabel(prefs, m)).join(', ')} will clear.`);
  if (prefs.seniors && next !== 'family') out.push('The note about travellers aged 65 or older will clear.');
  return out;
}

export function impactOfSize(prefs, n) {
  if (prefs.traveller !== 'group' || n >= prefs.size) return [];
  const lost = prefs.members.slice(n).filter(hasContent);
  return lost.length ? [`Names and picks for ${lost.map((m) => memberLabel(prefs, m)).join(', ')} will clear.`] : [];
}

// ---- transitions -----------------------------------------------------------------------------
export function setCity(prefs, cityId) {
  if (prefs.cityId === cityId) return prefs;
  const droppedIds = new Set();
  const members = prefs.members.map((m) => ({
    ...m,
    interests: m.interests.filter((id) => {
      const ok = cityHas(cityId, id);
      if (!ok) droppedIds.add(id);
      return ok;
    }),
  }));
  // Only mention a pick as lost if it was lost for everyone, i.e. truly gone from the plan.
  return {
    ...prefs,
    cityId,
    members,
    dropped: prefs.cityId ? [...droppedIds].map((id) => INTERESTS[id].label) : [],
  };
}

export function setTraveller(prefs, type) {
  if (!TRAVELLERS.includes(type) || prefs.traveller === type) return prefs;
  const first = prefs.members[0] || blank(1);
  const base = { ...prefs, traveller: type, dropped: [] };
  if (type === 'solo') return { ...base, size: 1, seniors: false, members: [first] };
  if (type === 'family') {
    const size = clamp(prefs.size > 1 ? prefs.size : 3, LIMITS.familyMin, LIMITS.familyMax);
    return { ...base, size, members: [{ ...first, name: '' }] };
  }
  const size = clamp(prefs.size > 1 ? prefs.size : 3, LIMITS.groupMin, LIMITS.groupMax);
  return { ...base, size, seniors: false, members: resize([first], size) };
}

function resize(members, n) {
  const out = members.slice(0, n);
  for (let i = out.length; i < n; i++) out.push(blank(i + 1));
  return out;
}

export function setSize(prefs, n) {
  if (prefs.traveller === 'group') {
    const size = clamp(n, LIMITS.groupMin, LIMITS.groupMax);
    return { ...prefs, size, members: resize(prefs.members, size) };
  }
  if (prefs.traveller === 'family') return { ...prefs, size: clamp(n, LIMITS.familyMin, LIMITS.familyMax) };
  return prefs;
}

export const setSeniors = (prefs, on) => (prefs.traveller === 'family' ? { ...prefs, seniors: !!on } : prefs);

export function toggleInterest(prefs, memberId, interestId) {
  if (!cityHas(prefs.cityId, interestId)) return prefs;
  let changed = false;
  const members = prefs.members.map((m) => {
    if (m.id !== memberId) return m;
    if (m.interests.includes(interestId)) { changed = true; return { ...m, interests: m.interests.filter((i) => i !== interestId) }; }
    if (m.interests.length >= MAX_PICKS) return m;
    changed = true;
    return { ...m, interests: [...m.interests, interestId] };
  });
  return changed ? { ...prefs, members, dropped: [] } : prefs;
}

export const renameMember = (prefs, memberId, name) => ({
  ...prefs,
  members: prefs.members.map((m) => (m.id === memberId ? { ...m, name: name.slice(0, LIMITS.nameMax) } : m)),
});

export function setDetail(prefs, key, value) {
  const d = prefs.details;
  let v = value;
  if (key === 'days') {
    const n = Math.round(Number(value));
    v = Number.isFinite(n) ? clamp(n, LIMITS.daysMin, LIMITS.daysMax) : d.days;
  }
  else if (key === 'budget' && !BUDGETS.includes(value)) return prefs;
  else if (key === 'pace' && !PACES.includes(value)) return prefs;
  else if (key === 'food' && !FOODS.includes(value)) return prefs;
  else if (key === 'lowWalking') v = !!value;
  else if (!(key in d)) return prefs;
  return { ...prefs, details: { ...d, [key]: v } };
}

// ---- validation ------------------------------------------------------------------------------
export function validate(prefs) {
  const who = [];
  if (!prefs.traveller) who.push('Choose who is travelling.');
  if (prefs.traveller === 'group') {
    const seen = new Map();
    prefs.members.forEach((m) => {
      const k = memberLabel(prefs, m).toLowerCase();
      seen.set(k, (seen.get(k) || 0) + 1);
    });
    const dup = [...seen].find(([, n]) => n > 1);
    if (dup) who.push(`Two travellers share the name "${dup[0]}". Rename one so picks stay separate.`);
  }

  const interests = prefs.members
    .filter((m) => m.interests.length === 0)
    .map((m) => ({ memberId: m.id, message: `${memberLabel(prefs, m)}: pick at least one interest.` }));

  const details = [];
  if (!prefs.details.budget) details.push({ field: 'budget', message: 'Pick a budget tier.' });
  const { days } = prefs.details;
  if (!(days >= LIMITS.daysMin && days <= LIMITS.daysMax)) details.push({ field: 'days', message: 'Choose 1 to 5 days.' });

  return { who, interests, details, valid: !who.length && !interests.length && !details.length };
}

export const STEPS = ['who', 'interests', 'details', 'review'];
export const STEP_LABEL = { who: 'Who', interests: 'Interests', details: 'Trip', review: 'Review', composing: 'Composing', plan: 'Itinerary' };
