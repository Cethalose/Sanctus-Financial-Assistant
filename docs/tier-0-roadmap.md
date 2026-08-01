# Sanctus Financial Assistant Tier 0 Roadmap

## Executive Summary

Tier 0 should deliver a working web application that lets any user sign in with Google, complete a first-time budget setup, return later, and see the same budget data securely persisted. This roadmap is intentionally narrow: it creates a usable prototype for Sanctus Financial Assistant while establishing a maintainable foundation for future deterministic, local-first financial workflows.

The recommended path is a small Next.js application deployed on Vercel, using Supabase for Google authentication and Postgres persistence. This stack gives Sanctus rapid delivery, managed security primitives, user-scoped data storage, and a clear future path toward local-first features without introducing artificial intelligence, banking integrations, or advanced planning complexity in Tier 0. The application should keep deterministic business rules in framework-independent modules so budget behavior remains portable if the persistence or synchronization model changes later.

## Tier 0 Product Boundary

Included:

1. Google authentication.
2. First-time user onboarding.
3. Initial budget configuration.
4. Secure persistence of user-owned budget data.
5. Dashboard view showing configured budget and deterministic calculations.
6. Responsive desktop and mobile web interface.
7. GitHub-to-Vercel deployment workflow.

Excluded:

1. AI features.
2. Banking, payroll, investment, or third-party financial integrations.
3. Job search, resume, application, or interview workflows.
4. Multi-user or household budgeting.
5. Advanced forecasting, retirement planning, debt optimization, or tax planning.
6. Native mobile applications.

## Recommended Architecture

Use a conventional three-layer web architecture:

1. Frontend application: Next.js App Router with TypeScript, React Server Components where useful, and a small client-side budget setup/dashboard experience.
2. Identity and persistence: Supabase Auth with Google OAuth, Supabase Postgres for user profiles and budget records, and Row Level Security for user-owned data.
3. Deployment and operations: GitHub repository connected to Vercel, environment variables for Supabase and OAuth configuration, preview deployments for each branch, and a production deployment after acceptance.

Deterministic-first separation:

1. Domain logic: budget formulas, budget-state labels, validation rules, and user-facing financial calculations live in plain TypeScript modules with no dependency on Next.js, Supabase, React, or Vercel.
2. Application layer: onboarding, dashboard, route protection, and save/load flows call the domain modules but do not own calculation behavior.
3. Persistence adapters: Supabase reads and writes are isolated behind small data-access functions so a future local-first store, hybrid sync layer, or different backend can reuse the same domain logic.
4. Tests: core budget calculations and validation rules are covered at the domain layer before they are exercised through UI or persistence flows.

Core data model:

1. `profiles`: one row per authenticated user, linked to the Supabase auth user id.
2. `budgets`: one active Tier 0 budget per user, including monthly income, required expenses, flexible expenses, savings target, currency, and timestamps.
3. `budget_categories`: optional normalized category rows if the team wants editable line items in Tier 0; otherwise, keep category totals in the `budgets` table and introduce category rows in Tier 1.

Security model:

1. Authentication is handled by Supabase Auth using Google OAuth.
2. Budget data is stored server-side in Postgres.
3. Row Level Security ensures users can only read and write their own records.
4. No financial account credentials, bank tokens, or highly sensitive integrations are collected in Tier 0.

## Technology Stack Recommendation

1. Next.js + TypeScript: fast prototype delivery, strong Vercel fit, maintainable routing and server/client boundaries.
2. Vercel: simple production deployment, preview URLs, environment variable management, and low operational overhead.
3. Supabase Auth: Google sign-in with less custom authentication code, session handling, and a future path to additional providers if needed.
4. Supabase Postgres: durable relational persistence with Row Level Security, migrations, and transparent data ownership.
5. Zod: input validation for budget payloads and deterministic calculation inputs.
6. Playwright or Vitest/Testing Library: focused tests for onboarding, persistence, and budget calculations.
7. Tailwind CSS or a small component system: rapid responsive UI without overbuilding design infrastructure.

Primary tradeoff: Supabase is not purely local-first. Its use in Tier 0 is an intentional compromise to enable Google-authenticated persistence quickly and securely while the product is still proving its first workflow. The architecture should preserve a future migration path toward local-first or hybrid synchronization by keeping Supabase-specific code at the persistence boundary, keeping domain logic independent, and avoiding assumptions that budget data can only exist in a hosted Postgres database.

## Phased Implementation Plan

### Phase 1: Project Foundation

Goal: establish the deployable application skeleton and baseline engineering standards.

Scope:

1. Initialize a TypeScript Next.js app.
2. Add formatting, linting, and minimal test setup.
3. Configure GitHub and Vercel deployment.
4. Create environment variable documentation for local and hosted environments.
5. Define baseline routes: sign-in, onboarding, dashboard, and account/session handling.

Completion criteria:

1. App runs locally.
2. Vercel preview deployment works from GitHub.
3. Production deployment can be promoted manually.
4. Basic health page or landing route renders on desktop and mobile.

### Phase 2: Google Authentication

Goal: enable any user to authenticate with Google and maintain a secure session.

Scope:

1. Configure Supabase project and Google OAuth credentials.
2. Implement sign-in, callback, sign-out, and session-aware navigation.
3. Protect onboarding and dashboard routes.
4. Create a profile row after first authentication.

Completion criteria:

1. New user can sign in with Google.
2. Returning user remains signed in across sessions where browser session state allows.
3. Signed-out users cannot access budget routes.
4. Profile creation is idempotent.

### Phase 3: Budget Data Model and Persistence

Goal: persist a user-owned initial budget securely.

Implementation artifact: [Budget Persistence Model](budget-persistence-model.md).

Scope:

1. Create Supabase migrations for `profiles` and `budgets`.
2. Add Row Level Security policies for user-scoped reads and writes.
3. Define TypeScript domain types and Zod schemas for budget input.
4. Add server-side actions or API routes for reading and saving a budget.
5. Keep deterministic calculation logic separate from persistence code.

Completion criteria:

1. Authenticated user can create and update their own budget.
2. User cannot read or mutate another user's budget under RLS.
3. Budget survives sign-out, browser refresh, and return sign-in.
4. Validation rejects incomplete or invalid budget payloads.

### Phase 4: First-Time Onboarding

Goal: guide a new user through initial budget configuration with minimal friction.

Scope:

1. Build onboarding form for monthly income, required expenses, flexible expenses, savings target, and currency.
2. Provide clear validation and save states.
3. Route first-time users without a budget to onboarding.
4. Route users with a budget to dashboard.

Completion criteria:

1. New authenticated user lands in onboarding.
2. User can complete and save the initial budget on desktop and mobile.
3. Invalid entries are explained before save.
4. Successful save redirects to dashboard.

### Phase 5: Dashboard and Deterministic Guidance

Goal: display the saved budget and useful deterministic guidance.

Scope:

1. Show income, expense totals, savings target, remaining monthly balance, and savings-rate calculation.
2. Label the budget state using deterministic rules, such as surplus, balanced, or deficit.
3. Allow editing the saved budget.
4. Keep calculations in a tested pure function module.

Completion criteria:

1. Returning user sees their persisted budget.
2. Dashboard calculations match unit-tested deterministic formulas.
3. User can edit the budget and see recalculated results after save.
4. Dashboard remains usable on mobile and desktop.

### Phase 6: Prototype Hardening and Board Demo

Goal: make Tier 0 reviewable and safe enough for prototype use.

Scope:

1. Add focused tests for auth route protection, budget validation, calculation logic, and persistence behavior.
2. Review Supabase policies and environment variable handling.
3. Add basic error, loading, and empty states.
4. Prepare a short demo script and deployment checklist.

Completion criteria:

1. Prototype is deployed through Vercel.
2. A new user can complete the full flow from Google sign-in through dashboard return visit.
3. No known route exposes another user's data.
4. Board can review the working prototype with a documented demo path.

## Milestone Sequence

1. Milestone A: Deployable skeleton in Vercel.
2. Milestone B: Google sign-in and protected routes.
3. Milestone C: Supabase schema, RLS, and budget persistence.
4. Milestone D: Onboarding flow saves initial budget.
5. Milestone E: Dashboard displays deterministic budget guidance.
6. Milestone F: Hardening pass and Board demo.

## Risks and Mitigations

1. Google OAuth setup delay: prepare explicit redirect URI and environment variable checklist before implementation begins.
2. RLS misconfiguration: require a focused policy review and tests using separate user contexts before demo approval.
3. Scope expansion: keep Tier 0 limited to manual budget entry and deterministic calculations.
4. Overbuilding local-first architecture too early: isolate data access and calculation logic now, defer offline sync until a later approved tier.
5. Financial-data sensitivity: collect only budget figures in Tier 0, avoid account credentials and external financial integrations.

## Decisions Requiring Board Approval

1. Approve Supabase as the Tier 0 authentication and persistence provider.
2. Approve Next.js on Vercel as the Tier 0 application and deployment foundation.
3. Approve manual budget entry as sufficient for Tier 0, with no banking integrations.
4. Approve one active budget per user for Tier 0 unless the Board wants category-level or multi-budget support immediately.
5. Approve implementation beginning only after this roadmap is accepted.

## Proposed Acceptance Criteria for Tier 0

1. A new user can authenticate with Google.
2. A signed-in user without a budget is routed to onboarding.
3. The user can configure income, expenses, savings target, and currency.
4. Budget data persists securely between sessions.
5. The dashboard shows the saved budget and deterministic calculations.
6. A signed-out user cannot access protected budget pages.
7. The app is deployed through GitHub and Vercel.

## Recommended Next Step

If the Board approves this roadmap, create implementation child issues for the six milestones above, with Phase 1 and Phase 2 started first. Implementation should remain narrow until the Board has reviewed the Tier 0 prototype.
