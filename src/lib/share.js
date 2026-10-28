// Shareable links: the traveller's choices live in the query string, nothing else. The plan is
// recomputed from them on load (the composer is deterministic), so a link never goes stale.
import { CITIES } from '../data/cities.js';
import { initialPrefs, setCity, setTraveller, setSize, setSeniors, toggleInterest, renameMember, setDetail, validate } from './prefs.js';

export function encodePrefs(prefs, extra = {}) {
  const q = new URLSearchParams();
  q.set('c', prefs.cityId);
  q.set('t', prefs.traveller);
  if (prefs.traveller !== 'solo') q.set('n', String(prefs.size));
  if (prefs.seniors) q.set('s', '1');
  q.set('d', String(prefs.details.days));
  q.set('b', prefs.details.budget);
  q.set('p', prefs.details.pace);
  q.set('f', prefs.details.food);
  if (prefs.details.lowWalking) q.set('w', '1');
  if (extra.meetPeople) q.set('mp', '1');
  q.set('m', prefs.members.map((m) => `${encodeURIComponent(m.name)}~${m.interests.join('.')}`).join('|'));
  return q.toString();
}

export function decodePrefs(search) {
  try {
    const q = new URLSearchParams(search);
    const city = q.get('c');
    if (!city || !CITIES[city]) return null;
    let p = setTraveller(setCity(initialPrefs(), city), q.get('t'));
    if (!p.traveller) return null;
    if (q.get('n')) p = setSize(p, Number(q.get('n')));
    if (q.get('s') === '1') p = setSeniors(p, true);
    const members = (q.get('m') || '').split('|');
    p.members.forEach((m, i) => {
      const [name = '', picks = ''] = (members[i] || '').split('~');
      p = renameMember(p, m.id, decodeURIComponent(name));
      picks.split('.').filter(Boolean).slice(0, 5).forEach((id) => { p = toggleInterest(p, m.id, id); });
    });
    p = setDetail(p, 'days', Number(q.get('d')) || 3);
    p = setDetail(p, 'budget', q.get('b'));
    p = setDetail(p, 'pace', q.get('p') || 'balanced');
    p = setDetail(p, 'food', q.get('f') || 'any');
    p = setDetail(p, 'lowWalking', q.get('w') === '1');
    return validate(p).valid ? { prefs: p, meetPeople: q.get('mp') === '1' } : null;
  } catch {
    return null;
  }
}
