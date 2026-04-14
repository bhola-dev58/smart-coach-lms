# MeetMe Center - Project Architecture & Structure

To ensure maximum scalability and maintainability, this Next.js project is structured according to **Frontend**, **Backend**, and **Database (DB)** domains. Since Next.js is a full-stack framework (App Router), we conceptually and physically separate concerns within the `src/` directory.

## 1. Frontend (UI & Client-Side Logic)
The frontend is responsible for everything the user interacts with (styled with responsive UI, components, and layouts).

- **`src/app/`**: Contains the page layouts and UI routing (`page.js`, `layout.js`). All frontend pages like `/courses`, `/about`, `/contact`, `/lms` live here.
- **`src/components/`**: Reusable React components. These are kept strictly visual and client-oriented.
  - `home/` - Landing page sections.
  - `courses/` - Course cards, enrollment buttons, and player UI.
  - `layout/` - Header, footer, sidebars.
- **`src/app/globals.css`**: Global design tokens and styling.

## 2. Backend (Server Logic & APIs)
The backend handles business logic, security, and interacting with the database. It runs securely on the Node.js server.

- **`src/app/api/`**: Contains all RESTful API endpoints (Next.js Route Handlers).
  - e.g., `/api/courses` (fetching/creating courses)
  - e.g., `/api/auth` (authentication workflows via NextAuth)
  - e.g., `/api/enroll` (Razorpay payment integration)
- **`NextAuth`**: Handles secure user authentication state.
- **`Kubernetes Deployments`**: (See `k8s/` directory) ensures the backend instances scale up when CPU load hits 70%.

## 3. Database (DB)
The DB handles persistent data storage. We use MongoDB Atlas with Mongoose.

- **`src/models/`**: Defines the Mongoose Schema mappings for our database collections.
  - `User.js` - Stores student and admin credentials.
  - `Course.js` - Stores course metadata, pricing, and video links.
  - `Enrollment.js` - Links students to courses.
  - `Payment.js` - Validates Razorpay transactions.
- **`src/lib/db.js`**: Handles the optimized, singleton MongoDB connection (preventing connection leaks on serverless/server deployments).
- **`src/lib/seed_courses.js`**: Initial database population script.

---

### Best Practices to Maintain This Structure:
1. **Never write DB connection logic directly inside a Frontend Component.** Always call an API route (`fetch('/api/...')`) or use Next.js Server Components.
2. **Keep API Routes clean:** API routes (`src/app/api/...`) should validate data and immediately call the database through `src/models/`.
3. **Mongoose Models:** Any changes to how data is shaped MUST be done inside `src/models/`.
