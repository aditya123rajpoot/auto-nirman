export const BACKEND_BASE_URL = (process.env.AUTO_NIRMAN_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

export async function postToBackend<T>(path: string, body: unknown, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      body: JSON.stringify(body),
      cache: 'no-store',
      ...init,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`FastAPI backend unavailable for ${path}:`, error instanceof Error ? error.message : error);
    return null;
  }
}

export async function getFromBackend<T>(path: string, init?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}${path}`, {
      method: 'GET',
      cache: 'no-store',
      ...init,
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`FastAPI backend unavailable for ${path}:`, error instanceof Error ? error.message : error);
    return null;
  }
}
