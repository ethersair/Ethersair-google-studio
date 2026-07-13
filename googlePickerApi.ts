// Google Picker loading and integration utilities

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

/**
 * Dynamically load the Google API (gapi) library
 */
export function loadGapiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(new Error('Failed to load gapi script'));
    document.body.appendChild(script);
  });
}

/**
 * Open the Google Picker overlay
 */
export function openGooglePicker(
  accessToken: string,
  onFilePicked: (file: { id: string; name: string; mimeType: string; url: string }) => void,
  onCancel?: () => void
): void {
  const gapi = window.gapi;
  const google = window.google;

  if (!gapi || !google) {
    throw new Error('Google APIs not loaded properly. Ensure sign-in was completed.');
  }

  gapi.load('picker', () => {
    try {
      const view = new google.picker.DocsView(google.picker.ViewId.DOCS)
        .setParent(google.picker.DocsViewMode.GRID)
        .setIncludeFolders(true);

      const picker = new google.picker.PickerBuilder()
        .enableFeature(google.picker.Feature.NAV_HIDDEN)
        .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)
        .setDeveloperKey('') // Optional for default drive access with verified domain auth
        .setAppId('')
        .setOAuthToken(accessToken)
        .addView(view)
        .setCallback((data: any) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const document = data[google.picker.Response.DOCUMENTS][0];
            onFilePicked({
              id: document[google.picker.Document.ID],
              name: document[google.picker.Document.NAME],
              mimeType: document[google.picker.Document.MIME_TYPE],
              url: document[google.picker.Document.URL]
            });
          } else if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
            if (onCancel) onCancel();
          }
        })
        .build();

      picker.setVisible(true);
    } catch (err) {
      console.error('Failed to construct Google Picker:', err);
      throw err;
    }
  });
}
