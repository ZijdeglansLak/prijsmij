import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface SupplierUser {
  id: number;
  storeName: string;
  contactName: string;
  email: string;
  credits: number;
}

interface SupplierAuthContextType {
  supplier: SupplierUser | null;
  token: string | null;
  login: (token: string, supplier: SupplierUser) => void;
  logout: () => void;
  updateCredits: (credits: number) => void;
  isLoggedIn: boolean;
}

const SupplierAuthContext = createContext<SupplierAuthContextType | null>(null);

const TOKEN_KEY = "bestbod_supplier_token";
const USER_KEY = "bestbod_supplier_user";

export function SupplierAuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [supplier, setSupplier] = useState<SupplierUser | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  function login(newToken: string, newSupplier: SupplierUser) {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newSupplier));
    setToken(newToken);
    setSupplier(newSupplier);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setSupplier(null);
  }

  function updateCredits(credits: number) {
    if (!supplier) return;
    const updated = { ...supplier, credits };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    setSupplier(updated);
  }

  return (
    <SupplierAuthContext.Provider value={{ supplier, token, login, logout, updateCredits, isLoggedIn: !!token && !!supplier }}>
      {children}
    </SupplierAuthContext.Provider>
  );
}

export function useSupplierAuth() {
  const ctx = useContext(SupplierAuthContext);
  if (!ctx) throw new Error("useSupplierAuth must be used within SupplierAuthProvider");
  return ctx;
}
