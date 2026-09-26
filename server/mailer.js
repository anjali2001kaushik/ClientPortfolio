// Resend-based mailer.
// Uses HTTPS instead of SMTP, so it works with Render's outbound
// SMTP restrictions.

export const transporter = {
  async sendMail({ from, to, replyTo, subject, text, html }) {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM,
        to: Array.isArray(to) ? to : [to],
        reply_to: replyTo,
        subject,
        text,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend API error:', data);
      throw new Error(data?.message || 'Email sending failed');
    }

    return data;
  },
};