export default function GrainOverlay() {
  return (
    <>
      <svg width="0" height="0">
        <filter id="noiseFilter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.85"
            numOctaves="2"
            stitchTiles="stitch"
          />
        </filter>
      </svg>
      <div className="grain" style={{ background: 'url(#noiseFilter)' }} />
      <div className="vignette" />
    </>
  );
}
