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

// FIX: Switched from Vite-specific `import.meta.env` to `process.env` to resolve TypeScript errors.
// This change removes the need for `vite/client` types and Vite-specific environment checks.
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    const errorTitle = "Configuration Missing";
    const errorMessage = "Supabase credentials are not set. Please ensure you have set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables in your project settings and have redeployed the site.";
    displayError(errorTitle, errorMessage);
}

export const supabase = createClient(supabaseUrl!, supabaseAnonKey!);
