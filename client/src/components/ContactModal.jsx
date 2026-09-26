import { useEffect, useRef, useState } from 'react';

const initialForm = { name: '', email: '', message: '' };

export default function ContactModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const firstFieldRef = useRef(null);

  // Reset to a clean form each time the modal is opened, and move
  // focus into it for keyboard/screen-reader users.
  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setStatus('idle');
      setErrorMsg('');
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open]);

  // Close on Escape, and lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleChange = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in every field.');
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || data.ok === false) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div
      className="modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-box"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-modal-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="eyebrow2" style={{ marginBottom: 14 }}>
              Message Sent
            </div>
            <h3 id="contact-modal-title" className="modal-title">
              Thank you!
            </h3>
            <p className="modal-success-text">
              Thanks for reaching out — I've received your message and will
              get back to you soon. A confirmation email is on its way to
              your inbox too.
            </p>
            <button className="btn-primary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <span className="reel-tag">Get In Touch</span>
            <h3 id="contact-modal-title" className="modal-title">
              Let's talk
            </h3>
            <p className="modal-sub">
              Tell me a bit about the project — I'll get back to you within
              48 hours.
            </p>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="cm-name">
                  Name
                </label>
                <input
                  ref={firstFieldRef}
                  id="cm-name"
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cm-email">
                  Email
                </label>
                <input
                  id="cm-email"
                  className="form-input"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="cm-message">
                  Message
                </label>
                <textarea
                  id="cm-message"
                  className="form-input form-textarea"
                  rows={4}
                  value={form.message}
                  onChange={handleChange('message')}
                />
              </div>

              {status === 'error' && (
                <div className="form-error">{errorMsg}</div>
              )}

              <button
                className="btn-primary modal-submit"
                type="submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
