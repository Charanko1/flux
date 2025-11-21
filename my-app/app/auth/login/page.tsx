"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { FaLock, FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";

type SocialLoading = "none" | "google" | "facebook";

const Spinner = () => (
  <div className="flex items-center justify-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700 mr-2"></div>
    <span className="text-xs text-gray-700">Loading...</span>
  </div>
);

// --- COMPONENT BACKGROUND ---
const FluxBackground = () => (
  <div className="absolute inset-0 grid grid-cols-6 pointer-events-none select-none">
    <div className="bg-gradient-to-b from-[#FFCB74] to-[#E6AE47]" />
    <div className="bg-gradient-to-b from-[#F6F6F6] to-[#CFA348]" />
    <div className="bg-gradient-to-b from-[#2F2F2F] to-[#2F2F2F]" />
    <div className="bg-gradient-to-b from-[#FFCB74] to-[#5C5C5C]" />
    <div className="bg-gradient-to-b from-[#111111] to-[#F0D28C]" />
    <div className="bg-gradient-to-b from-[#F6F6F6] to-[#B0A48C]" />
  </div>
);

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialLoading>("none");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

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
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe }),
      });
      const data = await res.json();
      if (res.ok) await login(data.token, data.user);
      else setError(data.message || "Login gagal.");
    } catch {
      setError("Terjadi kesalahan server.");
    }
    setIsLoading(false);
  };

  const handleSocialLogin = (provider: "google" | "facebook") => {
    if (isLoading) return;
    setSocialLoading(provider);
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* ================= LEFT SIDE (DESKTOP ONLY) ================= */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-800 relative h-full">
        <FluxBackground />
        <div className="relative z-10 bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl p-10 flex flex-col items-center max-w-md">
          <Image src="/logo2.png" alt="Logo" width={160} height={160} priority />
          <h1 className="text-3xl font-bold mt-4 text-gray-900">FLUX</h1>
          <p className="text-sm text-gray-700 mt-2 font-medium tracking-wide">
            YOUR PERSONAL FLOW IN MOTION
          </p>
        </div>
      </div>

      {/* ================= RIGHT SIDE (FORM AREA) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center h-full relative lg:bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden">
        
        {/* --- MOBILE BACKGROUND --- */}
        <div className="lg:hidden absolute inset-0 z-0">
            <FluxBackground />
            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" /> 
        </div>

        {/* --- CONTAINER FORM --- */}
        {/* Samain layoutnya: max-w-[340px], padding p-5, margin mx-4 */}
        <div className="relative z-10 w-full max-w-[340px] sm:max-w-sm bg-white/90 lg:bg-transparent p-5 sm:p-8 rounded-2xl shadow-2xl lg:shadow-none lg:p-0 border border-white/20 lg:border-none backdrop-blur-md lg:backdrop-blur-none mx-4">
          
          {/* Mobile Branding - Diperkecil (w-16) dan margin (mb-2) */}
          <div className="lg:hidden flex flex-col items-center mb-2 text-center">
             <div className="relative w-16 h-16 mb-1 drop-shadow-md">
                <Image src="/logo2.png" alt="Logo Mobile" fill className="object-contain" />
             </div>
             <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm">FLUX</h1>
             <p className="text-[10px] text-gray-600 font-medium tracking-widest">FLOW IN MOTION</p>
          </div>

          <Link
            href="/auth/landing"
            className="text-[10px] sm:text-xs text-gray-600 lg:text-gray-700 mb-3 block hover:underline transition-colors hover:text-amber-600 flex items-center"
          >
            ← Back to Home
          </Link>

          <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">
            Sign In
          </h1>
          <p className="text-gray-600 lg:text-gray-700 text-xs mb-4">
            Welcome back! Please enter your details
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1.5 rounded-lg mb-3 text-[10px] text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Email Input */}
            <div className="relative group">
              <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 text-sm sm:text-lg group-focus-within:text-amber-600 transition-colors" />
              <input
                name="email"
                type="email"
                placeholder="name@gmail.com"
                value={form.email}
                onChange={handleChange}
                // Padding input py-2 biar ga terlalu tebel
                className="border border-gray-300 bg-white/80 lg:bg-white py-2 pl-10 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm lg:shadow-none"
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="border border-gray-300 bg-white/80 lg:bg-white py-2 pl-10 pr-10 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm lg:shadow-none"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 hover:text-gray-700 p-1"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs mt-1">
              <label className="flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3 w-3 text-amber-500 border-gray-300 rounded focus:ring-amber-400"
                />
                <span className="ml-2 text-gray-700 text-[10px] sm:text-xs">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-amber-600 lg:text-amber-500 font-semibold hover:text-amber-700 hover:underline text-[10px] sm:text-xs"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button - Padding py-2 */}
            <button
              type="submit"
              disabled={isLoading}
              className="bg-amber-400 lg:bg-amber-400 text-gray-900 py-2 rounded-xl font-semibold text-sm hover:bg-amber-500 active:scale-[0.98] disabled:opacity-70 transition-all mt-1 shadow-md lg:shadow-none"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 my-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            {/* Social Buttons - Padding py-2 */}
            <div className="flex flex-row gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading || socialLoading !== "none"}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-50 transition-all disabled:opacity-60 shadow-sm lg:shadow-none"
              >
                {socialLoading === "google" ? <Spinner /> : <><FcGoogle size={18} /> <span className="font-medium text-gray-700">Google</span></>}
              </button>
              <button
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading || socialLoading !== "none"}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-50 transition-all disabled:opacity-60 shadow-sm lg:shadow-none"
              >
                {socialLoading === "facebook" ? <Spinner /> : <><FaFacebook className="text-blue-600" size={18} /> <span className="font-medium text-gray-700">Facebook</span></>}
              </button>
            </div>

            <p className="text-center text-[10px] sm:text-xs text-gray-600 mt-3">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-amber-600 lg:text-amber-500 hover:text-amber-700 hover:underline"
              >
                Sign Up Now
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}