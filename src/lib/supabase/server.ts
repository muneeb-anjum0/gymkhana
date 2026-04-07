import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

export async function createSupabaseServerClient() {
  const supabaseEnv = getSupabaseEnv();

  if (!supabaseEnv) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(supabaseEnv.url, supabaseEnv.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
    },
  });
}