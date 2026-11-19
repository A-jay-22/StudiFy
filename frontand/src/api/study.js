const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;
  try {
    const headers = { ...options.headers };
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error("Cannot reach the StudyAI server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return data;
}

export const studyApi = {
  listItems: (kind) =>
    request(kind ? `/study/items?kind=${encodeURIComponent(kind)}` : "/study/items"),
  createItem: (item) =>
    request("/study/items", { method: "POST", body: JSON.stringify(item) }),
  updateItem: (id, item) =>
    request(`/study/items/${encodeURIComponent(id)}`, {
      method: "PUT",
      body: JSON.stringify(item),
    }),
  deleteItem: (id) =>
    request(`/study/items/${encodeURIComponent(id)}`, { method: "DELETE" }),
  upload: (file, subject = "General") => {
    const body = new FormData();
    body.append("file", file);
    body.append("subject", subject);
    return request("/study/items/upload", { method: "POST", body });
  },
  downloadUrl: (id, format = "pdf", inline = false) =>
    `${API_BASE_URL}/study/items/${encodeURIComponent(id)}/download?format=${encodeURIComponent(
      format
    )}${inline ? "&inline=1" : ""}`,
  viewPdfUrl: (id) =>
    `${API_BASE_URL}/study/items/${encodeURIComponent(id)}/download?format=pdf&inline=1`,
  progress: () => request("/study/progress"),
  track: (seconds, page, keepalive = false) =>
    request("/study/sessions", {
      method: "POST",
      body: JSON.stringify({ seconds, page }),
      keepalive,
    }),
  generate: (payload) =>
    request("/study/ai", { method: "POST", body: JSON.stringify(payload) }),
  askAboutMaterial: (materialId, prompt, history = []) =>
    request(`/study/materials/${encodeURIComponent(materialId)}/ask`, {
      method: "POST",
      body: JSON.stringify({ prompt, history }),
    }),
};
