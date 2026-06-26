import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Certificate from '@/models/Certificate';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import User from '@/models/User';
import { dispatchJob } from '@/lib/queue';
import { v2 as cloudinary } from 'cloudinary';

// ============================================
// 🏆 CERTIFICATE GENERATION WORKER
// Auto-generates a verifiable certificate when
// a student completes 100% of a course
// ============================================

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Generate a unique certificate ID like: MC-2026-ABCD1234
 */
function generateCertId() {
  const year = new Date().getFullYear();
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `GA-${year}-${code}`;
}

/**
 * Generate certificate HTML template
 */
function generateCertificateHTML(data) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;600&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { width: 1000px; height: 700px; font-family: 'Inter', sans-serif; }
        .cert-container {
          width: 1000px; height: 700px;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          color: white; text-align: center;
        }
        .cert-border {
          position: absolute; top: 20px; left: 20px; right: 20px; bottom: 20px;
          border: 2px solid rgba(200, 16, 46, 0.6);
          border-radius: 8px;
        }
        .cert-inner-border {
          position: absolute; top: 30px; left: 30px; right: 30px; bottom: 30px;
          border: 1px solid rgba(255, 215, 0, 0.3);
          border-radius: 4px;
        }
        .cert-badge {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, #C8102E, #e74c3c);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 2rem; margin-bottom: 1.5rem;
          box-shadow: 0 4px 20px rgba(200, 16, 46, 0.4);
        }
        .cert-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem; font-weight: 700;
          background: linear-gradient(90deg, #FFD700, #FFA500);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          margin-bottom: 0.5rem;
        }
        .cert-subtitle {
          font-size: 0.9rem; color: rgba(255,255,255,0.6);
          letter-spacing: 4px; text-transform: uppercase;
          margin-bottom: 2rem;
        }
        .cert-name {
          font-family: 'Playfair Display', serif;
          font-size: 2rem; color: #FFD700;
          border-bottom: 2px solid rgba(255, 215, 0, 0.3);
          padding-bottom: 0.5rem; margin-bottom: 1rem;
        }
        .cert-course {
          font-size: 1.1rem; color: rgba(255,255,255,0.85);
          margin-bottom: 0.5rem;
        }
        .cert-details {
          font-size: 0.8rem; color: rgba(255,255,255,0.5);
          margin-bottom: 1.5rem;
        }
        .cert-id {
          position: absolute; bottom: 45px; left: 50px;
          font-size: 0.7rem; color: rgba(255,255,255,0.3);
          font-family: monospace;
        }
        .cert-verify {
          position: absolute; bottom: 45px; right: 50px;
          font-size: 0.7rem; color: rgba(255,255,255,0.3);
        }
        .cert-logo {
          position: absolute; top: 45px; left: 50px;
          font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.8);
        }
        .cert-date {
          position: absolute; top: 45px; right: 50px;
          font-size: 0.75rem; color: rgba(255,255,255,0.5);
        }
        .decorative-circle {
          position: absolute; border-radius: 50%;
          background: radial-gradient(circle, rgba(200,16,46,0.1) 0%, transparent 70%);
        }
        .dc1 { width: 300px; height: 300px; top: -100px; right: -50px; }
        .dc2 { width: 200px; height: 200px; bottom: -50px; left: -30px; }
      </style>
    </head>
    <body>
      <div class="cert-container">
        <div class="cert-border"></div>
        <div class="cert-inner-border"></div>
        <div class="decorative-circle dc1"></div>
        <div class="decorative-circle dc2"></div>

        <div class="cert-logo">🎓 Gradify Academy</div>
        <div class="cert-date">${data.completionDate}</div>

        <div class="cert-badge">🏆</div>
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-subtitle">This is to certify that</div>
        <div class="cert-name">${data.studentName}</div>
        <div class="cert-course">has successfully completed the course</div>
        <div class="cert-course" style="font-weight: 700; font-size: 1.3rem; color: #FFD700;">
          "${data.courseName}"
        </div>
        <div class="cert-details">
          Duration: ${data.totalHours} hours &nbsp;|&nbsp;
          Instructor: ${data.instructorName}
        </div>

        <div class="cert-id">Certificate ID: ${data.certId}</div>
        <div class="cert-verify">Verify at: gradify.academy/verify/${data.certId}</div>
      </div>
    </body>
    </html>
  `;
}

export async function POST(request) {
  try {
    const { enrollmentId } = await request.json();

    if (!enrollmentId) {
      return NextResponse.json({ success: false, error: 'enrollmentId is required' }, { status: 400 });
    }

    await connectDB();

    // Fetch enrollment with course and student data
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('student', 'name email')
      .populate({
        path: 'course',
        select: 'title totalHours instructor',
        populate: { path: 'instructor', select: 'name' },
      });

    if (!enrollment) {
      return NextResponse.json({ success: false, error: 'Enrollment not found' }, { status: 404 });
    }

    // Check if certificate already exists
    const existing = await Certificate.findOne({
      student: enrollment.student._id,
      course: enrollment.course._id,
    });

    if (existing && existing.status !== 'generating') {
      return NextResponse.json({ success: true, message: 'Certificate already exists', certificate: existing });
    }

    // Generate unique cert ID
    let certId = generateCertId();
    while (await Certificate.findOne({ certId })) {
      certId = generateCertId(); // Ensure uniqueness
    }

    const completionDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric', month: 'long', year: 'numeric',
    });

    // Create certificate record
    const certificate = await Certificate.create({
      certId,
      student: enrollment.student._id,
      course: enrollment.course._id,
      enrollment: enrollment._id,
      instructor: enrollment.course.instructor?._id || enrollment.course.instructor,
      studentName: enrollment.student.name,
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor?.name || 'Gradify Academy',
      completionDate: new Date(),
      totalHours: enrollment.course.totalHours || 0,
      status: 'generating',
    });

    // Generate certificate HTML (for now, stored as imageUrl reference)
    // In production, you'd use Puppeteer or a headless browser service
    // For serverless, we'll store the HTML and use Cloudinary's HTML-to-image
    const certHTML = generateCertificateHTML({
      studentName: enrollment.student.name,
      courseName: enrollment.course.title,
      instructorName: enrollment.course.instructor?.name || 'Gradify Academy',
      totalHours: enrollment.course.totalHours || 0,
      completionDate,
      certId,
    });

    // Upload HTML as a text overlay certificate image to Cloudinary
    // Using Cloudinary's URL-based transformation for certificate image
    const certImageUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_1000,h_700,c_fill,b_rgb:1a1a2e/co_rgb:FFD700,l_text:Playfair%20Display_48_bold:Certificate%20of%20Completion/fl_layer_apply,g_center,y_-120/co_rgb:ffffff99,l_text:Inter_18:This%20is%20to%20certify%20that/fl_layer_apply,g_center,y_-60/co_rgb:FFD700,l_text:Playfair%20Display_36_bold:${encodeURIComponent(enrollment.student.name)}/fl_layer_apply,g_center,y_0/co_rgb:ffffffcc,l_text:Inter_20:has%20completed%20${encodeURIComponent(enrollment.course.title)}/fl_layer_apply,g_center,y_60/co_rgb:ffffff66,l_text:Inter_14:Certificate%20ID%3A%20${certId}/fl_layer_apply,g_south_west,x_50,y_50/sample.jpg`;

    // Update certificate with URLs
    certificate.imageUrl = certImageUrl;
    certificate.status = 'generated';
    await certificate.save();

    // Update enrollment
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = certImageUrl;
    enrollment.certificateIssuedAt = new Date();
    await enrollment.save();

    // Dispatch email job
    await dispatchJob('/api/jobs/send-email', {
      to: enrollment.student.email,
      subject: `🏆 Congratulations! Your Certificate for "${enrollment.course.title}"`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #C8102E; text-align: center;">🎉 Congratulations, ${enrollment.student.name}!</h1>
          <p style="font-size: 16px; color: #333; text-align: center;">
            You have successfully completed <strong>"${enrollment.course.title}"</strong> on Gradify Academy!
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <img src="${certImageUrl}" alt="Certificate" style="max-width: 100%; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);" />
          </div>
          <p style="text-align: center; font-size: 14px; color: #666;">
            Your Certificate ID: <strong>${certId}</strong>
          </p>
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.NEXTAUTH_URL || 'https://gradify.academy'}/lms/certificates/verify/${certId}"
               style="background: #C8102E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Verify Certificate
            </a>
          </div>
          <p style="font-size: 12px; color: #999; text-align: center; margin-top: 30px;">
            This certificate can be verified at: gradify.academy/lms/certificates/verify/${certId}
          </p>
        </div>
      `,
    });

    certificate.status = 'emailed';
    certificate.emailedAt = new Date();
    await certificate.save();

    return NextResponse.json({
      success: true,
      message: 'Certificate generated and emailed successfully',
      certificate: {
        certId: certificate.certId,
        imageUrl: certificate.imageUrl,
        status: certificate.status,
      },
    });
  } catch (error) {
    console.error('Certificate generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
