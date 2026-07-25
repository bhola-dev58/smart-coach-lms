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

4. **UI/UX Design & Front-End Excellence (Garden-Skills Protocol)**:
   - **No Emojis**: NEVER use raw emojis (🎯, ⭐, 📚) in UI elements. ALWAYS use clean inline React SVG icons.
   - **Premium Visual Aesthetics**: Apply modern gradients, glassmorphism (`backdrop-filter`), smooth micro-animations (`transition: all 0.2s ease`), and dynamic theme CSS variables.
   - **Responsive & Accessible**: All components, cards, forms, and toolbars MUST be fully responsive across mobile/desktop with active focus rings, skeleton loaders for async/content-loading surfaces, and live character counters for inputs with length constraints.
   - **Skill File Reference**: Master design guidelines are active in `.agent/skills/web-design-engineer/SKILL.md` and `.gsd/KNOWLEDGE_UI_UX_DESIGN.md`.
<!-- END:nextjs-agent-rules -->
