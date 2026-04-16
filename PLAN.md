# Project Upgrade & Completion Plan (MeetMe Center LMS)

## Step 1: Current State Analysis

### Strong & Stable Parts (DO NOT REBUILD)
* **Design System**: Premium UI/UX with CSS Modules, glassmorphism, completely responsive.
* **Database Models**: Mongoose models (`User`, `Course`, `Enrollment`, `Payment`) are correctly structured.
* **Authentication**: Stateless JWT with `next-auth` (Popup login logic implemented without destroying page state).
* **Payment Gateway**: Razorpay integration is complete (Client Checkout, Server Validation, Webhook).
* **LMS Dashboard**: Course Player (`/lms/learn`) & Enrollments fetching UI.
* **Admin Panel**: Role-based access control, basic CRUD views for Data Management.

### Incomplete, Inconsistent, or Missing Parts
* **Missing Components**: Placeholder LMS tabs (`/lms/live`, `/lms/materials`, `/lms/tests`), Admin Settings (`/admin/settings`).
* **Validation**: Input validation in Admin APIs is basic, needs fortification (empty checks, type validation).
* **Media Management**: Course thumbnails and content uploads are hardcoded text fields in the admin panel instead of structured image/video uploaders.
* **Resilience**: Lacking `loading.js` and `error.js` boundaries across major server components for smooth User Experience during SSR.

---

## Step 2: Upgrade Phases

### Phase 1: Refactoring & Technical Debt Cleanup (Safely)
* **Task 1.1**: Add standard input validation to `/api/admin/courses` and `/api/admin/users`.
* **Task 1.2**: Implement Next.js `loading.js` and `error.js` in `/admin` and `/lms` boundary levels to handle network delays gracefully.
* **Task 1.3**: Standardize API responses (e.g. consistently wrapping `{ data, error, meta }`).

### Phase 2: Complete Missing Functional Segments
* **Task 2.1**: Implement `Admin Settings` page (`/admin/settings`) to control global site toggles (e.g., Enable/Disable Registrations, Site under Maintenance).
* **Task 2.2**: Replace remaining "Coming Soon" components in the LMS (`Live Classes`, `Materials`) with basic functional tables or informative grids.
* **Task 2.3**: Update the user `Profile` dropdown and Header state tracking to ensure mobile navigations safely close upon use.

### Phase 3: Production Improvements & Scalability
* **Task 3.1**: Implement rate limiting middleware (or Basic API request throttling) for auth & payments.
* **Task 3.2**: Add index optimization for MongoDB queries (ensure fields like `schema.index({ slug: 1 })` and `student: 1` are properly set).
* **Task 3.3**: Ensure NextAuth configuration properly protects against CSRF and securely signs cookies.

### Phase 4: Prepare for Deployment
* **Task 4.1**: Validate `Dockerfile` & Kubernetes manifests (`k8s/`) ensuring environment variables are securely mapped.
* **Task 4.2**: Verify `package.json` build scripts properly generate static optimized assets (`npm run build`).

---

*Awaiting instruction to execute Phase 1...*
