// Shared vim-like scrolling helpers.
//
// Used by the article list (src/pages/index.astro, j/k moves focus between
// entries) and by article pages (src/layouts/BlogPost.astro, j/k/gg/G scroll
// the document). Both need the same continuously-eased scroll: rapid or held
// keypresses chase a single moving target instead of each keypress starting
// its own competing `scrollBy(..., smooth)` animation, which is what caused
// the stutter on fast repeats.

const EASING = 0.3;

export const isTypingTarget = (el: EventTarget | null): boolean =>
  el instanceof HTMLElement &&
  (el.isContentEditable ||
    ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));

export interface SmoothScroller {
  /** Ease towards an absolute document offset (clamped to the page). */
  scrollTo(y: number): void;
  /** Ease by a delta, relative to the pending target when one is in flight. */
  scrollBy(delta: number): void;
  /** Largest scrollable offset. */
  maxScroll(): number;
  /** The offset the page is heading to: the pending target, else the current position. */
  pendingTop(): number;
}

export function createSmoothScroller(): SmoothScroller {
  let targetY: number | null = null;
  let rafId: number | null = null;

  const maxScroll = () =>
    document.documentElement.scrollHeight - window.innerHeight;

  const clamp = (v: number) => Math.max(0, Math.min(v, maxScroll()));

  const animate = () => {
    const current = window.scrollY;
    const diff = (targetY as number) - current;
    if (Math.abs(diff) < 1) {
      window.scrollTo(0, targetY as number);
      rafId = null;
      targetY = null;
      return;
    }
    window.scrollTo(0, current + diff * EASING);
    rafId = requestAnimationFrame(animate);
  };

  const scrollTo = (y: number) => {
    targetY = clamp(y);
    if (rafId === null) rafId = requestAnimationFrame(animate);
  };

  const pendingTop = () => targetY ?? window.scrollY;

  return {
    scrollTo,
    scrollBy: (delta: number) => scrollTo(pendingTop() + delta),
    maxScroll,
    pendingTop,
  };
}
