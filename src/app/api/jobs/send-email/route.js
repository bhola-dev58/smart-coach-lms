import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

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

    if (process.env.RESEND_API_KEY) {
      // Send using Resend API (HTTP-based, works perfectly on Render free tier)
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: from || 'Gradify Academy <contact@gradify.academy>',
          to: Array.isArray(to) ? to : [to],
          subject: subject,
          html: html,
          reply_to: replyTo || undefined,
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.message || 'Resend API returned an error');
      }
    } else {
      // Fallback to Nodemailer/SMTP
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
    }

    return NextResponse.json({ success: true, message: `Email sent to ${to}` });
  } catch (error) {
    console.error('Email worker error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
