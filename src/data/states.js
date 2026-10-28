import { STATE_OUTLINES, bounds, smoothPath } from './geo.js';

const meta = {
  rajasthan: { name: 'Rajasthan', cityIds: ['jaipur', 'udaipur'] },
  maharashtra: { name: 'Maharashtra', cityIds: ['mumbai'] },
  himachal: { name: 'Himachal Pradesh', cityIds: ['manali'] },
};

export const STATES = Object.fromEntries(
  Object.entries(meta).map(([id, m]) => {
    const b = bounds(STATE_OUTLINES[id]);
    return [id, {
      id, ...m,
      path: smoothPath(STATE_OUTLINES[id], { k: 0.09 }),
      view: { cx: b.cx, cy: b.cy, span: Math.max(b.w, b.h) * 1.3 },
    }];
  }),
);
export const STATE_LIST = Object.values(STATES);
