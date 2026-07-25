<!-- BEGIN:nextjs-agent-rules -->
# Next.js App Router — Production Caching & Dynamic Route Rules

1. **Dynamic Page Routes & Live Database State**:
   - Any page component that fetches live database state (such as homepage `/`, course catalog `/courses`, or LMS browse `/lms/browse`) MUST include `export const dynamic = 'force-dynamic';` at the top of its `page.js`.
   - **Reason**: In Next.js production builds (`npm run build`), routes without dynamic params or request headers default to static pre-rendering (SSG). Without `export const dynamic = 'force-dynamic';`, newly created or published database records will NOT appear on deployed environments even if local `npm run dev` shows them.

2. **On-Demand Cache Revalidation**:
   - Whenever an API route creates, updates, publishes, or deletes database records (e.g., `/api/admin/courses`, `/api/admin/courses/publish`), it MUST invoke `revalidatePath(...)` from `'next/cache'` for all affected routes:
     - `revalidatePath('/')`
     - `revalidatePath('/courses')`
     - `revalidatePath('/lms/browse')`

3. **Development vs Production Caching Differences**:
   - Remember that `npm run dev` (Local) disables static route caching, so database changes show up immediately during local testing. Production builds enforce static route caching unless explicit dynamic exports or `revalidatePath` calls are present.
<!-- END:nextjs-agent-rules -->
