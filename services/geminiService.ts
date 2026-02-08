import { GoogleGenAI } from "@google/genai";
import { ImageSize } from "../types";

// Helper to handle the API key selection flow
const ensureApiKey = async (): Promise<void> => {
  // @ts-ignore
  if (window.aistudio && window.aistudio.hasSelectedApiKey) {
     // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
       // @ts-ignore
      await window.aistudio.openSelectKey();
    }
  }
};

export const generateValentineImage = async (prompt: string, size: ImageSize): Promise<string> => {
  await ensureApiKey();

  // Initialize client with key from env (which is injected by the platform after selection)
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview', // Required model for high quality
      contents: {
        parts: [
          {
            text: prompt,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1", // Square is classic for cards
          imageSize: size,
        },
      },
    });

    // Extract image
    if (response.candidates && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          return `data:image/png;base64,${base64EncodeString}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    // If we get a specific error about the entity not found, we might need to re-trigger auth,
    // but usually standard error handling is enough for the UI to show a message.
    throw error;
  }
};
