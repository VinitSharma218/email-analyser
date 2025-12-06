'use server';

/**
 * @fileOverview Summarizes potential security risks identified in the email header analysis.
 *
 * - summarizeSecurityRisks - A function that summarizes the security risks.
 * - SummarizeSecurityRisksInput - The input type for the summarizeSecurityRisks function.
 * - SummarizeSecurityRisksOutput - The return type for the summarizeSecurityRisks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeSecurityRisksInputSchema = z.object({
  headerAnalysis: z
    .string()
    .describe(
      'The analysis of the email header, including DMARC, SPF, DKIM, links, domains, and IP addresses.'
    ),
});
export type SummarizeSecurityRisksInput = z.infer<typeof SummarizeSecurityRisksInputSchema>;

const SummarizeSecurityRisksOutputSchema = z.object({
  securitySummary: z
    .string()
    .describe(
      'A summary of the potential security risks, including spam and spoofing possibilities.'
    ),
});
export type SummarizeSecurityRisksOutput = z.infer<typeof SummarizeSecurityRisksOutputSchema>;

export async function summarizeSecurityRisks(
  input: SummarizeSecurityRisksInput
): Promise<SummarizeSecurityRisksOutput> {
  return summarizeSecurityRisksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeSecurityRisksPrompt',
  input: {schema: SummarizeSecurityRisksInputSchema},
  output: {schema: SummarizeSecurityRisksOutputSchema},
  prompt: `You are an AI expert in email security.
  Based on the email header analysis provided, summarize the potential security risks, including the possibility of spam or spoofing.
  \n  Header Analysis: {{{headerAnalysis}}}`,
});

const summarizeSecurityRisksFlow = ai.defineFlow(
  {
    name: 'summarizeSecurityRisksFlow',
    inputSchema: SummarizeSecurityRisksInputSchema,
    outputSchema: SummarizeSecurityRisksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
