import { useEffect, useRef } from 'react';
import { SCENES } from './CityBanner.jsx';

// "Composing your trip": a pen draws a dotted route, landmark sketches appear, a stamp lands.
// About two and a half seconds. Under reduced motion or lightweight mode it is a short still card.
export function Composing({ city, calm, onDone }) {
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), calm ? 350 : 2600);
    return () => clearTimeout(t);
  }, [calm]);
  const [A, B, C] = SCENES[city.id] || SCENES.jaipur;
  return (
    <div className="composing" role="status" aria-live="polite">
      <svg viewBox="0 0 400 220" className="composing-art" aria-hidden="true">
        <defs><clipPath id="c-reveal"><rect className="c-reveal" x="0" y="0" width="400" height="220" /></clipPath></defs>
        <path d="M40 170C100 90 150 190 200 120S320 60 360 110" fill="none" stroke="var(--accent)" strokeWidth="4" strokeLinecap="round" strokeDasharray="0.1 11" clipPath="url(#c-reveal)" />
        <g className="c-ic c-ic1"><svg x="14" y="104" width="70" height="70" viewBox="0 0 100 100"><A /></svg></g>
        <g className="c-ic c-ic2"><svg x="165" y="56" width="70" height="70" viewBox="0 0 100 100"><B /></svg></g>
        <g className="c-ic c-ic3"><svg x="318" y="62" width="70" height="70" viewBox="0 0 100 100"><C /></svg></g>
        <g className="c-pen"><path d="M0 0l-14 -26l6 -3l14 26z" fill="var(--ink)" /><path d="M0 0l-2 8l8 -4z" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1" /></g>
      </svg>
      <p className="composing-title">Composing your {city.name} trip</p>
      <p className="composing-sub">Matching your picks to places that suit them.</p>
      <p className="composing-stamp" aria-hidden="true">Composed</p>
      <button type="button" className="linklike" onClick={onDone}>Skip</button>
    </div>
  );
}
