import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

if (supabaseUrl && supabaseAnonKey) {
    let validUrl = supabaseUrl;
    if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
        console.warn('VITE_SUPABASE_URL missing protocol. Appending https://');
        validUrl = `https://${supabaseUrl}`;
    }

    try {
        console.log('Initializing Supabase with URL:', validUrl);
        client = createClient(validUrl, supabaseAnonKey);
    } catch (e) {
        console.error('Failed to initialize Supabase client:', e);
    }
} else {
    console.error('Missing Supabase environment variables. Please check .env.local');
}

export const supabase = client;
