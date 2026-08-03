import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { Role, User } from "@/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  hasRole: (roles?: Role[]) => boolean;
  login: (email: string, role: Role) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = "auth_user";

function readStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  const login = useCallback(async (email: string, role: Role) => {
    // Replace with a real request, e.g.
    // const { data } = await apiClient.post("/auth/login", { email, password });
    const nextUser: User = {
      id: "USR-SESSION",
      name: email.split("@")[0] ?? "User",
      email,
      role,
      active: true,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
    localStorage.setItem("auth_token", "mock-token");
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("auth_token");
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (roles?: Role[]) => (!roles || roles.length === 0 ? true : !!user && roles.includes(user.role)),
    [user],
  );

  const value = useMemo(
    () => ({ user, isAuthenticated: !!user, hasRole, login, logout }),
    [user, hasRole, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
