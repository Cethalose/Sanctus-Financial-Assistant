import { describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";
import { ensureProfile } from "./profile";

describe("ensureProfile", () => {
  it("uses the authenticated callback client when provided", async () => {
    const upsert = vi.fn().mockResolvedValue({ error: null });
    const client = {
      from: vi.fn(() => ({ upsert })),
    };

    await ensureProfile(
      {
        id: "user-123",
        email: "person@example.test",
        user_metadata: {
          name: "Test Person",
          picture: "https://example.test/avatar.png",
        },
      } as User,
      client,
    );

    expect(client.from).toHaveBeenCalledWith("profiles");
    expect(upsert).toHaveBeenCalledWith(
      {
        id: "user-123",
        email: "person@example.test",
        full_name: "Test Person",
        avatar_url: "https://example.test/avatar.png",
      },
      { onConflict: "id" },
    );
  });

  it("throws a stable profile creation error", async () => {
    const client = {
      from: vi.fn(() => ({
        upsert: vi.fn().mockResolvedValue({
          error: { message: "new row violates row-level security policy for table \"profiles\"" },
        }),
      })),
    };

    await expect(
      ensureProfile(
        {
          id: "user-123",
          email: null,
          user_metadata: {},
        } as User,
        client,
      ),
    ).rejects.toThrow(
      'Failed to ensure profile: new row violates row-level security policy for table "profiles"',
    );
  });
});
