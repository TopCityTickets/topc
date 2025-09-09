import { createClient } from '@supabase/supabase-js';

const displayError = (title: string, message: string) => {
    const rootEl = document.getElementById('root');
    if (rootEl) {
        rootEl.innerHTML = `
            <div style="font-family: Inter, sans-serif; background-color: #111827; color: #F3F4F6; display: flex; align-items: center; justify-content: center; height: 100vh; padding: 2rem;">
                <div style="text-align: center; max-width: 600px; border: 1px solid #1F2937; padding: 2.5rem; border-radius: 0.5rem; background-color: #1F2937;">
                    <h1 style="font-size: 1.5rem; font-weight: 800; color: #fff;">${title}</h1>
                    <p style="margin-top: 1rem; color: #D1D5DB; line-height: 1.6;">${message}</p>
                    <p style="margin-top: 1.5rem; font-size: 0.875rem; color: #4B5563;">Your app cannot connect to the database until this is resolved. See the console for more details.</p>
                </div>
            </div>
        `;
    }
    console.error(`${title}: ${message}`);
    throw new Error(message);
}

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
    const errorTitle = "Configuration Missing";
    const errorMessage = "Supabase credentials are not set. Please ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correctly defined as environment variables in your deployment settings and that the project has been redeployed.";
    displayError(errorTitle, errorMessage);
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);