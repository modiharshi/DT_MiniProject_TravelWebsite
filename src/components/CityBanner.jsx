import * as I from './MapIcons.jsx';

// Three landmarks per city, reused by the panel banner, the chips and the composing animation.
export const SCENES = {
  jaipur: [I.HawaMahal, I.Camel, I.Fort],
  mumbai: [I.GatewayOfIndia, I.SeaLink, I.Palm],
  udaipur: [I.LakePalace, I.Sailboat, I.Fort],
  manali: [I.Peaks, I.Pine, I.Pagoda],
};

export function CityMark({ cityId, size = 44 }) {
  const [Main] = SCENES[cityId];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true" focusable="false" className="city-mark"><Main /></svg>
  );
}

// A small postcard-style header: three landmarks on a hill with a dotted trail between them.
export function CityBanner({ cityId }) {
  const [A, B, C] = SCENES[cityId];
  return (
    <svg viewBox="0 0 320 96" aria-hidden="true" focusable="false" className="city-banner">
      <path d="M0 80q40-18 80-6t80-8t80 8t80-6V96H0z" fill="var(--accent-2)" opacity=".35" />
      <path d="M0 88q60-14 110-4t110-4t100 6V96H0z" fill="var(--accent)" opacity=".18" />
      <path d="M30 84C80 40 120 96 160 60S250 30 292 70" fill="none" stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="0.1 8" />
      <svg x="12" y="22" width="64" height="64" viewBox="0 0 100 100"><A /></svg>
      <svg x="128" y="30" width="56" height="56" viewBox="0 0 100 100"><B /></svg>
      <svg x="244" y="20" width="64" height="64" viewBox="0 0 100 100"><C /></svg>
    </svg>
  );
}

export function HeroStrip() {
  const row = [['jaipur', 0], ['mumbai', 1], ['udaipur', 2], ['manali', 3]];
  return (
    <svg viewBox="0 0 320 80" aria-hidden="true" focusable="false" className="hero-strip">
      <path d="M20 66C80 20 110 80 160 40S250 20 300 56" fill="none" stroke="var(--rasp)" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="0.1 8" />
      {row.map(([id, i]) => {
        const [Main] = SCENES[id];
        return <svg key={id} x={8 + i * 78} y={i % 2 ? 6 : 14} width="56" height="56" viewBox="0 0 100 100"><Main /></svg>;
      })}
    </svg>
  );
}
