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
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    if (!session) {
      router.push(`${pathname}?auth=login`, { scroll: false });
      return;
    }

    setLoading(true);

    const res = await loadRazorpay();
    if (!res) {
      alert('Razorpay SDK failed to load. Check your connection.');
      setLoading(false);
      return;
    }

    try {
      // 1. Create Order
      const orderRes = await fetch('/api/payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, studentId: session.user.id, amount }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) throw new Error(orderData.error);

      // 2. Open Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'MeetMe Center',
        description: `Enrollment for ${courseTitle}`,
        order_id: orderData.orderId,
        handler: async function (response) {
          // 3. Verify Payment
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
            router.push('/lms');
          } else {
            alert('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          name: session.user?.name || '', // Use logged in user details
          email: session.user?.email || '',
        },
        theme: { color: '#C8102E' },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading}
      className={className || "btn btn-primary btn-lg"}
      style={style || { width: '100%', padding: '1rem' }}
    >
      {loading ? 'Processing...' : (children || `Enroll Now — ₹${amount.toLocaleString('en-IN')}`)}
    </button>
  );
}
