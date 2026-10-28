import { useCallback, useEffect, useRef } from 'react';

// One camera over one coordinate system. It writes the SVG viewBox directly
// (no React renders per frame) and publishes --px: map units per screen pixel,
// so labels and markers can stay a constant, readable size while the map scales.
const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

export function useCamera({ svgRef, uiRef, stageRef, getPad, initial }) {
  const cur = useRef({ ...initial });
  const size = useRef({ w: 1000, h: 800 });
  const run = useRef(null); // { raf, resolve }

  const apply = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const { cx, cy, span } = cur.current;
    const { w, h } = size.current;
    const pad = getPad(w, h);
    const effW = Math.max(80, w - pad.l - pad.r);
    const effH = Math.max(80, h - pad.t - pad.b);
    const k = Math.min(effW, effH) / span;
    const x0 = cx - (pad.l + effW / 2) / k;
    const y0 = cy - (pad.t + effH / 2) / k;
    svg.setAttribute('viewBox', `${x0.toFixed(2)} ${y0.toFixed(2)} ${(w / k).toFixed(2)} ${(h / k).toFixed(2)}`);
    uiRef.current?.style.setProperty('--px', (1 / k).toFixed(5));
    svg.style.setProperty('--px', (1 / k).toFixed(5));
  }, [svgRef, uiRef, getPad]);

  const cancel = useCallback(() => {
    if (run.current) {
      cancelAnimationFrame(run.current.raf);
      run.current.resolve(false);
      run.current = null;
    }
  }, []);

  // Resolves true when the move finishes, false if something interrupted it.
  const to = useCallback((target, duration = 1000, { instant = false } = {}) => {
    cancel();
    if (instant || duration <= 0) {
      cur.current = { ...target };
      apply();
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const from = { ...cur.current };
      const t0 = performance.now();
      const step = (now) => {
        const t = Math.min(1, (now - t0) / duration);
        const e = ease(t);
        cur.current = {
          cx: from.cx + (target.cx - from.cx) * e,
          cy: from.cy + (target.cy - from.cy) * e,
          span: from.span * Math.pow(target.span / from.span, e),
        };
        apply();
        if (t < 1) run.current.raf = requestAnimationFrame(step);
        else { run.current = null; resolve(true); }
      };
      run.current = { raf: requestAnimationFrame(step), resolve };
    });
  }, [apply, cancel]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return undefined;
    const measure = () => {
      const r = el.getBoundingClientRect();
      size.current = { w: Math.max(1, r.width), h: Math.max(1, r.height) };
      apply();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => { ro.disconnect(); cancel(); };
  }, [stageRef, apply, cancel]);

  return { to, cancel };
}
