// Test environment variables
console.log("NEXT_PUBLIC_GEMINI_API_KEY:", process.env.NEXT_PUBLIC_GEMINI_API_KEY ? "Present" : "Missing");
console.log("NEXT_PUBLIC_SUPABASE_URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Present" : "Missing");
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('GEMINI') || key.includes('SUPABASE')));
