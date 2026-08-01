import type { User } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileMetadata = {
  full_name?: string;
  name?: string;
  avatar_url?: string;
  picture?: string;
};

export async function ensureProfile(user: User): Promise<void> {
  const metadata = user.user_metadata as ProfileMetadata;
  const supabase = await createSupabaseServerClient();

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
