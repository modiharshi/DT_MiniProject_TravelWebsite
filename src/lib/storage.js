// localStorage that never throws. If storage is blocked, values live in memory for the session and
// `storageAvailable()` lets the UI say that saving is unavailable. The planner works either way.
const memory = new Map();
let probed = null;

export function storageAvailable() {
  if (probed !== null) return probed;
  try {
    const k = '__xplore_probe__';
    window.localStorage.setItem(k, '1');
    window.localStorage.removeItem(k);
    probed = true;
  } catch {
    probed = false;
  }
  return probed;
}

export function readJSON(key, fallback) {
  try {
    if (storageAvailable()) {
      const raw = window.localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    }
  } catch { /* fall through to memory */ }
  return memory.has(key) ? memory.get(key) : fallback;
}

export function writeJSON(key, value) {
  memory.set(key, value);
  try {
    if (storageAvailable()) { window.localStorage.setItem(key, JSON.stringify(value)); return true; }
  } catch { probed = false; }
  return false;
}

export const KEYS = { trips: 'xplore.trips', lite: 'xplore.lite', votes: 'xplore.votes', notes: 'xplore.notes' };
