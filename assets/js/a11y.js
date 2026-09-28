'use strict';
/* Accessibility menu: text size, contrast, grayscale, link highlight, readable font, text spacing,
   stop animations (incl. freezing GIF emotes), strong focus, big cursor. Choices persist per browser. */
(() => {
  const KEY = 'odedsvr-a11y';
  const SIZES = [1, 1.1, 1.25, 1.4, 1.6];
  const MODES = [
    ['contrast', 'ניגודיות גבוהה', '<circle cx="12" cy="12" r="9"/><path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor"/>'],
    ['grayscale', 'גווני אפור', '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3v18"/>'],
    ['links', 'הדגשת קישורים', '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>'],
    ['font', 'גופן קריא', '<path d="M4 20 10 4h1l6 16M6.5 14h8"/>'],
    ['spacing', 'ריווח טקסט', '<path d="M3 6h18M3 12h18M3 18h18"/><path d="m18 3 3 3-3 3M6 21l-3-3 3-3"/>'],
    ['stop', 'עצירת אנימציות', '<circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/>'],
    ['focus', 'הדגשת פוקוס', '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="8" y="8" width="8" height="8"/>'],
    ['cursor', 'סמן גדול', '<path d="M5 3v15l4-4 3 7 3-1-3-7h6z"/>'],
  ];
  const html = document.documentElement;
  let state = { size: 0, modes: {} };
  try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && typeof s === 'object') state = { size: Math.min(Math.max(0, s.size | 0), SIZES.length - 1), modes: s.modes || {} }; } catch {}
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} };

  /* ---- GIF freezing: draw the current frame onto a canvas and hide the animated image ---- */
  const isAnimated = img => /\.gif($|\?)/i.test(img.currentSrc || img.src) || /files\.kick\.com\/emotes\//.test(img.src);
  function freeze(img) {
    if (img.dataset.a11yFrozen || !isAnimated(img) || img.closest('.a11y-root')) return;
    const draw = () => {
      if (!img.naturalWidth || img.dataset.a11yFrozen || !html.classList.contains('a11y-stop')) return;
      const w = img.clientWidth || img.width || 48, h = img.clientHeight || img.height || 48;
      const c = document.createElement('canvas');
      const dpr = window.devicePixelRatio || 1;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      c.style.width = w + 'px'; c.style.height = h + 'px';
      c.className = 'a11y-frozen'; c.setAttribute('role', 'img'); c.setAttribute('aria-label', img.alt || '');
      const ctx = c.getContext('2d');
      const r = Math.min(c.width / img.naturalWidth, c.height / img.naturalHeight);
      const dw = img.naturalWidth * r, dh = img.naturalHeight * r;
      try { ctx.drawImage(img, (c.width - dw) / 2, (c.height - dh) / 2, dw, dh); } catch { return; }
      img.dataset.a11yFrozen = '1'; img.hidden = true; img.after(c);
    };
    if (img.complete) draw(); else img.addEventListener('load', draw, { once: true });
    if (img.loading === 'lazy') img.loading = 'eager';
  }
  function unfreezeAll() {
    document.querySelectorAll('canvas.a11y-frozen').forEach(c => c.remove());
    document.querySelectorAll('img[data-a11y-frozen]').forEach(img => { img.hidden = false; delete img.dataset.a11yFrozen; });
  }
  const observer = new MutationObserver(() => document.querySelectorAll('img').forEach(freeze));

  function apply() {
    html.style.zoom = state.size ? String(SIZES[state.size]) : '';
    for (const [id] of MODES) html.classList.toggle('a11y-' + id, !!state.modes[id]);
    if (state.modes.stop) { document.querySelectorAll('img').forEach(freeze); observer.observe(document.body, { childList: true, subtree: true }); }
    else { observer.disconnect(); unfreezeAll(); }
    if (panel) {
      panel.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(!!state.modes[b.dataset.mode])));
      sizeLabel.textContent = Math.round(SIZES[state.size] * 100) + '%';
      dec.disabled = state.size === 0; inc.disabled = state.size === SIZES.length - 1;
    }
  }

  /* ---- UI ---- */
  const ico = body => `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
  const root = document.createElement('div');
  root.className = 'a11y-root';
  root.innerHTML = `
<button type="button" class="a11y-toggle" aria-expanded="false" aria-controls="a11y-panel" aria-label="תפריט נגישות">
  <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><circle cx="12" cy="4" r="2"/><path d="M19 8.5c0 .6-.4 1-1 1.1L14.5 10v3.2l2 6.9a1 1 0 0 1-1.9.6L12.7 15h-1.4l-1.9 5.7a1 1 0 0 1-1.9-.6l2-6.9V10l-3.5-.4a1 1 0 0 1 .2-2.1l4.4.4h2.8l4.4-.4a1 1 0 0 1 1.2 1z"/></svg>
</button>
<div class="a11y-panel" id="a11y-panel" role="dialog" aria-modal="false" aria-labelledby="a11y-title" hidden>
  <div class="a11y-head"><h2 id="a11y-title">תפריט נגישות</h2><button type="button" class="a11y-close" aria-label="סגירת תפריט הנגישות">×</button></div>
  <div class="a11y-size" role="group" aria-label="גודל טקסט">
    <button type="button" data-size="-1" aria-label="הקטנת טקסט">−</button>
    <span aria-live="polite">גודל טקסט <b class="a11y-size-value">100%</b></span>
    <button type="button" data-size="1" aria-label="הגדלת טקסט">+</button>
  </div>
  <div class="a11y-grid">${MODES.map(([id, label, path]) => `<button type="button" class="a11y-opt" data-mode="${id}" aria-pressed="false">${ico(path)}<span>${label}</span></button>`).join('')}</div>
  <div class="a11y-foot"><button type="button" class="a11y-reset">איפוס הגדרות</button><a href="accessibility.html">הצהרת נגישות</a></div>
</div>`;
  document.body.append(root);
  const toggle = root.querySelector('.a11y-toggle'), panel = root.querySelector('.a11y-panel');
  const sizeLabel = root.querySelector('.a11y-size-value');
  const dec = root.querySelector('[data-size="-1"]'), inc = root.querySelector('[data-size="1"]');

  const open = () => { panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); panel.querySelector('.a11y-close').focus(); };
  const close = (refocus = true) => { panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); if (refocus) toggle.focus(); };
  toggle.addEventListener('click', () => (panel.hidden ? open() : close()));
  root.querySelector('.a11y-close').addEventListener('click', () => close());
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.addEventListener('click', e => { if (!panel.hidden && !root.contains(e.target)) close(false); });

  root.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => {
    state.size = Math.min(Math.max(0, state.size + Number(b.dataset.size)), SIZES.length - 1); save(); apply();
  }));
  root.querySelectorAll('[data-mode]').forEach(b => b.addEventListener('click', () => {
    state.modes[b.dataset.mode] = !state.modes[b.dataset.mode]; save(); apply();
  }));
  root.querySelector('.a11y-reset').addEventListener('click', () => { state = { size: 0, modes: {} }; save(); apply(); });

  apply();
})();
