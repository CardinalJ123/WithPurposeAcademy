import { auth } from "@/lib/firebase";

/** fetch() with the caller's Firebase ID token attached. */
export async function authedFetch(input: string, init: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  const token = await user.getIdToken();
  return fetch(input, {
    ...init,
    headers: { ...(init.headers ?? {}), Authorization: `Bearer ${token}` },
  });
}

export async function authedJson<T = unknown>(input: string, init: RequestInit = {}) {
  const res = await authedFetch(input, init);
  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
  return data;
}

/**
 * Fetches a protected binary (e.g. a course PDF) with the auth token and
 * returns an object URL for it. The caller owns the URL and should
 * URL.revokeObjectURL() it when done to free memory.
 */
export async function authedObjectUrl(input: string) {
  const res = await authedFetch(input);
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      msg = (await res.json()).error ?? msg;
    } catch {
      /* non-JSON error body */
    }
    throw new Error(msg);
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}
