import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// 1. Create a project on Supabase: https://app.supabase.com/
// 2. Go to 'Project Settings' > 'API' in your Supabase dashboard.
// 3. Find your Project URL and anon (public) key, and paste them here.

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseAnonKey === 'YOUR_SUPABASE_ANON_KEY') {
    // This provides a clear message in the developer console to help with setup.
    // In a real production app, you would use environment variables.
    alert("Supabase credentials are not configured. Please update `services/supabaseClient.ts` with your project's URL and anon key.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
