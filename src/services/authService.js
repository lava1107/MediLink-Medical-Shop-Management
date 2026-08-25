// Mock auth service. Structured so `login`/`logout` can later be swapped for real
// POST /api/auth/login calls against a Node.js + Express + MongoDB backend, with
// JWT stored in place of the current localStorage mock session.
import { USERS } from "../data/mockData.js";

const SESSION_KEY = "medilink.session";

export async function login(username, password) {
  // Simulate network latency.
  await new Promise((r) => setTimeout(r, 300));
  if (!username || !password) {
    throw new Error("Please enter both username and password.");
  }
  const user = USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) throw new Error("No account found with that username.");
  if (user.status !== "Active") throw new Error("This account has been deactivated. Contact your administrator.");
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function loginWithUser(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
