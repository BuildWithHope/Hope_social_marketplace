"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getUserProfile } from "@/lib/api";

const AuthContext = createContext({
  user: null,
  isAuth: false,
  loading: true,
  login: () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      const profile = await getUserProfile();
      setUser(profile);
    } catch (err) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(async (token) => {
    if (typeof window !== "undefined" && token) {
      localStorage.setItem("token", token);
    }
    await checkAuth();
  }, [checkAuth]);

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const profile = await getUserProfile();
      setUser(profile);
    } catch (err) {
      // If fetching profile fails on refresh, keep state or handle if needed
    }
  }, []);

  const isAuth = Boolean(user);

  return (
    <AuthContext.Provider value={{ user, isAuth, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
