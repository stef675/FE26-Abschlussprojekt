const BASE_URL = "http://localhost:3000";

export async function listeClient<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
    ...options,
  });

  if (!res.ok) throw new Error((await res.text()) || `Request failed: ${res.status}`);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}