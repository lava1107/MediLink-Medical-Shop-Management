import React, { createContext, useCallback, useEffect, useState } from "react";
import { getSession, loginWithUser, logout as logoutService } from "../services/authService.js";
import { BRANCHES } from "../data/mockData.js";

export const AuthContext = createContext(null);

// Provides the authenticated user + role information application-wide.
// Backed by localStorage today (mock authentication); swap `authService.js`
// internals for real JWT-based calls later without touching consuming components.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());
  const [currentBranch, setCurrentBranch] = useState(() => {
    const session = getSession();
    return session && session.role !== "Admin" ? session.branch : BRANCHES[0].name;
  });

  useEffect(() => {
    if (user && user.role !== "Admin") setCurrentBranch(user.branch);
  }, [user]);

  const login = useCallback((u) => {
    loginWithUser(u);
    setUser(u);
    if (u.role !== "Admin") setCurrentBranch(u.branch);
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const value = { user, login, logout, currentBranch, setCurrentBranch };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
