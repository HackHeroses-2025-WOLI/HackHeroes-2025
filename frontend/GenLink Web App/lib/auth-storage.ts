const TOKEN_KEY = "genlink-auth-token";
const STORAGE_PREF_KEY = "genlink-auth-storage";

type StorageTarget = "local" | "session";

const isBrowser = () => typeof window !== "undefined";

const getStorage = (target: StorageTarget) =>
  target === "local" ? window.localStorage : window.sessionStorage;

const clearTokens = () => {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_KEY);
};

export const authStorage = {
  getToken(): string | null {
    if (!isBrowser()) {
      return null;
    }

    return (
      window.sessionStorage.getItem(TOKEN_KEY) ||
      window.localStorage.getItem(TOKEN_KEY)
    );
  },
  setToken(token: string, remember: boolean) {
    if (!isBrowser()) {
      return;
    }

    clearTokens();
    const target: StorageTarget = remember ? "local" : "session";
    getStorage(target).setItem(TOKEN_KEY, token);
    window.localStorage.setItem(STORAGE_PREF_KEY, target);
  },
  clearToken() {
    clearTokens();
  },
  getPreferredPersistence(): StorageTarget {
    if (!isBrowser()) {
      return "local";
    }

    const stored = window.localStorage.getItem(STORAGE_PREF_KEY);
    return stored === "session" ? "session" : "local";
  },
};
