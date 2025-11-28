import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateVisionImage = async (
  prompt: string, 
  aspectRatio: AspectRatio,
  model: string = 'gemini-2.5-flash-image'
): Promise<string> => {
  try {
    // Flash Lite and some other models do not support imageConfig/aspectRatio.
    // We conditionally add it only if not using the lite model.
    const isLiteModel = model.includes('lite');
    
    const config: any = {};
    
    // Only add imageConfig if it's NOT the lite model
    if (!isLiteModel) {
      config.imageConfig = {
        aspectRatio: aspectRatio,
      };
    }

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            text: `High quality, photorealistic, cinematic shot of ${prompt}. 4k resolution, highly detailed, vibrant colors.`,
          },
        ],
      },
      config: config,
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};