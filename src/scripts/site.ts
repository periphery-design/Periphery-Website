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
