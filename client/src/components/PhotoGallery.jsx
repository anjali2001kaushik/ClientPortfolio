import { useEffect, useState } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useTilt } from '../hooks/useTilt.js';

function PhotoCard({ img, onOpen }) {
  const tiltRef = useTilt({ max: 8, lift: 1.02 });
  const mediaUrl = img.imageUrl;

  return (
    <button
      ref={tiltRef}
      className="photo-card"
      type="button"
      onClick={() => mediaUrl && onOpen(img)}
    >
      <img
        className="photo-image"
        src={mediaUrl}
        alt={img.title || img.filename || 'Portfolio photograph'}
        loading="lazy"
      />

      <div className="tilt-glare" />

      {!mediaUrl && (
        <div className="photo-filename">
          {img.filename}
        </div>
      )}

      {mediaUrl && (
        <span className="photo-open-hint">
          View
        </span>
      )}
    </button>
  );
}

function Lightbox({ image, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  if (!image) return null;

  return (
    <div
      className="photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={image.title || 'Photo preview'}
      onClick={onClose}
    >
      <button
        className="photo-lightbox-close"
        type="button"
        onClick={onClose}
        aria-label="Close photo"
      >
        ×
      </button>

      <img
        src={image.imageUrl}
        alt={image.title || 'Portfolio photograph'}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function Gallery({ gallery, onOpen }) {
  const [ref, visible] = useReveal();
  const [expanded, setExpanded] = useState(false);

  const initialCount = gallery.initialCount || 6;

  const hasMore =
    gallery.images.length > initialCount;

  const images = expanded
    ? gallery.images
    : gallery.images.slice(0, initialCount);

  return (
    <div className="photo-gallery-group">

      <div className="photo-gallery-head">
        <h3>{gallery.title}</h3>

        {hasMore && (
          <span className="photo-count">
            {gallery.images.length} photos
          </span>
        )}
      </div>

      <div
        ref={ref}
        className={`photo-grid reveal ${
          visible ? 'in' : ''
        }`}
      >
        {images.map((img) => (
          <PhotoCard
            key={img.id}
            img={img}
            onOpen={onOpen}
          />
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className="photo-more-btn"
          onClick={() => setExpanded((v) => !v)}
        >
          {expanded
            ? 'Show Less'
            : `View More (${gallery.images.length - initialCount} more)`}
        </button>
      )}

    </div>
  );
}

export default function PhotoGallery({ photography }) {
  const [headRef, headVisible] = useReveal();
  const [activeImage, setActiveImage] = useState(null);

  return (
    <section className="block" id="photography">

      <div className="wrap">

        <div
          ref={headRef}
          className={`section-head reveal ${
            headVisible ? 'in' : ''
          }`}
        >
          <div>
            <span className="reel-tag">
            
            </span>

            <h2>{photography.title}</h2>
          </div>

          <p className="section-desc">
            {photography.description}
          </p>
        </div>

        {photography.galleries.map((gallery) => (
          <Gallery
            key={gallery.id}
            gallery={gallery}
            onOpen={setActiveImage}
          />
        ))}

      </div>

      <Lightbox
        image={activeImage}
        onClose={() => setActiveImage(null)}
      />

    </section>
  );
}