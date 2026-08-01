import { describe, expect, it } from "vitest";
import { createAuthCallbackUrl, isAuthOnlyPath, isProtectedPath } from "./routes";

describe("auth route classification", () => {
  it("marks budget and account routes as protected", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/settings")).toBe(true);
    expect(isProtectedPath("/onboarding")).toBe(true);
    expect(isProtectedPath("/account")).toBe(true);
  });

  it("leaves public and auth callback routes unprotected", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/sign-in")).toBe(false);
    expect(isProtectedPath("/auth/callback")).toBe(false);
  });

  it("marks sign-in as auth-only", () => {
    expect(isAuthOnlyPath("/sign-in")).toBe(true);
    expect(isAuthOnlyPath("/dashboard")).toBe(false);
  });

  it("creates callback URLs on the request origin", () => {
    expect(createAuthCallbackUrl("https://preview.example.com", "/dashboard")).toBe(
      "https://preview.example.com/auth/callback?next=%2Fdashboard",
    );
  });
});
