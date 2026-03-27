import { createContext, useContext, useState, type ReactNode } from "react";

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

const TOKEN_KEY = "bestbod_token";
const USER_KEY = "bestbod_user";

export function UserAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  function login(newToken: string, newUser: AuthUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
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
