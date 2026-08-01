import { describe, expect, it } from "vitest";
import { hasPkceFlowIdCookie, sanitizePkceFlowId } from "./pkce-flow";

describe("sanitizePkceFlowId", () => {
  it("accepts Supabase PKCE flow ids", () => {
    expect(sanitizePkceFlowId("abcDEF123_-")).toBe("abcDEF123_-");
  });

  it("rejects invalid or empty flow ids", () => {
    expect(sanitizePkceFlowId("short")).toBeNull();
    expect(sanitizePkceFlowId("contains space")).toBeNull();
    expect(sanitizePkceFlowId(null)).toBeNull();
  });

  it("reports whether the flow id cookie is usable", () => {
    expect(hasPkceFlowIdCookie("abcDEF123_-")).toBe(true);
    expect(hasPkceFlowIdCookie("short")).toBe(false);
  });
});
