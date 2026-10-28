import { useEffect, useRef } from 'react';

// An accessible modal: focus moves in, Tab is kept inside, Escape and the close button close it, and
// focus returns to whatever opened it. Escape is marked handled so the app does not also step back.
export function Dialog({ title, titleId, onClose, side = false, children, className = '' }) {
  const ref = useRef(null);
  const opener = useRef(null);
  useEffect(() => {
    opener.current = document.activeElement;
    ref.current?.querySelector('[data-autofocus]')?.focus();
    return () => { if (opener.current?.isConnected) opener.current.focus({ preventScroll: true }); };
  }, []);
  const onKey = (e) => {
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onClose(); return; }
    if (e.key !== 'Tab') return;
    const f = [...ref.current.querySelectorAll('button, [href], input, textarea, select, summary, [tabindex]:not([tabindex="-1"])')].filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div className="scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div ref={ref} role="dialog" aria-modal="true" aria-labelledby={titleId} className={`dialog ${side ? 'dialog-side' : ''} ${className}`} onKeyDown={onKey}>
        <button type="button" className="dialog-close" onClick={onClose} data-autofocus aria-label={`Close ${title}`}>
          <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>
        </button>
        {children}
      </div>
    </div>
  );
}
