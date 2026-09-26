export default function Marquee({ items }) {
  // Duplicate the list so the CSS animation (-50% translateX) loops seamlessly.
  const loop = [...items, ...items];
  const withDots = loop.flatMap((item, i) => {
    const label = <span key={`item-${i}`}>{item}</span>;
    const dot = i < loop.length - 1 ? <span key={`dot-${i}`}>&middot;</span> : null;
    return dot ? [label, dot] : [label];
  });

  return (
    <div className="marquee-section">
      <div className="marquee-track">{withDots}</div>
    </div>
  );
}
