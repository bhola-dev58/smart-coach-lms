# Future Implementation Plan: Live Streaming, Batches, & Attendance System

This document outlines the feasibility, architectural design, and cost-effectiveness of implementing private live-stream embeds, batch scheduling, automated recording delivery, and lesson-wise attendance tracking in the Gradify Academy LMS.

---

## 1. Feasibility Matrix

All of your requested features are **100% possible** to implement using modern web technologies, Next.js, and MongoDB. Below is a breakdown of what is possible and how it works:

| Feature | Feasibility | Implementation Method |
| :--- | :--- | :--- |
| **Private Embedded Live Stream** | **Yes** | Embed YouTube **Unlisted** live feeds inside our custom video frame, guarded by Next.js session authentication. |
| **Lesson-Wise Attendance** | **Yes** | Track student presence via automated heartbeat pings from the video player, or via Zoom Webhook integration. |
| **Auto-Recording Delivery** | **Yes** | **YouTube Live:** Auto-saves as a recording at the exact same URL when the stream ends (No cost).<br>**Zoom/Meet:** Zoom webhook triggers on end-of-meeting to dynamically update the lesson's recording link. |
| **Batch/Cohort Control** | **Yes** | Introduce a `Batch` model in MongoDB to group students and schedule release times for courses/lessons. |
| **Concurrent Sessions** | **Yes** | MongoDB & Next.js can handle thousands of concurrent users. Concurrent Zoom/Meet sessions are handled by assigning unique host IDs per batch. |

---

## 2. Deep Dive & Implementation Strategies

### A. Private Live Stream Embedding (Lesson-Wise)
* **How it works:** 
  - The admin creates a live lesson in the LMS. The backend generates or links a YouTube Live stream.
  - When the student views that lesson, we verify their login session on the server. If authorized, we render a custom `<iframe>` player referencing the **Unlisted** YouTube stream.
  - We disable context menus and external links in the iframe to make it harder to share the stream.
* **Startup recommendation:** Use **YouTube Unlisted Streams**. This is completely free, handles infinite bandwidth, and automatically turns into a recorded video at the **same URL** once the stream ends.

### B. Auto-Recording & Missed Student Access
* **Option 1: YouTube Live (Recommended for Startup Phase)**
  - When the live session ends, YouTube automatically processes and hosts the video as a normal unlisted recording.
  - The URL does not change. Students who missed the live class simply open their dashboard, click the lesson, and watch the recording in the same player frame.
* **Option 2: Zoom Cloud Integration**
  - If live classes are done via Zoom:
    1. The admin schedules the class in the LMS (connected to the Zoom API).
    2. The Zoom meeting starts with `"auto_recording": "cloud"`.
    3. Once the meeting ends, Zoom fires a `recording.completed` webhook.
    4. Our Next.js backend receives this webhook, extracts the secure recording URL, and saves it in MongoDB as the `videoUrl` for that specific lesson.

### C. Attendance System
We can implement attendance in two ways:
1. **Interactive Check-in:** A popup appears at random times during the live class asking the student to click "I am attending".
2. **Silent Analytics Tracking (Recommended):** The video player sends a small tracking ping (heartbeat) to the backend every 60 seconds. If a student stays online for more than 70% of the class duration, they are automatically marked as **Present** for that lesson.

### D. Batch Management & Scheduling (Admin Controls)
To support 4 to 8 concurrent classes with 15 to 20 students per class, we will introduce:
1. **Batch Schema:**
   ```javascript
   const BatchSchema = new mongoose.Schema({
     name: { type: String, required: true }, // e.g. "Python Batch A"
     course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
     students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
     schedule: [{
       lesson: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
       liveTime: Date // Specific date/time this batch gets their live class
     }]
   });
   ```
2. **Access Control:** When a student logs in, we query their assigned `Batch`. They can only view and join the live video player when the current time matches their batch's scheduled `liveTime`.

---

## 3. Cost-Effectiveness Analysis

For an early-stage startup, keeping infrastructure costs close to zero is vital. Here is a cost comparison:

### Scenario A: The Free/Bootstrapped Stack (Recommended)
* **Video Hosting & Live Streaming:** YouTube Unlisted Streams.
  - **Cost:** **$0** (Free streaming, free bandwidth, free cloud storage for recordings).
* **Live Doubts (Weekly):** Free Zoom/Google Meet.
  - **Cost:** **$0** (Utilizes free 40-minute Zoom meetings or standard Google Meet links).
* **Server & DB:** Existing AWS Hosting + MongoDB Atlas.
  - **Cost:** **$0** (Already covered by your existing AWS server infrastructure and MongoDB Atlas tier).
* **Total Monthly Cost:** **$0** (No additional server hosting costs needed).

### Scenario B: The Integrated SaaS Stack (Premium)
* **Live Classes (Zoom Pro):** 1 Pro License per concurrent host. For 4 concurrent classes, you need 4 host accounts.
  - **Cost:** **$60 - $80/month** ($15-20 per host).
* **Automated Webhooks & DB Sync:**
  - **Cost:** **$0** (Custom coding handles this natively in Next.js).
* **Total Monthly Cost:** **~$60 - $90**

---

## 4. Suggested Implementation Roadmap

If we decide to start building this, we should do it in three phases:
* **Phase 1: Batch & Live Schema Setup** — Create the Batch model, add batch filters to the student dashboard so different cohorts only see their scheduled times.
* **Phase 2: Stream Player & YouTube Unlisted Integration** — Set up the authenticated iframe player for live streams.
* **Phase 3: Automated Attendance & Sync** — Write the background heartbeat ping logic to automatically calculate and record attendance details.
