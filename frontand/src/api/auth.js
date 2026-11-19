export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("studify_token");
};

export const setStoredToken = (token) => {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem("studify_token", token);
  } else {
    window.localStorage.removeItem("studify_token");
  }
};

export const request = async (path, options = {}) => {
  let response;
  const token = getStoredToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      credentials: "include",
      headers,
    });
  } catch {
    throw new Error("Cannot reach the authentication server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.message || "Authentication request failed.");
    error.status = response.status;
    throw error;
  }

  if (data.token) {
    setStoredToken(data.token);
  }

  return data;
};

export const authApi = {
  register: (credentials) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  login: (credentials) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),
  socialLogin: (payload) =>
    request("/auth/social-login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  logout: async () => {
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setStoredToken(null);
    }
  },
  currentUser: () => request("/auth/me"),
};
