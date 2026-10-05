import { apiFetch } from './client';

/* Feed */
export function fetchFeed({ limit, offset } = {}) {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  if (offset) params.set('offset', offset);
  const qs = params.toString();
  return apiFetch(`/api/feed${qs ? `?${qs}` : ''}`);
}

/* Posts */
export const fetchPost = (id) => apiFetch(`/api/posts/${id}`);
export const createPost = (data) => apiFetch('/api/posts', { method: 'POST', body: data });
export const updatePost = (id, data) => apiFetch(`/api/posts/${id}`, { method: 'PUT', body: data });
export const deletePost = (id) => apiFetch(`/api/posts/${id}`, { method: 'DELETE' });

/* Likes */
export const likePost = (id) => apiFetch(`/api/posts/${id}/like`, { method: 'POST' });
export const unlikePost = (id) => apiFetch(`/api/posts/${id}/like`, { method: 'DELETE' });

/* Bookmarks */
export const bookmarkPost = (id) => apiFetch(`/api/posts/${id}/bookmark`, { method: 'POST' });
export const unbookmarkPost = (id) => apiFetch(`/api/posts/${id}/bookmark`, { method: 'DELETE' });
export const fetchBookmarks = () => apiFetch('/api/bookmarks');

/* Comments */
export const fetchComments = (postId) => apiFetch(`/api/posts/${postId}/comments`);
export const addComment = (postId, content) =>
  apiFetch(`/api/posts/${postId}/comments`, { method: 'POST', body: { content } });
export const deleteComment = (commentId) =>
  apiFetch(`/api/comments/${commentId}`, { method: 'DELETE' });
