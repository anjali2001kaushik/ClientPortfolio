import { useEffect, useRef } from 'react';

/**
 * Attach to a container: tracks the cursor position inside it and writes
 * --px/--py custom properties in the range -1..1. CSS on descendant
 * "layers" reads those vars (via calc()) to drift at different rates,
 * producing a parallax depth effect with a single shared listener.
 *
 * No-ops on touch devices and when the user prefers reduced motion.
 */
export function useParallax() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (!canHover || prefersReducedMotion) return;

    let raf = null;

    const handleMove = (e) => {
      const rect = el.getBoundingClientRect();
      const px = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const py = ((e.clientY - rect.top) / rect.height) * 2 - 1;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--px', px.toFixed(3));
        el.style.setProperty('--py', py.toFixed(3));
      });
    };

    const handleLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.setProperty('--px', 0);
      el.style.setProperty('--py', 0);
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return ref;
}
