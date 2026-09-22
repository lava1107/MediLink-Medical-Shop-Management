// Authentication service backed by Node.js + Express + MySQL REST API
import { api } from "./api.js";

const SESSION_KEY = "medilink.session";
const TOKEN_KEY = "medilink.token";

export async function login(username, password) {
  if (!username || !password) {
    throw new Error("Please enter both username and password.");
  }

  try {
    const result = await api.post("/auth/login", { username, password });
    if (result && result.token) {
      localStorage.setItem(TOKEN_KEY, result.token);
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user));
      return result.user;
    }
    throw new Error("Invalid response from server.");
  } catch (err) {
    // If backend isn't responding or user is using demo mock, fall back gracefully
    if (err.status === 0 || err.status === 503) {
      console.warn("Backend unavailable, checking fallback login:", err.message);
    }
    throw err;
  }
}

export function loginWithUser(user, token = "demo-jwt-token") {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  if (token) localStorage.setItem(TOKEN_KEY, token);
  return user;
}

export async function getMe() {
  try {
    const user = await api.get("/auth/me");
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      return user;
    }
  } catch {
    // Return cached session if request fails
  }
  return getSession();
}

export async function logout() {
  try {
    await api.post("/auth/logout");
  } catch {
    // Proceed with local logout regardless
  }
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
