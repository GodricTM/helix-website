import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let client = null;

if (supabaseUrl && supabaseAnonKey) {
    let validUrl = supabaseUrl;

    // 1. Check if it's just a Project ID (no dots, e.g., "abcdefghijklm")
    if (!validUrl.includes('.')) {
        console.warn('VITE_SUPABASE_URL looks like a Project ID. Constructing full URL.');
        validUrl = `https://${validUrl}.supabase.co`;
    }

    // 2. Ensure Protocol is https://
    if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        console.warn('VITE_SUPABASE_URL missing protocol. Appending https://');
        validUrl = `https://${validUrl}`;
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
