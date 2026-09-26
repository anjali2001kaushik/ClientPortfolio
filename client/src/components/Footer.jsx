export default function Footer({ markInitials, markSuffix, social }) {
  const year = new Date().getFullYear();

  return (
    <footer>
      <div className="mark">
        {markInitials}
        <span>·</span>
        {markSuffix}
      </div>
      <div className="foot-links">
        {social.instagram && (
          <a href={social.instagram} target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
        )}
        {social.linkedin && (
          <a href={social.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        )}
        {social.vimeo && (
          <a href={social.vimeo} target="_blank" rel="noopener noreferrer">
            Vimeo
          </a>
        )}
      </div>
      <div className="copy">© {year} Bhavya Agrawal. All frames reserved.</div>
    </footer>
  );
}
