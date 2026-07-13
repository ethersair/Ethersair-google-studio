// Google Tasks API client-side helpers

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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Google Tasks API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to load tasks (${res.status}): ${errText}`);
  }

  const data = await res.json();
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create Google task (${res.status}): ${errText}`);
  }

  return await res.json();
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update task status (${res.status}): ${errText}`);
  }

  return await res.json();
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

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete Google task (${res.status}): ${errText}`);
  }
}
