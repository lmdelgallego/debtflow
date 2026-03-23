import { createWebBrowserClient } from "@debtflow/supabase";

export function createClient() {
  return createWebBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
