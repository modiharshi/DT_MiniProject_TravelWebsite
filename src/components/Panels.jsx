import { forwardRef } from 'react';
import { CITY_LIST, CITIES } from '../data/cities.js';
import { STATES } from '../data/states.js';
import { STEP_LABEL } from '../lib/prefs.js';
import { CityBanner, CityMark, HeroStrip } from './CityBanner.jsx';

const Arrow = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false">
    <path d="M20 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export function CityChip({ city, onSelect, onHover, current }) {
  return (
    <li>
      <button type="button" className="chip" aria-current={current ? 'true' : undefined}
        onClick={() => onSelect(city.id)}
        onPointerEnter={() => onHover(city.id)} onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(city.id)} onBlur={() => onHover(null)}>
        <CityMark cityId={city.id} />
        <span className="chip-name">{city.name}</span>
        <span className="chip-state">{STATES[city.stateId].name}</span>
      </button>
    </li>
  );
}

export const HomePanel = forwardRef(function HomePanel({ onSelect, onHover }, headingRef) {
  return (
    <>
      <HeroStrip />
      <p className="stamp">Trip Composer</p>
      <h1 ref={headingRef} tabIndex={-1} className="display">
        <span className="script">Pick a place.</span>
        <span className="sans">We&rsquo;ll plan the rest.</span>
      </h1>
      <p className="lede">Choose a city on the map, say who&rsquo;s coming and what you like, and get a day-by-day plan.</p>
      <p className="cue"><span className="cue-dot" aria-hidden="true" />Tap a glowing city to begin</p>
      <ul className="chips" aria-label="Launch cities">
        {CITY_LIST.map((c) => <CityChip key={c.id} city={c} onSelect={onSelect} onHover={onHover} />)}
      </ul>
      <p className="margin-note" aria-hidden="true">
        <svg viewBox="0 0 90 40" width="90" height="40"><path d="M2 8C30 2 56 6 80 30m0 0-14-2m14 2-2-14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        <span>four cities for now</span>
      </p>
    </>
  );
});

export const StatePanel = forwardRef(function StatePanel({ stateId, onSelect, onHover, onBack }, headingRef) {
  const st = STATES[stateId];
  const cities = st.cityIds.map((id) => CITIES[id]);
  return (
    <>
      <button type="button" className="back" onClick={onBack}><Arrow />Back to India</button>
      <p className="stamp">State</p>
      <h2 ref={headingRef} tabIndex={-1} className="display"><span className="script">{st.name}</span></h2>
      <p className="lede">
        {cities.length > 1 ? `${cities.length} cities to start from. Pick one.` : 'One city to start from.'}
      </p>
      <ul className="chips" aria-label={`Cities in ${st.name}`}>
        {cities.map((c) => <CityChip key={c.id} city={c} onSelect={onSelect} onHover={onHover} />)}
      </ul>
    </>
  );
});

export const CityPanel = forwardRef(function CityPanel({ cityId, onSelect, onHover, onBack, backLabel, onStart, resume }, headingRef) {
  const city = CITIES[cityId];
  const st = STATES[city.stateId];
  const siblings = st.cityIds.filter((id) => id !== cityId).map((id) => CITIES[id]);
  return (
    <>
      <button type="button" className="back" onClick={onBack}><Arrow />{backLabel}</button>
      <CityBanner cityId={cityId} />
      <p className="stamp">{st.name}</p>
      <h2 ref={headingRef} tabIndex={-1} className="display city-title">
        <span className="script stamp-in">{city.name}</span>
      </h2>
      <p className="lede">{city.tagline}</p>
      <aside className="note" aria-labelledby="note-h">
        <h3 id="note-h">{city.noteTitle} <span>General note</span></h3>
        <p>{city.note}</p>
      </aside>
      <div className="actions">
        <button type="button" className="btn btn-primary" onClick={onStart}>{resume ? 'Continue planning' : 'Start planning'}</button>
        {resume && <p className="hint">Your earlier choices are kept.</p>}
      </div>
      {siblings.length > 0 && (
        <p className="switch">
          Not {city.name}?{' '}
          {siblings.map((s) => (
            <button key={s.id} type="button" className="linklike" onClick={() => onSelect(s.id)}
              onPointerEnter={() => onHover(s.id)} onPointerLeave={() => onHover(null)}>
              Try {s.name}
            </button>
          ))}
        </p>
      )}
    </>
  );
});

export function Trail({ nav, step = 'city', onIndia, onState, onCity }) {
  const st = nav.stateId ? STATES[nav.stateId] : null;
  const city = nav.cityId ? CITIES[nav.cityId] : null;
  return (
    <nav className="trail" aria-label="Where you are">
      <ol>
        <li className="trail-brand"><button type="button" onClick={onIndia} aria-label="Xplore, back to the India map">Xplore</button></li>
        <li>{nav.level === 'india' ? <span aria-current="page">India</span> : <button type="button" onClick={onIndia}>India</button>}</li>
        {st && (
          <li>{nav.level === 'state' ? <span aria-current="page">{st.name}</span> : <button type="button" onClick={() => onState(st.id)}>{st.name}</button>}</li>
        )}
        {nav.level === 'city' && city && (
          <li>{step === 'city' ? <span aria-current="page">{city.name}</span> : <button type="button" onClick={onCity}>{city.name}</button>}</li>
        )}
        {nav.level === 'city' && step !== 'city' && <li><span aria-current="page">{STEP_LABEL[step]}</span></li>}
      </ol>
    </nav>
  );
}
