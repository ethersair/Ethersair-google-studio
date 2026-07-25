// Google Docs and Google Drive API client-side helpers

async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (err: any) {
    if (err.name === 'TypeError' || err.message?.includes('Failed to fetch')) {
      throw new Error(`Network Error: Unable to reach Google API (${url}). Please check your connection or reconnect your Google account.`);
    }
    throw err;
  }
}

async function handleApiResponse(res: Response, apiName: string): Promise<any> {
  if (res.ok) {
    if (res.status === 204) return null;
    return await res.json();
  }
  let errText = '';
  try {
    errText = await res.text();
  } catch {}

  if (res.status === 401) {
    throw new Error(`${apiName} Error (401): Invalid or expired Google authentication credentials. Please reconnect your Google account.`);
  }
  if (res.status === 403) {
    throw new Error(`${apiName} Error (403): Permission denied or missing OAuth scope. Please reconnect your Google account with full write/read permissions.`);
  }
  throw new Error(`${apiName} Error (${res.status}): ${errText}`);
}

export interface DriveDoc {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

/**
 * Fetch list of Google Docs files from Google Drive
 */
export async function listGoogleDocs(accessToken: string): Promise<DriveDoc[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.document' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=20`;

  const res = await safeFetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await handleApiResponse(res, 'Drive API');
  return data.files || [];
}

/**
 * Create a new Google Document
 */
export async function createGoogleDoc(accessToken: string, title: string): Promise<string> {
  const url = 'https://docs.googleapis.com/v1/documents';

  const res = await safeFetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  const data = await handleApiResponse(res, 'Google Docs API');
  return data.documentId;
}

/**
 * Write/Append custom report text to a Google Document
 */
export async function appendTextToDoc(
  accessToken: string,
  documentId: string,
  text: string
): Promise<void> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;

  const requests = [
    {
      insertText: {
        text: text,
        endOfSegmentLocation: {} // Inserts at the end of the document
      }
    }
  ];

  const res = await safeFetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests
    })
  });

  await handleApiResponse(res, 'Google Docs API');
}

/**
 * Export portfolio snapshot or report to a Google Document
 */
export async function exportPortfolioToDoc(
  accessToken: string,
  documentId: string,
  portfolioData: { chainName: string; tokens: any[]; total: number }[],
  totalNetWorth: number
): Promise<void> {
  let text = `APEX DEFI DASHBOARD - PORTFOLIO SNAPSHOT REPORT\n`;
  text += `==============================================\n`;
  text += `Generated: ${new Date().toLocaleString()}\n`;
  text += `Total Estimated Asset Value: $${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;

  portfolioData.forEach(chain => {
    text += `${chain.chainName.toUpperCase()} ECOSYSTEM PORTFOLIO\n`;
    text += `----------------------------------------------\n`;
    chain.tokens.forEach(token => {
      const value = token.balance * token.price;
      text += `• ${token.name} (${token.symbol}): ${token.balance.toLocaleString()} @ $${token.price.toLocaleString()} = $${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n`;
    });
    text += `Total Value: $${chain.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}\n\n`;
  });

  text += `Report generated securely via Apex DeFi and logged in Cloud SQL.`;

  await appendTextToDoc(accessToken, documentId, text);
}
