import nodemailer from 'nodemailer';

// Konfigurasi Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Pastikan ada di .env
    pass: process.env.EMAIL_PASS, // Pastikan App Password ada di .env
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: '"Flux Notification" <no-reply@fluxapp.com>', // Ubah nama pengirim sesuai app
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};