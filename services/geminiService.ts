/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import { GenerationParams, STYLE_PRESETS } from '../types';

export const generateWallpaperImage = async (params: GenerationParams): Promise<{ imageBase64: string; mimeType: string; enhancedPrompt: string }> => {
  // Initialize the client using the environment variable API_KEY
  // For Vercel deployment: Set 'API_KEY' in your project's Environment Variables settings.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  try {
    let finalPrompt = params.prompt;
    const style = STYLE_PRESETS.find(s => s.id === params.stylePreset);
    const isStyleActive = style && style.id !== 'none';

    // Step 1: Enhance the prompt using Gemini 3 Flash (Free tier)
    if (params.enhancePrompt) {
      try {
        const enhancementSystemPrompt = `You are an expert AI art director. 
        Rewrite the user's concept into a descriptive, high-quality image generation prompt.
        
        User Concept: "${params.prompt}"
        Style Context: ${isStyleActive ? `${style.label} (${style.description})` : 'Neutral / Faithful to User Concept'}
        ${isStyleActive ? `Visual Elements to Integrate: ${style.promptSuffix}` : ''}
        
        Instructions:
        1. Describe the scene, lighting, and composition in detail.
        2. Integrate the style's visual elements naturally.
        3. Output ONLY the final prompt text.`;

        const enhancementResponse = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{ role: 'user', parts: [{ text: enhancementSystemPrompt }] }],
        });

        if (enhancementResponse.text) {
          finalPrompt = enhancementResponse.text.trim();
        }
      } catch (enhancementError) {
        console.warn('Prompt enhancement failed, proceeding with original prompt:', enhancementError);
      }
    }

    // Step 2: Generate Image with Gemini 2.5 Flash Image (Free tier)
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          { text: finalPrompt },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: params.aspectRatio,
        },
      },
    });

    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from Gemini.');
    }

    const parts = candidates[0].content?.parts;
    if (!parts || parts.length === 0) {
      throw new Error('No content parts returned.');
    }

    const imagePart = parts.find((part) => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error('No image data found in response.');
    }

    return {
      imageBase64: imagePart.inlineData.data as string,
      mimeType: imagePart.inlineData.mimeType || 'image/png',
      enhancedPrompt: finalPrompt
    };

  } catch (error) {
    console.error('Gemini generation error:', error);
    throw error;
  }
};