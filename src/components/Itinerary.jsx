import { forwardRef, useEffect, useId, useMemo, useRef, useState } from 'react';
import { AREA_BY_ID } from '../data/areas.js';
import { PLACE_BY_ID } from '../data/places.js';
import { STAY_BY_ID } from '../data/stays.js';
import { FOOD_BY_ID } from '../data/food.js';
import { CITIES } from '../data/cities.js';
import { INTERESTS } from '../data/interests.js';
import { DEFAULT_DATA, balanceDay, dayCoverage, formatTime, swapStop, tally, transportHint } from '../engine/composer.js';
import { memberLabel } from '../lib/prefs.js';
import { KEYS, readJSON, storageAvailable, writeJSON } from '../lib/storage.js';
import { savePostcard } from '../lib/postcard.js';
import { Dialog } from './Dialog.jsx';
import { PlaceArt } from './PlaceArt.jsx';
import { Tick } from './FlowIcons.jsx';

const rupees = (n) => '₹'.repeat(n);
const WALK = { 1: 'Easy walking', 2: 'Some walking', 3: 'Lots of walking or steps' };
const BEST = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening', any: 'Any time' };
const TYPE_LABEL = { hostel: 'Hostel', homestay: 'Homestay', hotel: 'Hotel', heritage: 'Heritage stay', cottage: 'Cottage' };
const MEAL_LABEL = { lunch: 'Lunch', dinner: 'Dinner', snack: 'Chai stop', breakfast: 'Breakfast' };

const Icon = {
  swap: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 8h13l-3-3m3 3-3 3M20 16H7l3-3m-3 3 3 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  info: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2.2" /><path d="M12 11v6M12 7.5v.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>,
  up: <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M7 11v9H4v-9zM7 11l4-8c2 0 3 1.5 2.5 3.5L13 9h6a1.5 1.5 0 0 1 1.5 2l-2 7a2 2 0 0 1-2 1.5H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  down: <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" style={{ transform: 'scaleY(-1)' }}><path d="M7 11v9H4v-9zM7 11l4-8c2 0 3 1.5 2.5 3.5L13 9h6a1.5 1.5 0 0 1 1.5 2l-2 7a2 2 0 0 1-2 1.5H7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></svg>,
  balance: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 4v16M5 20h14M5 7h14M5 7l-3 7a3 3 0 0 0 6 0zM19 7l-3 7a3 3 0 0 0 6 0z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
};

// ---- the mini parchment map for a day ---------------------------------------------------------
function RouteMap({ day, highlight, drawn }) {
  const uid = useId().replace(/:/g, '');
  const stops = day.items.filter((i) => i.type === 'stop').map((i, n) => ({ ...PLACE_BY_ID[i.placeId], n: n + 1 }));
  const path = stops.map((s, i) => `${i ? 'L' : 'M'}${s.coords.x} ${s.coords.y}`).join(' ');
  return (
    <figure className="routemap">
      <svg viewBox="0 0 100 100" role="img" aria-label={`Sketch map of day ${day.index + 1}: ${stops.map((s) => s.name).join(', then ')}`}>
        <defs>
          <mask id={`m-${uid}`}>
            <path d={path} fill="none" stroke="#fff" strokeWidth="7" pathLength="1" strokeDasharray="1" strokeDashoffset={drawn ? 0 : 1} className="route-mask" />
          </mask>
        </defs>
        <rect width="100" height="100" fill="var(--parch)" />
        <path d="M6 20q30-12 52-4t40 0M4 88q24 6 48 0t44 4" fill="none" stroke="var(--cream)" strokeWidth="1.4" strokeDasharray="1 3" />
        {day.areaIds.map((id) => {
          const a = AREA_BY_ID[id];
          return (
            <g key={id}>
              <ellipse cx={a.coords.x} cy={a.coords.y} rx="25" ry="19" fill="var(--accent-2)" opacity=".28" stroke="var(--ink)" strokeWidth=".5" strokeDasharray="1.5 1.5" />
              <text x={a.coords.x} y={a.coords.y + 28} className="route-area">{a.name.length > 20 ? a.name.slice(0, 18) + '…' : a.name}</text>
            </g>
          );
        })}
        <path d={path} fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="0.1 3.2" mask={`url(#m-${uid})`} />
        {stops.map((s) => (
          <g key={s.id} transform={`translate(${s.coords.x} ${s.coords.y})`} className="route-pin" data-on={highlight === s.id ? 'true' : 'false'}>
            <circle r={highlight === s.id ? 6.6 : 5} fill={highlight === s.id ? 'var(--yellow)' : 'var(--ink)'} stroke="var(--ink)" strokeWidth="1" />
            <text y="2" className="route-n" fill={highlight === s.id ? 'var(--ink)' : 'var(--parch)'}>{s.n}</text>
          </g>
        ))}
      </svg>
      <figcaption>Sketch of the day. Not to scale.</figcaption>
    </figure>
  );
}

// ---- budget tracker ---------------------------------------------------------------------------
function BudgetTracker({ plan, prefs }) {
  const t = useMemo(() => tally(plan, prefs), [plan, prefs]);
  const pct = Math.round(t.ratio * 100);
  const group = t.people > 1;
  return (
    <section className="budget" aria-labelledby="budget-h">
      <div className="budget-head">
        <h2 id="budget-h">Budget guide</h2>
        <span className="tag-est">Estimate</span>
      </div>
      <div className="budget-bar" role="img" aria-label={`About ${pct} per cent of your ${rupees(Number(prefs.details.budget))} comfort ceiling`}>
        <span className="budget-fill" style={{ width: `${Math.max(4, pct)}%` }} />
      </div>
      <p className="budget-line"><strong>{pct}%</strong> of your {rupees(Number(prefs.details.budget))} ceiling{group ? ` · rough share per person: ${t.perPerson} tier points` : ''}</p>
      <ul className="budget-days" aria-label="Spend by day">
        {t.perDay.map((v, i) => (
          <li key={i}><span>Day {i + 1}</span><i style={{ '--w': `${Math.min(100, (v / Math.max(...t.perDay, 1)) * 100)}%` }} /></li>
        ))}
      </ul>
      <p className="hint">Tier points, not rupees: each stop, meal and night counts its tier (1 to 3). {group ? 'Per-person shares split the stay and count stops and meals once each. ' : ''}Real costs vary, so check before you book.</p>
    </section>
  );
}

// ---- votes (group mode), kept in this browser only ----------------------------------------------
function Votes({ prefs, placeId, votes, setVotes }) {
  const key = `${prefs.cityId}|${placeId}`;
  const mine = votes[key] || {};
  const cycle = (mid) => {
    const cur = mine[mid] || 0;
    const next = cur === 0 ? 1 : cur === 1 ? -1 : 0;
    const merged = { ...votes, [key]: { ...mine, [mid]: next } };
    if (!next) delete merged[key][mid];
    setVotes(merged);
  };
  const yes = Object.values(mine).filter((v) => v === 1).length;
  const no = Object.values(mine).filter((v) => v === -1).length;
  return (
    <div className="votes" role="group" aria-label="Group votes for this stop">
      {prefs.members.map((m) => {
        const v = mine[m.id] || 0;
        const name = memberLabel(prefs, m);
        return (
          <button key={m.id} type="button" className="vote" data-v={v} onClick={() => cycle(m.id)}
            aria-label={`${name}: ${v === 1 ? 'yes' : v === -1 ? 'no' : 'no vote yet'}. Press to change.`}>
            <span className="vote-ico">{v === -1 ? Icon.down : Icon.up}</span>
            <span className="vote-name">{name}</span>
          </button>
        );
      })}
      <span className="vote-tally" aria-live="polite">{yes} yes · {no} no</span>
    </div>
  );
}

// ---- one stop ----------------------------------------------------------------------------------
function StopCard({ item, n, next, day, prefs, calm, onOpen, onSwap, votes, setVotes, onHover }) {
  const place = PLACE_BY_ID[item.placeId];
  const ref = useRef(null);
  const solo = prefs.traveller === 'solo';
  const move = (e) => {
    if (calm || e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    ref.current.style.setProperty('--tx', `${((e.clientX - r.left) / r.width - 0.5) * 10}px`);
    ref.current.style.setProperty('--ty', `${((e.clientY - r.top) / r.height - 0.5) * 8}px`);
    ref.current.style.setProperty('--rz', `${((e.clientX - r.left) / r.width - 0.5) * 3}deg`);
  };
  const leave = () => ['--tx', '--ty', '--rz'].forEach((k) => ref.current?.style.removeProperty(k));
  return (
    <article ref={ref} className="stop" data-slot={place.bestTime} onPointerMove={move} onPointerLeave={() => { leave(); onHover(null); }} onPointerEnter={() => onHover(place.id)}>
      <div className="stop-time"><span className="stop-n" aria-hidden="true">{n}</span><time>{formatTime(item.start)}</time><span className="stop-to">to {formatTime(item.end)}</span></div>
      <div className="stop-body">
        <div className="polaroid" aria-hidden="true"><span className="tape" /><PlaceArt place={place} /></div>
        <h4>{place.name}</h4>
        <ul className="meta" aria-label="Details">
          <li>{AREA_BY_ID[place.areaId].name}</li>
          <li><span className="sr-only">Cost tier </span>{rupees(place.costTier)}</li>
          <li>{place.durationMins} min</li>
          <li>{WALK[place.walkingLevel]}</li>
        </ul>
        <ul className="why" aria-label="Why it fits you">{item.why.map((w) => <li key={w}>{w}</li>)}</ul>
        <p className="note-q"><span>{place.sample ? 'Sample note' : 'Sample traveller note'}</span> {place.sampleNotes[0].text}</p>
        {solo && place.bestTime === 'evening' && <p className="hint-solo">Evening on your own: {place.safetyNote || 'Stick to well-lit, busy stretches after dark.'}</p>}
        {place.safetyNote && !(solo && place.bestTime === 'evening') && <p className="hint-safety">{place.safetyNote}</p>}
        {prefs.traveller === 'group' && <Votes prefs={prefs} placeId={place.id} votes={votes} setVotes={setVotes} />}
        <div className="stop-actions">
          <button type="button" className="btn btn-small" onClick={() => onOpen(place.id)}>{Icon.info}Details<span className="sr-only"> for {place.name}</span></button>
          <button type="button" className="btn btn-small" onClick={() => onSwap(day.index, place.id)}>{Icon.swap}Not this one<span className="sr-only">: swap {place.name}</span></button>
        </div>
        {next && <p className="hop">{transportHint(DEFAULT_DATA, place.areaId, next.areaId)}</p>}
      </div>
    </article>
  );
}

function MealTicket({ item }) {
  const f = item.foodId ? FOOD_BY_ID[item.foodId] : null;
  if (!f) return null;
  return (
    <div className="meal" data-slot={item.slot}>
      <div className="meal-time"><time>{formatTime(item.start)}</time></div>
      <div className="meal-body">
        <p className="meal-kind">{MEAL_LABEL[item.slot]} {item.slot === 'snack' ? 'ticket' : 'stop'}</p>
        <p className="meal-name">{f.name}</p>
        <p className="meal-meta">{AREA_BY_ID[f.areaId].name} · {rupees(f.costTier)} · Example place, not a recommendation of a real business</p>
      </div>
    </div>
  );
}

function StayPostcard({ stay, night }) {
  return (
    <aside className="stay-card" aria-label={`Tonight you sleep here: ${stay.name}`}>
      <div className="stay-stamp" aria-hidden="true">Night {night}</div>
      <p className="stay-kicker">Tonight you sleep here</p>
      <p className="stay-name">{stay.name}</p>
      <p className="stay-meta">{TYPE_LABEL[stay.type]} · {AREA_BY_ID[stay.areaId].name} · {rupees(stay.costTier)} · Example stay</p>
      <p className="stay-desc">{stay.description}</p>
    </aside>
  );
}

// ---- a day, as a ticket -------------------------------------------------------------------------
function DayTicket({ day, plan, prefs, stay, calm, onOpen, onSwap, onBalance, votes, setVotes, isLast }) {
  const ref = useRef(null);
  const [drawn, setDrawn] = useState(calm);
  const [hover, setHover] = useState(null);
  useEffect(() => {
    if (calm || !ref.current || !('IntersectionObserver' in window)) { setDrawn(true); return undefined; }
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setDrawn(true); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [calm]);
  const stops = day.items.filter((i) => i.type === 'stop');
  const cov = prefs.members.length > 1 ? dayCoverage(day, prefs) : null;
  const left = cov ? prefs.members.filter((m) => !cov[m.id]) : [];
  const mood = day.mood;
  let n = 0;
  return (
    <section ref={ref} className="ticket" aria-labelledby={`day-${day.index}`} data-day={day.index}>
      <header className="ticket-stub">
        <span className="stub-label">Day</span>
        <span className="stub-num" id={`day-${day.index}`}>{day.index + 1}</span>
        <span className="stub-mood">{mood}</span>
        <span className="stub-areas">{day.areaIds.map((a) => AREA_BY_ID[a].name).join(' + ')}</span>
      </header>
      <div className="ticket-main">
        <RouteMap day={day} highlight={hover} drawn={drawn} />
        {left.length > 0 && (
          <div className="compromise" role="status">
            <p><strong>Compromise day.</strong> Nothing here matches {left.map((m) => memberLabel(prefs, m)).join(', ')}.</p>
            <button type="button" className="btn btn-small" onClick={() => onBalance(day.index)}>{Icon.balance}Balance this day</button>
          </div>
        )}
        <div className="timeline">
          {day.items.map((it, i) => {
            if (it.type === 'stop') {
              n += 1;
              const nextStop = day.items.slice(i + 1).find((x) => x.type === 'stop');
              return <StopCard key={it.placeId} item={it} n={n} next={nextStop ? PLACE_BY_ID[nextStop.placeId] : null} day={day} prefs={prefs} calm={calm}
                onOpen={onOpen} onSwap={onSwap} votes={votes} setVotes={setVotes} onHover={setHover} />;
            }
            if (it.type === 'meal') return <MealTicket key={`${it.slot}-${i}`} item={it} />;
            return <div key={`rest-${i}`} className="rest"><time>{formatTime(it.start)}</time><span>Rest break. Sit down, drink water, no rush.</span></div>;
          })}
        </div>
        {stay && !isLast && <StayPostcard stay={stay} night={day.index + 1} />}
        {isLast && plan.days.length > 1 && <p className="checkout">Last day. Check out in the morning and leave bags with the stay if your plans run late.</p>}
        <p className="sr-only">{stops.length} stops on day {day.index + 1}.</p>
      </div>
    </section>
  );
}

// ---- place detail slide-over --------------------------------------------------------------------
function PlaceDetail({ placeId, day, prefs, plan, onClose }) {
  const place = PLACE_BY_ID[placeId];
  const item = day.items.find((i) => i.placeId === placeId);
  const [note, setNote] = useState(() => readJSON(KEYS.notes, {})[placeId] || '');
  const [saved, setSaved] = useState('');
  const ok = storageAvailable();
  const save = () => {
    const all = { ...readJSON(KEYS.notes, {}), [placeId]: note };
    const stored = writeJSON(KEYS.notes, all);
    setSaved(stored ? 'Saved on this device.' : 'Saving is unavailable in this browser. Your note stays until you close the page.');
  };
  const labels = prefs.members.flatMap((m) => m.interests).filter((i, k, a) => a.indexOf(i) === k && place.tags.includes(i)).map((i) => CITIES[prefs.cityId].interests.find((x) => x.id === i)?.label || INTERESTS[i].label);
  return (
    <Dialog title={place.name} titleId="pd-title" onClose={onClose} side className="place-dialog">
      <div className="pd-art"><PlaceArt place={place} /></div>
      <div className="pd-body">
        <p className="stamp">{AREA_BY_ID[place.areaId].name}</p>
        <h2 id="pd-title" className="pd-title">{place.name}</h2>
        {place.sample && <p className="tag-sample">Example place. This is a generic type of stop, not a specific business.</p>}
        <ul className="badges" aria-label="Good for">
          <li data-on={place.soloFriendly}>Solo-friendly</li>
          <li data-on={place.groupFriendly}>Group-friendly</li>
          <li data-on={place.seniorFriendly}>Senior-friendly</li>
        </ul>
        <dl className="facts">
          <div><dt>Category</dt><dd>{place.category.replace('-', ' ')}</dd></div>
          <div><dt>Cost tier</dt><dd>{rupees(place.costTier)} <small>indicative</small></dd></div>
          <div><dt>Best time</dt><dd>{BEST[place.bestTime]}</dd></div>
          <div><dt>Time needed</dt><dd>{place.durationMins} min</dd></div>
          <div><dt>Walking</dt><dd>{WALK[place.walkingLevel]}</dd></div>
          {item && <div><dt>In your plan</dt><dd>{formatTime(item.start)} on day {day.index + 1}</dd></div>}
        </dl>
        <p className="pd-desc">{place.description}</p>
        <h3>Why it fits you</h3>
        <ul className="why">{(item?.why || []).map((w) => <li key={w}>{w}</li>)}</ul>
        {labels.length > 0 && <p className="hint">Matched picks: {labels.join(', ')}.</p>}
        {place.safetyNote && <p className="hint-safety"><strong>Safety note.</strong> {place.safetyNote}</p>}
        <h3>Sample traveller notes</h3>
        <ul className="notes">{place.sampleNotes.map((n, i) => <li key={i}><q>{n.text}</q><span>{n.author}. Sample text, not a real review.</span></li>)}</ul>
        <label className="field" htmlFor="your-note"><span>Your note</span></label>
        <textarea id="your-note" rows="3" value={note} maxLength={400} onChange={(e) => { setNote(e.target.value); setSaved(''); }} placeholder="Something to remember about this stop" />
        <div className="note-row">
          <button type="button" className="btn btn-small" onClick={save}>Save note</button>
          <span className="hint" role="status">{saved || (ok ? '' : 'Saving is unavailable in this browser.')}</span>
        </div>
        <h3>Where it sits in the day</h3>
        <RouteMap day={day} highlight={placeId} drawn />
      </div>
    </Dialog>
  );
}

// ---- postcard summary ---------------------------------------------------------------------------
function Postcard({ plan, prefs, city, onSave, savedAt }) {
  const stops = plan.days.flatMap((d) => d.items.filter((i) => i.type === 'stop').map((i) => PLACE_BY_ID[i.placeId]));
  const matched = (p) => prefs.members.reduce((s, m) => s + m.interests.filter((i) => p.tags.includes(i)).length, 0);
  const top = [...stops].sort((a, b) => matched(b) - matched(a)).slice(0, 3);
  const moods = plan.days.map((d) => d.mood);
  const vibe = [...moods].sort((a, b) => moods.filter((m) => m === b).length - moods.filter((m) => m === a).length)[0] || 'City days';
  const who = { solo: 'Solo trip', group: `Friends, ${prefs.size} people`, family: `Family of ${prefs.size}` }[prefs.traveller];
  const line = `${plan.days.length} ${plan.days.length === 1 ? 'day' : 'days'} · ${who}`;
  const [busy, setBusy] = useState(false);
  const download = async () => {
    setBusy(true);
    const accent = getComputedStyle(document.querySelector('.app')).getPropertyValue('--accent').trim() || '#a33c60';
    await savePostcard({ title: city.name, vibe, line, stops: top.map((s) => s.name), accent, filename: `xplore-${city.id}-trip.png` });
    setBusy(false);
  };
  return (
    <section className="postcard" aria-labelledby="pc-h">
      <h2 id="pc-h" className="sr-only">Trip postcard</h2>
      <div className="pc-card">
        <div className="pc-stamp" aria-hidden="true"><span>Xplore</span><small>Sample plan</small></div>
        <p className="pc-brand">Xplore</p>
        <p className="pc-city">{city.name}</p>
        <p className="pc-vibe">{vibe}</p>
        <p className="pc-line">{line}</p>
        <ol className="pc-stops">{top.map((s) => <li key={s.id}>{s.name}</li>)}</ol>
        {savedAt && <span className="pc-saved" aria-hidden="true"><Tick /> Saved</span>}
      </div>
      <div className="pc-actions">
        <button type="button" className="btn btn-primary" onClick={onSave}>Save this trip</button>
        <button type="button" className="btn" onClick={download} disabled={busy}>{busy ? 'Making image' : 'Save as image'}</button>
      </div>
    </section>
  );
}

// ---- the whole itinerary -------------------------------------------------------------------------
export const ItineraryView = forwardRef(function ItineraryView({
  prefs, plan, setPlan, extra, onMeet, city, calm, onEdit, onRelax, onSave, onShare, savedAt, shareMsg, announce,
}, headingRef) {
  const [openId, setOpenId] = useState(null);
  const [votes, setVotesState] = useState(() => readJSON(KEYS.votes, {}));
  const scroller = useRef(null);
  const setVotes = (v) => { setVotesState(v); writeJSON(KEYS.votes, v); };
  const stay = plan.stay ? STAY_BY_ID[plan.stay] : null;
  const openDay = plan.days.find((d) => d.items.some((i) => i.placeId === openId));

  // time-of-day mood: the page tint drifts from cool morning to golden hour to dusk as you read
  useEffect(() => {
    const el = scroller.current;
    if (!el || calm) return undefined;
    let raf = 0;
    const stops = [[227, 238, 240], [247, 232, 192], [236, 208, 217]]; // cool morning, golden hour, dusk
    const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * t));
    const tint = () => {
      raf = 0;
      const p = el.scrollHeight - el.clientHeight > 0 ? el.scrollTop / (el.scrollHeight - el.clientHeight) : 0;
      const c = p < 0.5 ? mix(stops[0], stops[1], p * 2) : mix(stops[1], stops[2], (p - 0.5) * 2);
      el.style.setProperty('--mood-bg', `rgb(${c.join(' ')})`);
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(tint); };
    el.addEventListener('scroll', on, { passive: true });
    tint();
    return () => { el.removeEventListener('scroll', on); if (raf) cancelAnimationFrame(raf); };
  }, [calm, plan]);

  const swap = (dayIndex, placeId) => {
    const res = swapStop(plan, dayIndex, placeId, prefs, DEFAULT_DATA, extra);
    if (res.ok) { setPlan(res.plan); announce(`Swapped ${res.replaced.name} for ${res.replacement.name}.`); }
    else announce(res.message);
  };
  const balance = (dayIndex) => {
    const res = balanceDay(plan, dayIndex, prefs, DEFAULT_DATA, extra);
    if (res.ok) { setPlan(res.plan); announce(`Added ${res.added.name} for ${memberLabel(prefs, res.for)}.`); }
    else announce(res.message);
  };

  const jump = (i) => {
    const el = scroller.current?.querySelector(`[data-day="${i}"]`);
    el?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  };

  const problems = plan.constraints || [];
  const who = { solo: 'Solo', group: `Friends, ${prefs.size}`, family: `Family, ${prefs.size}${prefs.seniors ? ' (65+)' : ''}` }[prefs.traveller];

  return (
    <div className="itin" ref={scroller} data-calm={calm ? 'true' : 'false'}>
      <div className="itin-inner">
        <header className="itin-head">
          <p className="stamp">Trip Composer</p>
          <h1 ref={headingRef} tabIndex={-1} className="itin-title"><span className="script">Your {city.name} trip</span></h1>
          <p className="itin-sub">{plan.days.length} {plan.days.length === 1 ? 'day' : 'days'} · {who} · {rupees(Number(prefs.details.budget))} · {prefs.details.pace[0].toUpperCase() + prefs.details.pace.slice(1)} pace</p>
          <p className="hint">Times are suggestions. Places and stays marked &ldquo;example&rdquo; are generic types, not specific businesses.</p>
          <div className="itin-actions">
            <button type="button" className="btn btn-small" onClick={onEdit}>Change my choices</button>
            <button type="button" className="btn btn-small" onClick={onShare}>Copy link</button>
            <button type="button" className="btn btn-small" onClick={() => window.print()}>Print</button>
            {prefs.traveller === 'solo' && (
              <label className="switch-row">
                <input type="checkbox" checked={!!extra.meetPeople} onChange={(e) => onMeet(e.target.checked)} />
                <span className="check-box" aria-hidden="true"><Tick /></span>Meet people
              </label>
            )}
          </div>
          <p className="hint" role="status">{shareMsg}</p>
        </header>

        {problems.length > 0 && (
          <section className="problem" role="alert" aria-labelledby="problem-h">
            <h2 id="problem-h">{plan.days.length ? 'We could only plan part of this' : 'We could not plan this yet'}</h2>
            {problems.map((c) => (
              <div key={c.code + c.message}>
                <p>{c.message}</p>
                {c.relax.length > 0 && (
                  <div className="problem-actions">{c.relax.map((r) => <button key={r.label} type="button" className="btn btn-small btn-primary" onClick={() => onRelax(r.patch)}>{r.label}</button>)}</div>
                )}
              </div>
            ))}
            <button type="button" className="btn btn-small" onClick={onEdit}>Change my choices instead</button>
          </section>
        )}
        {plan.notes.length > 0 && <ul className="plan-notes" aria-label="Notes about this plan">{plan.notes.map((n) => <li key={n}>{n}</li>)}</ul>}

        {plan.days.length > 0 && (
          <>
            <BudgetTracker plan={plan} prefs={prefs} />
            <nav className="day-tabs" aria-label="Jump to a day">
              {plan.days.map((d) => <button key={d.index} type="button" onClick={() => jump(d.index)}>Day {d.index + 1}</button>)}
            </nav>
            <div className="days">
              {plan.days.map((d) => (
                <DayTicket key={d.index} day={d} plan={plan} prefs={prefs} stay={stay} calm={calm} isLast={d.index === plan.days.length - 1}
                  onOpen={setOpenId} onSwap={swap} onBalance={balance} votes={votes} setVotes={setVotes} />
              ))}
            </div>
            {!storageAvailable() && <p className="inline-note">Saving is unavailable in this browser, so trips, notes and votes will not be kept after you close the page. Copy the link to come back to this plan.</p>}
            <Postcard plan={plan} prefs={prefs} city={city} onSave={onSave} savedAt={savedAt} />
          </>
        )}
        <p className="itin-foot">Illustrated plan, not a booking. Check current conditions and access before you travel.</p>
      </div>
      {openId && openDay && <PlaceDetail placeId={openId} day={openDay} prefs={prefs} plan={plan} onClose={() => setOpenId(null)} />}
    </div>
  );
});
