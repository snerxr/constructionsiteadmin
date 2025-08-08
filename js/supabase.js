import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@2';
import { CONFIG } from '../config.js';

// Initialize Supabase client
let supabase = null;

export function initSupabase() {
    // Load credentials from config file
    const supabaseUrl = CONFIG.SUPABASE_URL;
    const supabaseKey = CONFIG.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
        console.error('Please set up your Supabase credentials');
        return null;
    }
    
    supabase = createClient(supabaseUrl, supabaseKey);
    return supabase;
}

export function getSupabase() {
    if (!supabase) {
        return initSupabase();
    }
    return supabase;
}