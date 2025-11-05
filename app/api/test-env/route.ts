import { NextResponse } from 'next/server';

export async function GET() {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    allNextPublicVars: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')),
    allEnvKeys: Object.keys(process.env).slice(0, 10) // First 10 env vars for debugging
  };

  return NextResponse.json(envVars);
}