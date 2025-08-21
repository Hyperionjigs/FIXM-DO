'use server';
/**
 * @fileOverview A flow to generate a selfie for a user profile.
 *
 * - generateSelfie - A function that creates a unique, AI-generated selfie.
 * - GenerateSelfieInput - The input type for the generateSelfie function.
 * - GenerateSelfieOutput - The return type for the generateSelfie function.
 */

import {z} from 'genkit';

const GenerateSelfieInputSchema = z.object({
  name: z.string().describe("The user's display name."),
});
export type GenerateSelfieInput = z.infer<typeof GenerateSelfieInputSchema>;

const GenerateSelfieOutputSchema = z.object({
  photoDataUri: z.string().describe("The generated selfie image as a data URI."),
});
export type GenerateSelfieOutput = z.infer<typeof GenerateSelfieOutputSchema>;

export async function generateSelfie(input: GenerateSelfieInput): Promise<GenerateSelfieOutput> {
  return generateSelfieFlow(input);
}

const generateSelfieFlow = async ({name}: GenerateSelfieInput): Promise<GenerateSelfieOutput> => {
  // Use DiceBear API for free avatar generation
  // This creates a unique avatar based on the user's name
  const seed = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9&mouth=smile&style=circle`;
  
  // Add a query parameter to identify AI-generated photos
  const urlWithIdentifier = `${avatarUrl}&ai_generated=true`;
  
  return {
    photoDataUri: urlWithIdentifier,
  };
};
