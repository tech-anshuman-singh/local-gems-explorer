export const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5050/api").replace(/\/$/, "");

export const api = {
  async post(path: string, body: object, token?: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  async get(path: string, token?: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  async patch(path: string, body: object, token?: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  async put(path: string, body: object, token?: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },

  // Upload multiple images as multipart/form-data (field name: "images")
  async uploadImages(path: string, files: File[], token: string) {
    const formData = new FormData();
    files.forEach((file) => formData.append("images", file));
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${res.status} ${res.statusText}`); }
    if (!res.ok) throw new Error(data.message || "Upload failed");
    return data;
  },

  // Upload a single image via /api/upload/image (field name: "image")
  // Returns { url: string, public_id: string }
  async uploadSingleImage(file: File, token: string): Promise<{ url: string; public_id: string }> {
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(`${BASE_URL}/upload/image`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const text = await res.text();
    let data: any;
    try { data = JSON.parse(text); } catch { throw new Error(`Server error: ${res.status} ${res.statusText}`); }
    if (!res.ok) throw new Error(data.message || "Image upload failed");
    return data;
  },

  async delete(path: string, token?: string) {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  },
};
