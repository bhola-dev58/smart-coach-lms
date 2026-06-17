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

    if (process.env.RESEND_API_KEY) {
      // 1. Send notification email to the admin
      const adminRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Gradify Academy <contact@gradify.academy>', // Resend verified sender domain
          reply_to: email, // Set the submitter's email as the reply-to address
          to: [process.env.SMTP_EMAIL || 'contact@gradify.academy'], // Admin email receiving the message
          subject: `New Contact Form Submission: ${subject}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
              <div style="background-color: #27AE60; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0; font-size: 24px;">New Contact Submission</h2>
              </div>
              <div style="padding: 24px; color: #333333; line-height: 1.6;">
                <p>You have received a new message from the contact form on your website.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; width: 120px; border-bottom: 1px solid #eeeeee;">Name:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eeeeee;">Email:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;"><a href="mailto:${email}">${email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eeeeee;">Phone:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">${phone || 'Not provided'}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: bold; border-bottom: 1px solid #eeeeee;">Subject:</td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #eeeeee;">${subject}</td>
                  </tr>
                </table>
                <h3 style="margin-top: 25px; margin-bottom: 10px; color: #27AE60;">Message:</h3>
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #27AE60; border-radius: 4px; font-style: italic; white-space: pre-line;">${message}</div>
                <p style="margin-top: 25px; font-size: 13px; color: #666666; text-align: center;">Click "Reply" in your email client to reply directly to the visitor.</p>
              </div>
            </div>
          `,
        }),
      });

      const adminResData = await adminRes.json();
      if (!adminRes.ok) {
        throw new Error(adminResData.message || 'Resend failed sending to admin');
      }

      // 2. Send automated thank-you email to the visitor
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: 'Gradify Academy <contact@gradify.academy>',
            to: [email],
            subject: 'We received your message - Gradify Academy',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                <div style="background-color: #27AE60; padding: 25px; text-align: center; color: white;">
                  <h2 style="margin: 0; font-size: 24px; letter-spacing: 0.5px;">Gradify Academy</h2>
                  <p style="margin: 5px 0 0 0; opacity: 0.9; font-size: 14px;">From Concepts to Creation</p>
                </div>
                <div style="padding: 24px; color: #333333; line-height: 1.6;">
                  <p style="font-size: 16px; font-weight: bold; margin-top: 0;">Hello ${name},</p>
                  <p>Thank you for reaching out to us. We have successfully received your message regarding <strong>"${subject}"</strong>.</p>
                  <p>Our team is currently reviewing your inquiry, and we will get back to you with a response within <strong>4 hours</strong>.</p>
                  
                  <div style="margin: 25px 0; padding: 15px; background-color: #f9f9f9; border-radius: 6px; font-size: 14px; color: #555555;">
                    <strong>Your message summary:</strong><br/>
                    <span style="font-style: italic;">"${message.length > 150 ? message.substring(0, 150) + '...' : message}"</span>
                  </div>

                  <p>In the meantime, feel free to explore our <a href="https://gradify.academy/courses" style="color: #27AE60; text-decoration: underline; font-weight: bold;">Courses</a> or learn more <a href="https://gradify.academy/about" style="color: #27AE60; text-decoration: underline; font-weight: bold;">About Us</a>.</p>
                  
                  <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;" />
                  
                  <p style="font-size: 12px; color: #777777; margin-bottom: 0;">
                    This is an automated confirmation email. Please do not reply directly to this message. 
                    If you need to add details to your inquiry, please write to us at <a href="mailto:contact@gradify.academy" style="color: #27AE60;">contact@gradify.academy</a>.
                  </p>
                </div>
                <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #777777; border-top: 1px solid #eeeeee;">
                  &copy; ${new Date().getFullYear()} Gradify Academy. All rights reserved.
                </div>
              </div>
            `,
          }),
        });
      } catch (visitorError) {
        // We log the error but don't fail the request, as sending the email to the admin is the primary goal
        console.error('Failed to send auto-reply to visitor:', visitorError);
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

      const mailOptions = {
        from: `"${name}" <${process.env.SMTP_EMAIL || 'bhola.dev58@gmail.com'}>`, // Send from the authenticated email to avoid spam blocks
        replyTo: email, // Set the user's email as the reply-to address
        to: process.env.SMTP_EMAIL || 'contact@gradify.academy', // Admin email receiving the message
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

      // Automated thank-you fallback
      try {
        const userMailOptions = {
          from: `"Gradify Academy" <${process.env.SMTP_EMAIL || 'contact@gradify.academy'}>`,
          to: email,
          subject: 'We received your message - Gradify Academy',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #27AE60; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">Gradify Academy</h2>
              </div>
              <div style="padding: 24px; color: #333333; line-height: 1.6;">
                <p>Hello ${name},</p>
                <p>Thank you for reaching out to us. We have successfully received your message regarding "${subject}".</p>
                <p>Our team is currently reviewing your inquiry, and we will get back to you within 4 hours.</p>
                <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 25px 0;" />
                <p style="font-size: 12px; color: #777777;">This is an automated confirmation email. Please do not reply directly to this message.</p>
              </div>
            </div>
          `,
        };
        await transporter.sendMail(userMailOptions);
      } catch (fallbackVisitorError) {
        console.error('Failed to send fallback auto-reply to visitor:', fallbackVisitorError);
      }
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
