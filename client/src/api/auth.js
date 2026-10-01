const BASE = '/auth';

/**
 * Safely parse a fetch Response as JSON.
 * If the body is empty or not JSON, returns null instead of throwing.
 */
async function safeJson(res) {
  const text = await res.text();
  if (!text || !text.trim()) return null;
  try {
    return JSON.parse(text);
  } catch {
    // Server returned non-JSON (e.g. HTML error page, proxy error)
    return null;
  }
}

/**
 * Sign up a new user.
 * @param {{ email: string, dob: string, username: string, password: string }} data
 */
export async function signupUser(data) {
  let res;
  try {
    res = await fetch(`${BASE}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running.');
  }
  const json = await safeJson(res);
  if (!res.ok) {
    throw new Error(json?.error || `Signup failed (${res.status})`);
  }
  return json; // { id, email, username }
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 */
export async function loginUser(data) {
  let res;
  try {
    res = await fetch(`${BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
  } catch {
    throw new Error('Cannot reach the server. Make sure the backend is running.');
  }
  const json = await safeJson(res);
  if (!res.ok) {
    throw new Error(json?.error || `Login failed (${res.status})`);
  }
  return json; // { message, token, user }
}

/**
 * Fetch the currently authenticated user (requires token).
 * @param {string} token
 */
export async function getMe(token) {
  let res;
  try {
    res = await fetch(`${BASE}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    throw new Error('Cannot reach the server.');
  }
  const json = await safeJson(res);
  if (!res.ok) {
    throw new Error(json?.error || 'Unauthorized');
  }
  return json; // { user }
}
