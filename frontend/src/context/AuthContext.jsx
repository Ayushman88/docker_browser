import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const t = localStorage.getItem("rebrowser_access_token");
    const e = localStorage.getItem("rebrowser_auth_email");
    if (t && e) {
      setToken(t);
      setEmail(e);
    }
    setReady(true);
  }, []);

  const login = useCallback((accessToken, userEmail) => {
    setToken(accessToken);
    setEmail(userEmail);
    localStorage.setItem("rebrowser_access_token", accessToken);
    localStorage.setItem("rebrowser_auth_email", userEmail);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setEmail(null);
    localStorage.removeItem("rebrowser_access_token");
    localStorage.removeItem("rebrowser_auth_email");
  }, []);

  const value = useMemo(
    () => ({ token, email, ready, isAuthenticated: Boolean(token), login, logout }),
    [token, email, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
