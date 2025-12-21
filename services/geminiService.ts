
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Paper, SearchFilters } from '../types';
import { getGlobalApiKeys } from './dataService';

// VERSION: ROBUST_FALLBACK_V3 (Shared Keys)

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const MODEL_FALLBACKS = [
  "gemini-3-flash-preview", 
  "gemini-flash-latest", 
  "gemini-flash-lite-latest"
];

const robustGenerateContent = async (
  contents: string,
  config: any = {}
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
          contents: contents,
          config: config
        });
        return response;
      } catch (error: any) {
        lastError = error;
        const msg = error.message || '';
        const isQuota = msg.includes('429') || msg.includes('quota') || msg.includes('exhausted');

        console.warn(`Explanation failed | Key #${k+1} | Model: ${model} | Error: ${isQuota ? 'QUOTA_EXCEEDED' : msg}`);

        if (isQuota) {
          await delay(2000); 
        } else {
          await delay(500);
          break; 
        }
      }
    }
  }
  throw lastError || new Error("Service busy.");
};

export const searchPapers = async (query: string, filters?: SearchFilters): Promise<Paper[]> => {
  return [];
};

export const generatePaperExplanation = async (paper: Paper): Promise<string> => {
  try {
    const response = await robustGenerateContent(
      `You are an expert academic mentor. I want to read the paper "${paper.title}" by ${paper.authors} (${paper.year}).
      
      First, search for this paper to understand its full content.
      Then, write a "Kindle-style" simplified conceptual rewrite.
      
      Guidelines:
      1.  **Tone:** Formal, calm, accessible, but scientifically accurate.
      2.  **Structure:**
          *   **Title & Authors** (Header)
          *   **The Big Picture:** Why does this research exist?
          *   **Core Concepts:** Explain key ideas simply.
          *   **Methodology:** How did they do it?
          *   **Key Findings:** What did they discover?
      3.  **Format:** Use Markdown.
      `,
      {
        tools: [{ googleSearch: {} }]
      }
    );

    return response.text || "Could not generate explanation.";
  } catch (error) {
    console.error("Explanation failed after retries:", error);
    return "We are currently experiencing high traffic. Please wait a moment and try again.";
  }
};

export const askQuestionAboutPaper = async (paper: Paper, question: string, history: {role: string, text: string}[]): Promise<string> => {
  try {
    const contextPrompt = `
      Paper: "${paper.title}" by ${paper.authors}.
      Answer this user question based on the paper: "${question}"
      Keep it concise and helpful.
    `;

    const response = await robustGenerateContent(
      contextPrompt,
      { tools: [{ googleSearch: {} }] }
    );

    return response.text || "I couldn't find an answer to that.";
  } catch (error) {
    console.error("Q&A failed:", error);
    return "Sorry, I encountered an error. Please try again in a moment.";
  }
};
