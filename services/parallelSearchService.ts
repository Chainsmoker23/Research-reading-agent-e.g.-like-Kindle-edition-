
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Paper, SearchFilters } from '../types';
import { getGlobalApiKeys } from './dataService';

// VERSION: UNIFIED_SINGLE_CALL_V3
// Now supports Shared Database Keys

const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MODEL_FALLBACKS = [
  "gemini-3-flash-preview", 
  "gemini-flash-latest", 
  "gemini-flash-lite-latest"
];

const robustGenerateContent = async (
  prompt: string,
  schema: any
): Promise<GenerateContentResponse> => {
  // Fetch keys asynchronously from DB (Shared)
  const dbKeys = await getGlobalApiKeys();
  const envKeys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4,
    process.env.API_KEY_5
  ];
  
  // Combine Shared DB keys + Env keys + Local legacy
  const allKeys = [...dbKeys, ...envKeys];
  const keys = [...new Set(allKeys)].filter((key): key is string => !!key && key.trim().length > 0);
  
  if (keys.length === 0) keys.push(''); 

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
          await delay(1500); 
        } else {
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
           throw new Error("No papers found.");
        }

        return papers.map((item: any, index: number) => ({
            ...item,
            id: `unified-${Date.now()}-${index}`
        }));

    } catch (e) {
        console.error("Final search failure:", e);
        throw new Error("Search service busy (Rate Limit). Please wait 30 seconds and try again.");
    }
};
