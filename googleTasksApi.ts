// Google Tasks API client-side helpers

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

export interface GoogleTaskList {
  id: string;
  title: string;
  updated: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
  webViewLink?: string;
}

/**
 * Fetch list of Task Lists belonging to the authenticated user
 */
export async function listTaskLists(accessToken: string): Promise<GoogleTaskList[]> {
  const url = 'https://tasks.googleapis.com/v1/users/@default/tasklists';

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await handleApiResponse(res, 'Google Tasks API');
  return data.items || [];
}

/**
 * Fetch tasks from a specific Task List
 */
export async function listTasks(accessToken: string, taskListId: string): Promise<GoogleTask[]> {
  const url = `https://tasks.googleapis.com/v1/lists/${taskListId}/tasks?showCompleted=true`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Accept': 'application/json'
    }
  });

  const data = await handleApiResponse(res, 'Google Tasks API');
  return data.items || [];
}

/**
 * Create a new task in a specific Task List
 */
export async function createGoogleTask(
  accessToken: string,
  taskListId: string,
  task: {
    title: string;
    notes?: string;
    due?: string; // ISO format string
  }
): Promise<GoogleTask> {
  const url = `https://tasks.googleapis.com/v1/lists/${taskListId}/tasks`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: task.title,
      notes: task.notes || 'Created via Apex DeFi Dashboard',
      due: task.due
    })
  });

  return await handleApiResponse(res, 'Google Tasks API');
}

/**
 * Toggle task status (e.g. mark completed/uncompleted)
 */
export async function updateTaskStatus(
  accessToken: string,
  taskListId: string,
  taskId: string,
  completed: boolean
): Promise<GoogleTask> {
  const url = `https://tasks.googleapis.com/v1/lists/${taskListId}/tasks/${taskId}`;

  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      status: completed ? 'completed' : 'needsAction'
    })
  });

  return await handleApiResponse(res, 'Google Tasks API');
}

/**
 * Delete a Google Task
 */
export async function deleteGoogleTask(
  accessToken: string,
  taskListId: string,
  taskId: string
): Promise<void> {
  const url = `https://tasks.googleapis.com/v1/lists/${taskListId}/tasks/${taskId}`;

  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  await handleApiResponse(res, 'Google Tasks API');
}
