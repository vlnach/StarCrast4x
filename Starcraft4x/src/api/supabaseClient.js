import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client is optional. If env vars are missing, we export null and
 * the app uses local JSON files as fallback.
 */
const projectUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseClient =
  projectUrl && anonKey ? createClient(projectUrl, anonKey) : null;
