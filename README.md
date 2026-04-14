# 🎓 MeetMe Center — Smart Coaching LMS

A modern, scalable Learning Management System (LMS) built for coaching centers. Students can browse courses, enroll via Razorpay payments, and access video content — all through a premium dark-themed UI.

## ✨ Features

- 🎨 **Premium Dark Theme** — Modern, responsive UI with glassmorphism and micro-animations
- 📚 **Course Management** — Browse, search, and view detailed course pages
- 💳 **Razorpay Payment Integration** — Secure online enrollment and payment
- 🔐 **Authentication** — NextAuth-powered login/signup for students and admins
- 📹 **Video Hosting Ready** — Course content delivery with video player
- ☸️ **Kubernetes Ready** — Pre-configured K8s manifests for production-grade scalability (auto-scales 3→15 pods)

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
│   ├── api/              # ⚙️ Backend API endpoints
│   ├── courses/          # 📚 Course pages
│   ├── lms/              # 🎓 Student dashboard
│   ├── auth/             # 🔐 Login/Signup
│   ├── about/            # ℹ️  About page
│   ├── contact/          # 📞 Contact page
│   ├── layout.js         # Root layout
│   ├── page.js           # Homepage
│   └── globals.css       # Global styles
├── components/           # 🎨 Reusable UI components
│   ├── home/             # Landing page sections
│   ├── courses/          # Course cards & enrollment
│   └── layout/           # Header, Footer, Sidebar
├── models/               # 🗄️ MongoDB Schemas
│   ├── User.js
│   ├── Course.js
│   ├── Enrollment.js
│   └── Payment.js
└── lib/                  # ⚙️ DB config & utilities
    ├── db.js             # MongoDB connection
    └── seed_courses.js   # Database seeder

k8s/                      # ☸️ Kubernetes manifests
├── deployment.yaml       # Pod deployment (3 replicas)
├── service.yaml          # ClusterIP service
├── hpa.yaml              # Auto-scaler (CPU/Memory based)
├── ingress.yaml          # Nginx ingress + TLS
└── secret.example.yaml   # Secrets template
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Razorpay account (for payments)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/meetme-lms.git
cd meetme-lms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Edit .env.local with your real credentials

# 4. Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🐳 Docker

```bash
# Build the image
docker build -t meetme-center .

# Run the container
docker run -p 3000:3000 --env-file .env.local meetme-center
```

## ☸️ Kubernetes Deployment

```bash
# 1. Set up secrets
cp k8s/secret.example.yaml k8s/secret.yaml
# Edit k8s/secret.yaml with real values

# 2. Apply all manifests
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/ingress.yaml
```

The HPA will automatically scale pods from **3 → 15** based on CPU (70%) and memory (80%) utilization.

## 📄 License

This project is private and proprietary.
