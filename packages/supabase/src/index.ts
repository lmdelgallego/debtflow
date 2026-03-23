import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

interface CookieStoreAdapter {
  getAll(): { name: string; value: string }[];
  setAll(
    cookiesToSet: {
      name: string;
      value: string;
      options?: Record<string, unknown>;
    }[]
  ): void;
}

interface MobileStorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export function createWebBrowserClient(url: string, key: string) {
  return createBrowserClient<Database>(url, key);
}

export function createWebServerClient(
  url: string,
  key: string,
  cookies: CookieStoreAdapter
) {
  return createServerClient<Database>(url, key, { cookies });
}

export function createMobileClient(
  url: string,
  key: string,
  storage: MobileStorageAdapter
): SupabaseClient<Database> {
  return createClient<Database>(url, key, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  });
}

export type { Database, MobileStorageAdapter };
