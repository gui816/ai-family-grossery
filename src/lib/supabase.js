import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(
  supabaseUrl || "https://example.supabase.co",
  supabaseKey || "missing-anon-key",
  { realtime: { params: { eventsPerSecond: 5 } } }
);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);