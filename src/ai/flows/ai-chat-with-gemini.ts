'use server';
/**
 * @fileOverview An AI chat agent powered by the Gemini API.
 *
 * - aiChatWithGemini - A function that handles the AI chat process.
 * - AIChatWithGeminiInput - The input type for the aiChatWithGemini function.
 * - AIChatWithGeminiOutput - The return type for the aiChatWithGemini function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatWithGeminiInputSchema = z.object({
  query: z.string().describe('The user query to the AI chatbot.'),
});
export type AIChatWithGeminiInput = z.infer<typeof AIChatWithGeminiInputSchema>;

const AIChatWithGeminiOutputSchema = z.object({
  response: z.string().describe('The response from the AI chatbot.'),
});
export type AIChatWithGeminiOutput = z.infer<typeof AIChatWithGeminiOutputSchema>;

export async function aiChatWithGemini(input: AIChatWithGeminiInput): Promise<AIChatWithGeminiOutput> {
  return aiChatWithGeminiFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatWithGeminiPrompt',
  input: {schema: AIChatWithGeminiInputSchema},
  output: {schema: AIChatWithGeminiOutputSchema},
  prompt: `You are a helpful AI assistant. Respond to the user query in a conversational manner.\n\nUser Query: {{{query}}}`,
});

const aiChatWithGeminiFlow = ai.defineFlow(
  {
    name: 'aiChatWithGeminiFlow',
    inputSchema: AIChatWithGeminiInputSchema,
    outputSchema: AIChatWithGeminiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
