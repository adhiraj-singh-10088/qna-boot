import { apiFetch } from "./client";

export const fetchConversations = () => apiFetch("/api/messages/conversations");

export const fetchThread = (username) =>
  apiFetch(`/api/messages/${encodeURIComponent(username)}`);

export const sendMessage = (username, { content, postId } = {}) =>
  apiFetch(`/api/messages/${encodeURIComponent(username)}`, {
    method: "POST",
    body: { content, postId },
  });
