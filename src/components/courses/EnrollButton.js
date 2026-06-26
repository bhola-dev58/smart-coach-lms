'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function EnrollButton({ courseId, amount, courseTitle, className, style, children }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [batchesList, setBatchesList] = useState([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState('');
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

  const getYearMonthBatches = () => {
    const options = [];
    const date = new Date();
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    
    // Current month
    const yr0 = String(date.getFullYear()).slice(-2);
    const m0 = months[date.getMonth()];
    options.push(`batch-${yr0}-${m0}`);
    
    // Next month
    const nextDate = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    const yr1 = String(nextDate.getFullYear()).slice(-2);
    const m1 = months[nextDate.getMonth()];
    options.push(`batch-${yr1}-${m1}`);
    
    return options;
  };

  const handlePaymentClick = () => {
    // ── Not logged in? Open auth modal ──
    if (!session) {
      router.push(`${pathname}?auth=login`, { scroll: false });
      return;
    }

    setLoading(true);
    setShowModal(true);
    setLoadingBatches(true);

    fetch(`/api/lms/course/${courseId}/batches`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.batches && json.batches.length > 0) {
          setBatchesList(json.batches);
          setSelectedBatch(JSON.stringify({ id: json.batches[0]._id, name: json.batches[0].name }));
        } else {
          setBatchesList([]);
          const fallbacks = getYearMonthBatches();
          setSelectedBatch(JSON.stringify({ id: '', name: fallbacks[0] }));
        }
      })
      .catch(err => {
        console.error('Failed to load batches:', err);
        setBatchesList([]);
        const fallbacks = getYearMonthBatches();
        setSelectedBatch(JSON.stringify({ id: '', name: fallbacks[0] }));
      })
      .finally(() => setLoadingBatches(false));
  };

  const triggerCheckout = async () => {
    if (!selectedBatch) {
      alert('Please select a batch to continue.');
      return;
    }

    const parsedBatch = JSON.parse(selectedBatch);
    const batchId = parsedBatch.id;
    const batchName = parsedBatch.name;

    setShowModal(false);

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
        body: JSON.stringify({ courseId, amount, batchId, batchName }),
      });
      const orderData = await orderRes.json();

      if (!orderData.success) {
        alert(orderData.error || 'Failed to create payment order.');
        setLoading(false);
        return;
      }

      // ── 2. Open Razorpay Checkout ──
      const options = {
        key: orderData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Gradify Academy',
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
              setLoading(false);
            }
          } catch (verifyErr) {
            console.error('Verification error:', verifyErr);
            alert('Payment was received but verification failed. Please contact support.');
            setLoading(false);
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
        theme: { color: '#1B2B6B' },
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
    <>
      <button
        onClick={handlePaymentClick}
        disabled={loading}
        className={className || 'btn btn-primary btn-lg'}
        style={style || { width: '100%', padding: '1rem' }}
      >
        {loading ? 'Processing...' : (children || `Enroll Now — ₹${amount?.toLocaleString('en-IN')}`)}
      </button>

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 99999,
          padding: '1rem',
          animation: 'fadeIn 0.25s ease-out',
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #ffffff, #f8fafc)',
            border: '1px solid #e2e8f0',
            borderRadius: '16px',
            padding: '2rem',
            width: '100%',
            maxWidth: '480px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            color: '#1e293b',
            position: 'relative',
          }}>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.025em', color: '#0f172a' }}>
              Select Cohort / Batch
            </h3>
            <p style={{ margin: '0 0 1.5rem 0', fontSize: '0.875rem', color: '#64748b', lineHeight: '1.5' }}>
              Select the batch you would like to join for <strong>{courseTitle}</strong> before proceeding to payment.
            </p>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#475569', marginBottom: '0.5rem' }}>
                Available Batches
              </label>
              {loadingBatches ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                  <svg style={{ animation: 'spin 1s linear infinite' }} width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" style={{ opacity: 0.75 }}></path>
                  </svg>
                  <span>Loading batches...</span>
                </div>
              ) : (
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    color: '#0f172a',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                >
                  {batchesList.length > 0 ? (
                    batchesList.map(b => (
                      <option key={b._id} value={JSON.stringify({ id: b._id, name: b.name })} style={{ background: '#ffffff', color: '#0f172a' }}>
                        {b.name}
                      </option>
                    ))
                  ) : (
                    getYearMonthBatches().map(opt => (
                      <option key={opt} value={JSON.stringify({ id: '', name: opt })} style={{ background: '#ffffff', color: '#0f172a' }}>
                        {opt} (Default)
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { setShowModal(false); setLoading(false); }}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e2e8f0';
                  e.target.style.color = '#0f172a';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f1f5f9';
                  e.target.style.color = '#475569';
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={triggerCheckout}
                disabled={loadingBatches}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '8px',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
                }}
                onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
              >
                Proceed to Pay
              </button>
            </div>
          </div>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </>
  );
}
