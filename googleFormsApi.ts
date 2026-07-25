// Google Forms and Google Drive API client-side helpers

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
    throw new Error(`${apiName} Error (403): Permission denied or missing OAuth scope. Please reconnect your Google account with full permissions.`);
  }
  throw new Error(`${apiName} Error (${res.status}): ${errText}`);
}

export interface GoogleForm {
  formId: string;
  info: {
    title: string;
    description?: string;
    documentTitle?: string;
  };
  responderUri: string; // The URL to view and fill the form
}

/**
 * List created forms from Google Drive
 */
export async function listGoogleForms(accessToken: string): Promise<any[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.form' and trashed=false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime,webViewLink)&orderBy=modifiedTime desc&pageSize=20`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await handleApiResponse(res, 'Drive API');
  return data.files || [];
}

/**
 * Create a new empty Google Form
 */
export async function createGoogleForm(accessToken: string, title: string, description?: string): Promise<GoogleForm> {
  const url = 'https://forms.googleapis.com/v1/forms';

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      info: {
        title: title,
        documentTitle: title
      }
    })
  });

  const form = await handleApiResponse(res, 'Google Forms API');

  if (description) {
    // Perform description updates via batchUpdate
    await fetch(`https://forms.googleapis.com/v1/forms/${form.formId}:batchUpdate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        requests: [
          {
            updateFormInfo: {
              info: {
                description: description
              },
              updateMask: 'description'
            }
          }
        ]
      })
    });
  }

  return form;
}

/**
 * Add multi-choice and short-answer questions to a Google Form to create a feedback/poll system
 */
export async function addQuestionsToForm(accessToken: string, formId: string): Promise<void> {
  const url = `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`;

  const requests = [
    {
      createItem: {
        item: {
          title: "Rate your overall DeFi user experience on Apex Dashboard",
          description: "1 = Poor, 5 = Excellent",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: "RADIO",
                options: [
                  { value: "1 - Poor" },
                  { value: "2 - Fair" },
                  { value: "3 - Good" },
                  { value: "4 - Very Good" },
                  { value: "5 - Excellent" }
                ]
              }
            }
          }
        },
        location: { index: 0 }
      }
    },
    {
      createItem: {
        item: {
          title: "Which blockchain ecosystem do you trade or stake on most?",
          questionItem: {
            question: {
              required: true,
              choiceQuestion: {
                type: "RADIO",
                options: [
                  { value: "Ethereum (EthersAir)" },
                  { value: "Solana (Jito/Jup)" },
                  { value: "Polygon (POL)" },
                  { value: "Avalanche (AVAX)" },
                  { value: "BNB Chain" }
                ]
              }
            }
          }
        },
        location: { index: 1 }
      }
    },
    {
      createItem: {
        item: {
          title: "Any additional suggestions, yield features, or audit requests for our platform?",
          questionItem: {
            question: {
              required: false,
              textQuestion: {
                paragraph: true
              }
            }
          }
        },
        location: { index: 2 }
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
    throw new Error(`Failed to add questions to form (${res.status}): ${errText}`);
  }
}
