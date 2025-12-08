// client/src/lib/api.ts
// Minimal API helper for the client. Uses VITE_API_URL if set.
// Assumes cookie based sessions on the server (credentials: 'include').

export const API_BASE = (import.meta.env.VITE_API_URL as string) || "";

export type ApiOptions = RequestInit & { parseJson?: boolean };

async function apiFetch(path: string, opts: ApiOptions = {}) {
  const { parseJson = true, ...init } = opts;
  const url = path.startsWith("http") ? path : `${API_BASE}${path}`;

  const res = await fetch(url, {
    credentials: "include", // needed if server uses cookie sessions
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
    ...init,
  });

  if (!res.ok) {
    let body: any = null;
    try {
      body = await res.json();
    } catch {}
    const error = new Error(body?.message || res.statusText);
    (error as any).status = res.status;
    (error as any).body = body;
    throw error;
  }

  if (!parseJson) {
    return res;
  }

  try {
    return await res.json();
  } catch {
    return null;
  }
}

export default apiFetch;