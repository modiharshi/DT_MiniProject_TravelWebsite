// Draws the trip postcard on a canvas and downloads it as a PNG. Entirely client-side.
const W = 1200;
const H = 800;

export async function savePostcard({ title, vibe, line, stops, accent, filename }) {
  try { await Promise.all(['64px Yellowtail', '700 30px Manrope', '600 22px Oswald', '600 34px Caveat'].map((f) => document.fonts.load(f))); } catch { /* fall back to system fonts */ }
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#f6f0e4'; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#2b3562'; g.lineWidth = 6; g.strokeRect(28, 28, W - 56, H - 56);
  g.strokeStyle = accent; g.lineWidth = 2; g.strokeRect(42, 42, W - 84, H - 84);
  // postage stamp
  g.save(); g.translate(1010, 120); g.rotate(0.08);
  g.fillStyle = '#ebddbd'; g.fillRect(-70, -60, 140, 120);
  g.setLineDash([6, 6]); g.strokeStyle = '#2b3562'; g.lineWidth = 3; g.strokeRect(-70, -60, 140, 120);
  g.setLineDash([]); g.fillStyle = accent; g.font = '600 22px Oswald, sans-serif'; g.textAlign = 'center'; g.fillText('XPLORE', 0, -8); g.font = '600 16px Oswald, sans-serif'; g.fillText('SAMPLE PLAN', 0, 22);
  g.restore();
  g.textAlign = 'left';
  g.fillStyle = accent; g.font = '64px Yellowtail, cursive'; g.fillText('Xplore', 90, 140);
  g.fillStyle = '#2b3562'; g.font = '700 74px Manrope, sans-serif'; g.fillText(title, 90, 250);
  g.fillStyle = accent; g.font = '600 38px Caveat, cursive'; g.fillText(vibe, 92, 305);
  g.fillStyle = '#2b3562'; g.font = '700 28px Manrope, sans-serif'; g.fillText(line, 90, 370);
  g.fillStyle = accent; g.font = '600 22px Oswald, sans-serif'; g.fillText('TOP STOPS', 90, 440);
  g.fillStyle = '#2b3562'; g.font = '600 30px Manrope, sans-serif';
  stops.slice(0, 3).forEach((s, i) => { g.fillText(`${i + 1}.  ${s}`, 90, 490 + i * 52); });
  g.fillStyle = '#5c617a'; g.font = '600 20px Manrope, sans-serif';
  g.fillText('Illustrated plan from the Xplore Trip Composer. Check current conditions and access before you travel.', 90, H - 80);
  await new Promise((resolve) => c.toBlob((blob) => {
    if (!blob) return resolve();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    resolve();
  }, 'image/png'));
}
