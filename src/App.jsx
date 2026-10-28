import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ZoomStage } from './components/ZoomStage.jsx';
import { HomePanel, StatePanel, CityPanel, Trail } from './components/Panels.jsx';
import { WhoStep, InterestsStep, DetailsStep, ReviewStep } from './components/Flow.jsx';
import { ItineraryView } from './components/Itinerary.jsx';
import { Composing } from './components/Composing.jsx';
import { About, MyTrips } from './components/Overlays.jsx';
import { CompassRose } from './components/MapIcons.jsx';
import { CITIES } from './data/cities.js';
import { STATES } from './data/states.js';
import { useCamera } from './useCamera.js';
import { compose, DEFAULT_DATA } from './engine/composer.js';
import { encodePrefs, decodePrefs } from './lib/share.js';
import { KEYS, readJSON, writeJSON } from './lib/storage.js';
import * as P from './lib/prefs.js';

const INDIA_VIEW = { cx: 515, cy: 490, span: 1000 };
const cityView = (c) => ({ cx: c.x, cy: c.y - 9, span: 175 });
const START = { level: 'india', stateId: null, cityId: null };
const cityNav = (id) => ({ level: 'city', stateId: CITIES[id].stateId, cityId: id });

// Where the map sits relative to the panel: left rail on desktop, bottom sheet on phones.
const getPad = (w, h) =>
  w < 820 ? { l: 0, r: 0, t: 52, b: Math.round(h * 0.5) } : { l: w > 1180 ? 450 : 370, r: 0, t: 56, b: 0 };

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const STEP_ORDER = ['city', ...P.STEPS, 'plan'];
const PANEL_STEPS = ['city', ...P.STEPS];

function useReducedMotion() {
  const [rm, setRm] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setRm(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return rm;
}

export default function App() {
  const svgRef = useRef(null);
  const uiRef = useRef(null);
  const stageRef = useRef(null);
  const headingRef = useRef(null);
  const panelRef = useRef(null);
  const seq = useRef(0);
  const acted = useRef(false);

  // A shared link carries the traveller's choices; the plan is recomputed from them.
  const shared = useMemo(() => decodePrefs(window.location.search), []);
  const firstNav = shared ? cityNav(shared.prefs.cityId) : START;

  const [nav, setNav] = useState(firstNav);            // where the camera is headed
  const [panelNav, setPanelNav] = useState(firstNav);  // what the panel shows, set on arrival
  const [moving, setMoving] = useState(false);
  const [drawKey, setDrawKey] = useState(0);
  const [hovered, setHovered] = useState(null);
  const [fading, setFading] = useState(false);
  const [status, setStatus] = useState('');
  const [step, setStep] = useState(shared ? 'plan' : 'city');
  const [prefs, setPrefs] = useState(() => shared?.prefs || P.initialPrefs());
  const [extra, setExtra] = useState({ meetPeople: !!shared?.meetPeople });
  const [plan, setPlan] = useState(() => (shared ? compose(shared.prefs, DEFAULT_DATA, { meetPeople: !!shared.meetPeople }) : null));
  const [lite, setLite] = useState(() => readJSON(KEYS.lite, false) === true);
  const [modal, setModal] = useState(null);
  const [trips, setTrips] = useState(() => readJSON(KEYS.trips, []));
  const [savedAt, setSavedAt] = useState(0);
  const [shareMsg, setShareMsg] = useState('');
  const reduced = useReducedMotion();
  const calm = reduced || lite;

  const cam = useCamera({ svgRef, uiRef, stageRef, getPad, initial: shared ? cityView(CITIES[shared.prefs.cityId]) : INDIA_VIEW });

  // Every camera move goes through here: animated normally, a quick fade under reduced motion.
  const move = useCallback(async (view, ms) => {
    if (!calm) return cam.to(view, ms);
    setFading(true);
    await wait(110);
    await cam.to(view, 0, { instant: true });
    setFading(false);
    return true;
  }, [cam, calm]);

  // A move that survives being cancelled from outside the sequence: if nothing newer has started,
  // snap to the destination instead of leaving the camera (and the panel) stranded mid-way.
  const settle = useCallback(async (view, ms, stale) => {
    const ok = await move(view, ms);
    if (stale()) return false;
    if (!ok) await cam.to(view, 0, { instant: true });
    return true;
  }, [move, cam]);

  const arrive = useCallback((next, message) => {
    setNav(next);
    setPanelNav(next);
    setMoving(false);
    setStatus(message);
    setStep('city');
    if (next.cityId) {
      setPrefs((p) => P.setCity(p, next.cityId));
      setPlan((pl) => (pl && pl.cityId === next.cityId ? pl : null));
    }
  }, []);

  const api = useMemo(() => ({
    setTraveller: (t) => setPrefs((p) => P.setTraveller(p, t)),
    setSize: (n) => setPrefs((p) => P.setSize(p, n)),
    setSeniors: (on) => setPrefs((p) => P.setSeniors(p, on)),
    toggle: (mid, iid) => setPrefs((p) => P.toggleInterest(p, mid, iid)),
    rename: (mid, name) => setPrefs((p) => P.renameMember(p, mid, name)),
    detail: (k, v) => setPrefs((p) => P.setDetail(p, k, v)),
  }), []);

  const goStep = useCallback((to) => {
    acted.current = true;
    setStep(to);
    setStatus(
      to === 'city' ? 'Back to the city overview.'
        : to === 'plan' ? 'Your itinerary is ready.'
          : to === 'composing' ? 'Composing your trip.'
            : `Step ${P.STEPS.indexOf(to) + 1} of ${P.STEPS.length}: ${P.STEP_LABEL[to]}.`,
    );
  }, []);

  const selectCity = useCallback(async (cityId) => {
    const city = CITIES[cityId];
    const token = ++seq.current;
    const stale = () => token !== seq.current;
    acted.current = true;
    setHovered(null);
    setMoving(true);
    const sameState = nav.level !== 'india' && nav.stateId === city.stateId;
    const dest = { level: 'city', stateId: city.stateId, cityId };

    if (!sameState) {
      setNav({ level: 'state', stateId: city.stateId, cityId: null });
      if (!(await settle(STATES[city.stateId].view, 1050, stale))) return false;
      setDrawKey((k) => k + 1);
      if (!calm) { await wait(900); if (stale()) return false; }
    }
    setNav(dest);
    if (!(await settle(cityView(city), sameState ? 950 : 1050, stale))) return false;
    arrive(dest, `${city.name} selected, in ${STATES[city.stateId].name}.`);
    return true;
  }, [nav, settle, calm, arrive]);

  const goState = useCallback(async (stateId) => {
    const token = ++seq.current;
    acted.current = true;
    setMoving(true);
    const next = { level: 'state', stateId, cityId: null };
    setNav(next);
    if (!(await settle(STATES[stateId].view, 1000, () => token !== seq.current))) return;
    arrive(next, `${STATES[stateId].name}. Pick a city.`);
  }, [settle, arrive]);

  const goIndia = useCallback(async () => {
    const token = ++seq.current;
    acted.current = true;
    setHovered(null);
    setMoving(true);
    setNav(START);
    if (!(await settle(INDIA_VIEW, 1100, () => token !== seq.current))) return;
    arrive(START, 'Back on the map of India.');
  }, [settle, arrive]);

  const goBack = useCallback(() => {
    if (nav.level === 'india') return;
    if (nav.level === 'city' && step !== 'city') { goStep(STEP_ORDER[Math.max(0, STEP_ORDER.indexOf(step === 'composing' ? 'plan' : step) - 1)]); return; }
    if (nav.level === 'city' && STATES[nav.stateId].cityIds.length > 1) goState(nav.stateId);
    else goIndia();
  }, [nav, step, goStep, goState, goIndia]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape' && !e.defaultPrevented) goBack(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goBack]);

  // Move focus to the new heading once the panel has arrived, but only after the user has acted.
  useEffect(() => {
    panelRef.current?.scrollTo(0, 0);
    if (!moving && acted.current) headingRef.current?.focus({ preventScroll: true });
  }, [moving, panelNav, step]);

  // ---- composing, sharing, saving ----
  const recompute = useCallback((nextPrefs, nextExtra) => {
    setPlan(compose(nextPrefs, DEFAULT_DATA, nextExtra));
  }, []);

  const startCompose = useCallback(() => {
    recompute(prefs, extra);
    goStep('composing');
  }, [prefs, extra, recompute, goStep]);

  const onRelax = useCallback((patch) => {
    let next = prefs;
    Object.entries(patch.details || {}).forEach(([k, v]) => { next = P.setDetail(next, k, v); });
    setPrefs(next);
    recompute(next, extra);
    setStatus('Choices relaxed and plan updated.');
  }, [prefs, extra, recompute]);

  const onMeet = useCallback((on) => {
    const next = { ...extra, meetPeople: on };
    setExtra(next);
    recompute(prefs, next);
    setStatus(on ? 'Meet people is on. Social stays and stops rank higher.' : 'Meet people is off.');
  }, [extra, prefs, recompute]);

  const onShare = useCallback(async () => {
    const url = `${window.location.origin}${window.location.pathname}?${encodePrefs(prefs, extra)}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied. It rebuilds this plan from your choices.');
    } catch {
      setShareMsg(`Copy this link: ${url}`);
    }
  }, [prefs, extra]);

  const onSave = useCallback(() => {
    const entry = { id: String(Date.now()), savedAt: Date.now(), prefs, meetPeople: !!extra.meetPeople };
    const next = [entry, ...trips].slice(0, 20);
    setTrips(next);
    const stored = writeJSON(KEYS.trips, next);
    setSavedAt(Date.now());
    setStatus(stored ? 'Trip saved on this device.' : 'Saving is unavailable in this browser. The trip is kept until you close the page.');
  }, [prefs, extra, trips]);

  const onDeleteTrip = useCallback((id) => {
    const next = trips.filter((t) => t.id !== id);
    setTrips(next);
    writeJSON(KEYS.trips, next);
  }, [trips]);

  const onOpenTrip = useCallback(async (t) => {
    setModal(null);
    const ex = { meetPeople: !!t.meetPeople };
    setExtra(ex);
    setPrefs(t.prefs);
    if (!(await selectCity(t.prefs.cityId))) return;
    setPrefs(t.prefs);
    setPlan(compose(t.prefs, DEFAULT_DATA, ex));
    goStep('plan');
  }, [selectCity, goStep]);

  const toggleLite = () => {
    const next = !lite;
    setLite(next);
    writeJSON(KEYS.lite, next);
    setStatus(next ? 'Lightweight mode on. Fewer animations.' : 'Lightweight mode off.');
  };

  const theme = nav.level === 'city' ? nav.cityId : 'india';
  const inPanelStep = PANEL_STEPS.includes(step);
  const arrived = !moving && nav.level === 'city' && inPanelStep;
  const inFlow = panelNav.level === 'city' && step !== 'city' && inPanelStep;
  const flowCity = panelNav.level === 'city' ? CITIES[panelNav.cityId] : null;
  const flowProps = { prefs, city: flowCity, api, ref: headingRef };
  const backLabel = panelNav.level === 'city' && STATES[panelNav.stateId].cityIds.length > 1
    ? `Back to ${STATES[panelNav.stateId].name}` : 'Back to India';

  return (
    <div className="app" data-theme={theme} data-level={nav.level} data-lite={lite ? 'true' : 'false'} data-step={step}>
      <header className="topbar">
        <Trail nav={nav} step={panelNav.level === 'city' ? step : 'city'} onIndia={goIndia} onState={goState} onCity={() => goStep('city')} />
        <div className="tools">
          <button type="button" className="tool" onClick={() => setModal('trips')}>My trips{trips.length ? <span className="tool-count">{trips.length}</span> : null}</button>
          <button type="button" className="tool" onClick={() => setModal('about')}>About</button>
          <button type="button" className="tool" aria-pressed={lite} onClick={toggleLite} title="Fewer animations, no parallax">Lite</button>
        </div>
      </header>

      <main className="stage" ref={stageRef}>
        <ZoomStage svgRef={svgRef} uiRef={uiRef} nav={nav} drawKey={drawKey} arrived={arrived}
          hovered={hovered} onSelect={selectCity} onHover={setHovered} fading={fading} />
        <div className="grain" aria-hidden="true" />
        <div className="wash" aria-hidden="true" />
        <div className="compass-fixed" aria-hidden="true"><CompassRose size={110} /></div>
        {arrived && (
          <p className="cartouche" key={nav.cityId}>
            <span>{CITIES[nav.cityId].cartouche}</span>
          </p>
        )}
        <p className="map-caption">Illustrated map, not to scale.</p>

        <section className="panel" ref={panelRef} data-away={moving || !inPanelStep ? 'true' : 'false'} data-flow={inFlow ? 'true' : 'false'}
          inert={moving || !inPanelStep ? true : undefined} aria-label="Trip steps">
          <div className="panel-inner" key={`${panelNav.level}-${panelNav.cityId || panelNav.stateId || 'x'}-${step}`}>
            {panelNav.level === 'india' && <HomePanel ref={headingRef} onSelect={selectCity} onHover={setHovered} />}
            {panelNav.level === 'state' && (
              <StatePanel ref={headingRef} stateId={panelNav.stateId} onSelect={selectCity} onHover={setHovered} onBack={goIndia} />
            )}
            {panelNav.level === 'city' && step === 'city' && (
              <CityPanel ref={headingRef} cityId={panelNav.cityId} onSelect={selectCity} onHover={setHovered}
                onBack={goBack} backLabel={backLabel} onStart={() => goStep('who')} resume={!!prefs.traveller} />
            )}
            {inFlow && step === 'who' && <WhoStep {...flowProps} onBack={goBack} onNext={() => goStep('interests')} />}
            {inFlow && step === 'interests' && <InterestsStep {...flowProps} onBack={goBack} onNext={() => goStep('details')} />}
            {inFlow && step === 'details' && <DetailsStep {...flowProps} onBack={goBack} onNext={() => goStep('review')} />}
            {inFlow && step === 'review' && <ReviewStep {...flowProps} onBack={goBack} onGo={goStep} onCompose={startCompose} />}
          </div>
        </section>

        {step === 'composing' && flowCity && <Composing city={flowCity} calm={calm} onDone={() => goStep('plan')} />}
        {step === 'plan' && plan && flowCity && (
          <ItineraryView ref={headingRef} prefs={prefs} plan={plan} setPlan={setPlan} extra={extra} onMeet={onMeet}
            city={flowCity} calm={calm} onEdit={() => goStep('review')} onRelax={onRelax} onSave={onSave} onShare={onShare}
            savedAt={savedAt} shareMsg={shareMsg} announce={setStatus} />
        )}
      </main>

      {modal === 'about' && <About onClose={() => setModal(null)} />}
      {modal === 'trips' && <MyTrips trips={trips} onOpen={onOpenTrip} onDelete={onDeleteTrip} onClose={() => setModal(null)} />}

      <div className="sr-only" role="status" aria-live="polite">{status}</div>
    </div>
  );
}
