import { useReveal } from '../hooks/useReveal.js';
import WorkCard from './WorkCard.jsx';

// Highlights a "World Record" occurrence inside a category title in gold,
// leaving the rest of the title in the normal heading color.
function highlightWorldRecord(title) {
  const marker = 'World Record';
  const idx = title.indexOf(marker);
  if (idx === -1) return title;

  return (
    <>
      {title.slice(0, idx)}
      <span className="text-gold">{title.slice(idx, idx + marker.length)}</span>
      {title.slice(idx + marker.length)}
    </>
  );
}

function CategoryBlock({ category }) {
  const [headRef, headVisible] = useReveal();

  return (
    <div className="work-category">
      <div ref={headRef} className={`section-head reveal ${headVisible ? 'in' : ''}`}>
        <div>
          <span className="reel-tag">{category.reelTag}</span>
          <h2>{highlightWorldRecord(category.categoryTitle)}</h2>
        </div>
        {category.categoryDesc && (
          <p className="section-desc">{category.categoryDesc}</p>
        )}
      </div>

      <div className="work-grid">
        {category.items.map((project) => (
          <WorkCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}

export default function WorkGrid({ categories }) {
  return (
    <section className="block" id="work">
      <div className="wrap">
        {categories.map((category, i) => (
          <div
            key={category.id}
            className={i < categories.length - 1 ? 'work-category-spacer' : ''}
          >
            <CategoryBlock category={category} />
          </div>
        ))}
      </div>
    </section>
  );
}
