import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

export type UserRole = "buyer" | "seller";

export interface AuthUser {
  id: number;
  role: UserRole;
  storeName?: string;
  contactName: string;
  email: string;
  credits: number;
  isAdmin: boolean;
  emailVerified: boolean;
  avatarUrl?: string | null;
}

interface UserAuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateCredits: (credits: number) => void;
  updateUser: (partial: Partial<AuthUser>) => void;
  isLoggedIn: boolean;
  isSeller: boolean;
  isBuyer: boolean;
  isAdmin: boolean;
}

const UserAuthContext = createContext<UserAuthContextType | null>(null);

const TOKEN_KEY = "prijsmij_token";
const USER_KEY = "prijsmij_user";

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const tokenRef = useRef(token);
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  // Keep the ref in sync and register a global token getter for the API client
  useEffect(() => {
    tokenRef.current = token;
  }, [token]);

  useEffect(() => {
    setAuthTokenGetter(() => tokenRef.current);
    return () => { setAuthTokenGetter(null); };
  }, []);

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    const currentToken = localStorage.getItem(TOKEN_KEY);
    if (currentToken) {
      fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${currentToken}` },
      }).catch(() => {});
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }

  function updateCredits(credits: number) {
    if (!user) return;
    const updated = { ...user, credits };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  function updateUser(partial: Partial<AuthUser>) {
    if (!user) return;
    const updated = { ...user, ...partial };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setUser(updated);
  }

  function refreshFromServer() {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (!storedToken) return;
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${storedToken}` } })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!data) return;
        const refreshed: AuthUser = {
          id: data.id,
          role: data.role,
          storeName: data.storeName,
          contactName: data.contactName,
          email: data.email,
          credits: data.credits,
          isAdmin: data.isAdmin,
          emailVerified: data.emailVerified,
          avatarUrl: data.avatarUrl ?? null,
        };
        localStorage.setItem(USER_KEY, JSON.stringify(refreshed));
        setUser(refreshed);
      })
      .catch(() => {});
  }

  // Refresh user data from the server on mount
  useEffect(() => {
    refreshFromServer();
  }, []);

  // Pick up changes made in other tabs (e.g. email verified in a different tab)
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === USER_KEY && e.newValue) {
        try { setUser(JSON.parse(e.newValue)); } catch {}
      }
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Re-check when the user switches back to this tab
  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        refreshFromServer();
      }
    }
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  return (
    <UserAuthContext.Provider value={{
      user, token, login, logout, updateCredits, updateUser,
      isLoggedIn: !!token && !!user,
      isSeller: user?.role === "seller",
      isBuyer: user?.role === "buyer",
      isAdmin: user?.isAdmin ?? false,
    }}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const ctx = useContext(UserAuthContext);
  if (!ctx) throw new Error("useUserAuth must be used within UserAuthProvider");
  return ctx;
}
