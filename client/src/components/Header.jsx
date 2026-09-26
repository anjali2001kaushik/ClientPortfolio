import { useState } from 'react';

export default function Header({ markInitials, markSuffix, onContactClick,instagram }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  const openContact = () => {
    close();
    onContactClick();
  };

  return (
    <header>
      <div className="mark">
        {markInitials}
        <span>·</span>
        {markSuffix}
      </div>

      <div
        className="nav-toggle"
        id="navToggle"
        role="button"
        aria-label="Toggle menu"
        aria-expanded={open}
        tabIndex={0}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') setOpen((v) => !v);
        }}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <nav className={open ? 'open' : ''}>

        {instagram && (
          <a
            className="instagram-header-link"
            href={instagram}
            target="_blank"
            rel="noreferrer"
            onClick={close}
          >
            Instagram
          </a>
        )}

        <a
          className="nav-link"
          href="#work"
          onClick={close}
        >
          Work
        </a>

        <a
          className="nav-link"
          href="#photography"
          onClick={close}
        >
          Photos
        </a>

        <a
          className="nav-link"
          href="#about"
          onClick={close}
        >
          About
        </a>

        <a
          className="nav-link"
          href="#contact"
          onClick={close}
        >
          Contact
        </a>

        <button
          className="cta-pill"
          onClick={openContact}
        >
          Let's Talk
        </button>

      </nav>
    </header>
  );
}
