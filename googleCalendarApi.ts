// Google Calendar API client-side helpers

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
    throw new Error(`${apiName} Error (403): Permission denied or missing OAuth scope. Please reconnect your Google account with full permissions.`);
  }
  throw new Error(`${apiName} Error (${res.status}): ${errText}`);
}

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime?: string;
    date?: string;
  };
  end: {
    dateTime?: string;
    date?: string;
  };
  htmlLink?: string;
}

/**
 * Fetch list of upcoming events from Google Calendar
 */
export async function listUpcomingEvents(accessToken: string): Promise<CalendarEvent[]> {
  const now = new Date().toISOString();
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(now)}&orderBy=startTime&singleEvents=true&maxResults=20`;

  const res = await safeFetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await handleApiResponse(res, 'Calendar API');
  return data.items || [];
}

/**
 * Create a new calendar event
 */
export async function createCalendarEvent(
  accessToken: string,
  event: {
    summary: string;
    description?: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
  }
): Promise<CalendarEvent> {
  const url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';

  const res = await safeFetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      summary: event.summary,
      description: event.description || 'Created via Apex DeFi Dashboard',
      start: {
        dateTime: event.startTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      },
      end: {
        dateTime: event.endTime,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
      }
    })
  });

  return await handleApiResponse(res, 'Calendar API');
}

/**
 * Delete a calendar event
 */
export async function deleteCalendarEvent(accessToken: string, eventId: string): Promise<void> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`;

  const res = await safeFetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  await handleApiResponse(res, 'Calendar API');
}
