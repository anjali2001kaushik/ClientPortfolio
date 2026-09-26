import { useReveal } from '../hooks/useReveal.js';
import { useTilt } from '../hooks/useTilt.js';
import profile from "../assets/profile.jpg";

// Splits "**bold**" segments out of a plain string into <strong> spans,
// so about.json can mark up the founder's name without needing a full
// markdown renderer dependency.
function renderWithBold(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function About({ about }) {
  const [headRef, headVisible] = useReveal();
  const [gridRef, gridVisible] = useReveal();
  const tiltRef = useTilt({ max: 7, lift: 1.02 });

  return (
    <section className="block" id="about">
      <div className="wrap">
        <div ref={headRef} className={`section-head reveal ${headVisible ? 'in' : ''}`}>
          <div>
            <span className="reel-tag"></span>
            <h2>About</h2>
          </div>
        </div>

        <div ref={gridRef} className={`about-grid reveal ${gridVisible ? 'in' : ''}`}>
           <div ref={tiltRef} className="about-photo">
            <img
              src={profile}
              alt="Bhavya Agrawal"
              className="profile-image"
            />
            <div className="tilt-glare" />
          </div>
          <div className="about-copy">
            {about.paragraphs.map((para, i) => (
              <p key={i}>{renderWithBold(para)}</p>
            ))}
            <div className="kit-list">
              {about.kit.map((row) => (
                <div className="kit-row" key={row.label}>
                  <span>{row.label}</span>
                  <span>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
