import { useReveal } from '../hooks/useReveal.js';
import { useTilt } from '../hooks/useTilt.js';

function TestimonialCard({ t }) {
  // Smaller max angle than the work/photo cards — these are read, not scanned.
  const tiltRef = useTilt({ max: 5, lift: 1.015 });

  return (
    <div ref={tiltRef} className="testi-card">
      <div className="tilt-glare tilt-glare--soft" />
      <div className="stars">★★★★★</div>
      <p>"{t.quote}"</p>
      <div className="testi-who">
        {t.name}
        <span>{t.role}</span>
      </div>
    </div>
  );
}

export default function Testimonials({ items, onShareReview }) {
  const [headRef, headVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();

  return (
    <section className="block" style={{ paddingTop: 0 }}>
      <div className="wrap">
        <div ref={headRef} className={`section-head reveal ${headVisible ? 'in' : ''}`}>
          <div>
            <span className="reel-tag">Reel 07 — Timecode 52:00</span>
            <h2>
              Words From
              <br />
              The Set
            </h2>
          </div>
          {onShareReview && (
            <button type="button" className="btn-ghost" onClick={onShareReview}>
              Share Your Experience
            </button>
          )}
        </div>

        <div ref={gridRef} className={`testi-grid reveal ${gridVisible ? 'in' : ''}`}>
          {items.map((t) => (
            <TestimonialCard key={t.name} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
