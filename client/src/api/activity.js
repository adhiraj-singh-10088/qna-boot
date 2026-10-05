import { apiFetch } from "./client";

export const fetchActivity = () => apiFetch("/api/activity");
