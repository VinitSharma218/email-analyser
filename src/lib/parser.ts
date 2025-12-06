
export type AuthResult = 'pass' | 'fail' | 'neutral' | 'none' | 'temperror' | 'permerror';

export interface AuthResults {
  spf: { result: AuthResult; from: string };
  dkim: { result: AuthResult; domain: string };
  dmarc: { result: AuthResult; domain:string };
}

const getUnique = (arr: string[]) => [...new Set(arr)];

export function extractIps(text: string): string[] {
  const ipRegex = /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g;
  const matches = text.match(ipRegex) || [];
  return getUnique(matches);
}

export function extractDomains(text: string): string[] {
  const receivedHeaders = text.match(/Received: from ([\s\S]*?)(?=\n[A-Z]|$)/gi) || [];
  const fromDomains = receivedHeaders.map(header => {
      const match = header.match(/from\s+([^\s(]+)/);
      return match ? match[1] : null;
  }).filter((d): d is string => d !== null);

  const otherDomainsRegex = /(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}/g;
  let otherMatches = text.match(otherDomainsRegex) || [];

  let allDomains = [...fromDomains, ...otherMatches];
  
  // Filter out IP addresses and simple numbers, and domains with invalid characters
  allDomains = allDomains.filter(d => 
    !/^\d+(\.\d+){3}$/.test(d) && 
    !/^\d+$/.test(d) &&
    !d.startsWith('.') && !d.endsWith('.') &&
    !d.includes('..')
  );

  // Convert to lowercase and get unique domains
  return getUnique(allDomains.map(d => d.toLowerCase().replace(/\[|\]/g, '')));
}

export function extractLinks(text: string): string[] {
  const urlRegex = /(?:https?|ftp):\/\/[^\s"'<>]+/gi;
  const matches = text.match(urlRegex) || [];
  return getUnique(matches);
}

function parseAuthHeader(header: string): Partial<AuthResults> {
  const results: Partial<AuthResults> = {};
  const spfRegex = /spf=([a-z]+) .*?smtp\.mailfrom=([^; ]+)/;
  const dkimRegex = /dkim=([a-z]+) .*?header\.d=([^; ]+)/;
  const dmarcRegex = /dmarc=([a-z]+) .*?header\.from=([^; ]+)/;

  const spfMatch = header.match(spfRegex);
  if (spfMatch) {
    results.spf = { result: spfMatch[1] as AuthResult, from: spfMatch[2] };
  }

  const dkimMatch = header.match(dkimRegex);
  if (dkimMatch) {
    results.dkim = { result: dkimMatch[1] as AuthResult, domain: dkimMatch[2] };
  }

  const dmarcMatch = header.match(dmarcRegex);
  if (dmarcMatch) {
    results.dmarc = { result: dmarcMatch[1] as AuthResult, domain: dmarcMatch[2] };
  }
  
  return results;
}

export function extractAuthResults(text: string): AuthResults {
    const defaultResult: AuthResults = {
        spf: { result: 'none', from: 'N/A' },
        dkim: { result: 'none', domain: 'N/A' },
        dmarc: { result: 'none', domain: 'N/A' },
    };

    const authHeaderRegex = /Authentication-Results:([\s\S]*?)(?=\n[A-Z][a-zA-Z-]*:|$)/;
    const match = text.match(authHeaderRegex);
    
    if (match && match[1]) {
        const headerContent = match[1].replace(/\n\s+/g, ' ');
        const parsed = parseAuthHeader(headerContent);
        return { ...defaultResult, ...parsed };
    }

    // Fallback if the main regex fails, try to find keywords
    const lowerText = text.toLowerCase();
    if (lowerText.includes('spf=pass')) defaultResult.spf.result = 'pass';
    else if (lowerText.includes('spf=fail')) defaultResult.spf.result = 'fail';

    if (lowerText.includes('dkim=pass')) defaultResult.dkim.result = 'pass';
    else if (lowerText.includes('dkim=fail')) defaultResult.dkim.result = 'fail';

    if (lowerText.includes('dmarc=pass')) defaultResult.dmarc.result = 'pass';
    else if (lowerText.includes('dmarc=fail')) defaultResult.dmarc.result = 'fail';

    return defaultResult;
}