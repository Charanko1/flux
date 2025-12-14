"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export interface UserType {
  _id: string;
  name: string;
  username?: string;
  email: string;
  role?: string;
  avatarUrl?: string;
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

  // Helper: fetch profil dari backend (pakai cookie `session`)
  const fetchProfile = async (): Promise<UserType | null> => {
    try {
      const res = await fetch("/api/user/profile", {
        method: "GET",
        credentials: "include",
      });
      if (!res.ok) return null;
      const data = await res.json();
      return {
        _id: data._id,
        name: data.name,
        email: data.email,
        username: data.username,
        role: data.role,
        avatarUrl: data.avatarUrl,
      };
    } catch {
      return null;
    }
  };

  // Inisialisasi: coba ambil dari localStorage, kalau tidak ada sync dari backend
  useEffect(() => {
    const init = async () => {
      const savedUser = typeof window !== "undefined"
        ? localStorage.getItem("user")
        : null;

      if (savedUser) {
        setUser(JSON.parse(savedUser));
        setLoading(false);
        return;
      }

      // Tidak ada di localStorage → coba baca dari API (cookie session)
      const profile = await fetchProfile();
      if (profile) {
        setUser(profile);
        if (typeof window !== "undefined") {
          localStorage.setItem("user", JSON.stringify(profile));
        }
      }

      setLoading(false);
    };

    init();
  }, []);

  // Login manual (email/password)
  const login = async (token: string, userData?: Partial<UserType>) => {
    localStorage.setItem("token", token);

    if (userData) {
      const newUser = userData as UserType;
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    } else {
      // kalau tidak ada userData eksplisit, sync dari backend
      const profile = await fetchProfile();
      if (profile) {
        setUser(profile);
        localStorage.setItem("user", JSON.stringify(profile));
      }
    }

    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    router.push("/auth/login");
  };

  // Update user lokal setelah PUT /api/user/profile
  const updateUser = async (data: Partial<UserType>): Promise<UserType> => {
    if (!user) throw new Error("Not authenticated");

    const updatedUser: UserType = {
      ...user,
      ...data,
      name: data.name ?? user.name,
    };

    setUser(updatedUser);
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

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
