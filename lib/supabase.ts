// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import { supabaseConfig } from './supabase-config'

// Try environment variables first, fallback to config file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || supabaseConfig.url;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || supabaseConfig.anonKey;

// Debug logging
console.log("Supabase Environment check:");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "Missing");
console.log("NEXT_PUBLIC_SUPABASE_ANON_KEY:", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Present" : "Missing");
console.log("Using Supabase URL:", supabaseUrl);
console.log("Using real Supabase connection");

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
