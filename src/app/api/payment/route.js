import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Enrollment from '@/models/Enrollment';
import crypto from 'crypto';

// POST /api/payment — Create a Razorpay order
export async function POST(request) {
  try {
    // ── Auth Check ──
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Please login first' }, { status: 401 });
    }

    // ── Razorpay Key Check ──
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      console.error('❌ Razorpay keys missing in .env.local');
      return NextResponse.json({
        success: false,
        error: 'Payment gateway is not configured. Please contact support.',
      }, { status: 503 });
    }

    await connectDB();
    const { courseId, batchId, batchName } = await request.json();

    if (!courseId) {
      return NextResponse.json({ success: false, error: 'courseId is required' }, { status: 400 });
    }

    const Course = (await import('@/models/Course')).default;
    const course = await Course.findById(courseId).lean();
    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    // Validate batch belongs to course if provided
    if (batchId && batchId.trim() !== '') {
      const Batch = (await import('@/models/Batch')).default;
      const batchExists = await Batch.findOne({ _id: batchId, course: courseId });
      if (!batchExists) {
        return NextResponse.json({ success: false, error: 'Invalid batch for this course' }, { status: 400 });
      }
    }

    // ── Check if already active/completed enrolled ──
    const existingEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
      status: { $in: ['active', 'completed'] },
    });

    if (existingEnrollment) {
      return NextResponse.json({
        success: false,
        error: 'You are already enrolled in this course!',
      }, { status: 409 });
    }

    // ── Check if expired enrollment exists for 50% discount ──
    const expiredEnrollment = await Enrollment.findOne({
      student: session.user.id,
      course: courseId,
      status: 'expired'
    });

    // 50% discount if expired, otherwise regular price
    const finalPrice = expiredEnrollment ? Math.round(course.price * 0.5) : course.price;

    // ── Create Razorpay Order ──
    // Dynamic import to handle cases where razorpay package might not work
    let Razorpay;
    try {
      Razorpay = (await import('razorpay')).default;
    } catch (importErr) {
      console.error('❌ Razorpay package import failed:', importErr.message);
      return NextResponse.json({
        success: false,
        error: 'Payment gateway unavailable. Please try again later.',
      }, { status: 503 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(finalPrice * 100), // Razorpay uses paise (₹499 = 49900)
        currency: 'INR',
        receipt: `rcpt_${courseId.slice(-6)}_${Date.now()}`,
        notes: { courseId, studentId: session.user.id },
      });
    } catch (razorpayErr) {
      console.error('❌ Razorpay order creation failed:', razorpayErr.message);
      return NextResponse.json({
        success: false,
        error: 'Failed to create payment order. Please check payment credentials or try again.',
      }, { status: 502 });
    }

    // ── Save Payment Record ──
    await Payment.create({
      student: session.user.id,
      course: courseId,
      amount: Math.round(finalPrice * 100), // Store in paise
      razorpayOrderId: order.id,
      status: 'created',
      notes: {
        courseId,
        studentId: session.user.id,
        batchId: batchId || '',
        batchName: batchName || ''
      }
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId,
    });
  } catch (error) {
    console.error('❌ Payment POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/payment — Verify payment and create enrollment
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Missing payment verification data' }, { status: 400 });
    }

    // ── Verify Signature ──
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }

    // ── Update Payment ──
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        paidAt: new Date(),
      },
      { returnDocument: 'after' }
    );

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
    }

    // ── Create or Reactivate Enrollment ──
    const existingEnrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course,
    });

    // Resolve Batch
    let resolvedBatchId = null;
    try {
      const User = (await import('@/models/User')).default;
      const Batch = (await import('@/models/Batch')).default;
      
      const studentUser = await User.findById(payment.student).lean();
      const studentEmail = studentUser ? studentUser.email : null;

      const bId = payment.notes 
        ? (typeof payment.notes.get === 'function' ? payment.notes.get('batchId') : payment.notes.batchId)
        : null;
      const bName = payment.notes
        ? (typeof payment.notes.get === 'function' ? payment.notes.get('batchName') : payment.notes.batchName)
        : null;

      if (bId && bId.trim() !== '') {
        const existingBatch = await Batch.findOne({ _id: bId, course: payment.course });
        if (existingBatch) {
          resolvedBatchId = existingBatch._id;
          if (studentEmail) {
            await Batch.findByIdAndUpdate(existingBatch._id, {
              $addToSet: { students: studentEmail }
            });
          }
        }
      } else if (bName && bName.trim() !== '') {
        const updateObj = { $setOnInsert: { isActive: true } };
        if (studentEmail) {
          updateObj.$addToSet = { students: studentEmail };
        }
        const existingBatch = await Batch.findOneAndUpdate(
          { course: payment.course, name: bName },
          updateObj,
          { upsert: true, returnDocument: 'after' }
        );
        resolvedBatchId = existingBatch._id;
      }
    } catch (batchErr) {
      console.error('Error resolving batch for enrollment:', batchErr);
    }

    if (!existingEnrollment) {
      // Brand new enrollment
      await Enrollment.create({
        student: payment.student,
        course: payment.course,
        batch: resolvedBatchId,
        payment: payment._id,
        status: 'active',
        enrolledAt: new Date(),
        // expiresAt will be automatically set to 6 months by the Enrollment pre-save hook
      });
    } else if (existingEnrollment.status === 'expired') {
      // Reactivate expired enrollment
      existingEnrollment.status = 'active';
      existingEnrollment.enrolledAt = new Date();
      
      // Explicitly set 6 months validity from now
      const expDate = new Date();
      expDate.setMonth(expDate.getMonth() + 6);
      existingEnrollment.expiresAt = expDate;
      
      existingEnrollment.payment = payment._id;
      existingEnrollment.batch = resolvedBatchId;
      // Reset progress percentage so they can learn again
      existingEnrollment.progress = {
        completedLessons: [],
        currentLesson: '',
        percentage: 0,
        lastAccessedAt: new Date(),
        totalWatchTimeMin: 0
      };
      
      await existingEnrollment.save();
      console.log(`✅ Reactivated expired enrollment for student ${payment.student} in course ${payment.course}`);
    }

    return NextResponse.json({ success: true, message: 'Payment verified, enrollment created!' });
  } catch (error) {
    console.error('❌ Payment PUT Error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
