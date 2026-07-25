// Google Sheets and Google Drive API client-side helpers

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

  const data = await handleApiResponse(res, 'Drive API');
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

  const data = await handleApiResponse(res, 'Google Sheets API');
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

  await handleApiResponse(res, 'Google Sheets API');
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

  await handleApiResponse(txRes, 'Google Sheets API');
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

  await handleApiResponse(res, 'Drive API');
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

  const data = await handleApiResponse(res, 'Drive API');
  return data.files || [];
}
