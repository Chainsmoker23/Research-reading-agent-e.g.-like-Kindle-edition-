
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Paper, SearchFilters } from '../types';

// Helper to get keys dynamically including user override
const getApiKeys = () => {
  const userKeys: string[] = [];
  
  if (typeof window !== 'undefined') {
    // Legacy support
    const legacy = localStorage.getItem('user_gemini_key');
    if (legacy) userKeys.push(legacy);
    
    // Multi-key support (1-5)
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

  // User keys first, then env keys. Deduplicate.
  const allKeys = [...userKeys, ...envKeys];
  
  return [...new Set(allKeys)].filter((key): key is string => !!key && key.trim().length > 0);
};

// Helper to sanitize JSON string
const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes an AI operation with automatic failover across multiple API keys.
 */
const runWithRotation = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  let lastError: any;
  const keysToTry = getApiKeys();

  if (keysToTry.length === 0) {
    keysToTry.push('');
  }

  for (let i = 0; i < keysToTry.length; i++) {
    try {
      const currentKey = keysToTry[i];
      const ai = new GoogleGenAI({ apiKey: currentKey });
      return await operation(ai);
    } catch (error: any) {
      lastError = error;
      const msg = error.message || '';
      const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('exhausted');

      console.warn(`Parallel Search API attempt failed with Key #${i + 1} (${isQuota ? 'Quota' : 'Error'}): ${msg}`);
      
      if (isQuota) {
        await delay(1000 + (i * 500));
      }

      if (i === keysToTry.length - 1) break;
    }
  }

  throw lastError || new Error("All provided API keys failed.");
};

async function fetchPapersSubset(
    query: string, 
    type: 'journal' | 'preprint', 
    filters?: SearchFilters
): Promise<Paper[]> {
    try {
        let constraints = "";
        if (filters) {
            const parts = [];
            if (filters.startYear) parts.push(`published on or after ${filters.startYear}`);
            if (filters.endYear) parts.push(`published on or before ${filters.endYear}`);
            if (filters.source) parts.push(`from sources related to "${filters.source}"`);
            
            if (parts.length > 0) {
                constraints = `STRICT SEARCH CONSTRAINTS: Only include papers that are ${parts.join(" AND ")}.`;
            }
        }

        const focus = type === 'journal' 
            ? "Focus strictly on established, Peer Reviewed journals (e.g., Nature, Science, IEEE, Springer)." 
            : "Focus strictly on Preprints (e.g., arXiv, bioRxiv, medRxiv) or recent cutting-edge developments.";

        const statusValue = type === 'journal' ? 'Peer Reviewed' : 'Preprint';

        const prompt = `
            Find 3 distinct research papers on "${query}".
            ${focus}
            ${constraints}
            
            Return a strictly valid JSON array. Each object must have:
            - title (string)
            - authors (string)
            - year (string)
            - description (string, max 25 words, helping user decide to read)
            - source (string)
            - status (string, strictly "${statusValue}")
        `;

        const response = await runWithRotation<GenerateContentResponse>((ai) => ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
                responseSchema: {
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
                }
            }
        }));

        const text = response.text || "[]";
        return JSON.parse(cleanJsonString(text));
    } catch (e) {
        console.warn(`Parallel search subset (${type}) failed after retries`, e);
        // Return empty array on failure so other parallel request can still succeed
        return [];
    }
}

export const searchPapersFast = async (query: string, filters?: SearchFilters): Promise<Paper[]> => {
    // Execute both search strategies in parallel for speed
    const [journals, preprints] = await Promise.all([
        fetchPapersSubset(query, 'journal', filters),
        fetchPapersSubset(query, 'preprint', filters)
    ]);

    // Combine results
    const combined = [...journals, ...preprints];
    
    // Fallback if both fail
    if (combined.length === 0) {
        throw new Error("No papers found. Please check your API usage or try different keywords.");
    }

    // Add unique IDs and dedup based on title (simple check)
    const seenTitles = new Set();
    return combined.filter(p => {
        if (seenTitles.has(p.title)) return false;
        seenTitles.add(p.title);
        return true;
    }).map((item, index) => ({
        ...item,
        id: `parallel-${Date.now()}-${index}`
    }));
};
