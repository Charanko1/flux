// hooks/useLogin.ts
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

type SocialLoading = "none" | "google" | "facebook";

export function useLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialLoading>("none");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const router = useRouter();
  const { login } = useAuth(); // Pastikan AuthContext kamu juga tidak menimpa token logic

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Email dan password tidak boleh kosong.");
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/session?type=login", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe }),
      });

      const data = await res.json();

      if (res.ok) {
        // --- PERBAIKAN UTAMA DISINI ---
        // Simpan token dari backend ke localStorage agar SettingsPage bisa membacanya
        if (data.token) {
            localStorage.setItem("token", data.token);
        }
        // ------------------------------

        await login(data.token, data.user);
        router.push("/dashboard");
      } else if (res.status === 403) {
        setError(data.message || "Login gagal. Akun belum diverifikasi.");
      } else {
        setError(data.message || "Login gagal. Cek kembali email dan password Anda.");
      }
    } catch {
      setError("Terjadi kesalahan server saat mencoba login.");
    }
    setIsLoading(false);
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    if (isLoading) return;
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return {
    form,
    isLoading,
    socialLoading,
    error,
    showPassword,
    rememberMe,
    setRememberMe,
    setShowPassword,
    handleChange,
    handleSubmit,
    handleSocialLogin,
  };
}