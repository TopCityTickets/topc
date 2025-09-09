// Fix: Add triple-slash directive to include Vite's client types, which defines `import.meta.env`.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// These values are read from your project's build-time environment variables.
// In Vercel, you must name your environment variables with the `VITE_` prefix
// for them to be exposed to the frontend code during the build process.
//
// 1. Go to your Vercel Project -> Settings -> Environment Variables.
// 2. Create/Rename a variable to `VITE_SUPABASE_URL` with your Supabase URL.
// 3. Create/Rename another variable to `VITE_SUPABASE_ANON_KEY` with your Supabase Anon Key.
// 4. Redeploy your application for the changes to take effect.

// This uses the standard `import.meta.env` object, which is populated by
// build tools that Vercel's build system supports.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Supabase configuration is missing. Please ensure you have set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your Vercel project settings and have redeployed the site.";
    
    // Display a user-friendly error message on the screen
    const rootEl = document.getElementById('root');
    if (rootEl) {
        rootEl.innerHTML = `
            <div style="font-family: Inter, sans-serif; background-color: #111827; color: #F3F4F6; display: flex; align-items: center; justify-content: center; height: 100vh; padding: 2rem;">
                <div style="text-align: center; max-width: 600px; border: 1px solid #1F2937; padding: 2.5rem; border-radius: 0.5rem; background-color: #1F2937;">
                    <h1 style="font-size: 1.5rem; font-weight: 800; color: #fff;">Configuration Error</h1>
                    <p style="margin-top: 1rem; color: #D1D5DB; line-height: 1.6;">${errorMessage}</p>
                    <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #4B5563;">Your app cannot connect to the database until this is resolved. See the console for more details.</p>
                </div>
            </div>
        `;
    }
    
    // Also log to console and stop execution
    console.error(errorMessage);
    throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);