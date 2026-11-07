import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Smooth scroll (Nonstop-style feel), skipped for reduced motion ---------- */
let lenis: Lenis | null = null;
if (!reduceMotion) {
  lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
  const raf = (t: number) => { lenis!.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
}

/* ---------- Fresh visits always start at the top ----------
   Some browsers (and embedded previews) carry an old scroll position onto a newly opened page, which drops
   a case study straight onto its copy and skips the cover. Back/forward and reload keep the browser's own
   restore, and links to an #anchor still jump to it. */
const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
if (!location.hash && (!nav || nav.type === 'navigate')) {
  // Stop forcing it the moment the visitor scrolls themselves (slow connections finish loading late)
  let touched = false;
  for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) addEventListener(ev, () => { touched = true; }, { once: true, passive: true });
  const toTop = () => { if (touched) return; window.scrollTo(0, 0); lenis?.scrollTo(0, { immediate: true, force: true }); };
  toTop();
  window.addEventListener('pageshow', (e) => { if (!e.persisted) toTop(); }, { once: true });
  window.addEventListener('load', toTop, { once: true });   // after late layout shifts (images, fonts)
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
   Hovering a row shows its image: the card grows in, and each new image expands over the last. The card eases toward
   the pointer (transform only) and the loop sleeps once it settles. Keyboard focus parks it beside the row.
   Touch devices never see the card (CSS hides it); their image is inside the opened row. */
document.querySelectorAll<HTMLElement>('[data-cap-reveal]').forEach((el) => {
  const rows = [...el.querySelectorAll<HTMLElement>('.cap')];
  const imgs = [...el.querySelectorAll<HTMLElement>('.rv-img')];
  const card = el.querySelector<HTMLElement>('.rv-card');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)');
  if (!card || imgs.length !== rows.length) return;

  // Show image i. If the card is just growing in, the image is already full size inside it; otherwise the new
  // image goes on top and expands from the centre, and the ones underneath close (unseen) once it has finished.
  let z = 1, cur = -1;
  const snap = (m: HTMLElement, on: boolean) => { m.classList.add('no-anim'); m.classList.toggle('is-on', on); void m.offsetWidth; m.classList.remove('no-anim'); };
  const set = (i: number) => {
    const wasActive = el.classList.contains('is-active');
    el.classList.add('is-active');
    if (i === cur) return;
    cur = i;
    const img = imgs[i];
    img.style.zIndex = String(++z);
    if (!wasActive) { imgs.forEach((m) => snap(m, m === img)); return; }
    img.classList.add('is-on');
    img.addEventListener('transitionend', () => {
      if (cur === i) imgs.forEach((m) => { if (m !== img) snap(m, false); });
    }, { once: true });
  };
  let tx = 0, ty = 0, cx = 0, cy = 0, running = false, shown = false;
  const clear = () => { el.classList.remove('is-active'); shown = false; cur = -1; };
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
  // Sides with a single frame are stills and are left alone
  const sides = [...el.querySelectorAll<HTMLElement>('.seq-frames')].map((s) => [...s.querySelectorAll<HTMLImageElement>('.seq-frame')]).filter((s) => s.length > 1);
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

/* ---------- Roll once: hovered titles roll up and stay up ----------
   On leave, once the roll has finished, the title snaps back to its start with transitions off. Both copies
   of the title are identical, so the snap can't be seen, and the next hover rolls up again. Leaving mid-roll
   lets the roll finish first. Keyboard focus behaves like hover. */
document.querySelectorAll<HTMLElement>('[data-roll-once]').forEach((el) => {
  const roll = el.querySelector<HTMLElement>('.roll');
  const b = roll?.querySelector<HTMLElement>('.roll-b');
  if (!roll || !b) return;
  let state: 'idle' | 'rolling' | 'rolled' = 'idle';
  let inside = false;
  const reset = () => {
    roll.classList.add('no-anim');
    el.classList.remove('is-rolled');
    void roll.offsetWidth;            // apply the snap before transitions come back
    roll.classList.remove('no-anim');
    state = 'idle';
  };
  const enter = () => { inside = true; if (state === 'idle') { state = 'rolling'; el.classList.add('is-rolled'); } };
  const leave = () => { inside = false; if (state === 'rolled') reset(); };
  b.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'transform' || state !== 'rolling') return;
    state = 'rolled';
    if (!inside) reset();
  });
  el.addEventListener('mouseenter', enter);
  el.addEventListener('mouseleave', leave);
  el.addEventListener('focus', () => { if (el.matches(':focus-visible')) enter(); });
  el.addEventListener('blur', leave);
});

/* ---------- Films (case studies) ----------
   Muted, looping, plays while on screen and pauses when it scrolls away or the tab is hidden. The visitor's
   Pause sticks until they press Play. Sound is off until asked for. Reduced motion: never autoplays. */
document.querySelectorAll<HTMLElement>('[data-film]').forEach((el) => {
  const v = el.querySelector('video')!;
  const play = el.querySelector<HTMLButtonElement>('[data-film-play]')!;
  const sound = el.querySelector<HTMLButtonElement>('[data-film-sound]')!;
  let userPaused = reduceMotion, onScreen = false;
  const label = () => { const on = !v.paused; play.textContent = on ? 'Pause' : 'Play'; play.setAttribute('aria-pressed', String(on)); };
  const sync = () => {
    if (onScreen && !userPaused && !document.hidden) { v.preload = 'auto'; v.play().catch(() => {}); }
    else v.pause();
  };
  v.addEventListener('play', label); v.addEventListener('pause', label);
  play.addEventListener('click', () => { userPaused = !v.paused; if (!userPaused) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause(); });
  sound.addEventListener('click', () => {
    v.muted = !v.muted;
    sound.textContent = v.muted ? 'Sound on' : 'Sound off';
    sound.setAttribute('aria-pressed', String(!v.muted));
    if (!v.muted && v.paused) { userPaused = false; v.play().catch(() => {}); }
  });
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; sync(); }, { threshold: 0.35 }).observe(v);
  document.addEventListener('visibilitychange', sync);
  label();
});

/* ---------- Wireframe 2: campaign reels ----------
   Blossom (drag + momentum + snap) loads only for a mouse; touch keeps the phone's own swipe and scroll-snap.
   A thin progress line follows the scroll, and Previous / Next step one slide at a time. */
const reels = [...document.querySelectorAll<HTMLElement>('[data-reel]')];
if (reels.length) {
  const fineReel = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const blossomReady = fineReel ? import('@blossom-carousel/core').then((m) => m.Blossom) : Promise.resolve(null);
  reels.forEach((wrap) => {
    const list = wrap.querySelector<HTMLElement>('[blossom-carousel]')!;
    const fill = wrap.querySelector<HTMLElement>('.progress-fill');
    const prev = wrap.querySelector<HTMLButtonElement>('[data-reel-prev]');
    const next = wrap.querySelector<HTMLButtonElement>('[data-reel-next]');
    let api: { prev: (o?: object) => void; next: (o?: object) => void } | null = null;
    let wheelIdle = 0;
    const update = () => {
      const max = list.scrollWidth - list.clientWidth;
      const p = max > 0 ? list.scrollLeft / max : 1;
      fill?.style.setProperty('--p', String(Math.min(1, Math.max(0, p))));
      if (prev) prev.disabled = list.scrollLeft <= 2;
      if (next) next.disabled = list.scrollLeft >= max - 2;
    };
    // Fallback stepping without Blossom: scroll to the next / previous slide edge
    const step = (dir: 1 | -1) => {
      const slides = [...list.children] as HTMLElement[];
      const pad = parseFloat(getComputedStyle(list).scrollPaddingInlineStart) || 0;
      const x = list.scrollLeft + pad;
      const target = dir > 0 ? slides.find((s) => s.offsetLeft > x + 4) : [...slides].reverse().find((s) => s.offsetLeft < x - 4);
      list.scrollTo({ left: target ? target.offsetLeft - pad : dir > 0 ? list.scrollWidth : 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    prev?.addEventListener('click', () => (api ? api.prev() : step(-1)));
    next?.addEventListener('click', () => (api ? api.next() : step(1)));
    list.addEventListener('scroll', update, { passive: true });
    // Mouse wheel / vertical trackpad over the reel moves it sideways until it reaches an end,
    // then lets the page scroll on as normal (so nobody gets stuck).
    list.addEventListener('wheel', (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;          // sideways trackpad swipes are native already
      const max = list.scrollWidth - list.clientWidth;
      const atStart = list.scrollLeft <= 1, atEnd = list.scrollLeft >= max - 1;
      if ((e.deltaY < 0 && atStart) || (e.deltaY > 0 && atEnd)) return;
      e.preventDefault();
      // Pause snapping while the wheel turns (small trackpad moves would otherwise snap back), resume after
      list.style.setProperty('--snap-type', 'none');
      clearTimeout(wheelIdle);
      wheelIdle = window.setTimeout(() => list.style.removeProperty('--snap-type'), 180);
      const dy = e.deltaMode === 1 ? e.deltaY * 32 : e.deltaY;
      list.scrollBy({ left: dy, behavior: 'instant' as ScrollBehavior });
    }, { passive: false });
    window.addEventListener('resize', update);
    update();
    blossomReady.then((Blossom) => {
      if (!Blossom) return;
      const b = Blossom(list);
      b.init();
      api = b;
      update();
    }).catch(() => {});
  });
}
