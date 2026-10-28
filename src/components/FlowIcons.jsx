// Original line icons for interest cards and traveller choices. Drawn on a 48-unit grid with
// currentColor strokes and a few accent fills so they pick up each city's theme. Decorative only:
// the label next to each icon carries the meaning.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', strokeLinejoin: 'round' };
const A = 'var(--accent-3)';
const B = 'var(--accent-2)';

const ICONS = {
  'street-food': (
    <>
      <path d="M7 25h34c0 9-7 15-17 15S7 34 7 25z" fill={A} {...S} fillOpacity=".9" />
      <path d="M16 19c-2-3 2-5 0-8M24 19c-2-3 2-5 0-8M32 19c-2-3 2-5 0-8" {...S} />
    </>
  ),
  'local-food': (
    <>
      <circle cx="24" cy="25" r="16" fill="var(--parch)" {...S} />
      <circle cx="17" cy="20" r="4.5" fill={A} {...S} />
      <circle cx="31" cy="20" r="4.5" fill={B} {...S} />
      <circle cx="24" cy="32" r="4.5" fill={A} {...S} />
      <path d="M7 42h34" {...S} />
    </>
  ),
  cafes: (
    <>
      <path d="M9 19h23v9a10 10 0 0 1-10 10h-3A10 10 0 0 1 9 28z" fill={A} {...S} />
      <path d="M32 21h3a4.5 4.5 0 0 1 0 9h-3M7 42h27" {...S} />
      <path d="M16 14c-2-2 2-3 0-6M23 14c-2-2 2-3 0-6" {...S} />
    </>
  ),
  heritage: (
    <>
      <path d="M7 41V22h34v19z" fill={A} {...S} fillOpacity=".85" />
      <path d="M7 22v-7h6v7M17 22v-7h6v7M25 22v-7h6v7M35 22v-7h6v7" {...S} />
      <path d="M19 41v-9a5 5 0 0 1 10 0v9" fill="var(--parch)" {...S} />
    </>
  ),
  'art-galleries': (
    <>
      <rect x="7" y="9" width="34" height="26" rx="2" fill="var(--parch)" {...S} />
      <path d="M12 30l8-9 6 6 4-4 6 7z" fill={B} {...S} />
      <circle cx="32" cy="16" r="2.6" fill={A} {...S} />
      <path d="M17 35l-3 8M31 35l3 8" {...S} />
    </>
  ),
  'art-crafts': (
    <>
      <rect x="18" y="5" width="12" height="14" rx="4" fill={A} {...S} />
      <rect x="9" y="19" width="30" height="8" rx="1.5" fill={B} {...S} />
      <circle cx="13" cy="38" r="2.2" fill="currentColor" />
      <circle cx="24" cy="38" r="2.2" fill="currentColor" />
      <circle cx="35" cy="38" r="2.2" fill="currentColor" />
      <path d="M18.5 38h-3M29.5 38h-3" {...S} strokeDasharray="1 3" />
    </>
  ),
  beaches: (
    <>
      <circle cx="33" cy="14" r="6.5" fill={A} {...S} />
      <path d="M5 30q6-6 12 0t12 0t12 0M5 39q6-6 12 0t12 0t12 0" {...S} />
    </>
  ),
  shopping: (
    <>
      <path d="M10 17h28l-2.5 24h-23z" fill={A} {...S} fillOpacity=".9" />
      <path d="M17 17v-3a7 7 0 0 1 14 0v3" {...S} />
      <path d="M18 26c1 4 11 4 12 0" {...S} />
    </>
  ),
  nightlife: (
    <>
      <path d="M31 7a17 17 0 1 0 11 24A14 14 0 0 1 31 7z" fill={A} {...S} />
      <path d="M36 8v6M33 11h6M40 19v4M38 21h4" {...S} />
    </>
  ),
  temples: (
    <>
      <path d="M24 4l4 7h-8zM24 10l7 9H17z" fill={A} {...S} />
      <path d="M11 19h26v22H11z" fill="var(--parch)" {...S} />
      <path d="M20 41v-8a4 4 0 0 1 8 0v8M7 41h34" {...S} />
    </>
  ),
  offbeat: (
    <>
      <path d="M9 42C26 38 6 31 20 25s6-9 14-14" {...S} strokeDasharray="1 4.5" />
      <path d="M35 4v14" {...S} />
      <path d="M35 5l9 3.5-9 3.5z" fill={A} {...S} />
      <circle cx="9" cy="42" r="2.5" fill="currentColor" />
    </>
  ),
  'lakes-sunsets': (
    <>
      <path d="M11 29a13 13 0 0 1 26 0z" fill={A} {...S} />
      <path d="M5 29h38M10 35h28M16 41h16" {...S} />
      <path d="M24 9v4M10 14l3 3M38 14l-3 3" {...S} />
    </>
  ),
  'nature-adventure': (
    <>
      <path d="M3 40L17 15l8 13 5-7 15 19z" fill={B} {...S} />
      <path d="M13 21l4-6 4 6-4-2zM27 25l3-4 3 4-3-1.5z" fill="var(--parch)" {...S} strokeWidth="1.6" />
      <circle cx="36" cy="10" r="3.5" fill={A} {...S} />
    </>
  ),
};

export function InterestIcon({ id, size = 44 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true" focusable="false" className="icon-interest">
      {ICONS[id] || <circle cx="24" cy="24" r="12" {...S} />}
    </svg>
  );
}

function Person({ x, y, s = 1, tint = A, pack }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      {pack && <rect x="-17" y="-3" width="10" height="18" rx="4" fill={B} {...S} />}
      <circle cx="0" cy="-16" r="7" fill="var(--parch)" {...S} />
      <path d="M-11 22v-12a11 11 0 0 1 22 0v12z" fill={tint} {...S} />
    </g>
  );
}

export function TravellerArt({ kind }) {
  return (
    <svg viewBox="0 0 96 64" width="96" height="64" aria-hidden="true" focusable="false" className="icon-traveller">
      {kind === 'solo' && (
        <>
          <path d="M70 52c8-2 10-10 4-12M16 54h64" {...S} strokeDasharray="1 5" />
          <Person x={46} y={28} s={1.15} pack />
        </>
      )}
      {kind === 'group' && (
        <>
          <Person x={26} y={32} s={0.9} tint={B} />
          <Person x={70} y={32} s={0.9} tint={A} />
          <Person x={48} y={28} s={1.05} tint="var(--accent)" />
        </>
      )}
      {kind === 'family' && (
        <>
          <Person x={28} y={28} s={1} tint={A} />
          <Person x={68} y={28} s={1} tint={B} />
          <Person x={48} y={40} s={0.7} tint="var(--accent)" />
        </>
      )}
    </svg>
  );
}

export const Tick = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
    <path d="M4 12.5l5 5L20 6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
