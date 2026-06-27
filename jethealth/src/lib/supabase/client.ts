import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Fixed cookie name so the browser and server clients always agree on the
      // session cookie, even when they are configured with different Supabase
      // URLs (e.g. public tunnel for the browser vs internal URL for the server).
      cookieOptions: { name: "sb-jethealth-auth-token" },
    },
  );
}
