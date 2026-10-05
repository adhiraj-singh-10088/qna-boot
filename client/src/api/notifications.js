import { apiFetch } from './client';

export const fetchNotifications = () => apiFetch('/api/notifications');
export const fetchUnreadCount = () => apiFetch('/api/notifications/unread-count');
export const markNotificationRead = (id) =>
  apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
export const markAllNotificationsRead = () =>
  apiFetch('/api/notifications/read-all', { method: 'POST' });
