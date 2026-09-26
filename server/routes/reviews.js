import { Router } from 'express';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { transporter } from '../mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const REVIEWS_FILE = path.join(DATA_DIR, 'reviews.json');
const TESTIMONIALS_FILE = path.join(DATA_DIR, 'testimonials.json');

// Who has to click Approve/Reject before a brand review goes live.
// Set this in server/.env — see server/.env.example.
const APPROVER_EMAIL = process.env.REVIEW_APPROVER_EMAIL || process.env.CONTACT_RECEIVER || process.env.SMTP_USER;

// Base URL the Approve/Reject links in the email point back to. Must be
// a publicly reachable URL of THIS server (not the client), since the
// links are opened straight from an email client, not from the site.
const PUBLIC_SERVER_URL = (process.env.PUBLIC_SERVER_URL || `http://localhost:${process.env.PORT || 4000}`).replace(/\/$/, '');

const MAX_QUOTE_LENGTH = 240; // roughly the length of the existing testimonial copy
const MAX_WORDS = 40;

const router = Router();

// =====================
// JSON read/write helpers (this file owns reviews.json + testimonials.json)
// =====================
async function readJson(filePath, fallback) {
  try {
    const raw = await readFile(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    if (err.code === 'ENOENT') return fallback;
    throw err;
  }
}

async function writeJson(filePath, data) {
  await writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wordCount(str = '') {
  return str.trim().split(/\s+/).filter(Boolean).length;
}

function renderDecisionPage({ title, message, tone }) {
  // Tiny standalone HTML page shown after Bhavya taps Approve/Reject
  // from the email — no login, no dashboard, just a plain confirmation.
  const color = tone === 'good' ? '#2f8f4e' : tone === 'bad' ? '#b3413a' : '#8a6d1d';
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title)}</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background:#111; color:#eee; display:flex; align-items:center; justify-content:center; height:100vh; margin:0;">
    <div style="max-width:420px; text-align:center; padding:32px;">
      <h2 style="color:${color}; margin-bottom:12px;">${escapeHtml(title)}</h2>
      <p style="color:#bbb; line-height:1.6;">${escapeHtml(message)}</p>
    </div>
  </body>
</html>`;
}

// =====================
// POST /api/reviews — brand submits a review from the site
// =====================
router.post('/', async (req, res) => {
  const { name, brand, quote } = req.body || {};

  if (!name?.trim() || !brand?.trim() || !quote?.trim()) {
    return res.status(400).json({ error: 'Name, brand and review are required.' });
  }

  const trimmedQuote = quote.trim();

  if (trimmedQuote.length > MAX_QUOTE_LENGTH || wordCount(trimmedQuote) > MAX_WORDS) {
    return res.status(400).json({
      error: `Please keep the review under ${MAX_WORDS} words.`,
    });
  }

  const review = {
    id: crypto.randomUUID(),
    token: crypto.randomBytes(20).toString('hex'),
    name: name.trim(),
    brand: brand.trim(),
    quote: trimmedQuote,
    status: 'pending', // pending | approved | rejected
    createdAt: new Date().toISOString(),
  };

  try {
    const reviews = await readJson(REVIEWS_FILE, []);
    reviews.push(review);
    await writeJson(REVIEWS_FILE, reviews);
  } catch (err) {
    console.error('Failed to store review:', err.message);
    return res.status(500).json({ error: 'Could not save your review. Please try again later.' });
  }

  const approveUrl = `${PUBLIC_SERVER_URL}/api/reviews/${review.id}/approve?token=${review.token}`;
  const rejectUrl = `${PUBLIC_SERVER_URL}/api/reviews/${review.id}/reject?token=${review.token}`;

  try {
    await transporter.sendMail({
      from: `"Portfolio Reviews" <${process.env.SMTP_USER}>`,
      to: APPROVER_EMAIL,
      subject: `New brand review from ${review.brand} — approval needed`,
      html: `
        <h2>New review awaiting approval</h2>
        <p><strong>Brand / Company:</strong> ${escapeHtml(review.brand)}</p>
        <p><strong>Submitted by:</strong> ${escapeHtml(review.name)}</p>
        <h3>Review</h3>
        <p style="font-style:italic;">"${escapeHtml(review.quote)}"</p>
        <p>This will <strong>not</strong> appear on the site until you approve it.</p>
        <p>
          <a href="${approveUrl}" style="display:inline-block;padding:10px 20px;background:#2f8f4e;color:#fff;text-decoration:none;border-radius:4px;margin-right:12px;">Approve</a>
          <a href="${rejectUrl}" style="display:inline-block;padding:10px 20px;background:#b3413a;color:#fff;text-decoration:none;border-radius:4px;">Reject</a>
        </p>
      `,
    });
  } catch (err) {
    // The review is already saved as pending, so don't fail the request —
    // just log it. Bhavya can still be notified manually if mail is down.
    console.error('Failed to send review-approval email:', err.message);
  }

  res.status(201).json({
    ok: true,
    message: 'Thanks! Your review has been submitted and is awaiting approval.',
  });
});

// =====================
// GET /api/reviews/:id/approve — clicked from the approval email
// =====================
router.get('/:id/approve', async (req, res) => {
  await decide(req, res, 'approved');
});

// =====================
// GET /api/reviews/:id/reject — clicked from the approval email
// =====================
router.get('/:id/reject', async (req, res) => {
  await decide(req, res, 'rejected');
});

async function decide(req, res, decision) {
  const { id } = req.params;
  const { token } = req.query;

  try {
    const reviews = await readJson(REVIEWS_FILE, []);
    const review = reviews.find((r) => r.id === id);

    if (!review || review.token !== token) {
      return res.status(404).send(
        renderDecisionPage({
          title: 'Link not found',
          message: 'This approval link is invalid or has expired.',
          tone: 'bad',
        })
      );
    }

    if (review.status !== 'pending') {
      return res.send(
        renderDecisionPage({
          title: 'Already decided',
          message: `This review from ${review.brand} was already ${review.status}.`,
          tone: 'neutral',
        })
      );
    }

    review.status = decision;
    review.decidedAt = new Date().toISOString();
    await writeJson(REVIEWS_FILE, reviews);

    if (decision === 'approved') {
      const testimonials = await readJson(TESTIMONIALS_FILE, []);
      testimonials.push({
        quote: review.quote,
        name: review.name,
        role: review.brand,
      });
      await writeJson(TESTIMONIALS_FILE, testimonials);
    }

    res.send(
      renderDecisionPage({
        title: decision === 'approved' ? 'Review approved' : 'Review rejected',
        message:
          decision === 'approved'
            ? `The review from ${review.brand} is now live in the "Words From The Set" section.`
            : `The review from ${review.brand} has been rejected and will not be published.`,
        tone: decision === 'approved' ? 'good' : 'bad',
      })
    );
  } catch (err) {
    console.error(`Failed to ${decision} review:`, err.message);
    res.status(500).send(
      renderDecisionPage({
        title: 'Something went wrong',
        message: 'Could not process this action. Please try again.',
        tone: 'bad',
      })
    );
  }
}

export default router;
