import { memo } from 'react';
import {
  INDIA, MAINLAND, SRI_LANKA, ANDAMAN, STATE_OUTLINES, ICON_SPOTS, PALMS, BOATS, KITES,
  smoothPath, project,
} from '../data/geo.js';
import { STATE_LIST } from '../data/states.js';
import * as I from './MapIcons.jsx';

const INDIA_D = smoothPath(INDIA, { k: 0.1 });
const MAINLAND_D = smoothPath(MAINLAND, { k: 0 });
const SRI_D = smoothPath(SRI_LANKA, { k: 0.12 });

const BOOST = 1.35;
const at = ([lon, lat, s]) => ({ x: project([lon, lat])[0], y: project([lon, lat])[1], s: s * BOOST });
const SPOT = Object.fromEntries(Object.entries(ICON_SPOTS).map(([k, v]) => [k, at(v)]));

function Label({ lon, lat, rot = 0, size = 34, children, className = 'lbl-script', fill }) {
  const [x, y] = project([lon, lat]);
  return (
    <text x={x} y={y} transform={`rotate(${rot} ${x} ${y})`} className={className} fontSize={size} fill={fill}>
      {children}
    </text>
  );
}

// The static illustration. Memoised: the camera moves, the art never re-renders.
function MapArtImpl() {
  const s = SPOT;
  return (
    <>
      <defs>
        <clipPath id="india-clip"><path d={INDIA_D} /></clipPath>
        <pattern id="wave-pat" width="64" height="40" patternUnits="userSpaceOnUse">
          <path d="M4 14q8-8 16 0t16 0" fill="none" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="round" opacity=".55" />
          <path d="M36 34q8-8 16 0t16 0" fill="none" stroke="var(--cream)" strokeWidth="2.2" strokeLinecap="round" opacity=".4" />
        </pattern>
        <pattern id="block-pat" width="26" height="26" patternUnits="userSpaceOnUse">
          <circle cx="13" cy="13" r="2" fill="var(--cream)" opacity=".35" />
          <path d="M0 0l4 4M26 0l-4 4" stroke="var(--cream)" strokeWidth="1" opacity=".25" />
        </pattern>
      </defs>

      {/* Sea, then neighbouring land, then India. */}
      <rect x="-3000" y="-3000" width="7000" height="7000" fill="var(--rasp)" />
      <rect x="-3000" y="-3000" width="7000" height="7000" fill="url(#wave-pat)" />
      <path d={MAINLAND_D} fill="var(--cream)" />
      <path d={SRI_D} fill="var(--cream)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" />
      {ANDAMAN.map((a, i) => (
        <path key={i} d={smoothPath(a, { closed: false, k: 0.12 })} fill="none" stroke="var(--teal)" strokeWidth="7" strokeLinecap="round" />
      ))}

      <path d={INDIA_D} fill="var(--teal)" stroke="var(--ink)" strokeWidth="3" strokeLinejoin="round" />
      <path d={INDIA_D} fill="url(#block-pat)" />

      {/* The three launch states, plain and quiet. Cities are the only live targets. */}
      <g clipPath="url(#india-clip)">
        {STATE_LIST.map((st) => (
          <path key={st.id} d={st.path} fill="#4D9DB1" stroke="var(--cream)" strokeWidth="1.8"
            strokeDasharray="1 6" strokeLinecap="round" />
        ))}
      </g>

      {/* Map text: hand-lettered, decorative. */}
      <Label lon={77.5} lat={39.6} size={92} className="lbl-title" fill="var(--rasp)">India</Label>
      <Label lon={62.2} lat={27.9} size={30} className="lbl-neigh" fill="var(--teal-text)">Pakistan</Label>
      <Label lon={83.3} lat={29.4} size={26} className="lbl-neigh" fill="var(--teal-text)">Nepal</Label>
      <Label lon={88.4} lat={33.6} size={34} className="lbl-neigh" fill="var(--teal-text)">Tibet</Label>
      <Label lon={96.2} lat={21.2} size={24} className="lbl-neigh" fill="var(--teal-text)" rot={-20}>Myanmar</Label>
      <Label lon={81.8} lat={5.0} size={22} className="lbl-sea" fill="var(--cream)">Sri Lanka</Label>
      <Label lon={58.0} lat={15.4} size={40} rot={-52} className="lbl-sea" fill="var(--cream)">Arabian Sea</Label>
      <Label lon={85.6} lat={12.2} size={40} rot={-62} className="lbl-sea" fill="var(--cream)">Bay of Bengal</Label>

      {/* Landmarks and culture. All decorative, none clickable. */}
      <g aria-hidden="true" className="decor">
        <I.Plant {...s.peaks}><I.Peaks /></I.Plant>
        <I.Plant {...s.lotus}><I.LotusTemple /></I.Plant>
        <I.Plant {...s.indiaGate}><I.IndiaGate /></I.Plant>
        <I.Plant {...s.taj}><I.TajMahal /></I.Plant>
        <I.Plant {...s.hawa}><I.HawaMahal /></I.Plant>
        <I.Plant {...s.camel}><I.Camel /></I.Plant>
        <I.Plant {...s.gateway}><I.GatewayOfIndia hole="var(--rasp)" /></I.Plant>
        <I.Plant {...s.seaLink}><I.SeaLink /></I.Plant>
        <I.Plant {...s.keralaBoat}><I.KeralaBoat /></I.Plant>
        <I.Plant {...s.charminar}><I.Charminar /></I.Plant>
        <I.Plant {...s.sitar}><I.Sitar /></I.Plant>
        <I.Plant {...s.elephant}><I.Elephant /></I.Plant>
        <I.Plant {...s.cow}><I.Cow /></I.Plant>
        <I.Plant {...s.peacock}><I.Peacock /></I.Plant>
        <I.Plant {...s.tiger}><I.Tiger /></I.Plant>
        <I.Plant {...s.om}><I.Om /></I.Plant>
        <I.Plant {...s.rangoli}><I.Rangoli /></I.Plant>
        <I.Plant {...s.diya}><I.Diya /></I.Plant>
        {PALMS.map((p, i) => <I.Plant key={i} {...at(p)} flip={i % 2 === 1}><I.Palm /></I.Plant>)}
        {BOATS.map((b, i) => <I.Plant key={i} {...at(b)}><I.Sailboat /></I.Plant>)}
        {KITES.map((k, i) => <I.Plant key={i} {...at(k)} rot={i ? 14 : -10}><I.Kite /></I.Plant>)}
        {[[62, 20.5], [64.5, 11], [71.5, 12.5], [92.5, 18], [90.2, 12.8], [85, 7.6], [60.5, 8.5], [76.5, 5.4]].map(([lon, lat], i) => {
          const [x, y] = project([lon, lat]);
          return <g key={i} transform={`translate(${x} ${y}) scale(.8)`}><I.Waves n={2 + (i % 2)} /></g>;
        })}
      </g>

      {/* Compass in the Bay of Bengal sea, bottom right. */}
      <g aria-hidden="true" transform={`translate(${project([95.2, 7.6]).join(' ')}) scale(1.35) translate(-60 -60)`}>
        <I.CompassRose size={120} />
      </g>
    </>
  );
}
export const MapArt = memo(MapArtImpl);

// Landmark clusters that only appear once you are close to a city (Image 2 style).
function Group({ cx, cy, children }) {
  return <g transform={`translate(${cx} ${cy})`}>{children}</g>;
}
const G = ({ x, y, s, flip, rot, children }) => (
  <I.Plant x={x} y={y} s={s} flip={flip} rot={rot}>{children}</I.Plant>
);

export function CityGlyphs({ city }) {
  const c = { cx: city.x, cy: city.y };
  switch (city.id) {
    case 'jaipur':
      return (
        <Group {...c}>
          <ellipse cx="4" cy="12" rx="52" ry="30" className="wash-blob" />
          <G x={-38} y={10} s={0.3}><I.HawaMahal /></G>
          <G x={34} y={-26} s={0.28}><I.Fort hole="var(--rasp)" /></G>
          <G x={40} y={34} s={0.28}><I.Camel /></G>
        </Group>
      );
    case 'udaipur':
      return (
        <Group {...c}>
          <ellipse cx="4" cy="34" rx="52" ry="22" fill="var(--aqua)" opacity=".8" stroke="var(--ink)" strokeWidth=".8" />
          <path d="M-30 40q6-4 12 0t12 0t12 0t12 0" fill="none" stroke="var(--parch)" strokeWidth="1.2" />
          <G x={-8} y={36} s={0.28}><I.LakePalace /></G>
          <G x={-40} y={-4} s={0.26}><I.Fort hole="var(--rasp)" /></G>
          <G x={26} y={42} s={0.22}><I.Sailboat /></G>
        </Group>
      );
    case 'mumbai':
      return (
        <Group {...c}>
          <ellipse cx="8" cy="8" rx="46" ry="34" className="wash-blob" />
          <G x={-30} y={4} s={0.3}><I.SeaLink /></G>
          <G x={30} y={-2} s={0.34}><I.GatewayOfIndia hole="var(--teal)" /></G>
          <G x={28} y={32} s={0.22}><I.Palm /></G>
        </Group>
      );
    case 'manali':
      return (
        <Group {...c}>
          <ellipse cx="2" cy="8" rx="44" ry="26" fill="var(--parch)" opacity=".55" />
          <path d="M-38 34q10-8 20-2t20-4t20-2t18-6" fill="none" stroke="var(--aqua)" strokeWidth="3.4" strokeLinecap="round" />
          <G x={-30} y={20} s={0.3}><I.Pine /></G>
          <G x={-18} y={24} s={0.24}><I.Pine /></G>
          <G x={10} y={-18} s={0.46}><I.Peaks /></G>
          <G x={32} y={20} s={0.3}><I.Pagoda /></G>
        </Group>
      );
    default:
      return null;
  }
}

export { STATE_OUTLINES };
