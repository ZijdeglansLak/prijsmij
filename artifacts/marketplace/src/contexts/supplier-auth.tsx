// Backward compatibility wrapper — all supplier auth now delegates to user-auth
import { useUserAuth, type AuthUser } from "./user-auth";

export interface SupplierUser {
  id: number;
  storeName: string;
  contactName: string;
  email: string;
  credits: number;
}

function userToSupplier(user: AuthUser | null): SupplierUser | null {
  if (!user) return null;
  return {
    id: user.id,
    storeName: user.storeName ?? user.contactName,
    contactName: user.contactName,
    email: user.email,
    credits: user.credits,
  };
}

export function useSupplierAuth() {
  const auth = useUserAuth();
  return {
    supplier: userToSupplier(auth.user),
    token: auth.token,
    login: (token: string, supplierData: SupplierUser) =>
      auth.login(token, { ...supplierData, role: "seller" as const }),
    logout: auth.logout,
    updateCredits: auth.updateCredits,
    isLoggedIn: auth.isLoggedIn && auth.isSeller,
  };
}
