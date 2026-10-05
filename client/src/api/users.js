import { apiFetch } from './client';

export function searchUsers(query) {
  const qs = query ? `?q=${encodeURIComponent(query)}` : '';
  return apiFetch(`/api/users/search${qs}`);
}

export const fetchProfile = (username) => apiFetch(`/api/users/${encodeURIComponent(username)}`);
export const fetchUserPosts = (username) =>
  apiFetch(`/api/users/${encodeURIComponent(username)}/posts`);
export const fetchFollowers = (username) =>
  apiFetch(`/api/users/${encodeURIComponent(username)}/followers`);
export const fetchFollowing = (username) =>
  apiFetch(`/api/users/${encodeURIComponent(username)}/following`);

export const updateMe = (patch) => apiFetch('/api/users/me', { method: 'PATCH', body: patch });
