// src/ai/flows/code-formatter.ts
'use server';

/**
 * @fileOverview A code formatting AI agent using Prettier via LLM.
 *
 * - formatCode - A function that formats the given code.
 * - FormatCodeInput - The input type for the formatCode function.
 * - FormatCodeOutput - The return type for the formatCode function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {prettierFormat} from '@/services/prettier-formatter';

const FormatCodeInputSchema = z.object({
  code: z.string().describe('The code to be formatted.'),
  language: z.string().describe('The programming language of the code.'),
});
export type FormatCodeInput = z.infer<typeof FormatCodeInputSchema>;

const FormatCodeOutputSchema = z.object({
  formattedCode: z.string().describe('The formatted code.'),
});
export type FormatCodeOutput = z.infer<typeof FormatCodeOutputSchema>;

export async function formatCode(input: FormatCodeInput): Promise<FormatCodeOutput> {
  return formatCodeFlow(input);
}

const formatCodeFlow = ai.defineFlow(
  {
    name: 'formatCodeFlow',
    inputSchema: FormatCodeInputSchema,
    outputSchema: FormatCodeOutputSchema,
  },
  async input => {
    const formattedCode = await prettierFormat(input.code, input.language);
    return {formattedCode};
  }
);
