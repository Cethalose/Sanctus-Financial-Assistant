# Sanctus Financial Assistant

Tier 0 prototype for manual first-time budget onboarding, secure persistence, and deterministic financial guidance.

## Local Development

Use Node 22, then install dependencies and run the app:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Commands

```bash
npm run lint
npm run test
npm run build
npm audit
```

## Routes

- `/` health and skeleton overview
- `/sign-in` Supabase Google authentication entry
- `/onboarding` first-time budget setup shell
- `/dashboard` deterministic budget calculation shell
- `/account` session/account shell

## Current Milestone Scope

Milestone A establishes the Next.js/TypeScript application shell, baseline routes, environment documentation, a framework-independent budget domain module, and a Supabase persistence boundary for later storage work.

Milestone B adds Supabase Google authentication, an OAuth callback, protected
budget/account routes, sign-out, and idempotent profile creation after first
authentication.

Milestone C defines the Supabase `profiles` and `budgets` persistence model, RLS policies, and database-level RLS verification fixture.

Milestone D adds a responsive onboarding flow for manual initial budget configuration:

- monthly income
- required expenses
- flexible expenses
- savings target
- currency

The current onboarding implementation persists the prototype budget in browser `localStorage` until Supabase authentication and persistence are wired into the app flow. Domain validation and calculation logic should remain reusable by the server-side Supabase adapter.

Milestone E adds the saved-budget dashboard:

- income, total expenses, planned outflow, remaining balance, and savings-rate display
- deterministic surplus, balanced, and deficit guidance from `src/lib/budget.ts`
- edit flow back through onboarding so saved values recalculate after update
- responsive dashboard layout for desktop and mobile review

Local verification currently passes `npm run lint`, `npm run test`, `npx tsc --noEmit`,
`npm audit`, and `npm run build` under Node 22.

## Architecture Notes

- Deterministic budget validation, calculations, state labels, and guidance live in framework-independent TypeScript modules under `src/lib`.
- Supabase-specific persistence must stay isolated behind server-only persistence adapters.
- Environment setup and Vercel notes live in `docs/deployment.md`.

## Documents

1. [Tier 0 Roadmap](docs/tier-0-roadmap.md)
2. [Budget Persistence Model](docs/budget-persistence-model.md)
3. [Deployment](docs/deployment.md)
4. [Milestone B Google Auth Contract](docs/milestone-b-google-auth.md)
