import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileClient = {
  from(table: "profiles"): {
    upsert(
      values: {
        id: string;
        email: string | null;
        full_name: string | null;
        avatar_url: string | null;
      },
      options: { onConflict: "id" },
    ): PromiseLike<{ error: { message: string } | null }>;
  };
};

type ProfileMetadata = {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
};

export async function ensureProfile(user: User, client?: ProfileClient): Promise<void> {
  const metadata = user.user_metadata as ProfileMetadata;
  const supabase = client ?? (await createSupabaseServerClient());

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email ?? null,
      full_name: metadata.full_name ?? metadata.name ?? null,
      avatar_url: metadata.avatar_url ?? metadata.picture ?? null,
    },
    { onConflict: "id" },
  );

  if (error) {
    throw new Error(`Failed to ensure profile: ${error.message}`);
  }
}
