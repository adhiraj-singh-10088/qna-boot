const TOKEN_KEY = 'inkspace_token';
const USER_KEY = 'inkspace_user';

/**
 * Reads the legacy auth token from localStorage. The browser session now
 * lives in an httpOnly cookie — this stays for API-client compatibility
 * (scripts may still inject a token) and is attached as a Bearer header.
 */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Stores / clears the session (mirrors AuthContext, used by API helpers). */
export function setSession(token, user) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

/**
 * Core JSON fetch helper.
 * - Prefixes /api paths, attaches the Bearer token when present
 * - Turns network failures and non-2xx responses into ApiError
 */
export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  /* Content translation: tell the server which UI language is active so it
     can translate user content (titles, bodies, bios, comments) in responses. */
  try {
    const lang = localStorage.getItem('inkspace_lang');
    if (lang && lang !== 'en') headers['X-Lang'] = lang;
  } catch { /* localStorage unavailable — skip */ }

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      credentials: 'include', // send the httpOnly session cookie
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Make sure the backend is running.', 0);
  }

  let json = null;
  try {
    const text = await res.text();
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }

  if (!res.ok) {
    throw new ApiError(json?.error || `Request failed (${res.status})`, res.status);
  }
  return json;
}
