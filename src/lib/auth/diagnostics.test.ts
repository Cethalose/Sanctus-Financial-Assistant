import { describe, expect, it } from "vitest";
import { sanitizeAuthError, summarizePkceCookies } from "./diagnostics";

describe("summarizePkceCookies", () => {
  it("reports PKCE verifier cookie classes without exposing values", () => {
    expect(
      summarizePkceCookies([
        { name: "sb-project-auth-token" },
        { name: "sb-project-auth-token-code-verifier" },
        { name: "sb-project-auth-token-flow-abcDEF123-code-verifier" },
        { name: "sb-project-auth-token-flows-code-verifier" },
      ]),
    ).toEqual({
      hasPkceCookie: true,
      pkceCookieCount: 3,
      hasFixedCodeVerifier: true,
      hasFlowCodeVerifier: true,
      hasFlowIndex: true,
    });
  });
});

describe("sanitizeAuthError", () => {
  it("keeps only non-secret Supabase auth error fields", () => {
    expect(
      sanitizeAuthError({
        name: "AuthPKCECodeVerifierMissingError",
        message: "invalid request: both auth code and code verifier should be non-empty",
        code: "bad_code_verifier",
        status: 400,
        access_token: "secret",
        refresh_token: "secret",
      }),
    ).toEqual({
      name: "AuthPKCECodeVerifierMissingError",
      message: "invalid request: both auth code and code verifier should be non-empty",
      code: "bad_code_verifier",
      status: 400,
    });
  });
});
