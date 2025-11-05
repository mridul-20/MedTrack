// Google Gemini API integration
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-001:generateContent';

// Function to get API key at runtime
function getGeminiApiKey() {
  // Try environment variable first
  let apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  
  // Debug logging
  console.log("Environment check:");
  console.log("NODE_ENV:", process.env.NODE_ENV);
  console.log("All NEXT_PUBLIC vars:", Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC')));
  console.log("GEMINI_API_KEY value:", apiKey);
  console.log("GEMINI_API_KEY length:", apiKey?.length);
  
  // Fallback: if environment variable is not available, use the hardcoded key
  if (!apiKey) {
    console.log("Environment variable not found, using fallback API key");
    apiKey = "AIzaSyBZCIlzqiQbYP3k2iLx9BtplvPNVU-f6nE";
  }
  
  return apiKey;
}

export const aiService = {
  async generateChatResponse(userInput: string): Promise<string> {
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const GEMINI_API_KEY = getGeminiApiKey();
        console.log("GEMINI_API_KEY:", GEMINI_API_KEY ? "Present" : "Missing");
        if (!GEMINI_API_KEY) {
          return "❌ Gemini API key not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your environment variables.";
        }

        console.log(`Attempt ${attempt}/${maxRetries} - Calling Gemini API`);
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a helpful health assistant. Please provide helpful, accurate, and safe health advice for the following question. Always remind users to consult healthcare professionals for serious concerns: ${userInput}`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error ${response.status}:`, errorText);
        
        if (response.status === 403) {
          throw new Error("Gemini API: Invalid API key. Please check your NEXT_PUBLIC_GEMINI_API_KEY.");
        } else if (response.status === 503) {
          if (attempt < maxRetries) {
            console.log(`503 error on attempt ${attempt}, retrying in ${attempt * 1000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 1000));
            continue;
          }
          throw new Error("Gemini API: Service temporarily unavailable after multiple attempts.");
        } else if (response.status === 429) {
          if (attempt < maxRetries) {
            console.log(`429 rate limit on attempt ${attempt}, retrying in ${attempt * 2000}ms...`);
            await new Promise(resolve => setTimeout(resolve, attempt * 2000));
            continue;
          }
          throw new Error("Gemini API: Rate limit exceeded after multiple attempts.");
        } else {
          throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
      } catch (error) {
        lastError = error as Error;
        console.error(`Gemini API error on attempt ${attempt}:`, error);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${attempt * 1000}ms...`);
          await new Promise(resolve => setTimeout(resolve, attempt * 1000));
          continue;
        }
      }
    }

    return `❌ Could not connect to the Gemini API after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`;
  },

  async analyzeSymptoms(symptoms: string, age?: number): Promise<{
    recommendedMedicines: string[];
    possibleConditions: string[];
    selfCareAdvice: string[];
  }> {
    try {
      const GEMINI_API_KEY = getGeminiApiKey();
      console.log("GEMINI_API_KEY in analyzeSymptoms:", GEMINI_API_KEY ? "Present" : "Missing");
      if (!GEMINI_API_KEY) {
        throw new Error("Gemini API key not configured");
      }

      const prompt = `Analyze these symptoms and provide medical recommendations: "${symptoms}"${age ? ` (Age: ${age})` : ''}

Please respond in this exact JSON format:
{
  "recommendedMedicines": ["medicine1", "medicine2", "medicine3"],
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "selfCareAdvice": ["advice1", "advice2", "advice3"]
}

Focus on common over-the-counter medications and general health advice. Always emphasize consulting healthcare professionals for serious concerns.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", responseText);
        return {
          recommendedMedicines: ["Paracetamol", "Ibuprofen"],
          possibleConditions: ["General symptoms"],
          selfCareAdvice: ["Rest well", "Stay hydrated", "Consult a doctor if symptoms persist"]
        };
      }
    } catch (error) {
      console.error("Error analyzing symptoms:", error);
      return {
        recommendedMedicines: ["Paracetamol", "Ibuprofen"],
        possibleConditions: ["General symptoms"],
        selfCareAdvice: ["Rest well", "Stay hydrated", "Consult a doctor if symptoms persist"]
      };
    }
  }
};
