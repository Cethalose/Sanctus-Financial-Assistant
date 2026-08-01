# SFA1 Tier 0 Milestone B: Google Authentication Implementation Contract

## Status

Implemented locally; pending hosted Google OAuth provider configuration and manual preview verification.

The repository now contains the Next.js skeleton needed for Milestone B. Google authentication is implemented through Supabase SSR clients, a server-side OAuth callback, protected-route middleware, sign-out, and idempotent profile creation.

## Assumed Foundation From Milestone A

Milestone B depends on:

1. Next.js App Router with TypeScript.
2. A local development command documented in `README.md`.
3. Route groups or equivalent app routes for public and protected screens.
4. Environment-variable documentation for local and hosted deployment.
5. Vercel-ready project configuration.

Do not implement Google authentication against a different framework without CTO/CEO confirmation, because the approved Tier 0 roadmap names Next.js, Vercel, Supabase Auth, and Supabase Postgres as the foundation.

## Environment Variables

Required application variables:

1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `NEXT_PUBLIC_SITE_URL`

Required provider configuration in Supabase and Google Cloud:

1. Google OAuth client ID.
2. Google OAuth client secret.
3. Authorized JavaScript origins for local, preview, and production URLs.
4. Authorized redirect URIs matching Supabase Auth callback URLs for local, preview, and production.

The service-role key must only be used server-side. It must not be exposed through client components, browser bundles, logs, or public environment variables.

## Route Contract

Public routes:

1. `/sign-in`: renders a Google sign-in action.
2. `/auth/callback`: exchanges the Supabase auth callback code for a session and redirects the user.

Protected routes:

1. `/onboarding`: only available to authenticated users.
2. `/dashboard`: only available to authenticated users.
3. `/account`: optional Tier 0 session/account page if the skeleton includes account navigation.

Route behavior:

1. Signed-out users visiting protected routes are redirected to `/sign-in`.
2. Signed-in users visiting `/sign-in` are redirected to `/dashboard` if they already have a Tier 0 budget, otherwise `/onboarding` after Milestone C/D data checks exist.
3. During Milestone B only, signed-in users can be redirected to `/onboarding` as the default protected destination because budget persistence is not implemented yet.
4. Sign-out clears the server/browser session and redirects to `/sign-in`.

Implemented files:

1. `src/app/sign-in/page.tsx`
2. `src/app/sign-in/actions.ts`
3. `src/app/auth/callback/route.ts`
4. `src/app/account/page.tsx`
5. `src/app/account/actions.ts`
6. `src/middleware.ts`
7. `middleware.ts`
8. `src/lib/auth/*`
9. `src/lib/supabase/*`

## Supabase Client Boundaries

Create small Supabase adapters rather than scattering auth code through pages:

1. Browser client for client components that trigger sign-in/sign-out.
2. Server client for server components, route handlers, and server actions.
3. Middleware client for route protection and session refresh.
4. Admin/service client only for server-only idempotent profile creation if RLS cannot satisfy the profile insert path.

Recommended file shape after Milestone A exists:

1. `src/lib/supabase/browser.ts`
2. `src/lib/supabase/server.ts`
3. `src/lib/supabase/middleware.ts`
4. `src/lib/auth/profile.ts`
5. `src/middleware.ts`

## Profile Creation Contract

After first successful authentication, ensure a profile row exists for the Supabase auth user.

Profile fields for Tier 0:

1. `id`: UUID, equal to `auth.users.id`.
2. `email`: nullable text copied from auth user metadata when available.
3. `full_name`: nullable text copied from auth user metadata when available.
4. `avatar_url`: nullable text copied from auth user metadata when available.
5. `created_at`: timestamp with time zone.
6. `updated_at`: timestamp with time zone.

Profile creation must be idempotent:

1. Use an upsert keyed by `id`, or insert-on-conflict-do-nothing followed by select.
2. Re-running the callback for the same user must not create duplicates or fail the sign-in flow.
3. Missing Google profile metadata must not block account creation.

If the `profiles` table does not exist yet, Milestone B may include a minimal profile migration, but the full RLS and budget persistence work remains Milestone C.

## Acceptance Criteria

Milestone B is complete when:

1. A new user can sign in with Google through Supabase Auth.
2. A returning user remains signed in across browser sessions where Supabase session state allows.
3. Signed-out users cannot access `/onboarding`, `/dashboard`, or other protected budget routes.
4. Sign-out clears the session and blocks protected route access.
5. Profile creation after first authentication is idempotent.
6. Local and hosted environment-variable setup is documented.

## Focused Verification

Use the smallest verification that proves the milestone:

1. Unit-test the protected-route matcher or middleware helper if route protection is factored into a pure helper.
2. Add one integration or Playwright smoke test for signed-out protected-route redirect if the skeleton already has Playwright.
3. Manually verify Google sign-in on the deployed preview because OAuth redirects cannot be fully proven by unit tests.
4. Confirm no service-role key appears in client bundle references or `NEXT_PUBLIC_` variables.

## Handoff Notes

Milestone B is ready for hosted verification once Supabase and Google OAuth settings are configured for the deployment origin. Local code verification passes `npm run lint`, `npm run test`, and `npm run build`.
