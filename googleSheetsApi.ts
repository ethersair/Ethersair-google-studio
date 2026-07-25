// Google Sheets and Google Drive API client-side helpers

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

export interface DriveSpreadsheet {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface SheetExportRow {
  chain: string;
  symbol: string;
  name: string;
  price: number;
  balance: number;
  value: number;
}

/**
 * Fetch list of Spreadsheet files from Google Drive
 */
export async function listSpreadsheets(accessToken: string): Promise<DriveSpreadsheet[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.spreadsheet' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=20`;

  const res = await safeFetch(url, {
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
 * Create a brand new Google Spreadsheet
 */
export async function createSpreadsheet(accessToken: string, title: string): Promise<string> {
  const res = await safeFetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      properties: {
        title: title
      }
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create spreadsheet (${res.status}): ${errText}`);
  }

  const data = await res.json();
  return data.spreadsheetId;
}

/**
 * Write portfolio token balances to a Google Sheet
 */
export async function exportPortfolioToSheet(
  accessToken: string,
  spreadsheetId: string,
  portfolioData: { chainName: string; tokens: any[]; total: number }[],
  totalNetWorth: number
): Promise<void> {
  const values: any[][] = [];

  // Title / Metadata header
  values.push(['APEX DEFI DASHBOARD - PORTFOLIO EXPORT']);
  values.push([`Export Date: ${new Date().toLocaleString()}`]);
  values.push([`Total Net Worth: $${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]);
  values.push([]); // blank row

  // Table header
  values.push(['Chain / Ecosystem', 'Token Symbol', 'Token Name', 'Current Price', 'Holdings', 'Value (USD)']);

  // Table rows
  portfolioData.forEach(chain => {
    chain.tokens.forEach(token => {
      values.push([
        chain.chainName,
        token.symbol,
        token.name,
        token.price,
        token.balance,
        token.balance * token.price
      ]);
    });
  });

  // Call spreadsheets.values.update API for portfolio
  const range = 'A1';
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const res = await safeFetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values
    })
  });

  if (!res.ok) {
    const errText = await res.text();
    if (res.status === 403) {
      throw new Error(`Google Sheets Permission Denied (403): The current Google token lacks edit permissions. Please click "Reconnect Google" to authorize write access.`);
    }
    throw new Error(`Failed to write portfolio to spreadsheet (${res.status}): ${errText}`);
  }
}

/**
 * Write ecosystem event logs / transaction history to a Google Sheet
 */
export async function exportTransactionsToSheet(
  accessToken: string,
  spreadsheetId: string,
  transactions: any[]
): Promise<void> {
  const values: any[][] = [];

  // Metadata headers
  values.push(['APEX DEFI DASHBOARD - TRANSACTION EVENT LOGS']);
  values.push([`Export Date: ${new Date().toLocaleString()}`]);
  values.push([`Total Transactions: ${transactions.length}`]);
  values.push([]); // blank row

  // Table header
  values.push(['ID', 'Action / Type', 'Ecosystem Chain', 'Description', 'Fiat Value', 'Status', 'Timestamp', 'Tx Hash']);

  // Table rows
  transactions.forEach(tx => {
    values.push([
      tx.id,
      tx.type.toUpperCase(),
      tx.chain,
      tx.details,
      tx.amount,
      tx.status.toUpperCase(),
      tx.timestamp,
      tx.txHash
    ]);
  });

  // Call spreadsheets.values.update API for transactions
  const range = 'A1';
  const txUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;

  const txRes = await safeFetch(txUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      range,
      majorDimension: 'ROWS',
      values
    })
  });

  if (!txRes.ok) {
    const errText = await txRes.text();
    if (txRes.status === 403) {
      throw new Error(`Google Sheets Permission Denied (403): The current Google token lacks edit permissions. Please click "Reconnect Google" to authorize write access.`);
    }
    throw new Error(`Failed to write transactions to spreadsheet (${txRes.status}): ${errText}`);
  }
}

/**
 * Delete a spreadsheet file from Google Drive (needs confirmation)
 */
export async function deleteSpreadsheetFile(accessToken: string, fileId: string): Promise<void> {
  const res = await safeFetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete spreadsheet file (${res.status}): ${errText}`);
  }
}

/**
 * Fetch a general list of non-trashed files from Google Drive
 */
export async function listDriveFiles(accessToken: string): Promise<any[]> {
  const url = `https://www.googleapis.com/drive/v3/files?q=trashed=false&fields=files(id,name,mimeType,modifiedTime,webViewLink,iconLink)&orderBy=modifiedTime desc&pageSize=30`;
  const res = await safeFetch(url, {
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
