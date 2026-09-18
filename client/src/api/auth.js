const BASE = '/auth';

/**
 * Sign up a new user.
 * @param {{ email: string, dob: string, username: string, password: string }} data
 */
export async function signupUser(data) {
  const res = await fetch(`${BASE}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Signup failed');
  return json; // { id, email, username }
}

/**
 * Log in an existing user.
 * @param {{ email: string, password: string }} data
 */
export async function loginUser(data) {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Login failed');
  return json; // { message, token, user }
}

/**
 * Fetch the currently authenticated user (requires token).
 * @param {string} token
 */
export async function getMe(token) {
  const res = await fetch(`${BASE}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || 'Unauthorized');
  return json; // { user }
}
