import { useEffect, useRef } from 'react';

/**
 * Attach to any element: adds a cursor-driven 3D tilt (perspective +
 * rotateX/rotateY) plus --mx/--my custom properties (0-100%) so a child
 * "glare" layer can track the pointer across the surface.
 *
 * Pure DOM style mutation (no re-renders) so it stays smooth at 60fps.
 * No-ops on touch devices and when the user prefers reduced motion —
 * mirrors the guard in useReveal.
 */
export function useTilt({ max = 10, lift = 1.02, perspective = 900 } = {}) {
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
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;

      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rx = (0.5 - py) * max * 2;
        const ry = (px - 0.5) * max * 2;
        el.style.transition = 'transform .1s linear';
        el.style.transform = `perspective(${perspective}px) rotateX(${rx.toFixed(
          2
        )}deg) rotateY(${ry.toFixed(2)}deg) scale3d(${lift}, ${lift}, ${lift})`;
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
    };

    const handleLeave = () => {
      if (raf) cancelAnimationFrame(raf);
      el.style.transition = 'transform .6s cubic-bezier(0.23, 1, 0.32, 1)';
      el.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      el.style.setProperty('--mx', '50%');
      el.style.setProperty('--my', '50%');
    };

    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [max, lift, perspective]);

  return ref;
}
