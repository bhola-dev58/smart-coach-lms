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
    const { courseId, amount } = await request.json();

    if (!courseId || !amount) {
      return NextResponse.json({ success: false, error: 'courseId and amount are required' }, { status: 400 });
    }

    // ── Check if already enrolled ──
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
        amount: Math.round(amount * 100), // Razorpay uses paise (₹499 = 49900)
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
      amount: Math.round(amount * 100), // Store in paise
      razorpayOrderId: order.id,
      status: 'created',
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error('❌ Payment POST Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Internal server error' }, { status: 500 });
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
      { new: true }
    );

    if (!payment) {
      return NextResponse.json({ success: false, error: 'Payment record not found' }, { status: 404 });
    }

    // ── Create Enrollment (only if not already exists) ──
    const existingEnrollment = await Enrollment.findOne({
      student: payment.student,
      course: payment.course,
    });

    if (!existingEnrollment) {
      await Enrollment.create({
        student: payment.student,
        course: payment.course,
        payment: payment._id,
        status: 'active',
        enrolledAt: new Date(),
      });
    }

    return NextResponse.json({ success: true, message: 'Payment verified, enrollment created!' });
  } catch (error) {
    console.error('❌ Payment PUT Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Verification failed' }, { status: 500 });
  }
}
