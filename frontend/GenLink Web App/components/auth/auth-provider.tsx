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
import { usePathname } from "next/navigation";

import { api } from "@/lib/api";
import { authStorage } from "@/lib/auth-storage";
import type { Account } from "@/types";

const UNPROTECTED_VOLUNTEER_PREFIXES = [
  "/wolontariusz/login",
  "/wolontariusz/rejestracja",
];

const shouldLoadProfileForPath = (pathname: string | null) => {
  if (!pathname) {
    return false;
  }

  if (!pathname.startsWith("/wolontariusz")) {
    return false;
  }

  if (pathname === "/wolontariusz") {
    return false;
  }

  const isPublicVolunteerPath = UNPROTECTED_VOLUNTEER_PREFIXES.some(
    (publicPath) =>
      pathname === publicPath || pathname.startsWith(`${publicPath}/`),
  );

  return !isPublicVolunteerPath;
};

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
  const [hasLoadedProfile, setHasLoadedProfile] = useState(false);
  const pathname = usePathname();
  const requiresProfile = useMemo(
    () => shouldLoadProfileForPath(pathname),
    [pathname],
  );

  const loadProfile = useCallback(async () => {
    const activeToken = authStorage.getToken();

    if (!activeToken) {
      setUser(null);
      setHasLoadedProfile(false);
      return;
    }

    try {
      const profile = await api.auth.me();
      setUser(profile);
      setHasLoadedProfile(true);
    } catch (error) {
      authStorage.clearToken();
      setUser(null);
      setToken(null);
      setHasLoadedProfile(false);
      throw error;
    }
  }, []);

  useEffect(() => {
    const storedToken = authStorage.getToken();

    if (storedToken) {
      setToken(storedToken);
    } else {
      setIsLoading(false);
      setUser(null);
      setHasLoadedProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    if (!requiresProfile) {
      setIsLoading(false);
      return;
    }

    if (hasLoadedProfile) {
      setIsLoading(false);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);

    loadProfile()
      .catch((error) => {
        console.error("Failed to load profile", error);
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [token, requiresProfile, hasLoadedProfile, loadProfile]);

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
    setHasLoadedProfile(false);
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
      isAuthenticated: Boolean(user && token),
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
