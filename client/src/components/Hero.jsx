import { useTimecode } from '../hooks/useTimecode.js';

export default function Hero({ hero }) {
  const timecode = useTimecode(24);
  return (
    <section className="hero">
      <div className="hero-tilt">
        <div className="eyebrow hero-layer hero-layer--1">{hero.eyebrow}</div>
        <h1 className="hero-layer hero-layer--2">
          {hero.titleLine1}
          <br />
          <em>{hero.titleLine2}</em>
        </h1>
        <p className="tagline hero-layer hero-layer--1">{hero.tagline}</p>
        <div className="hero-actions hero-layer hero-layer--1">
          <a className="btn-primary" href="#work">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            {hero.primaryCta}
          </a>
        </div>
      </div>
      <div className="timecode">
        <span className="dot"></span>
        <span>{timecode}</span> — REC
      </div>
      <div className="scrollcue">
        <span className="line"></span>
        Scroll
      </div>
    </section>
  );
}
