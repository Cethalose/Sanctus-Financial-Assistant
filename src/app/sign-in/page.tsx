import { env } from "@/lib/env";

type SignInPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const isConfigured = env.hasSupabaseConfig;
  const params = (await searchParams) ?? {};
  const callbackError = getCallbackError(params);

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
        {callbackError ? (
          <div className="notice">
            <strong>Authentication callback failed.</strong>
            <dl className="diagnostics">
              {callbackError.map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function getCallbackError(params: Record<string, string | string[] | undefined>) {
  if (getStringParam(params.error) !== "auth_callback") {
    return null;
  }

  return [
    ["stage", getStringParam(params.auth_error_stage)],
    ["name", getStringParam(params.auth_error_name)],
    ["message", getStringParam(params.auth_error_message)],
    ["code", getStringParam(params.auth_error_code)],
    ["status", getStringParam(params.auth_error_status)],
    ["hasFlowIdCookie", getStringParam(params.has_flow_id_cookie)],
    ["pkceCookieCount", getStringParam(params.pkce_cookie_count)],
  ].filter((entry): entry is [string, string] => Boolean(entry[1]));
}

function getStringParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
