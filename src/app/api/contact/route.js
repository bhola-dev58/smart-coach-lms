import dns from 'dns';
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    // Configure the nodemailer transporter
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

    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_EMAIL || 'bhola.dev58@gmail.com'}>`, // Send from the authenticated email to avoid spam blocks
      replyTo: email, // Set the user's email as the reply-to address
      to: 'bhola.dev58@gmail.com', // Admin email receiving the message
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Message from Gradify Academy Contact Form</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr />
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
