import { Client } from '@upstash/qstash';

// ============================================
// 📮 BACKGROUND JOB QUEUE (Upstash QStash)
// Offload heavy tasks to background workers
// so the main API thread never blocks
// ============================================

let qstashClient = null;

function getQStash() {
  if (qstashClient) return qstashClient;

  const token = process.env.QSTASH_TOKEN;
  if (!token) {
    console.warn('⚠️ QStash: QSTASH_TOKEN not set. Background jobs disabled, will run inline.');
    return null;
  }

  qstashClient = new Client({ token });
  return qstashClient;
}

/**
 * Dispatch a background job to a worker API endpoint.
 * If QStash is not configured, runs the job inline (synchronously).
 *
 * @param {string} endpoint - The worker API path (e.g., '/api/jobs/send-email')
 * @param {object} payload - The job payload
 * @param {object} options - Optional: { delay: '10s', retries: 3 }
 */
export async function dispatchJob(endpoint, payload, options = {}) {
  const qstash = getQStash();
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${endpoint}`;

  if (!qstash) {
    // Fallback: run inline (useful for local dev without QStash)
    console.log(`📮 [Inline Job] ${endpoint}`, payload);
    try {
      await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err) {
      console.error('Inline job failed:', err.message);
    }
    return;
  }

  try {
    await qstash.publishJSON({
      url: fullUrl,
      body: payload,
      retries: options.retries || 3,
      ...(options.delay ? { delay: options.delay } : {}),
    });
    console.log(`📮 [QStash] Job dispatched to ${endpoint}`);
  } catch (err) {
    console.error('QStash dispatch error:', err.message);
    // Fallback to inline
    try {
      await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (e) {
      console.error('Fallback inline job also failed:', e.message);
    }
  }
}
