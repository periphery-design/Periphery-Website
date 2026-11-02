import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Smooth scroll (Nonstop-style feel), skipped for reduced motion ---------- */
if (!reduceMotion) {
  const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const raf = (t: number) => { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

/* ---------- Theme toggle ---------- */
const root = document.documentElement;
// Storage can be blocked (private modes, sandboxed previews); the toggle still works for the visit.
const store = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } },
};
const toggle = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const syncToggle = () => {
  if (!toggle) return;
  const dark = root.dataset.theme === 'dark';
  toggle.setAttribute('aria-pressed', String(dark));
  toggle.querySelector('[data-theme-label]')!.textContent = dark ? 'Dark' : 'Light';
};
syncToggle();
toggle?.addEventListener('click', () => {
  root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  store.set('theme', root.dataset.theme!);
  syncToggle();
});
// Follow device changes until the visitor makes an explicit choice.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
  if (store.get('theme') || root.dataset.forceTheme) return;
  root.dataset.theme = e.matches ? 'dark' : 'light';
  syncToggle();
});

/* ---------- Scroll reveal ---------- */
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
}, { rootMargin: '0px 0px -10% 0px' });
document.querySelectorAll('[data-reveal]').forEach((el) => io.observe(el));

/* ---------- Expand / collapse panels (process steps, FAQs) ---------- */
document.querySelectorAll<HTMLButtonElement>('[data-expand]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.closest('[data-expand-item]')?.classList.toggle('is-open', !open);
  });
});

/* ---------- Card carousels: advance when the active bar finishes "loading" ---------- */
document.querySelectorAll<HTMLElement>('[data-carousel]').forEach((el) => {
  const slides = [...el.querySelectorAll<HTMLElement>('[data-slide]')];
  const bars = [...el.querySelectorAll<HTMLElement>('.bar')];
  if (slides.length < 2 || bars.length !== slides.length || reduceMotion) return;
  let i = 0;
  const show = (n: number) => {
    if (n === 0) bars.forEach((b) => b.classList.remove('is-done'));  // new loop: empty all bars
    slides.forEach((s, k) => s.classList.toggle('is-active', k === n));
    bars.forEach((b, k) => { b.classList.toggle('is-active', k === n); if (k < n) b.classList.add('is-done'); });
    i = n;
  };
  bars.forEach((b) => b.addEventListener('animationend', () => show((i + 1) % slides.length)));
  // Only run while the card is on screen and the tab is visible
  let onScreen = false;
  const sync = () => el.classList.toggle('is-paused', !onScreen || document.hidden);
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.25 }).observe(el);
  document.addEventListener('visibilitychange', sync);
  show(0);
});

/* ---------- Animated slide stacks: open when 40% visible, close again once fully out of view so it can replay ---------- */
document.querySelectorAll<HTMLElement>('[data-stack]').forEach((el) => {
  new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.intersectionRatio >= 0.4) el.classList.add('is-open');
      else if (!e.isIntersecting) el.classList.remove('is-open');
    }
  }, { threshold: [0, 0.4] }).observe(el);
});

/* ---------- Capabilities: image card that trails the mouse over the panel ----------
   Hovering a row shows its image; images slide up or down with the direction of travel. The card eases toward
   the pointer (transform only) and the loop sleeps once it settles. Keyboard focus parks it beside the row.
   Touch devices never see the card (CSS hides it); their image is inside the opened row. */
document.querySelectorAll<HTMLElement>('[data-cap-reveal]').forEach((el) => {
  const rows = [...el.querySelectorAll<HTMLElement>('.cap')];
  const imgs = [...el.querySelectorAll<HTMLElement>('.rv-img')];
  const card = el.querySelector<HTMLElement>('.rv-card');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!card || imgs.length !== rows.length) return;

  const set = (i: number) => {
    el.classList.add('is-active');
    imgs.forEach((m, k) => { m.classList.toggle('is-on', k === i); m.classList.toggle('is-before', k < i); });
  };
  let tx = 0, ty = 0, cx = 0, cy = 0, running = false, shown = false;
  const clear = () => { el.classList.remove('is-active'); shown = false; };
  const place = () => { card.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`; };
  const tick = () => {
    const k = reduceMotion ? 1 : 0.16;
    cx += (tx - cx) * k; cy += (ty - cy) * k; place();
    if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.3) requestAnimationFrame(tick); else running = false;
  };
  // x/y are the card's centre, in panel coordinates; kept inside the panel horizontally
  const aim = (x: number, y: number) => {
    const w = card.offsetWidth, width = el.clientWidth;
    tx = Math.min(Math.max(x, w / 2), width - w / 2); ty = y;
    if (!shown) { cx = tx; cy = ty; place(); shown = true; }   // appear at the pointer, don't fly in from the corner
    if (!running) { running = true; requestAnimationFrame(tick); }
  };

  rows.forEach((r, i) => {
    r.addEventListener('mouseenter', () => { if (fine.matches) set(i); });
    r.querySelector('button')?.addEventListener('focus', () => {
      if (!fine.matches) return;
      set(i);
      const box = el.getBoundingClientRect(), rb = r.getBoundingClientRect();
      aim(el.clientWidth - card.offsetWidth * 0.75, rb.top - box.top + rb.height / 2);
    });
  });
  // Card sits just right of the pointer so the name under it stays readable
  el.addEventListener('pointermove', (e) => {
    if (!fine.matches || e.pointerType !== 'mouse' || !el.classList.contains('is-active')) return;
    const box = el.getBoundingClientRect();
    aim(e.clientX - box.left + card.offsetWidth / 2 + 32, e.clientY - box.top);
  });
  el.addEventListener('mouseleave', () => { if (!el.contains(document.activeElement)) clear(); });
  el.addEventListener('focusout', (e) => { if (!el.contains(e.relatedTarget as Node)) clear(); });
});

/* ---------- Synced frame sequences (case studies) ----------
   One clock drives every side of the block, so both animations cut on the same tick. Starts once every
   frame has loaded (no blank frames), runs only while on screen and the tab is visible, has a Pause
   button (auto-moving content), and stays on the first frame for reduced motion. */
document.querySelectorAll<HTMLElement>('[data-seq]').forEach((el) => {
  if (reduceMotion) return;
  const sides = [...el.querySelectorAll<HTMLElement>('.seq-frames')].map((s) => [...s.querySelectorAll<HTMLImageElement>('.seq-frame')]);
  const n = sides[0]?.length ?? 0;
  if (n < 2 || sides.some((s) => s.length !== n)) return;
  const interval = Number(el.dataset.seq) || 1000;
  const toggle = el.querySelector<HTMLButtonElement>('[data-seq-toggle]');
  let i = 0, timer = 0, ready = false, onScreen = false, paused = false;
  const show = (k: number) => sides.forEach((s) => s.forEach((img, j) => img.classList.toggle('is-on', j === k)));
  const sync = () => {
    const run = ready && onScreen && !paused && !document.hidden;
    if (run && !timer) timer = window.setInterval(() => { i = (i + 1) % n; show(i); }, interval);
    if (!run && timer) { clearInterval(timer); timer = 0; }
  };
  // Load every frame when the block gets close, then start
  new IntersectionObserver(([e]) => {
    onScreen = e.isIntersecting;
    if (onScreen && !ready) {
      sides.flat().forEach((img) => { img.loading = 'eager'; });
      Promise.all(sides.flat().map((img) => img.decode().catch(() => {}))).then(() => { ready = true; sync(); });
    }
    sync();
  }, { rootMargin: '200px 0px' }).observe(el);
  document.addEventListener('visibilitychange', sync);
  if (toggle) {
    toggle.hidden = false;
    toggle.addEventListener('click', () => {
      paused = !paused;
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.textContent = paused ? 'Play' : 'Pause';
      sync();
    });
  }
});
