// Original flat-vector landmark and nature icons, drawn in a 100 x 100 box.
// Every icon is anchored at its base-centre so it can be planted on the map.
// Colours come from design tokens, so themes and dark surfaces stay consistent.

const C = {
  ink: 'var(--ink)', rasp: 'var(--rasp)', cream: 'var(--cream)', teal: 'var(--teal)',
  terra: 'var(--terra)', aqua: 'var(--aqua)', leaf: 'var(--leaf)', yellow: 'var(--yellow)',
  parch: 'var(--parch)',
};

export function Plant({ x, y, s = 1, flip, rot = 0, children, className = '' }) {
  const sx = flip ? -s : s;
  return (
    <g className={`deco ${className}`} transform={`translate(${x} ${y}) rotate(${rot}) scale(${sx} ${s}) translate(-50 -100)`}>
      {children}
    </g>
  );
}

const stroke = { stroke: C.ink, strokeWidth: 2.4, strokeLinejoin: 'round', strokeLinecap: 'round' };

export const IndiaGate = ({ hole = C.teal }) => (
  <g {...stroke}>
    <rect x="20" y="26" width="60" height="74" fill={C.cream} />
    <path d="M36 100V64a14 14 0 0 1 28 0v36z" fill={hole} />
    <rect x="14" y="16" width="72" height="12" fill={C.rasp} />
    <rect x="28" y="6" width="44" height="10" fill={C.rasp} />
    <rect x="24" y="34" width="52" height="8" fill={C.rasp} />
    <path d="M30 48h40M30 54h40" strokeWidth="1.6" />
  </g>
);

export const TajMahal = () => (
  <g {...stroke}>
    <rect x="8" y="88" width="84" height="12" fill={C.cream} />
    <rect x="30" y="58" width="40" height="30" fill={C.cream} />
    <path d="M50 18C33 32 30 46 32 60h36c2-14-1-28-18-42z" fill={C.cream} />
    <path d="M50 6v12" />
    <path d="M44 88V76a6 6 0 0 1 12 0v12z" fill={C.rasp} />
    {[10, 84].map((x) => (
      <g key={x}>
        <rect x={x} y="42" width="6" height="46" fill={C.cream} />
        <path d={`M${x - 1} 42a4 4 0 0 1 8 0z`} fill={C.rasp} />
      </g>
    ))}
    {[20, 72].map((x) => (
      <path key={x} d={`M${x} 64a8 8 0 0 1 8-8a8 8 0 0 1 8 8v-0z`} fill={C.rasp} />
    ))}
  </g>
);

export const LotusTemple = () => (
  <g {...stroke}>
    <path d="M50 88C20 88 6 76 4 62c22 4 40 14 46 26z" fill={C.cream} />
    <path d="M50 88c30 0 44-12 46-26-22 4-40 14-46 26z" fill={C.cream} />
    <path d="M50 90C30 82 18 62 22 38c16 8 26 28 28 52z" fill={C.rasp} />
    <path d="M50 90c20-8 32-28 28-52-16 8-26 28-28 52z" fill={C.rasp} />
    <path d="M50 92C40 70 40 40 50 14c10 26 10 56 0 78z" fill={C.cream} />
  </g>
);

export const HawaMahal = () => (
  <g {...stroke}>
    <rect x="12" y="70" width="76" height="30" fill={C.rasp} />
    <rect x="22" y="48" width="56" height="22" fill={C.rasp} />
    <rect x="30" y="30" width="40" height="18" fill={C.rasp} />
    <path d="M36 30V18a14 14 0 0 1 28 0v12z" fill={C.rasp} />
    <path d="M50 4v6" />
    {[
      [18, 74, 4], [32, 74, 4], [46, 74, 4], [60, 74, 4], [74, 74, 4],
      [28, 52, 4], [42, 52, 4], [56, 52, 4], [68, 52, 4], [38, 34, 4], [48, 34, 4], [58, 34, 4],
    ].map(([x, y], i) => (
      <path key={i} d={`M${x} ${y + 12}v-6a4 4 0 0 1 8 0v6z`} fill={C.cream} strokeWidth="1.4" />
    ))}
  </g>
);

export const GatewayOfIndia = ({ hole = C.teal }) => (
  <g {...stroke}>
    <rect x="10" y="42" width="80" height="58" fill={C.cream} />
    <path d="M36 100V68a14 14 0 0 1 28 0v32z" fill={hole} />
    {[16, 36, 64, 84].map((x) => (
      <g key={x}>
        <rect x={x - 6} y="26" width="12" height="16" fill={C.cream} />
        <path d={`M${x - 7} 26a7 7 0 0 1 14 0z`} fill={C.rasp} />
      </g>
    ))}
    <path d="M10 60h80" strokeWidth="1.6" />
    <path d="M34 42v-4h32v4" strokeWidth="1.6" />
  </g>
);

export const SeaLink = () => (
  <g {...stroke}>
    <path d="M0 74h100" strokeWidth="4" />
    <path d="M50 74L46 12h8z" fill={C.rasp} />
    {[8, 20, 32, 42, 58, 68, 80, 92].map((x) => (
      <path key={x} d={`M50 14L${x} 74`} stroke={C.cream} strokeWidth="1.6" />
    ))}
    {[10, 26, 74, 90].map((x) => <path key={x} d={`M${x} 74v14`} strokeWidth="3" />)}
    <path d="M0 92q6-5 12 0t12 0t12 0t12 0t12 0t12 0t12 0t12 0" stroke={C.cream} strokeWidth="1.8" fill="none" />
  </g>
);

export const Peaks = () => (
  <g {...stroke}>
    <path d="M0 100L26 52l22 48z" fill={C.rasp} />
    <path d="M30 100L60 28l36 72z" fill={C.cream} />
    <path d="M60 28l-10 22 10-5 10 8 8-9z" fill={C.parch} />
    <path d="M60 28L44 100h26z" fill={C.rasp} opacity=".9" />
    <path d="M26 52l-7 14 7-4 6 6z" fill={C.parch} />
    <path d="M70 100l14-34 16 34z" fill={C.rasp} />
  </g>
);

export const KeralaBoat = () => (
  <g className="bob" {...stroke}>
    <path d="M24 70Q50 16 80 70z" fill={C.cream} />
    <path d="M36 66Q50 36 58 66M48 66Q56 40 66 66" fill="none" strokeWidth="1.5" />
    <path d="M4 70Q50 96 96 70l-10 12Q50 100 14 82z" fill={C.ink} />
    <path d="M10 94q6-4 12 0t12 0t12 0t12 0t12 0t12 0" stroke={C.cream} strokeWidth="1.8" fill="none" />
    <path d="M88 60l8 26" />
  </g>
);

export const Charminar = ({ hole = C.teal }) => (
  <g {...stroke}>
    <rect x="14" y="48" width="72" height="52" fill={C.cream} />
    <path d="M38 100V74a12 12 0 0 1 24 0v26z" fill={hole} />
    {[6, 82].map((x) => (
      <g key={x}>
        <rect x={x} y="22" width="12" height="78" fill={C.cream} />
        <path d={`M${x - 1} 22a7 7 0 0 1 14 0z`} fill={C.rasp} />
        <path d={`M${x + 6} 12v6`} />
        <path d={`M${x} 46h12M${x} 66h12`} strokeWidth="1.5" />
      </g>
    ))}
    {[24, 44, 64].map((x) => (
      <path key={x} d={`M${x} 48a6 6 0 0 1 12 0z`} fill={C.rasp} />
    ))}
  </g>
);

export const Sitar = () => (
  <g {...stroke} transform="rotate(-22 50 60)">
    <rect x="46.5" y="2" width="7" height="56" rx="2" fill={C.cream} />
    <ellipse cx="50" cy="76" rx="22" ry="22" fill={C.cream} />
    <circle cx="50" cy="76" r="8" fill={C.rasp} />
    <path d="M42 8h-6M42 16h-6M58 12h6M58 20h6" />
    <path d="M50 2v56M47 20h6M47 32h6M47 44h6" strokeWidth="1.4" />
  </g>
);

export const Elephant = () => (
  <g {...stroke}>
    <rect x="34" y="30" width="58" height="42" rx="18" fill={C.ink} />
    {[40, 52, 70, 82].map((x) => <rect key={x} x={x} y="62" width="10" height="32" rx="3" fill={C.ink} />)}
    <circle cx="30" cy="44" r="18" fill={C.ink} />
    <path d="M17 50Q6 68 14 88q5 4 7-3Q15 68 26 58z" fill={C.ink} />
    <path d="M22 60Q14 62 12 72" stroke={C.cream} strokeWidth="3" fill="none" />
    <ellipse cx="38" cy="46" rx="9" ry="13" fill={C.rasp} />
    <circle cx="26" cy="40" r="2" fill={C.cream} stroke="none" />
    <path d="M16 34Q30 18 46 32z" fill={C.rasp} />
    <rect x="46" y="34" width="34" height="26" rx="6" fill={C.rasp} stroke={C.cream} />
    <path d="M50 58a4 4 0 0 1 8 0M60 58a4 4 0 0 1 8 0M70 58a4 4 0 0 1 8 0" fill="none" stroke={C.cream} strokeWidth="1.8" />
    <circle cx="63" cy="46" r="3" fill={C.cream} stroke="none" />
    <path d="M92 44q6 8 2 20" fill="none" />
  </g>
);

export const Camel = () => (
  <g {...stroke}>
    {[30, 40, 62, 72].map((x) => <path key={x} d={`M${x} 64v32`} strokeWidth="5" stroke={C.cream} />)}
    {[30, 40, 62, 72].map((x) => <path key={'o' + x} d={`M${x} 64v32`} strokeWidth="1.4" />)}
    <ellipse cx="50" cy="56" rx="28" ry="15" fill={C.cream} />
    <path d="M36 46Q48 20 62 46z" fill={C.cream} />
    <path d="M68 52Q86 44 82 24l9-3q4 16-4 28-8 12-19 14z" fill={C.cream} />
    <ellipse cx="91" cy="21" rx="9" ry="5" fill={C.cream} />
    <path d="M32 50h34v12H32z" fill={C.rasp} stroke={C.cream} strokeWidth="1.5" />
    <path d="M36 62l3 5 3-5 3 5 3-5 3 5 3-5" fill="none" stroke={C.yellow} strokeWidth="1.6" />
    <circle cx="92" cy="19" r="1.6" fill={C.ink} stroke="none" />
  </g>
);

export const Peacock = () => (
  <g {...stroke}>
    {[-66, -44, -22, 0, 22, 44, 66].map((a) => (
      <g key={a} transform={`rotate(${a} 50 68)`}>
        <ellipse cx="50" cy="30" rx="8" ry="22" fill={C.leaf} />
        <ellipse cx="50" cy="20" rx="4.5" ry="6.5" fill={C.yellow} strokeWidth="1.4" />
        <circle cx="50" cy="20" r="2" fill={C.ink} stroke="none" />
      </g>
    ))}
    <path d="M42 98Q38 74 50 58q12 16 8 40z" fill={C.ink} />
    <circle cx="50" cy="56" r="6" fill={C.ink} />
    <path d="M47 50l-2-8M50 50l0-9M53 50l2-8" strokeWidth="1.6" />
    <path d="M56 56l7 2-7 2z" fill={C.yellow} strokeWidth="1.4" />
  </g>
);

export const Tiger = () => (
  <g {...stroke}>
    <circle cx="22" cy="26" r="13" fill={C.terra} />
    <circle cx="78" cy="26" r="13" fill={C.terra} />
    <circle cx="22" cy="26" r="6" fill={C.cream} strokeWidth="1.6" />
    <circle cx="78" cy="26" r="6" fill={C.cream} strokeWidth="1.6" />
    <path d="M12 52Q10 24 50 22q40 2 38 30-2 36-38 42-36-6-38-42z" fill={C.terra} />
    <path d="M18 40l12 4M16 52l12 2M82 40l-12 4M84 52l-12 2M50 24v14M40 26l4 10M60 26l-4 10" fill="none" />
    <ellipse cx="50" cy="66" rx="20" ry="14" fill={C.cream} strokeWidth="1.8" />
    <path d="M44 56h12l-6 8z" fill={C.rasp} strokeWidth="1.6" />
    <path d="M50 64v6M42 72q8 6 16 0" fill="none" strokeWidth="1.8" />
    <circle cx="36" cy="46" r="3" fill={C.ink} stroke="none" />
    <circle cx="64" cy="46" r="3" fill={C.ink} stroke="none" />
  </g>
);

export const Diya = () => (
  <g {...stroke}>
    <g className="flame">
      <path d="M50 14Q68 40 50 62Q32 40 50 14z" fill={C.yellow} />
      <path d="M50 34Q58 46 50 56Q42 46 50 34z" fill={C.terra} stroke="none" />
    </g>
    <path d="M8 66Q50 76 92 66Q86 92 50 94Q14 92 8 66z" fill={C.rasp} />
    <path d="M20 76q30 8 60 0" fill="none" stroke={C.cream} strokeWidth="1.8" />
  </g>
);

export const Om = () => (
  <g>
    <text x="50" y="86" textAnchor="middle" fontSize="96" fill={C.cream} stroke={C.ink} strokeWidth="1.5"
      style={{ fontFamily: '"Kohinoor Devanagari","Noto Sans Devanagari","Devanagari Sangam MN",serif' }}>ॐ</text>
  </g>
);

export const Rangoli = () => (
  <g {...stroke} strokeWidth="2">
    {[0, 45, 90, 135].map((a) => (
      <ellipse key={a} cx="50" cy="60" rx="9" ry="30" fill={a % 90 ? C.yellow : C.rasp} transform={`rotate(${a} 50 60)`} />
    ))}
    <circle cx="50" cy="60" r="11" fill={C.cream} />
    <circle cx="50" cy="60" r="4" fill={C.rasp} stroke="none" />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * Math.PI) / 6;
      return <circle key={i} cx={50 + Math.cos(a) * 44} cy={60 + Math.sin(a) * 44} r="3" fill={C.cream} stroke="none" />;
    })}
  </g>
);

export const Cow = () => (
  <g {...stroke}>
    <path d="M30 6q-12 4-14 20M70 6q12 4 14 20" fill="none" strokeWidth="4" stroke={C.cream} />
    <path d="M24 28Q22 12 50 12t26 16q-2 30-10 52Q58 96 50 96T34 80Q26 58 24 28z" fill={C.cream} />
    <path d="M30 34l-12-8 4 16zM70 34l12-8-4 16z" fill={C.cream} />
    <circle cx="38" cy="38" r="3" fill={C.ink} stroke="none" />
    <circle cx="62" cy="38" r="3" fill={C.ink} stroke="none" />
    <path d="M32 62Q50 78 68 62l-4 22Q50 94 36 84z" fill={C.rasp} />
    <path d="M40 76h20" stroke={C.yellow} strokeWidth="2" />
    <path d="M38 22Q50 28 62 22" fill="none" stroke={C.rasp} strokeWidth="3" />
    <circle cx="50" cy="26" r="3" fill={C.yellow} stroke="none" />
    <circle cx="43" cy="82" r="2" fill={C.ink} stroke="none" />
    <circle cx="57" cy="82" r="2" fill={C.ink} stroke="none" />
  </g>
);

export const Palm = () => (
  <g className="sway">
    <path d="M52 100Q58 66 46 34" fill="none" stroke={C.ink} strokeWidth="4.5" strokeLinecap="round" />
    <g fill={C.ink}>
      <path d="M46 34Q26 20 4 30Q26 24 46 34z" />
      <path d="M46 34Q60 10 86 14Q62 14 46 34z" />
      <path d="M46 34Q70 30 90 48Q66 38 46 34z" />
      <path d="M46 34Q36 8 14 2Q38 10 46 34z" />
    </g>
    <path d="M46 34Q34 22 14 24Q34 24 46 34zM46 34Q64 20 80 20Q62 22 46 34z" fill={C.rasp} />
  </g>
);

export const Sailboat = () => (
  <g className="bob" {...stroke} strokeWidth="2">
    <path d="M50 8v66" />
    <path d="M52 12Q84 38 86 68H52z" fill={C.cream} />
    <path d="M48 24Q26 44 16 68h32z" fill={C.cream} />
    <path d="M8 76h84l-12 14H22z" fill={C.ink} />
  </g>
);

export const Kite = () => (
  <g {...stroke} strokeWidth="2">
    <path d="M50 4l24 30-24 38-24-38z" fill={C.yellow} />
    <path d="M50 4v68M26 34h48" strokeWidth="1.5" />
    <path d="M50 72q-8 10 0 18t-2 10" fill="none" />
  </g>
);

export const Fort = ({ hole = C.teal }) => (
  <g {...stroke}>
    <path d="M6 100V56h14v-8h10v8h40v-8h10v8h14v44z" fill={C.cream} />
    <path d="M40 100V76a10 10 0 0 1 20 0v24z" fill={hole} />
    {[6, 22, 70, 86].map((x) => <path key={x} d={`M${x} 56v-8h8v8`} fill={C.rasp} />)}
    {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={30 + i * 8} y="44" width="4" height="6" fill={C.cream} strokeWidth="1.2" />)}
    <path d="M6 70h88" strokeWidth="1.5" />
  </g>
);

export const LakePalace = () => (
  <g {...stroke}>
    <path d="M10 76h80v-18H10z" fill={C.cream} />
    <path d="M24 58V40a10 10 0 0 1 20 0v18zM56 58V34a12 12 0 0 1 24 0v24z" fill={C.cream} />
    <path d="M30 34V26M68 22v-8" />
    {[18, 34, 52, 66, 80].map((x) => <path key={x} d={`M${x} 76v-10a3 3 0 0 1 6 0v10z`} fill={C.rasp} strokeWidth="1.2" />)}
    <path d="M4 88q8-5 16 0t16 0t16 0t16 0t16 0t16 0" fill="none" stroke={C.cream} strokeWidth="2" />
  </g>
);

export const Pine = () => (
  <g {...stroke} strokeWidth="2">
    <rect x="46" y="84" width="8" height="16" fill={C.ink} />
    <path d="M50 6L22 44h14L16 70h20L12 90h76L64 70h20L64 44h14z" fill={C.leaf} />
    <path d="M50 6L40 24M34 56l-8 12" stroke={C.cream} strokeWidth="1.4" fill="none" />
  </g>
);

export const Pagoda = () => (
  <g {...stroke}>
    <rect x="22" y="78" width="56" height="22" fill={C.cream} />
    <path d="M10 80L50 54l40 26z" fill={C.rasp} />
    <rect x="30" y="52" width="40" height="8" fill={C.cream} />
    <path d="M18 54L50 30l32 24z" fill={C.rasp} />
    <rect x="38" y="26" width="24" height="6" fill={C.cream} />
    <path d="M28 28L50 10l22 18z" fill={C.rasp} />
    <path d="M50 4v8" />
    <path d="M44 100V88a6 6 0 0 1 12 0v12z" fill={C.ink} />
  </g>
);

export const Waves = ({ n = 3 }) => (
  <g fill="none" stroke={C.cream} strokeWidth="2.4" strokeLinecap="round">
    {Array.from({ length: n }).map((_, i) => (
      <path key={i} d="M0 0q8-8 16 0t16 0" transform={`translate(${i * 10} ${i * 9})`} opacity={1 - i * 0.2} />
    ))}
  </g>
);

export function CompassRose({ size = 120 }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden="true" focusable="false" className="compass">
      <circle cx="60" cy="60" r="34" fill="none" stroke={C.ink} strokeWidth="2" />
      <circle cx="60" cy="60" r="30" fill="none" stroke={C.ink} strokeWidth="1" strokeDasharray="2 4" />
      <path d="M60 8l9 42 42 10-42 10-9 42-9-42L9 60l42-10z" fill={C.cream} stroke={C.ink} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 8l9 42-9 10z" fill={C.rasp} />
      <path d="M60 112l-9-42 9-10z" fill={C.rasp} />
      <path d="M60 60l-9-10-42 10z" fill={C.ink} opacity=".85" />
      <path d="M60 60l9 10 42-10z" fill={C.ink} opacity=".85" />
      {[['N', 60, 6], ['S', 60, 119], ['E', 116, 64], ['W', 4, 64]].map(([t, x, y]) => (
        <text key={t} x={x} y={y} textAnchor="middle" fontSize="11" fontFamily="var(--font-tag)" fill={C.ink}>{t}</text>
      ))}
    </svg>
  );
}
