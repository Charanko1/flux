// File: lib/email.ts
import nodemailer from 'nodemailer';

// Konfigurasi Transporter (Ganti dengan SMTP kamu)
const transporter = nodemailer.createTransport({
  service: 'gmail', // atau host: 'smtp.mailtrap.io', dsb
  auth: {
    user: process.env.EMAIL_USER, // Masukkan di .env
    pass: process.env.EMAIL_PASS, // Masukkan di .env
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    await transporter.sendMail({
      from: '"Task Manager" <no-reply@taskmanager.com>',
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
};