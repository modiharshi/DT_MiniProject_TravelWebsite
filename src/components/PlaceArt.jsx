import { useId } from 'react';
import * as I from './MapIcons.jsx';
import { InterestIcon } from './FlowIcons.jsx';
import { INTERESTS } from '../data/interests.js';

// Original illustrations for places: a small scene (sky tinted by best time of day, hills, a sun or
// moon) around a landmark drawing from the map set, or an interest icon for generic places. These are
// drawings, not photographs, so nothing here implies a real image of the place.
const ART = {
  hawa: I.HawaMahal, fort: I.Fort, lake: I.LakePalace, gateway: I.GatewayOfIndia, sealink: I.SeaLink, peaks: I.Peaks,
  pine: I.Pine, pagoda: I.Pagoda, camel: I.Camel, peacock: I.Peacock, diya: I.Diya, om: I.Om, rangoli: I.Rangoli,
  kite: I.Kite, palm: I.Palm, sailboat: I.Sailboat, waves: I.Waves, sitar: I.Sitar,
};
const SKY = {
  morning: ['#cfe6ee', '#f6f0e4'], afternoon: ['#f8e3a3', '#f6f0e4'], evening: ['#b9a0cf', '#f2c7a6'], any: ['#d9e8e4', '#f6f0e4'],
};

export function PlaceArt({ place, className = '' }) {
  const uid = useId().replace(/:/g, '');
  const [top, bottom] = SKY[place.bestTime] || SKY.any;
  const Icon = ART[place.image];
  const interest = place.tags.find((t) => INTERESTS[t]);
  const evening = place.bestTime === 'evening';
  return (
    <svg viewBox="0 0 120 90" aria-hidden="true" focusable="false" className={`place-art ${className}`}>
      <defs>
        <linearGradient id={`sky-${uid}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={top} /><stop offset="1" stopColor={bottom} /></linearGradient>
      </defs>
      <rect width="120" height="90" fill={`url(#sky-${uid})`} />
      {evening ? (
        <g><circle cx="98" cy="18" r="8" fill="var(--parch)" /><circle cx="102" cy="15" r="7" fill="#b9a0cf" /></g>
      ) : (
        <circle cx="100" cy="18" r="9" fill="var(--yellow)" stroke="var(--ink)" strokeWidth="1.6" />
      )}
      <path d="M0 68q20-14 40-6t38-8t42 6V90H0z" fill="var(--leaf)" opacity=".55" />
      <path d="M0 76q30-10 60-2t60-4V90H0z" fill="var(--leaf)" opacity=".8" stroke="var(--ink)" strokeWidth="1.4" />
      {Icon ? (
        <svg x="28" y="10" width="64" height="64" viewBox="0 0 100 100"><Icon /></svg>
      ) : (
        <g transform="translate(34 14) scale(1.1)"><circle cx="24" cy="24" r="25" fill="var(--parch)" stroke="var(--ink)" strokeWidth="1.8" /><InterestIcon id={interest} size={48} /></g>
      )}
    </svg>
  );
}
