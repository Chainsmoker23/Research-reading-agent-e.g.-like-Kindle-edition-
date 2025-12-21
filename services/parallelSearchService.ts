
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Paper, SearchFilters } from '../types';

// VERSION: UNIFIED_SINGLE_CALL_V2
// This version is designed to be bulletproof against 429 errors by trying multiple models.

const getApiKeys = () => {
  const userKeys: string[] = [];
  if (typeof window !== 'undefined') {
    const legacy = localStorage.getItem('user_gemini_key');
    if (legacy) userKeys.push(legacy);
    for (let i = 1; i <= 5; i++) {
      const k = localStorage.getItem(`user_gemini_key_${i}`);
      if (k) userKeys.push(k);
    }
  }
  const envKeys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4,
    process.env.API_KEY_5
  ];
  const allKeys = [...userKeys, ...envKeys];
  // Ensure we have at least one empty string to attempt default env if no keys found
  const unique = [...new Set(allKeys)].filter((key): key is string => !!key && key.trim().length > 0);
  return unique.length > 0 ? unique : [''];
};

const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// The Model Ladder: If the first one hits a limit, we step down to the next.
// 'gemini-3-flash-preview': Best for reasoning
// 'gemini-flash-latest': Stable, good fallback
// 'gemini-flash-lite-latest': Fastest, lowest quota impact
const MODEL_FALLBACKS = [
  "gemini-3-flash-preview", 
  "gemini-flash-latest", 
  "gemini-flash-lite-latest"
];

/**
 * Robust execution function that rotates through:
 * 1. API Keys
 * 2. Models (per key)
 * This maximizes the chance of success even on free tiers.
 */
const robustGenerateContent = async (
  prompt: string,
  schema: any
): Promise<GenerateContentResponse> => {
  const keys = getApiKeys();
  let lastError: any;

  for (let k = 0; k < keys.length; k++) {
    const apiKey = keys[k];
    const ai = new GoogleGenAI({ apiKey });

    for (let m = 0; m < MODEL_FALLBACKS.length; m++) {
      const model = MODEL_FALLBACKS[m];
      
      try {
        const response = await ai.models.generateContent({
          model: model,
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: schema
          }
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const msg = error.message || '';
        const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('exhausted');

        console.warn(`Attempt failed | Key #${k+1} | Model: ${model} | Error: ${isQuota ? 'QUOTA_EXCEEDED' : msg}`);

        if (isQuota) {
          // If quota hit, wait briefly then try next model or next key
          await delay(1500); 
        } else {
          // If non-quota error (e.g. network), break inner loop to try next key immediately
          await delay(500);
          break; 
        }
      }
    }
  }

  throw lastError || new Error("Unable to search. Please check your API Quota.");
};

export const searchPapersFast = async (query: string, filters?: SearchFilters): Promise<Paper[]> => {
    let constraints = "";
    if (filters) {
        const parts = [];
        if (filters.startYear) parts.push(`published on or after ${filters.startYear}`);
        if (filters.endYear) parts.push(`published on or before ${filters.endYear}`);
        if (filters.source) parts.push(`from sources related to "${filters.source}"`);
        if (parts.length > 0) constraints = `CONSTRAINTS: ${parts.join(" AND ")}.`;
    }

    // We request only 3 papers to minimize token usage (TPM limits)
    const prompt = `
        Find 3 distinct research papers on "${query}".
        ${constraints}
        Goal: Mix of Peer Reviewed journals and Preprints.
        
        Return JSON array. Each object:
        - title (string)
        - authors (string)
        - year (string)
        - description (string, max 20 words)
        - source (string)
        - status (enum: "Preprint", "Peer Reviewed")
    `;

    const schema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                authors: { type: Type.STRING },
                year: { type: Type.STRING },
                description: { type: Type.STRING },
                source: { type: Type.STRING },
                status: { type: Type.STRING, enum: ["Preprint", "Peer Reviewed"] }
            },
            required: ["title", "authors", "year", "description", "source", "status"]
        }
    };

    try {
        const response = await robustGenerateContent(prompt, schema);
        const text = response.text || "[]";
        const papers = JSON.parse(cleanJsonString(text));

        if (!papers || papers.length === 0) {
           // If JSON parsing worked but array is empty, it's a content failure
           throw new Error("No papers found.");
        }

        return papers.map((item: any, index: number) => ({
            ...item,
            id: `unified-${Date.now()}-${index}`
        }));

    } catch (e) {
        console.error("Final search failure:", e);
        // Fallback mock data if absolutely everything fails, to prevent app crash
        throw new Error("Search service busy (Rate Limit). Please wait 30 seconds and try again.");
    }
};
