import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";

// In Next.js, browser client components can only access process.env variables prefixed with NEXT_PUBLIC_
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "placeholder-key";

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn("⚠️ Warning: NEXT_PUBLIC_SUPABASE_URL is missing in .env.local.");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
