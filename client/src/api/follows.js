import { apiFetch } from './client';

export const followUser = (username) =>
  apiFetch(`/api/users/${encodeURIComponent(username)}/follow`, { method: 'POST' });

export const unfollowUser = (username) =>
  apiFetch(`/api/users/${encodeURIComponent(username)}/follow`, { method: 'DELETE' });

export const fetchFollowRequests = () => apiFetch('/api/follow-requests');

export const acceptFollowRequest = (id) =>
  apiFetch(`/api/follow-requests/${id}/accept`, { method: 'POST' });

export const declineFollowRequest = (id) =>
  apiFetch(`/api/follow-requests/${id}`, { method: 'DELETE' });
