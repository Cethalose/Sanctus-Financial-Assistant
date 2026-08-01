import { env } from "@/lib/env";

export default function SignInPage() {
  const isConfigured = env.hasSupabaseConfig;

  return (
    <section className="section">
      <div className="panel stack">
        <p className="eyebrow">Authentication</p>
        <h1>Sign in</h1>
        <p className="lead">
          Use Google authentication to access budget onboarding and the dashboard.
        </p>
        {isConfigured ? (
          <a className="button" href="/auth/sign-in">
            Continue with Google
          </a>
        ) : (
          <div className="notice">
            Supabase environment variables are required before Google sign-in can start.
          </div>
        )}
      </div>
    </section>
  );
}
