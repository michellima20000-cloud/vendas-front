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
import type { User } from "@/types/api";

const TOKEN_KEY = "vendas-black-token";
const USER_KEY = "vendas-black-user";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(USER_KEY);
    return value ? (JSON.parse(value) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_KEY);
    const storedUser = readStoredUser();
    setToken(storedToken);
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const persistSession = useCallback((accessToken: string, nextUser: User) => {
    try {
      window.localStorage.setItem(TOKEN_KEY, accessToken);
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    } catch {
      throw new Error(
        "Seu navegador bloqueou o armazenamento local. Permita o acesso aos dados do site e tente novamente.",
      );
    }
    setToken(accessToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await api.login(email, password);
      persistSession(response.access_token, response.user);
      return response.user;
    },
    [persistSession],
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await api.register(name, email, password);
      persistSession(response.access_token, response.user);
      return response.user;
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // Mesmo sem acesso ao storage, o estado local deve ser encerrado.
    }
    setToken(null);
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const nextUser = await api.me(token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    } catch {
      logout();
    }
  }, [logout, token]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
    }),
    [isLoading, login, logout, refreshUser, register, token, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth precisa estar dentro de AuthProvider");
  return context;
}
