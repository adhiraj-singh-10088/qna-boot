import { ApiError } from "./client";

/** Uploads an image file (multipart) and returns { url }. */
export async function uploadImage(file) {
  const form = new FormData();
  form.append("image", file);

  let res;
  try {
    res = await fetch("/api/uploads", {
      method: "POST",
      credentials: "include",
      body: form,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Make sure the backend is running.", 0);
  }

  let json = null;
  try {
    json = await res.json();
  } catch {
    /* no body */
  }
  if (!res.ok) {
    throw new ApiError(json?.error || `Upload failed (${res.status})`, res.status);
  }
  return json; // { url }
}
