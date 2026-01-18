
import { GoogleGenAI, Modality } from "@google/genai";
import type { StoryResult } from '../types';

const apiKey = process.env.API_KEY;
if (!apiKey) {
    // In a real app, you might want to show a friendly error to the user.
    // For this environment, we assume the key is set.
    console.error("API_KEY environment variable not set. The app will not function.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || '' });

export const generateStoryAndImage = async (prompt: string): Promise<StoryResult> => {
    if (!apiKey) {
        throw new Error("API Key is missing. Please configure your environment.");
    }

    try {
        const fullPrompt = `Create a short, happy, and simple story for a 5-year-old child about ${prompt}. The story should be no more than 150 words. Also, create a single, colorful and cute illustration for this story in a whimsical, friendly cartoon style.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [{ text: fullPrompt }],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        let storyText = '';
        let imageUrl = '';

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    storyText += part.text;
                } else if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
        }

        if (!storyText || !imageUrl) {
            throw new Error("Failed to generate complete story and image.");
        }

        return { story: storyText, imageUrl };

    } catch (error) {
        console.error("Error generating story with Gemini:", error);
        throw new Error("Could not create the story. The magic spell might have failed!");
    }
};
