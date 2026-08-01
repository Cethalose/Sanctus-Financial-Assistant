# Budget Persistence Model

Status: Milestone C implementation artifact

## Scope

Milestone C establishes the server-side persistence model for Tier 0 manual budgets. It does not add banking integrations, category-level line items, household sharing, multiple budgets per user, or AI-derived financial advice.

## Persistence Boundary

Budget behavior should be split across three layers:

1. Domain layer: TypeScript types, validation schemas, and deterministic calculations. This layer must not import Supabase, Next.js, React, or browser APIs.
2. Persistence adapter: small server-only functions that translate between domain objects and Supabase rows.
3. Application layer: onboarding, dashboard, routing, and save/load interactions that call the adapter and domain layer.

Recommended file shape once the app scaffold exists:

```text
src/domain/budget.ts
src/domain/budget.test.ts
src/server/budgetRepository.ts
src/server/supabase/serverClient.ts
supabase/migrations/20260801000000_profiles_budgets.sql
supabase/tests/budget_rls_verification.sql
```

The persistence adapter should expose a narrow interface:

```ts
export type BudgetInput = {
  monthlyIncomeCents: number;
  requiredExpensesCents: number;
  flexibleExpensesCents: number;
  savingsTargetCents: number;
  currency: string;
};

export type Budget = BudgetInput & {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export interface BudgetRepository {
  getCurrentBudget(userId: string): Promise<Budget | null>;
  upsertCurrentBudget(userId: string, input: BudgetInput): Promise<Budget>;
}
```

The adapter must derive `userId` from the authenticated server session, not from a client-submitted payload. Client forms may submit budget values only.

## Data Model

`profiles`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key and foreign key to `auth.users.id`. |
| `email` | `text` | Optional cached email for account display. |
| `full_name` | `text` | Optional cached display name. |
| `avatar_url` | `text` | Optional cached profile image URL. |
| `created_at` | `timestamptz` | Server timestamp. |
| `updated_at` | `timestamptz` | Maintained by trigger. |

`budgets`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | Primary key. |
| `user_id` | `uuid` | Required owner, foreign key to `auth.users.id`, unique for one active Tier 0 budget. |
| `monthly_income_cents` | `integer` | Non-negative. |
| `required_expenses_cents` | `integer` | Non-negative. |
| `flexible_expenses_cents` | `integer` | Non-negative. |
| `savings_target_cents` | `integer` | Non-negative. |
| `currency` | `char(3)` | ISO 4217-style uppercase code. Defaults to `USD`. |
| `created_at` | `timestamptz` | Server timestamp. |
| `updated_at` | `timestamptz` | Maintained by trigger. |

The one-budget-per-user rule is enforced by `budgets_user_id_key`.

## RLS Policy Contract

Row Level Security is enabled on both tables.

Allowed:

1. Authenticated users can select, insert, and update their own profile row.
2. Authenticated users can select, insert, and update their own budget row.
3. Service-role/backend maintenance operations can use Supabase's normal RLS bypass behavior.

Denied:

1. Anonymous clients cannot read or write either table.
2. Authenticated users cannot read another user's profile or budget.
3. Authenticated users cannot insert or update rows owned by another user.
4. Tier 0 does not expose client delete policies.

## Validation Contract

Application validation should reject payloads that violate the database constraints before calling Supabase:

1. Money values must be integer cents, finite, and greater than or equal to zero.
2. `currency` must be exactly three uppercase ASCII letters.
3. The client cannot provide `id`, `user_id`, `created_at`, or `updated_at`.
4. The authenticated session user id is the only accepted budget owner.

## Verification

Run the migration against a Supabase database, then execute `supabase/tests/budget_rls_verification.sql` using a privileged SQL connection. The verification fixture creates two auth users, switches JWT subjects with `request.jwt.claim.sub`, and asserts that each user can only see or mutate their own rows.

Before accepting Milestone C in an application branch, also add adapter-level tests for:

1. `getCurrentBudget` returns only the session user's budget.
2. `upsertCurrentBudget` creates a first budget.
3. `upsertCurrentBudget` updates the existing budget for the same user.
4. Invalid budget input is rejected before persistence.
