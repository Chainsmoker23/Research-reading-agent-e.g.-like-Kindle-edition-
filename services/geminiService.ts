
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Paper, SearchFilters } from '../types';

// Helper to get keys dynamically including user override
const getApiKeys = () => {
  const userKeys: string[] = [];
  
  if (typeof window !== 'undefined') {
    // Support legacy key if exists
    const legacyKey = localStorage.getItem('user_gemini_key');
    if (legacyKey) userKeys.push(legacyKey);

    // Support new indexed keys 1-5
    for (let i = 1; i <= 5; i++) {
      const key = localStorage.getItem(`user_gemini_key_${i}`);
      if (key) userKeys.push(key);
    }
  }
  
  const envKeys = [
    process.env.API_KEY,
    process.env.API_KEY_2,
    process.env.API_KEY_3,
    process.env.API_KEY_4,
    process.env.API_KEY_5
  ];

  // Prioritize user keys, then env keys. Deduplicate.
  const allKeys = [...userKeys, ...envKeys];
  
  return [...new Set(allKeys)].filter((key): key is string => !!key && key.trim().length > 0);
};

// Helper to sanitize JSON string if the model returns markdown code blocks
const cleanJsonString = (str: string) => {
  return str.replace(/```json\n?|\n?```/g, '').trim();
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Executes an AI operation with automatic failover across multiple API keys.
 * If a key fails (e.g. quota exceeded), it proceeds to the next one with a small backoff.
 */
const runWithRotation = async <T>(
  operation: (ai: GoogleGenAI) => Promise<T>
): Promise<T> => {
  let lastError: any;
  const keysToTry = getApiKeys();

  if (keysToTry.length === 0) {
    console.warn("No API Keys provided in environment variables or user settings.");
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
      
      console.warn(`Gemini API attempt failed with Key #${i + 1} (${isQuota ? 'Quota/Rate Limit' : 'Error'}): ${msg}`);
      
      // If it's a quota error, wait a bit before trying the next key.
      // If keys share a project, this delay helps the bucket drain.
      if (isQuota) {
        await delay(1000 + (i * 500));
      }
      
      // If this was the last key, stop and throw
      if (i === keysToTry.length - 1) break;
    }
  }

  throw lastError || new Error("All provided API keys failed.");
};

export const searchPapers = async (query: string, filters?: SearchFilters): Promise<Paper[]> => {
  try {
    let filterInstruction = "";
    if (filters) {
      const parts = [];
      if (filters.startYear) parts.push(`published on or after ${filters.startYear}`);
      if (filters.endYear) parts.push(`published on or before ${filters.endYear}`);
      if (filters.source) parts.push(`from sources/journals strictly matching or related to "${filters.source}"`);
      
      if (parts.length > 0) {
        filterInstruction = `STRICT SEARCH CONSTRAINTS: Only include papers that are ${parts.join(" AND ")}.`;
      }
    }

    const response = await runWithRotation<GenerateContentResponse>((ai) => ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find 5 relevant and high-quality research papers on "${query}". 
      
      ${filterInstruction}

      Crucial Requirement:
      - Search across both peer-reviewed journals (e.g., IEEE, ACM, Nature, Science, Springer) AND reputable preprint servers (e.g., arXiv, bioRxiv, medRxiv).
      - Ensure a diverse selection if applicable, unless restricted by constraints.
      
      Return a strictly valid JSON array. Each object must have:
      - title (string)
      - authors (string)
      - year (string)
      - description (string, max 30 words, helping the user decide to read it)
      - source (string, e.g. "arXiv", "Nature", "ICLR")
      - status (string, strictly either "Preprint" or "Peer Reviewed")
      `,
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
    const data = JSON.parse(cleanJsonString(text));
    
    // Add unique IDs
    return data.map((item: any, index: number) => ({
      ...item,
      id: `paper-${Date.now()}-${index}`
    }));

  } catch (error) {
    console.error("Search failed after retries:", error);
    throw error; // Re-throw so UI can show the message
  }
};

export const generatePaperExplanation = async (paper: Paper): Promise<string> => {
  try {
    const response = await runWithRotation<GenerateContentResponse>((ai) => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `You are an expert academic mentor. I want to read the paper "${paper.title}" by ${paper.authors} (${paper.year}).
      
      First, search for this paper to understand its full content, abstract, and conclusions.
      Then, write a "Kindle-style" simplified conceptual rewrite of the paper.
      
      Guidelines:
      1.  **Tone:** Formal, calm, accessible, but scientifically accurate. Like a well-written Scientific American article.
      2.  **Structure:**
          *   **Title & Authors** (Header)
          *   **The Big Picture:** Why does this research exist? What problem is it solving?
          *   **Core Concepts:** Explain the key ideas without heavy jargon.
          *   **Methodology:** How did they do it? (Conceptual explanation, no complex math).
          *   **Key Findings:** What did they discover?
          *   **Implications:** Why does this matter?
      3.  **Format:** Use Markdown. Use ## for section headers. Use bold for emphasis. Break text into readable paragraphs.
      `,
      config: {
        tools: [{ googleSearch: {} }],
        thinkingConfig: { thinkingBudget: 2048 }, // Allow some thinking for structuring the explanation
      }
    }));

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Explanation failed after retries:", error);
    throw error;
  }
};

export const askQuestionAboutPaper = async (paper: Paper, question: string, history: {role: string, text: string}[]): Promise<string> => {
  try {
    const contextPrompt = `
      You are an academic reading assistant. The user is currently reading the paper:
      "${paper.title}" by ${paper.authors}.

      Your goal is to answer the user's question based strictly on the likely content of this paper. 
      If the question is about general knowledge but relevant to the paper, explain it in the context of the paper.
      
      Tone: Helpful, educational, clear.
      
      User Question: ${question}
    `;

    const response = await runWithRotation<GenerateContentResponse>((ai) => ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: contextPrompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable search to look up specific details of the paper to answer accurately
      }
    }));

    return response.text || "I couldn't find an answer to that.";
  } catch (error) {
    console.error("Q&A failed after retries:", error);
    return "Sorry, I encountered an error while trying to answer your question. Please check your network or API quota.";
  }
};
