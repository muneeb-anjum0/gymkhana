import { createBrowserClient } from "@supabase/ssr";

import type { Database } from "@/types/database";

import { getSupabaseEnv } from "./env";

export function createSupabaseBrowserClient() {
  const supabaseEnv = getSupabaseEnv();

  if (!supabaseEnv) {
    return null;
  }

  return createBrowserClient<Database>(supabaseEnv.url, supabaseEnv.anonKey);
}