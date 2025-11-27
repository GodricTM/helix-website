import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

if (supabaseUrl && supabaseAnonKey) {
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
        console.error('Invalid VITE_SUPABASE_URL: Must start with http:// or https://');
    } else {
        try {
            client = createClient(supabaseUrl, supabaseAnonKey);
        } catch (e) {
            console.error('Failed to initialize Supabase client:', e);
        }
    }
} else {
    console.error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = client;
