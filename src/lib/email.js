// ============================================================
// 📧 EMAIL SERVICE — src/lib/email.js
// Uses Resend API for all transactional emails.
// All email types are defined here as named exports.
// ============================================================
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_dummyKey12345678901234567890');
const FROM = 'Gradify Academy <contact@gradify.academy>';
const BASE_URL = process.env.NEXTAUTH_URL || 'https://gradify.academy';

// ─────────────────────────────────────────────────
// Helper: wrap content in branded HTML shell
// ─────────────────────────────────────────────────
function brandedHtml(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Arial, sans-serif; background: #f4f6fb; color: #1a1a2e; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 40px; text-align: center; }
    .header img { height: 44px; width: auto; }
    .header h1 { color: #fff; font-size: 22px; margin: 12px 0 4px; font-weight: 700; letter-spacing: -0.3px; }
    .header p { color: rgba(255,255,255,0.82); font-size: 14px; margin: 0; }
    .body { padding: 36px 40px; }
    .body p { font-size: 15px; line-height: 1.7; color: #374151; margin: 0 0 16px; }
    .otp-box { background: linear-gradient(135deg, #ede9fe, #ddd6fe); border-radius: 12px; padding: 28px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 44px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; font-family: 'Courier New', monospace; }
    .otp-note { font-size: 12px; color: #6b7280; margin-top: 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #4f46e5, #7c3aed); color: #fff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; margin: 16px 0; }
    .highlight-box { background: #f0fdf4; border-left: 4px solid #22c55e; border-radius: 0 8px 8px 0; padding: 16px 20px; margin: 20px 0; }
    .highlight-box p { margin: 0; color: #166534; font-size: 14px; }
    .course-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 20px 24px; margin: 20px 0; }
    .course-card .course-title { font-size: 18px; font-weight: 700; color: #1a1a2e; margin: 0 0 6px; }
    .course-card .course-meta { font-size: 13px; color: #6b7280; margin: 0; }
    .footer { background: #f9fafb; padding: 24px 40px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 12px; color: #9ca3af; margin: 4px 0; }
    .footer a { color: #4f46e5; text-decoration: none; }
    .divider { height: 1px; background: #e5e7eb; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🎓 Gradify Academy</h1>
      <p>From Concepts to Creation</p>
    </div>
    <div class="body">${bodyHtml}</div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Gradify Academy. All rights reserved.</p>
      <p><a href="${BASE_URL}">gradify.academy</a> · <a href="mailto:contact@gradify.academy">contact@gradify.academy</a> · <a href="tel:+918874270707">+91-8874270707</a></p>
      <p style="margin-top:8px; font-size:11px; color:#d1d5db;">You received this because you have an account at Gradify Academy.</p>
    </div>
  </div>
</body>
</html>`;
}

// ─────────────────────────────────────────────────
// 1️⃣  OTP — Email Verification
// ─────────────────────────────────────────────────
export async function sendOTPEmail(to, name, otp) {
  const html = brandedHtml('Verify Your Email — Gradify Academy', `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Welcome to <strong>Gradify Academy</strong>! 🎉 To activate your account, please verify your email address using the one-time password below:</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <div class="otp-note">This code expires in <strong>10 minutes</strong>. Do not share it with anyone.</div>
    </div>
    <p>If you did not create an account, please ignore this email — no action is needed.</p>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${otp} — Your Gradify Academy Verification Code`,
    html,
  });
}

// ─────────────────────────────────────────────────
// 2️⃣  Welcome Email — After Verification
// ─────────────────────────────────────────────────
export async function sendWelcomeEmail(to, name) {
  const html = brandedHtml('Welcome to Gradify Academy! 🚀', `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Your email has been <strong>successfully verified</strong>! 🎉 You're now a verified member of Gradify Academy.</p>
    <div class="highlight-box">
      <p>✅ Your account is active and ready to use. Start exploring courses today!</p>
    </div>
    <p>Here's what you can do next:</p>
    <ul style="font-size:15px; line-height:1.8; color:#374151; padding-left:20px;">
      <li>Browse our curated course library</li>
      <li>Enroll in your first course</li>
      <li>Join live sessions with expert instructors</li>
      <li>Track your progress and earn certificates</li>
    </ul>
    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/lms/browse" class="btn">🎓 Explore Courses</a>
    </div>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: '🎉 Welcome to Gradify Academy — Account Verified!',
    html,
  });
}

// ─────────────────────────────────────────────────
// 3️⃣  Enrollment Confirmation
// ─────────────────────────────────────────────────
export async function sendEnrollmentConfirmation(to, name, courseName, courseSlug) {
  const courseUrl = `${BASE_URL}/lms/course/${courseSlug}`;
  const html = brandedHtml(`Enrolled: ${courseName}`, `
    <p>Hi <strong>${name}</strong>,</p>
    <p>Congratulations! 🎊 You have been <strong>successfully enrolled</strong> in the following course:</p>
    <div class="course-card">
      <div class="course-title">📚 ${courseName}</div>
      <div class="course-meta">Enrolled on ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
    </div>
    <div class="highlight-box">
      <p>✅ You now have full access to all lessons, study materials, and live sessions for this course.</p>
    </div>
    <p>Ready to start learning?</p>
    <div style="text-align:center; margin-top:24px;">
      <a href="${courseUrl}" class="btn">▶ Start Learning Now</a>
    </div>
    <div class="divider"></div>
    <p style="font-size:13px; color:#6b7280;">Need help? Reply to this email or contact us at <a href="mailto:contact@gradify.academy" style="color:#4f46e5;">contact@gradify.academy</a></p>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: `✅ Successfully Enrolled: ${courseName}`,
    html,
  });
}

// ─────────────────────────────────────────────────
// 4️⃣  New Course Launched — Broadcast
// ─────────────────────────────────────────────────
export async function sendNewCourseLaunchEmail(recipients, courseName, courseSlug, description = '') {
  if (!recipients?.length) return;
  const courseUrl = `${BASE_URL}/lms/course/${courseSlug}`;
  const html = brandedHtml(`New Course: ${courseName}`, `
    <p>Hi there,</p>
    <p>🚀 We've just launched an exciting new course at Gradify Academy:</p>
    <div class="course-card">
      <div class="course-title">🆕 ${courseName}</div>
      ${description ? `<p class="course-meta" style="margin-top:8px;">${description}</p>` : ''}
    </div>
    <p>Be one of the first students to enroll and get ahead!</p>
    <div style="text-align:center; margin-top:24px;">
      <a href="${courseUrl}" class="btn">🔍 View Course Details</a>
    </div>
  `);

  // Batch send — Resend supports single recipient per email for compliance
  const sendPromises = recipients.map(email =>
    resend.emails.send({ from: FROM, to: email, subject: `🚀 New Course Launched: ${courseName}`, html })
      .catch(err => console.error(`[Email] Failed to send to ${email}:`, err.message))
  );
  return Promise.allSettled(sendPromises);
}

// ─────────────────────────────────────────────────
// 5️⃣  Announcement Broadcast
// ─────────────────────────────────────────────────
export async function sendAnnouncementEmail(recipients, announcementTitle, announcementBody) {
  if (!recipients?.length) return;
  const html = brandedHtml(`Announcement: ${announcementTitle}`, `
    <p>Hi there,</p>
    <p>📢 An important announcement from <strong>Gradify Academy</strong>:</p>
    <div class="course-card" style="border-left:4px solid #4f46e5; border-radius:0 8px 8px 0;">
      <div class="course-title" style="font-size:16px;">${announcementTitle}</div>
      <p style="margin:12px 0 0; font-size:14px; line-height:1.7; color:#374151;">${announcementBody}</p>
    </div>
    <div style="text-align:center; margin-top:24px;">
      <a href="${BASE_URL}/lms" class="btn">🏠 Go to My Dashboard</a>
    </div>
  `);

  const sendPromises = recipients.map(email =>
    resend.emails.send({ from: FROM, to: email, subject: `📢 Announcement: ${announcementTitle}`, html })
      .catch(err => console.error(`[Email] Failed to send to ${email}:`, err.message))
  );
  return Promise.allSettled(sendPromises);
}

// ─────────────────────────────────────────────────
// 6️⃣  New Login Alert
// ─────────────────────────────────────────────────
export async function sendLoginAlert(to, name, ipInfo = '') {
  const html = brandedHtml('New Login Detected', `
    <p>Hi <strong>${name}</strong>,</p>
    <p>A new login was detected on your Gradify Academy account.</p>
    <div class="course-card">
      <p style="margin:0; font-size:14px;"><strong>Time:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      ${ipInfo ? `<p style="margin:8px 0 0; font-size:14px;"><strong>Location/IP:</strong> ${ipInfo}</p>` : ''}
    </div>
    <p>If this was you, no action is needed. If you did not log in, please <a href="${BASE_URL}/?auth=login" style="color:#4f46e5;font-weight:600;">reset your password immediately</a>.</p>
  `);

  return resend.emails.send({
    from: FROM,
    to,
    subject: '🔐 New Login to Your Gradify Academy Account',
    html,
  });
}
