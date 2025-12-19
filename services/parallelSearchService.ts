import { GoogleGenAI, Type } from "@google/genai";
import { Paper, SearchFilters } from '../types';

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize JSON string
const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
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

        const response = await ai.models.generateContent({
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
        });

        const text = response.text || "[]";
        return JSON.parse(cleanJsonString(text));
    } catch (e) {
        console.warn(`Parallel search subset (${type}) failed`, e);
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
        throw new Error("No papers found in parallel search.");
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
