import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// Environment variables are injected by a build tool during the
// build process. If this code is running without a build step,
// the application will fail to connect to Supabase.

// Attempt to read Supabase credentials from environment variables.
// It checks for variables with the `VITE_` prefix (best practice for browser exposure)
// and falls back to non-prefixed versions for flexibility.
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Configuration Missing: Supabase credentials are not set. Please ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly defined as environment variables in your deployment settings and that the project has been redeployed.";
    console.error(errorMessage);
    // Throwing an error here will halt the app's execution, which is appropriate
    // since the app cannot function without a database connection.
    throw new Error(errorMessage);
}

// The '!' non-null assertion is safe here because of the check above.
export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);