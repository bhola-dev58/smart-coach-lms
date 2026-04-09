import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Enrollment from '@/models/Enrollment';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// POST /api/payment — Create a Razorpay order
export async function POST(request) {
  try {
    await connectDB();
    const { courseId, studentId, amount } = await request.json();

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay uses paise
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`,
      notes: { courseId, studentId },
    });

    await Payment.create({
      student: studentId,
      course: courseId,
      amount,
      razorpayOrderId: order.id,
      status: 'created',
    });

    return NextResponse.json({ success: true, orderId: order.id, amount: order.amount, currency: order.currency });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT /api/payment — Verify payment and create enrollment
export async function PUT(request) {
  try {
    await connectDB();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 400 });
    }

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      { razorpayPaymentId: razorpay_payment_id, razorpaySignature: razorpay_signature, status: 'captured' },
      { new: true }
    );

    // Create enrollment
    await Enrollment.create({
      student: payment.student,
      course: payment.course,
      payment: payment._id,
    });

    return NextResponse.json({ success: true, message: 'Payment verified, enrollment created' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
