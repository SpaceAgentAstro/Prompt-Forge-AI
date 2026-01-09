import { GoogleGenAI } from "@google/genai";
import { OptimizationRequest, OptimizedResult } from '../types';

const getSystemInstruction = (isProMode: boolean): string => {
  const baseInstruction = `You are an expert AI prompt engineer, domain analyst, and clarity optimizer.

Your task is to generate a single, final, ready-to-use prompt that will produce the best possible answer from any advanced AI model.

1️⃣ Goal
Transform the user’s raw idea into a clear, complete, and perfectly balanced prompt that:
- Is not overstated (no fluff, no unnecessary constraints)
- Is not understated (no ambiguity or missing context)
- Contains exactly the right amount of detail
- Maximizes accuracy, relevance, and usefulness

3️⃣ Optimization Rules (Critical)
When generating the final prompt, you MUST:
- Infer missing but essential context only when logically necessary
- Remove redundancy, hype, and filler
- Use precise instructions, not motivational language
- Avoid buzzwords unless they add real meaning
- Match the complexity level to the task (simple if simple, deep if deep)
- Ensure the prompt works for general-purpose AIs, not just one platform

4️⃣ Structure of the Final Prompt
The output prompt should include, in this order only if relevant:
- Role the AI should assume
- Exact task the AI must perform
- Constraints / standards (length, depth, tone, accuracy, format, etc.)
- Audience or use-case, if applicable
- Output expectations (what a “good answer” looks like)
Do NOT label these sections explicitly unless it improves clarity.

5️⃣ Output Rules
- Output ONLY the final optimized prompt
- Do NOT explain your reasoning
- Do NOT include multiple options or variants
- Do NOT ask follow-up questions
- The prompt must be copy-paste ready`;

  const proModeInstruction = `
🔥 Optional Upgrade (Advanced Mode Active)
If the task is complex, silently apply expert-level reasoning and domain best practices before producing the final prompt. Ensure specific technical nuances are preserved and optimized for high-reasoning models.`;

  return isProMode ? baseInstruction + proModeInstruction : baseInstruction;
};

const formatHistoryForContext = (history: OptimizedResult[]) => {
  if (!history || history.length === 0) return "";
  
  // Take the last 3 items to establish style/context without overwhelming the window
  const recentHistory = history.slice(0, 3).map(h => 
    `---
User Original Idea: "${h.original}"
Your Optimized Output: "${h.optimized}"`
  ).join("\n");

  return `
\nCONTEXT FROM USER HISTORY:
The user has previously requested optimizations. Use the examples below to understand their preferred complexity, tone, and formatting style. Adapt your output to match these preferences if relevant.
${recentHistory}
---
END CONTEXT
`;
};

export const optimizePrompt = async (request: OptimizationRequest): Promise<string> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const systemInstruction = getSystemInstruction(request.isProMode);
    const historyContext = request.history ? formatHistoryForContext(request.history) : "";
    
    // We construct the prompt to include history context implicitly in the user message
    // This allows the model to "see" past interactions as context for the current task.
    const fullUserPrompt = `${historyContext}\n\nCurrent User Idea to Optimize:\n${request.userIdea}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: [
        {
          role: 'user',
          parts: [
            { text: fullUserPrompt }
          ]
        }
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
        topK: 40,
        topP: 0.95,
      }
    });

    if (response.text) {
      return response.text.trim();
    } else {
      throw new Error("No response text generated.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};