# Deployment

Milestone A is a deployable Next.js skeleton intended for Vercel.

## Local setup

1. Use Node 22.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Run `npm run dev`.
5. Open `http://localhost:3000`.

Supabase public variables must be configured before Google sign-in can start.
Without them, protected routes redirect to `/sign-in` and the Google sign-in
button renders disabled.

## Vercel setup

1. Connect the GitHub repository to Vercel.
2. Use the default Next.js framework preset.
3. Configure these environment variables when Supabase is provisioned:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL`
4. Promote production manually after preview acceptance.

## Google OAuth setup

1. In Supabase Auth, enable the Google provider and enter the Google OAuth
   client ID and client secret.
2. In Google Cloud, include each deployed app origin in Authorized JavaScript
   origins.
3. In Google Cloud, include the Supabase Auth callback URL in Authorized
   redirect URIs for local, preview, and production environments.
4. Set `NEXT_PUBLIC_APP_URL` to the current app origin so Supabase returns users
   to `/auth/callback`.

## Verification

Run the smallest checks for the skeleton:

```bash
npm run test
npm run build
```
