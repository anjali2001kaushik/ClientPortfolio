import { useState } from 'react';
import { useReveal } from '../hooks/useReveal.js';
import { useTilt } from '../hooks/useTilt.js';

function getYoutubeEmbedUrl(url) {
  if (!url) return '';

  const videoId =
    url.match(/youtu\.be\/([^?&#/]+)/)?.[1] ||
    url.match(/[?&]v=([^&#]+)/)?.[1];

  return videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`
    : '';
}

export default function WorkCard({ project }) {
  const [isPlaying, setIsPlaying] = useState(false);

  const [revealRef, visible] = useReveal();
  const tiltRef = useTilt({ max: 9, lift: 1.02 });
  const mediaUrl = project.thumbnail || project.imageUrl;

  const classes = [
    'work-card',
    `c-span-${project.span}`,
    project.tall ? 'tall' : '',
    'reveal-3d',
    visible ? 'in' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const setRefs = (node) => {
    revealRef.current = node;
    tiltRef.current = node;
  };

  return (
    <div ref={setRefs} className={classes}>
      {isPlaying && project.videoUrl ? (
        <div className="video-container">
          <div className="video-player">
            <iframe
              src={getYoutubeEmbedUrl(project.videoUrl)}
              title={project.title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>

          <button
            type="button"
            className="close-video"
            onClick={() => setIsPlaying(false)}
            aria-label={`Close ${project.title}`}
          >
            ×
          </button>
        </div>
      ) : (
        <>
<div
  className="frame"
  style={
    mediaUrl
      ? {
          backgroundImage: `
            linear-gradient(
              0deg,
              rgba(0,0,0,0.55),
              rgba(0,0,0,0.05)
            ),
            url(${mediaUrl})
          `,
        }
      : undefined
  }
/>

          <div className="tilt-glare" />

          {project.letterbox && (
            <>
              <div className="letterbox-top" />
              <div className="letterbox-bottom" />
            </>
          )}

          {project.videoUrl && (
            <button
              type="button"
              className="play-btn"
              onClick={() => setIsPlaying(true)}
              aria-label={`Play ${project.title}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </button>
          )}

          <div className="work-meta">
            <h3>{project.title}</h3>

            <div className="spec">
              {project.category}
              <br />
              {project.spec}
            </div>
          </div>
        </>
      )}
    </div>
  );
}