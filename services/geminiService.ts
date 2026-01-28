
import { GoogleGenAI, Type } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const summarizeChat = async (topicTitle: string, messages: Message[]): Promise<string> => {
  if (messages.length === 0) return "No discussion took place.";

  const chatTranscript = messages
    .map(m => `${m.anonymousName}: ${m.text}`)
    .join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Summarize the following anonymous discussion about "${topicTitle}". 
        Highlight the main opinions, conflicting viewpoints, and the overall consensus if any. 
        Keep it concise (2-3 paragraphs).
        
        Transcript:
        ${chatTranscript}
      `,
    });

    return response.text || "Failed to generate summary.";
  } catch (error) {
    console.error("Summary generation error:", error);
    return "Error generating summary. Please try again later.";
  }
};

export const moderateMessage = async (text: string): Promise<boolean> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Is the following message toxic, hate speech, or harassment? Answer with only 'TRUE' or 'FALSE'.\n\n"${text}"`,
    });
    return response.text?.trim().toUpperCase() === 'FALSE';
  } catch {
    return true; // Default to allowing if API fails for MVP
  }
};
