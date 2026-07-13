// Google Docs and Google Drive API client-side helpers

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

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Drive API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Create a new Google Document
 */
export async function createGoogleDoc(accessToken: string, title: string): Promise<string> {
  const url = 'https://docs.googleapis.com/v1/documents';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google Doc (${res.status}): ${errText}`);
  }

  const data = await res.json();
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

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to append text to Google Doc (${res.status}): ${errText}`);
  }
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
