# Project Future Pipeline for Ralph Loop (Dynamic LMS Architecture)

> **IMPORTANT RULE FOR RALPH LOOP:** 
> Do **NOT** auto-commit or auto-push code after completing a task. The user needs to manually review all changes to understand what was updated and where. Pause and ask for user approval after each major file or block is modified. Focus heavily on Role-Based Access Controls (RBAC) ensuring every UI element and API endpoint correctly adapts to the user's role natively.

## Current State
The core LMS is built, the Premium UI is polished, and the interactive assignment system inside the player is completed with correct aesthetics. Old foundation tasks are considered DONE.

## New Ralph Loop Objectives

### Phase 1: Dynamic Profiles & Verification Ecosystem
* **Task 1.1**: **Student Profile & Dynamic Telemetry**
  * Detail the `/lms/profile` page using robust React context/hooks.
  * Allow students to edit personal data; handle dynamic progress aggregation safely.
  * **KYC/Verification mechanism**: Students can submit ID/records to be verified by Instructors or Admins conditionally.
* **Task 1.2**: **Instructor Profile Completion**
  * Setup advanced Instructors settings. Allow updates to bio, social links, payouts, and dynamic verification badges.

### Phase 2: Ultimate Instructor Control System (Dynamic Dashboard)
* **Task 2.1**: **Advanced Course Management Panel**
  * Fully dynamic dashboard tailored to the `instructor` role. 
  * Features: Live drag-and-drop course curriculum builder, lesson editing (CRUD data upgrading), attaching resources directly.
* **Task 2.2**: **Student Management & Verifications**
  * Instructor has control over their enrolled students: View student progress telemetrics, analyze performance, and verify student profile submissions.
  * Suspend/Approve students for specific exclusive premium cohorts.

### Phase 3: Future-Proof Student-Instructor Interactions (A to Z)
* **Task 3.1**: **Interactive Assignment & Grading Hub**
  * Instructor Panel to deeply review, annotate, and grade assignment submissions dynamically. Student views update in real-time.
* **Task 3.2**: **Next-Gen Q&A / Discussion Integration**
  * Threaded discussions mapped precisely between students and instructors globally within specific course units. Supports future AI hooks (auto-reply hints mapping).

### Phase 4: Admin Superuser Architecture & Scalability
* **Task 4.1**: **Global Control & Security Mapping**
  * True super-admin dashboard tracking total revenue, overall platform scaling, and full global safety filters.
  * Role mapping enforced strictly via next-auth middleware interceptors. Nobody bypasses role checks (Instructor vs Admin vs Student).
* **Task 4.2**: **Zero-Scratch Data Optimizations**
  * Re-use MongoDB schemas to implement aggregate data dashboards. Rely completely on DB indices and server-side pagination for scalable loading (10,000+ users safe).

---
*Proceed sequentially on the tasks. Remember: Explain what you do, write the code, verify using existing architectures dynamically, and do NOT auto-commit/push.*
-