'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EnrollButton({ courseId, amount, courseTitle, className, style, children }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true); // Already loaded
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    // ── Not logged in? Open auth modal ──
    if (!session) {
      router.push(`${pathname}?auth=login`, { scroll: false });
      return;
    }

    setLoading(true);

    try {
      // ── Load Razorpay SDK ──
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        alert('Razorpay SDK failed to load. Check your internet connection.');
        setLoading(false);
        return;
      }

      // ── 1. Create Order (server handles auth + validation) ──
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, amount }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        // Show specific error to user
        alert(orderData.error || 'Failed to create payment order.');
        setLoading(false);
        return;
      }

      // ── 2. Open Razorpay Checkout ──
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MeetMe Center',
        description: `Enrollment: ${courseTitle}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // ── 3. Verify Payment ──
          try {
            const verifyRes = await fetch('/api/payment', {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // Redirect to My Courses in dashboard
              router.push('/lms/courses');
              router.refresh();
            } else {
              alert(verifyData.error || 'Payment verification failed. Contact support.');
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            alert('Payment was received but verification failed. Please contact support.');
          }
        },
        prefill: {
          name: session.user?.name || '',
          email: session.user?.email || '',
        },
        // ── Enable all payment methods ──
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          emi: true,
        },
        // ── Show UPI apps (GPay, PhonePe, etc.) prominently ──
        config: {
          display: {
            blocks: {
              upi_apps: {
                name: 'Pay via UPI Apps',
                instruments: [
                  {
                    method: 'upi',
                    flows: ['intent', 'collect', 'qr'],
                    apps: ['google_pay', 'phonepe', 'paytm'],
                  },
                ],
              },
            },
            sequence: ['block.upi_apps'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: { color: '#C8102E' },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.on('payment.failed', function (response) {
        console.error('Payment failed:', response.error);
        alert(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });
      paymentObject.open();
    } catch (error) {
      console.error('Payment error:', error);
      alert('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className || 'btn btn-primary btn-lg'}
      style={style || { width: '100%', padding: '1rem' }}
    >
      {loading ? 'Processing...' : (children || `Enroll Now — ₹${amount?.toLocaleString('en-IN')}`)}
    </button>
  );
}
