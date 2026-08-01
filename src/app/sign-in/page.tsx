import { env } from "@/lib/env";
import { signInWithGoogle } from "./actions";

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
        <form action={signInWithGoogle}>
          <button className="button" type="submit" disabled={!isConfigured}>
            Continue with Google
          </button>
        </form>
        {!isConfigured ? (
          <div className="notice">
            Supabase environment variables are required before Google sign-in can start.
          </div>
        ) : null}
      </div>
    </section>
  );
}
