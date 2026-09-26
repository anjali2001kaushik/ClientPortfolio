import { Router } from 'express';
import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { transporter } from '../mailer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');

const router = Router();

// =====================
// Read JSON Helper
// =====================
async function readJson(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const raw = await readFile(filePath, 'utf-8');
  return JSON.parse(raw);
}


function route(filename) {
  return async (req, res) => {
    try {
      const data = await readJson(filename);
      res.json(data);
    } catch (err) {
      console.error(`Failed to load ${filename}:`, err.message);
      res.status(500).json({
        error: `Could not load ${filename}`,
      });
    }
  };
}

// =====================
// Content APIs
// =====================
router.get('/site', route('site.json'));
router.get('/work', route('work.json'));
router.get('/record', route('record.json'));
router.get('/about', route('about.json'));
router.get('/photography', route('photography.json'));

// =====================
// Bootstrap API
// =====================
router.get('/bootstrap', async (req, res) => {
  try {
    const [site, work, record, about, photography] = await Promise.all([
      readJson('site.json'),
      readJson('work.json'),
      readJson('record.json'),
      readJson('about.json'),
      readJson('photography.json'),
    ]);

    res.json({
      site,
      work,
      record,
      about,
      photography,
    });
  } catch (err) {
    console.error('Failed to bootstrap content:', err.message);
    res.status(500).json({
      error: 'Could not load site content',
    });
  }
});

// =====================
// Contact API
// =====================
router.post('/contact', async (req, res) => {
  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({
      error: 'Name, email and message are required.',
    });
  }

  try {
    // Email to you
    await transporter.sendMail({
      from: `"Portfolio Contact" <${process.env.SMTP_USER}>`,
      to: process.env.CONTACT_RECEIVER || process.env.SMTP_USER,
      replyTo: email,
      subject: `New Portfolio Contact from ${name}`,
      text: `
Name: ${name}
Email: ${email}

Message:
${message}
      `,
      html: `
        <h2>New Contact Message</h2>

        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>

        <h3>Message</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Confirmation email to visitor
    await transporter.sendMail({
      from: `"Bhavya Agrawal" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Thanks for reaching out!',
      html: `
        <h2>Thank You!</h2>

        <p>Hi ${name},</p>

        <p>Thank you for contacting me through my portfolio website.</p>

        <p>I have received your message and will get back to you as soon as possible.</p>

        <br>

        <p>Regards,</p>
        <strong>Bhavya Agrawal</strong>
      `,
    });

    res.json({
      ok: true,
      message: 'Message sent successfully.',
    });
  } catch (err) {
    console.error('Email sending failed:', err);

    res.status(500).json({
      ok: false,
      error: 'Unable to send your message. Please try again later.',
    });
  }
});

export default router;