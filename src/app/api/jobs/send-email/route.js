import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// ============================================
// 📧 BACKGROUND EMAIL WORKER
// Receives jobs from QStash or inline dispatch
// and sends emails via nodemailer
// ============================================

export async function POST(request) {
  try {
    const { to, subject, html, from, replyTo } = await request.json();

    if (!to || !subject || !html) {
      return NextResponse.json({ success: false, error: 'Missing required fields: to, subject, html' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport(
      process.env.SMTP_HOST
        ? {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '465', 10),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
              user: process.env.SMTP_EMAIL,
              pass: process.env.SMTP_PASSWORD,
            },
          }
        : {
            service: 'gmail',
            auth: {
              user: process.env.SMTP_EMAIL || 'bhola.dev58@gmail.com',
              pass: process.env.SMTP_PASSWORD,
            },
          }
    );

    await transporter.sendMail({
      from: from || `"Gradify Academy" <${process.env.SMTP_EMAIL || 'bhola.dev58@gmail.com'}>`,
      replyTo: replyTo || undefined,
      to,
      subject,
      html,
    });

    return NextResponse.json({ success: true, message: `Email sent to ${to}` });
  } catch (error) {
    console.error('Email worker error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
