# 🎓 MeetMe Center — Smart Coaching LMS

A modern, scalable Learning Management System (LMS) built for coaching centers. Students can browse courses, enroll via Razorpay payments, and access video content — all through a premium dark-themed UI.

## ✨ Features

- 🎨 **Premium UI/UX** — Modern, responsive design with glassmorphism and micro-animations.
- 🎓 **LMS Dashboard & Course Player** — A dedicated dark-themed learner environment (`/lms`) with a "Continue Learning" dashboard and a full-featured video course player (`/lms/learn/[courseId]`) including lesson sidebars and progress tracking.
- 📚 **Course Management & Browsing** — Browse, search, and view dynamic course pages fetched from MongoDB with deep serialization. Dashboard users get an internal, dark-mode course browser.
- 💳 **Razorpay Payment Integration** — Secure, automated online enrollment directly via course cards. Built-in support for UPI apps (GPay, PhonePe, Paytm), Netbanking, Wallets, and Cards with extensive error handling and webhook verification.
- 🔐 **Stateless JWT Authentication** — NextAuth-powered secure popup login/signup (No page reloads) and a smart top-right Profile dropdown menu.
- 📹 **Video Hosting Ready** — Course content delivery tailored for heavy video storage.
- ⚙️ **Database Seeding** — Built-in seeding scripts for quick prototyping (`courses` and `enrollments`).

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | Next.js (App Router), React 19, CSS |
| Backend    | Next.js API Routes, NextAuth        |
| Database   | MongoDB Atlas, Mongoose             |
| Payments   | Razorpay                            |
| DevOps     | Docker, Kubernetes (K8s), HPA       |

## 📁 Project Structure

```
src/
├── app/                  # Pages & API Routes
│   ├── api/              # ⚙️ Backend API endpoints (auth, payment, lms data)
│   ├── courses/          # 📚 Public Course pages
│   ├── lms/              # 🎓 Protected Student Dashboard & Learning Portal
│   │   ├── browse/       # In-dashboard course search
│   │   ├── courses/      # Enrolled courses view
│   │   └── learn/        # 🎬 Course Video Player 
│   ├── auth/             # 🔐 Login/Signup
│   └── globals.css       # Global styles
├── components/           # 🎨 Reusable UI components
│   ├── home/             # Landing page sections
│   ├── courses/          # Course cards & enrollment buttons
│   ├── layout/           # Global Header & Footer (with Profile dropdown)
│   └── lms/              # Dashboard sidebars & learning widgets
├── models/               # 🗄️ MongoDB Schemas
│   ├── User.js
│   ├── Course.js
│   ├── Enrollment.js
│   └── Payment.js
└── lib/                  # ⚙️ DB config & utilities
    ├── db.js             # MongoDB connection
    ├── seed_courses.js   # Seed initial courses catalog
    └── seed_enrollment.js# Seed test enrollments for student accounts

k8s/                      # ☸️ Kubernetes manifests (Optional)
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account keys (`rzp_test_...` or `rzp_live_...`)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/bhola-dev58/smart-coach-lms.git
cd smart-coach-lms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB URI, NextAuth secret, and Razorpay test/live keys

# 4. Seed the database (Optional but recommended)
node src/lib/seed_courses.js     # Seeds initial demo courses
node src/lib/seed_enrollment.js  # Enrolls "student@meetme.center" in courses

# 5. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 💳 Testing Payments

We use **Razorpay SDK** for processing. To test UPI intent flows, netbanking, or cards without spending money:
1. Ensure your `.env.local` contains `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...`
2. Browse a course and click `Enroll Now`.
3. In Test Mode, enter any UPI ID or select Google Pay/PhonePe (app opening intent works on mobile browsers). Payments will auto-verify as successful to test your DB write flow.

## 📄 License

This project is private and proprietary.
