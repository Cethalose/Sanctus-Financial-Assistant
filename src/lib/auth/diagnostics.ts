type CookieLike = {
  name: string;
};

const pkceFlowSlotPattern = /-flow-[A-Za-z0-9_-]{8,64}-code-verifier$/;

export function summarizePkceCookies(cookies: CookieLike[]) {
  const pkceCookies = cookies.filter((cookie) => isPkceCookieName(cookie.name));

  return {
    hasPkceCookie: pkceCookies.length > 0,
    pkceCookieCount: pkceCookies.length,
    hasFixedCodeVerifier: cookies.some((cookie) => cookie.name.endsWith("-code-verifier")),
    hasFlowCodeVerifier: cookies.some((cookie) => pkceFlowSlotPattern.test(cookie.name)),
    hasFlowIndex: cookies.some((cookie) => cookie.name.endsWith("-flows-code-verifier")),
  };
}

export function sanitizeAuthError(error: unknown) {
  if (!error || typeof error !== "object") {
    return {
      name: "UnknownAuthError",
      message: "Unknown Supabase auth error.",
      code: null,
      status: null,
    };
  }

  const record = error as Record<string, unknown>;

  return {
    name: typeof record.name === "string" ? record.name : "SupabaseAuthError",
    message: typeof record.message === "string" ? record.message : "Unknown Supabase auth error.",
    code: typeof record.code === "string" ? record.code : null,
    status: typeof record.status === "number" ? record.status : null,
  };
}

export function logAuthDiagnostic(
  level: "info" | "warn" | "error",
  event: string,
  details: Record<string, unknown>,
) {
  const payload = {
    event,
    ...details,
  };

  if (level === "error") {
    console.error("[auth]", payload);
    return;
  }

  if (level === "warn") {
    console.warn("[auth]", payload);
    return;
  }

  console.info("[auth]", payload);
}

function isPkceCookieName(name: string): boolean {
  return (
    name.endsWith("-code-verifier") ||
    name.endsWith("-flows-code-verifier") ||
    pkceFlowSlotPattern.test(name)
  );
}
