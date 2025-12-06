'use server';

import { summarizeSecurityRisks } from '@/ai/flows/summarize-security-risks';
import {
  extractAuthResults,
  extractDomains,
  extractIps,
  extractLinks,
  type AuthResults,
} from '@/lib/parser';

export interface AnalysisResult {
  securitySummary: string;
  authResults: AuthResults;
  links: string[];
  domains: string[];
  ips: string[];
}

export async function analyzeHeaderAction(
  headerContent: string
): Promise<{ data?: AnalysisResult; error?: string }> {
  try {
    if (!headerContent) {
      return { error: 'Header content cannot be empty.' };
    }

    // 1. Extract data from header
    const authResults = extractAuthResults(headerContent);
    const ips = extractIps(headerContent);
    const domains = extractDomains(headerContent);
    const links = extractLinks(headerContent);
    

    // 2. Prepare data for AI summary
    const headerAnalysis = `
      Authentication Results:
      - DMARC: ${authResults.dmarc.result} (domain: ${authResults.dmarc.domain})
      - SPF: ${authResults.spf.result} (from: ${authResults.spf.from})
      - DKIM: ${authResults.dkim.result} (domain: ${authResults.dkim.domain})

      Extracted IPs: ${ips.join(', ') || 'None'}
      Extracted Domains: ${domains.join(', ') || 'None'}
      Extracted Links: ${links.join(', ') || 'None'}
    `;

    // 3. Get AI summary
    const { securitySummary } = await summarizeSecurityRisks({ headerAnalysis });

    // 4. Return complete result
    return {
      data: {
        securitySummary,
        authResults,
        links,
        domains,
        ips,
      },
    };
  } catch (e) {
    console.error('Analysis Error:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred during analysis.';
    return { error: `Failed to analyze header. ${errorMessage}` };
  }
}
