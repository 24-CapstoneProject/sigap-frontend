export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const getToken = () => localStorage.getItem("token")?.trim() || null;

export const setAuthSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

export const getAuthHeaders = (withJson = false) => {
  const token = getToken();
  const headers = {};
  if (withJson) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export const apiFetch = (path, options = {}) => {
  const isFormData = options.body instanceof FormData;
  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(!!options.body && !isFormData),
      ...options.headers,
    },
  });
};

export const loginRequest = async (identifier, password) => {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "Login gagal");
  }

  setAuthSession(data.token, data.user);
  return data;
};

export const logoutRequest = async () => {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, { method: "POST" });
  } catch {
    // ignore network errors during logout
  }
  clearAuthSession();
};
