import { useEffect, useRef, useState } from 'react';

const MAX_WORDS = 40;
const MAX_CHARS = 240;

const initialForm = { name: '', brand: '', quote: '' };

function wordCount(str) {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

export default function ReviewModal({ open, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const firstFieldRef = useRef(null);

  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setStatus('idle');
      setErrorMsg('');
      setTimeout(() => firstFieldRef.current?.focus(), 0);
    }
  }, [open]);

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

  const words = wordCount(form.quote);
  const overLimit = words > MAX_WORDS || form.quote.length > MAX_CHARS;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.brand.trim() || !form.quote.trim()) {
      setStatus('error');
      setErrorMsg('Please fill in every field.');
      return;
    }
    if (overLimit) {
      setStatus('error');
      setErrorMsg(`Please keep your review under ${MAX_WORDS} words.`);
      return;
    }

    setStatus('submitting');
    setErrorMsg('');

    try {
      const res = await fetch('/api/reviews', {
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
        aria-labelledby="review-modal-title"
      >
        <button className="modal-close" onClick={onClose} aria-label="Close">
          &times;
        </button>

        {status === 'success' ? (
          <div className="modal-success">
            <div className="eyebrow2" style={{ marginBottom: 14 }}>
              Review Submitted
            </div>
            <h3 id="review-modal-title" className="modal-title">
              Thank you!
            </h3>
            <p className="modal-success-text">
              Your review has been sent for approval. Once it's reviewed,
              it'll appear in the "Words From The Set" section.
            </p>
            <button className="btn-primary" type="button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <span className="reel-tag">For Brand Partners</span>
            <h3 id="review-modal-title" className="modal-title">
              Share your experience
            </h3>
            <p className="modal-sub">
              Worked with Bhavya on a shoot or campaign? Leave a short
              review — approved reviews get featured in "Words From The
              Set."
            </p>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="rm-name">
                  Your Name
                </label>
                <input
                  ref={firstFieldRef}
                  id="rm-name"
                  className="form-input"
                  type="text"
                  value={form.name}
                  onChange={handleChange('name')}
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rm-brand">
                  Brand / Company
                </label>
                <input
                  id="rm-brand"
                  className="form-input"
                  type="text"
                  value={form.brand}
                  onChange={handleChange('brand')}
                  autoComplete="organization"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="rm-quote">
                  Your Review
                </label>
                <textarea
                  id="rm-quote"
                  className="form-input form-textarea"
                  rows={4}
                  maxLength={MAX_CHARS}
                  value={form.quote}
                  onChange={handleChange('quote')}
                  placeholder="Keep it short and specific — this is what visitors will read."
                />
                <div
                  className="form-counter"
                  style={{ color: overLimit ? 'var(--gold, #b3413a)' : undefined }}
                >
                  {words}/{MAX_WORDS} words
                </div>
              </div>

              {status === 'error' && (
                <div className="form-error">{errorMsg}</div>
              )}

              <button
                className="btn-primary modal-submit"
                type="submit"
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
