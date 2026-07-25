// Google Slides and Google Drive API client-side helpers

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

export interface DrivePresentation {
  id: string;
  name: string;
  modifiedTime: string;
  webViewLink?: string;
}

export interface SlideContent {
  title: string;
  subtitle: string;
  bullets: string[];
}

export interface GeneratedDeck {
  title: string;
  slides: SlideContent[];
}

export interface ColorRGB {
  red: number;
  green: number;
  blue: number;
}

export interface ThemeColors {
  bg: ColorRGB;
  title: ColorRGB;
  subtitle: ColorRGB;
  body: ColorRGB;
  accent: ColorRGB;
  fontTitle: string;
  fontBody: string;
}

// Color theme presets for programmatic Slide creation
export const COLOR_THEMES: Record<string, ThemeColors> = {
  'tech-slate': {
    bg: { red: 0.06, green: 0.09, blue: 0.16 },       // #0f172a
    title: { red: 0.22, green: 0.74, blue: 0.97 },    // #38bdf8
    subtitle: { red: 0.58, green: 0.64, blue: 0.72 }, // #94a3b8
    body: { red: 0.8, green: 0.83, blue: 0.88 },       // #cbd5e1
    accent: { red: 0.39, green: 0.4, blue: 0.95 },     // #6366f1
    fontTitle: 'Trebuchet MS',
    fontBody: 'Arial'
  },
  'warm-amber': {
    bg: { red: 0.99, green: 0.98, blue: 0.94 },       // #fefaf0
    title: { red: 0.47, green: 0.21, blue: 0.06 },    // #78350f
    subtitle: { red: 0.7, green: 0.32, blue: 0.04 },  // #b45309
    body: { red: 0.27, green: 0.1, blue: 0.01 },       // #451a03
    accent: { red: 0.85, green: 0.46, blue: 0.02 },    // #d97706
    fontTitle: 'Georgia',
    fontBody: 'Verdana'
  },
  'neon-emerald': {
    bg: { red: 0.01, green: 0.03, blue: 0.07 },       // #030712
    title: { red: 0.06, green: 0.73, blue: 0.51 },    // #10b981
    subtitle: { red: 0.02, green: 0.59, blue: 0.41 }, // #059669
    body: { red: 0.65, green: 0.95, blue: 0.81 },     // #a7f3d0
    accent: { red: 0.08, green: 0.95, blue: 0.58 },    // #14f195
    fontTitle: 'Lucida Console',
    fontBody: 'Courier New'
  },
  'royal-indigo': {
    bg: { red: 0.05, green: 0.04, blue: 0.06 },       // #0d0b0e
    title: { red: 0.75, green: 0.52, blue: 0.99 },    // #c084fc
    subtitle: { red: 0.65, green: 0.55, blue: 0.98 }, // #a78bfa
    body: { red: 0.88, green: 0.91, blue: 0.94 },     // #e2e8f0
    accent: { red: 0.93, green: 0.28, blue: 0.6 },     // #ec4899
    fontTitle: 'Verdana',
    fontBody: 'Arial'
  }
};

/**
 * Fetch list of Slide Presentations from Google Drive
 */
export async function listPresentations(accessToken: string): Promise<DrivePresentation[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.presentation' and trashed=false");
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
 * Programmatically create and design a beautiful slide deck
 */
export async function createPresentationFromDeck(
  accessToken: string,
  deck: GeneratedDeck,
  themeKey: string
): Promise<string> {
  // 1. Create a new presentation with the title
  const createRes = await fetch('https://slides.googleapis.com/v1/presentations', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: deck.title
    })
  });

  const presentation = await handleApiResponse(createRes, 'Google Slides API');
  const presentationId = presentation.presentationId;

  // Since Google Slides automatically includes a default starting slide (index 0) with a Title layout,
  // we will add our custom slides and eventually delete the default template slide to keep it clean.
  // Wait, let's look up the default slide ID if possible, or we can just append our slides.
  // Google Slides default presentations always have a slide with ID 'p'.
  // Let's execute our batchUpdate to build the slides.

  const theme = COLOR_THEMES[themeKey] || COLOR_THEMES['tech-slate'];
  const requests: any[] = [];

  deck.slides.forEach((slide, idx) => {
    const slideId = `slide_${idx}_${Date.now()}`;
    const titleId = `title_${idx}_${Date.now()}`;
    const subtitleId = `sub_${idx}_${Date.now()}`;
    const bodyId = `body_${idx}_${Date.now()}`;
    const accentBarId = `accent_${idx}_${Date.now()}`;

    // A. Add slide using BLANK predefined layout so we can design it precisely
    requests.push({
      createSlide: {
        objectId: slideId,
        slideLayoutReference: {
          predefinedLayout: 'BLANK'
        }
      }
    });

    // B. Customize slide background color
    requests.push({
      updatePageProperties: {
        objectId: slideId,
        pageProperties: {
          pageBackgroundFill: {
            solidFill: {
              color: {
                rgbColor: theme.bg
              }
            }
          }
        },
        fields: 'pageBackgroundFill.solidFill.color'
      }
    });

    // C. Add a design touch: side accent color bar
    requests.push({
      createShape: {
        objectId: accentBarId,
        shapeType: 'RECTANGLE',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 12, unit: 'PT' },
            height: { magnitude: 410, unit: 'PT' }
          },
          transform: {
            scaleX: 1, scaleY: 1,
            translateX: 0, translateY: 0,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      updateShapeProperties: {
        objectId: accentBarId,
        shapeProperties: {
          shapeBackgroundFill: {
            solidFill: {
              color: {
                opaqueColor: {
                  rgbColor: theme.accent
                }
              }
            }
          },
          outline: {
            outlineFill: {
              solidFill: {
                color: {
                  rgbColor: theme.accent
                }
              }
            }
          }
        },
        fields: 'shapeBackgroundFill.solidFill.color,outline.outlineFill.solidFill.color'
      }
    });

    // D. Build Title layout
    const isCover = idx === 0;

    requests.push({
      createShape: {
        objectId: titleId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 600, unit: 'PT' },
            height: { magnitude: isCover ? 120 : 65, unit: 'PT' }
          },
          transform: {
            scaleX: 1, scaleY: 1,
            translateX: 60, translateY: isCover ? 110 : 35,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: titleId,
        text: slide.title
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: titleId,
        textRange: { type: 'ALL' },
        style: {
          fontFamily: theme.fontTitle,
          fontSize: { magnitude: isCover ? 38 : 26, unit: 'PT' },
          bold: true,
          foregroundColor: {
            opaqueColor: {
              rgbColor: theme.title
            }
          }
        },
        fields: 'fontFamily,fontSize,bold,foregroundColor'
      }
    });

    // E. Build Subtitle
    requests.push({
      createShape: {
        objectId: subtitleId,
        shapeType: 'TEXT_BOX',
        elementProperties: {
          pageObjectId: slideId,
          size: {
            width: { magnitude: 600, unit: 'PT' },
            height: { magnitude: 50, unit: 'PT' }
          },
          transform: {
            scaleX: 1, scaleY: 1,
            translateX: 60, translateY: isCover ? 240 : 105,
            unit: 'PT'
          }
        }
      }
    });

    requests.push({
      insertText: {
        objectId: subtitleId,
        text: slide.subtitle
      }
    });

    requests.push({
      updateTextStyle: {
        objectId: subtitleId,
        textRange: { type: 'ALL' },
        style: {
          fontFamily: theme.fontBody,
          fontSize: { magnitude: isCover ? 18 : 13, unit: 'PT' },
          italic: true,
          foregroundColor: {
            opaqueColor: {
              rgbColor: theme.subtitle
            }
          }
        },
        fields: 'fontFamily,fontSize,italic,foregroundColor'
      }
    });

    // F. Build Bullets for content slides (skip for Cover Slide)
    if (!isCover && slide.bullets && slide.bullets.length > 0) {
      // Create body text box
      requests.push({
        createShape: {
          objectId: bodyId,
          shapeType: 'TEXT_BOX',
          elementProperties: {
            pageObjectId: slideId,
            size: {
              width: { magnitude: 600, unit: 'PT' },
              height: { magnitude: 210, unit: 'PT' }
            },
            transform: {
              scaleX: 1, scaleY: 1,
              translateX: 60, translateY: 165,
              unit: 'PT'
            }
          }
        }
      });

      // Format bullets with standard bullet unicode characters and nice double-spacing
      const bodyText = slide.bullets.map(b => `•  ${b}`).join('\n\n');
      requests.push({
        insertText: {
          objectId: bodyId,
          text: bodyText
        }
      });

      requests.push({
        updateTextStyle: {
          objectId: bodyId,
          textRange: { type: 'ALL' },
          style: {
            fontFamily: theme.fontBody,
            fontSize: { magnitude: 15, unit: 'PT' },
            foregroundColor: {
              opaqueColor: {
                rgbColor: theme.body
              }
            }
          },
          fields: 'fontFamily,fontSize,foregroundColor'
        }
      });
    }
  });

  // G. Delete the very first slide of the newly created presentation which was the blank template "p" slide,
  // so that only our custom designed slide deck remains.
  requests.push({
    deleteObject: {
      objectId: 'p'
    }
  });

  // Call batchUpdate API
  const updateRes = await fetch(`https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      requests
    })
  });

  await handleApiResponse(updateRes, 'Google Slides API');

  return presentationId;
}

/**
 * Delete a presentation file from Google Drive (needs confirmation)
 */
export async function deletePresentationFile(accessToken: string, fileId: string): Promise<void> {
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  await handleApiResponse(res, 'Drive API');
}
