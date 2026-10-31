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
  if (store.get('theme')) return;
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
