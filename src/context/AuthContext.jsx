import React, { createContext, useCallback, useEffect, useState } from "react";
import { getSession, login as loginService, loginWithUser, logout as logoutService } from "../services/authService.js";
import { BRANCHES } from "../data/mockData.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getSession());
  const [currentBranch, setCurrentBranch] = useState(() => {
    const session = getSession();
    return session && session.role !== "Admin" ? session.branch : BRANCHES[0].name;
  });

  useEffect(() => {
    if (user && user.role !== "Admin") setCurrentBranch(user.branch);
  }, [user]);

  const login = useCallback(async (usernameOrUser, password) => {
    if (typeof usernameOrUser === "string") {
      const u = await loginService(usernameOrUser, password);
      setUser(u);
      if (u.role !== "Admin") setCurrentBranch(u.branch);
      return u;
    } else {
      loginWithUser(usernameOrUser);
      setUser(usernameOrUser);
      if (usernameOrUser?.role !== "Admin" && usernameOrUser?.branch) setCurrentBranch(usernameOrUser.branch);
      return usernameOrUser;
    }
  }, []);

  const logout = useCallback(() => {
    logoutService();
    setUser(null);
  }, []);

  const value = { user, login, logout, currentBranch, setCurrentBranch };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
