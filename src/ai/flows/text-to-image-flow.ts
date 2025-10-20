'use server';
/**
 * @fileOverview An AI flow for generating images from a text prompt.
 *
 * - textToImage - A function that handles the image generation process.
 * - TextToImageInput - The input type for the textToImage function.
 * - TextToImageOutput - The return type for the textToImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const TextToImageInputSchema = z.string().describe("The text prompt for image generation.");
export type TextToImageInput = z.infer<typeof TextToImageInputSchema>;

const TextToImageOutputSchema = z.object({
  imageUrl: z.string().describe("The data URI of the generated image."),
});
export type TextToImageOutput = z.infer<typeof TextToImageOutputSchema>;


export async function textToImage(prompt: TextToImageInput): Promise<TextToImageOutput> {
    return textToImageFlow(prompt);
}


const textToImageFlow = ai.defineFlow(
  {
    name: 'textToImageFlow',
    inputSchema: TextToImageInputSchema,
    outputSchema: TextToImageOutputSchema,
  },
  async (prompt) => {
    const { media } = await ai.generate({
        model: googleAI.model('imagen-4.0-fast-generate-001'),
        prompt: prompt,
    });

    const imageUrl = media.url;
    if (!imageUrl) {
        throw new Error('Image generation failed to return a URL.');
    }

    return { imageUrl };
  }
);
