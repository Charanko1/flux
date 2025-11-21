"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserType {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: UserType | null;
  loading: boolean;
  login: (token: string, userData?: Partial<UserType>) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
  updateUser: (data: Partial<UserType>) => Promise<UserType>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const getToken = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // Ambil user dari localStorage saat pertama kali
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (token: string, userData?: Partial<UserType>) => {
    localStorage.setItem("token", token);

    if (userData) {
      const newUser = userData as UserType;
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }

    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  /**
   * ✅ Update user data locally (tanpa backend)
   */
  const updateUser = async (data: Partial<UserType>): Promise<UserType> => {
    if (!user) throw new Error("Not authenticated");

    const updatedUser: UserType = {
      ...user,
      ...data,
      name: data.username ?? user.name, // biar sidebar langsung ikut berubah
    };

    // Simpan ke state dan localStorage
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));

    return updatedUser;
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    getToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
