# Tier 0 Milestone F Hardening and Board Demo Runbook

## Current Status

Milestone F is a final verification milestone. It cannot be completed until Milestones A-E have produced a working Tier 0 prototype with:

1. A deployable Next.js application.
2. Google authentication through Supabase.
3. User-scoped budget persistence with Supabase Postgres and Row Level Security.
4. First-time onboarding that saves the initial budget.
5. Dashboard guidance backed by deterministic budget calculations.

As of this runbook revision, the repository contains a local Next.js prototype shell, budget domain tests, Supabase migration/policy fixtures, root route wrappers, and middleware wiring. Local lint, tests, and build pass, but Milestone F still cannot be accepted because hosted Vercel deployment, live Google OAuth, Supabase-backed budget persistence, two-user data isolation, and Board demo verification have not been completed.

## Hardening Scope

Milestone F verifies that the prototype is safe enough for Board review. It is not a feature expansion milestone.

Included:

1. Focused tests for calculation logic, budget validation, protected routes, and persistence boundaries.
2. Review of Supabase environment variables, migrations, and Row Level Security policies.
3. Error, loading, and empty-state checks for sign-in, onboarding, dashboard load, budget save, and sign-out.
4. Hosted deployment verification through the approved Vercel workflow.
5. A concise Board demo path.

Excluded:

1. Banking, payroll, investment, or external financial integrations.
2. AI features.
3. Multi-user or household budgeting.
4. Production launch beyond a Board-reviewable prototype.
5. Broad refactors unrelated to verification findings.

## Preconditions

Before executing this runbook, confirm:

1. Milestone A is complete: app skeleton runs locally and has a Vercel deployment path.
2. Milestone B is complete: Google sign-in, callback, sign-out, session-aware navigation, and protected routes work.
3. Milestone C is complete: `profiles` and `budgets` persistence exists with Row Level Security policies.
4. Milestone D is complete: first-time onboarding saves a valid initial budget and routes to dashboard.
5. Milestone E is complete: dashboard loads the persisted budget and shows deterministic guidance.
6. Vercel project and Supabase project are accessible to the responsible operator.
7. No secret values are written into code, issue comments, documents, screenshots, or logs.

## Verification Checklist

### Repository and Configuration

1. Confirm `.env.example` or equivalent documents all required non-secret environment variable names.
2. Confirm local-only `.env` files are gitignored.
3. Confirm Supabase service-role keys are not used in browser-executed code.
4. Confirm OAuth redirect URLs cover local development, Vercel preview, and accepted production URL as applicable.
5. Confirm deployment documentation names where variables are configured without exposing values.

### Automated Tests

1. Run domain calculation tests.
2. Run budget input validation tests.
3. Run persistence adapter tests or database policy tests for user-owned read/write behavior.
4. Run route protection tests for signed-out access to onboarding and dashboard.
5. Run the smallest available build or typecheck that proves the deployable app compiles.

Record exact commands and results in the issue comment when Milestone F is executed.

### Manual User Flow

1. Open the Vercel preview or production candidate URL in a clean browser session.
2. Attempt to visit onboarding and dashboard while signed out; confirm access is denied or redirected to sign-in.
3. Sign in with Google as a new reviewer account.
4. Confirm first-time user lands on onboarding.
5. Enter monthly income, required expenses, flexible expenses, savings target, and currency.
6. Save the budget and confirm redirect to dashboard.
7. Confirm dashboard displays income, expense totals, savings target, remaining monthly balance, savings rate, and deterministic state label.
8. Sign out.
9. Sign back in with the same Google account.
10. Confirm the saved budget persists and dashboard calculations match the saved values.
11. Edit the budget and confirm recalculated dashboard values after save.
12. Repeat responsive smoke checks on a mobile viewport and desktop viewport.

### Data Isolation

1. Sign in as User A and save a distinct budget.
2. Sign out.
3. Sign in as User B and save a different distinct budget.
4. Confirm User B cannot see User A budget values through the UI.
5. If database policy tests exist, confirm direct attempts to read or update another user's budget fail under Row Level Security.
6. Confirm no API route accepts a user id from the client as the authority for budget ownership.

### Error, Loading, and Empty States

1. Confirm sign-in failures display a recoverable error state.
2. Confirm dashboard loading does not expose stale or cross-user data.
3. Confirm a signed-in user with no budget gets an empty/onboarding state, not a broken dashboard.
4. Confirm invalid budget inputs are explained before save.
5. Confirm save failure leaves entered data visible and retryable.
6. Confirm network or Supabase errors do not reveal secrets, tokens, SQL details, or another user's data.

## Board Demo Script

1. State the Tier 0 boundary: Google sign-in, manual budget setup, persisted budget dashboard, deterministic calculations, no banking or AI integrations.
2. Start signed out and show protected dashboard access redirects to sign-in.
3. Sign in with Google.
4. Complete onboarding with demo budget values.
5. Land on dashboard and explain the deterministic fields:
   - monthly income
   - required expenses
   - flexible expenses
   - savings target
   - remaining monthly balance
   - savings rate
   - surplus, balanced, or deficit state
6. Refresh the browser and show persistence.
7. Sign out and sign back in, then show the same budget.
8. Edit one budget value and show recalculated guidance.
9. Close with known limitations and next-tier candidates, explicitly naming that Tier 0 does not connect to bank accounts or use AI.

## Demo Values

Use non-sensitive sample values only:

1. Monthly income: `5000`
2. Required expenses: `2600`
3. Flexible expenses: `900`
4. Savings target: `750`
5. Currency: `USD`

Expected deterministic outputs:

1. Total expenses: `3500`
2. Remaining monthly balance after expenses and savings target: `750`
3. Savings rate: `15%`
4. Budget state: `surplus`

## Completion Evidence

Milestone F can be marked complete only when the issue comment includes:

1. Vercel deployment URL reviewed by the Board.
2. Exact automated verification commands and pass/fail results.
3. Manual flow result for new user onboarding through return dashboard visit.
4. Data isolation result for at least two user contexts, or a named reason database policy testing could not be completed.
5. Known limitations and any follow-up issues created for defects found during hardening.

## Blocker

Current blocker owner: Milestones A-E assignees under SAN-64, with CEO/Board input needed for hosted Vercel/Supabase/OAuth access where required.

Smallest unblock action: complete enough implementation for SAN-69, SAN-71, SAN-73, SAN-70, and SAN-72 that a deployed prototype exists and the checklist above can be executed against real hosted auth and persistence.
