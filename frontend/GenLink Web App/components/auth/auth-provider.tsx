"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Account } from "@/types";

interface AuthContextValue {
  user: Account | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, options: { remember: boolean }) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Account | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch (error) {
      authStorage.clearToken();
      setUser(null);
      setToken(null);
      throw error;
    }
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const storedToken = authStorage.getToken();

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      setToken(storedToken);
      try {
        await loadProfile();
      } catch (error) {
        console.error("Failed to bootstrap auth", error);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [loadProfile]);

  const login = useCallback(
    async (nextToken: string, options: { remember: boolean }) => {
      authStorage.setToken(nextToken, options.remember);
      setToken(nextToken);
      await loadProfile();
    },
    [loadProfile],
  );

  const logout = useCallback(() => {
    authStorage.clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!token) {
      return;
    }

    await loadProfile();
  }, [loadProfile, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      login,
      logout,
      refreshProfile,
    }),
    [user, token, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
};
