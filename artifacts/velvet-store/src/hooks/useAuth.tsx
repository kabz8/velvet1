import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useGetAdminMe } from "@workspace/api-client-react";

interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  setAuth: (user: AdminUser, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("velvet_admin_token"));
  const [isLoading, setIsLoading] = useState(true);

  const { data, isError } = useGetAdminMe({
    query: {
      enabled: !!token,
      retry: false,
    },
    request: {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  } as any);

  useEffect(() => {
    if (data) {
      setUser(data as AdminUser);
      setIsLoading(false);
    } else if (isError || !token) {
      setUser(null);
      setIsLoading(false);
    }
  }, [data, isError, token]);

  const setAuth = (u: AdminUser, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem("velvet_admin_token", t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("velvet_admin_token");
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
