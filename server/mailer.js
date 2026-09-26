import nodemailer from 'nodemailer';

// Single shared SMTP transporter, used by both the contact form
// (routes/api.js) and the brand-review workflow (routes/reviews.js).
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});
