import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Payment from '@/models/Payment';
import Enrollment from '@/models/Enrollment';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('⚠️ Webhook secret not configured. Skipping webhook.');
      return NextResponse.json({ success: true, message: 'Webhook ignored' });
    }

    // Verify Webhook Signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    const event = JSON.parse(rawBody);

    await connectDB();

    // Handle Order Paid Event
    if (event.event === 'order.paid') {
      const { id: razorpayOrderId, amount, notes } = event.payload.order.entity;
      const razorpayPaymentId = event.payload.payment.entity.id;

      // Update Payment status to 'captured'
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpayOrderId },
        {
          razorpayPaymentId: razorpayPaymentId,
          status: 'captured',
          paidAt: new Date()
        },
        { new: true }
      );

      // Create Enrollment if not exists (Webhook acts as a safety net if frontend validation fails)
      if (payment) {
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
           console.log(`✅ Webhook: Enrollment created for payment ${razorpayPaymentId}`);
         }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
