"use client";
const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
let refreshInFlight = null;

const getToken = () =>
  typeof window === "undefined"
    ? null
    : localStorage.getItem("peleka_access_token");
const getRefreshToken = () =>
  typeof window === "undefined"
    ? null
    : localStorage.getItem("peleka_refresh_token");
export function setTokens({ access_token, refresh_token }) {
  if (access_token) localStorage.setItem("peleka_access_token", access_token);
  if (refresh_token)
    localStorage.setItem("peleka_refresh_token", refresh_token);
}
export function clearTokens() {
  localStorage.removeItem("peleka_access_token");
  localStorage.removeItem("peleka_refresh_token");
  localStorage.removeItem("peleka_user");
}
export const saveUser = (u) =>
  localStorage.setItem("peleka_user", JSON.stringify(u));
export const getSavedUser = () => {
  if (typeof window === "undefined") return null;
  try {
    return JSON.parse(localStorage.getItem("peleka_user") || "null");
  } catch {
    return null;
  }
};

async function refreshOnce() {
  if (refreshInFlight) return refreshInFlight;
  const rt = getRefreshToken();
  if (!rt) return Promise.reject(new Error("no_refresh_token"));
  refreshInFlight = fetch(`${BASE}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: rt }),
  })
    .then(async (res) => {
      if (!res.ok) throw new Error("refresh_failed");
      const json = await res.json();
      if (!json.success) throw new Error("refresh_failed");
      setTokens(json.data);
      return json.data.access_token;
    })
    .finally(() => {
      refreshInFlight = null;
    });
  return refreshInFlight;
}

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

async function core(method, path, body, opts = {}) {
  const doFetch = async (bearer) => {
    const headers = { Accept: "application/json" };
    if (bearer) headers.Authorization = `Bearer ${bearer}`;
    let payload;
    if (body instanceof FormData) payload = body;
    else if (body !== undefined) {
      headers["Content-Type"] = "application/json";
      payload = JSON.stringify(body);
    }
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: payload,
    });
    let json = null;
    try {
      json = await res.json();
    } catch {}
    return { res, json };
  };
  let bearer = getToken();
  let { res, json } = await doFetch(bearer);
  if (res.status === 401 && !opts.noRetry && getRefreshToken()) {
    try {
      const fresh = await refreshOnce();
      const retry = await doFetch(fresh);
      res = retry.res;
      json = retry.json;
    } catch {
      clearTokens();
      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }
      throw new ApiError("Session expired", 401, "UNAUTHORIZED");
    }
  }
  if (!res.ok)
    throw new ApiError(
      json?.error?.message || `HTTP ${res.status}`,
      res.status,
      json?.error?.code,
      json?.error?.details,
    );
  return json;
}

export const api = {
  get: (path) => core("GET", path),
  post: (path, body) => core("POST", path, body),
  patch: (path, body) => core("PATCH", path, body),
  put: (path, body) => core("PUT", path, body),
  del: (path) => core("DELETE", path),
};
export default api;
