import { createClient } from '@supabase/supabase-js';

// --- IMPORTANT ---
// These values are read from your project's environment variables.
// In a no-build setup like this, your hosting provider (e.g., Vercel)
// needs a way to inject these variables into the client-side code.
// This often requires using a specific prefix for the variable names
// (like VITE_ or NEXT_PUBLIC_). Check your hosting provider's documentation.

// This check prevents a crash in the browser where `process` is not defined.
const supabaseUrl = typeof process !== 'undefined' ? process.env.SUPABASE_URL : undefined;
const supabaseAnonKey = typeof process !== 'undefined' ? process.env.SUPABASE_ANON_KEY : undefined;


if (!supabaseUrl || !supabaseAnonKey) {
    const errorMessage = "Supabase credentials could not be found. For a static site, server-side environment variables (like those set in Vercel) are not automatically available in the browser. You may need to use a build tool or a specific variable naming convention (e.g., VITE_YOUR_VAR) supported by your hosting provider to expose them to the frontend.";
    
    // Display a user-friendly error message on the screen
    const rootEl = document.getElementById('root');
    if (rootEl) {
        rootEl.innerHTML = `
            <div style="font-family: Inter, sans-serif; background-color: #111827; color: #F3F4F6; display: flex; align-items: center; justify-content: center; height: 100vh; padding: 2rem;">
                <div style="text-align: center; max-width: 600px; border: 1px solid #1F2937; padding: 2.5rem; border-radius: 0.5rem; background-color: #1F2937;">
                    <h1 style="font-size: 1.5rem; font-weight: 800; color: #fff;">Configuration Error</h1>
                    <p style="margin-top: 1rem; color: #D1D5DB; line-height: 1.6;">${errorMessage}</p>
                    <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #4B5563;">Your app cannot connect to the database until this is resolved.</p>
                </div>
            </div>
        `;
    }
    
    // Also log to console and stop execution
    console.error(errorMessage);
    throw new Error(errorMessage);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);