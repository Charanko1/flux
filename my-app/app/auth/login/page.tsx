// File: app/login/page.tsx
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
import { motion, Variants } from "framer-motion"; 
import { Loader2 } from "lucide-react"; // Import Loader2

type SocialLoading = "none" | "google" | "facebook";

// --- ANIMATION VARIANTS ---
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100 } 
  },
};

const Spinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="animate-spin h-4 w-4 border-gray-700 mr-2" />
    <span className="text-xs text-gray-700">Loading...</span>
  </div>
);

// --- COMPONENT BACKGROUND ---
const FluxBackground = () => (
  <div className="absolute inset-0 grid grid-cols-6 pointer-events-none select-none h-full">
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
    setError(null);
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, rememberMe }), 
      });

      const data = await res.json();

      if (res.ok) {
        // SUKSES: Update Auth Context dan Redirect
        await login(data.user); 
        router.push("/dashboard"); 
      } else if (res.status === 403) {
        // --- LOGIC BARU: AKUN BELUM VERIFIKASI ---
        setError(data.message || "Login gagal. Akun belum diverifikasi.");
        
        // Opsional: Arahkan user kembali ke halaman register/verifikasi jika perlu
        // Jika kamu mau user langsung ke halaman OTP, aktifkan kode di bawah:
        /*
        setTimeout(() => {
          router.push(`/auth/register?email=${form.email}`);
        }, 1500);
        */
      } else {
        // Gagal karena kredensial salah (401) atau error lain
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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* ================= LEFT SIDE (DESKTOP ONLY) ================= */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-800 relative h-full">
        <FluxBackground />
        
        {/* Animated Glass Card Left */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md border border-white/40"
        >
          {/* Floating Logo Animation */}
          <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Image src="/logo2.png" alt="Logo" width={160} height={160} priority className="drop-shadow-lg" />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-bold mt-6 text-gray-900"
          >
            FLUX
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-sm text-gray-700 mt-2 font-medium tracking-widest"
          >
            YOUR PERSONAL FLOW IN MOTION
          </motion.p>
        </motion.div>
      </div>

      {/* ================= RIGHT SIDE (FORM AREA) ================= */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center h-full relative lg:bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden">
        
        {/* --- MOBILE BACKGROUND --- */}
        <div className="lg:hidden absolute inset-0 z-0">
            <FluxBackground />
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[3px]" /> 
        </div>

        {/* --- CONTAINER FORM (Animated) --- */}
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="relative z-10 w-full max-w-[340px] sm:max-w-sm bg-white/90 lg:bg-transparent p-6 sm:p-8 rounded-2xl shadow-2xl lg:shadow-none lg:p-0 border border-white/40 lg:border-none backdrop-blur-md lg:backdrop-blur-none mx-4"
        >
          
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center mb-4 text-center">
             <motion.div 
                initial={{ scale: 0 }} animate={{ scale: 1 }} 
                className="relative w-16 h-16 mb-2 drop-shadow-md"
             >
                <Image src="/logo2.png" alt="Logo Mobile" fill className="object-contain" />
             </motion.div>
             <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm">FLUX</h1>
             <p className="text-[10px] text-gray-600 font-medium tracking-widest">FLOW IN MOTION</p>
          </div>

          <motion.div variants={itemVariants}>
            <Link
              href="/auth/landing"
              className="text-[10px] sm:text-xs text-gray-600 lg:text-gray-500 mb-4 block hover:underline transition-colors hover:text-amber-600 flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
            </Link>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-2xl font-bold mb-1 text-gray-900">Sign In</h1>
            <p className="text-gray-500 text-xs mb-6">Welcome back! Please enter your details</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-xs text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email Input */}
            <motion.div variants={itemVariants} className="relative group">
              <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg group-focus-within:text-amber-500 transition-colors duration-300" />
              <input
                name="email"
                type="email"
                placeholder="name@gmail.com"
                value={form.email}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2.5 pl-10 rounded-xl w-full text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm"
                required
              />
            </motion.div>

            {/* Password Input */}
            <motion.div variants={itemVariants} className="relative group">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm group-focus-within:text-amber-500 transition-colors duration-300" />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2.5 pl-10 pr-10 rounded-xl w-full text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-between text-xs">
              <label className="flex items-center cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 text-amber-500 border-gray-300 rounded focus:ring-amber-400 cursor-pointer accent-amber-500"
                />
                <span className="ml-2 text-gray-600 group-hover:text-gray-800 transition-colors">Remember me</span>
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-amber-600 font-semibold hover:text-amber-700 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="bg-amber-400 text-gray-900 py-2.5 rounded-xl font-bold text-sm hover:bg-amber-500 shadow-lg shadow-amber-400/20 disabled:opacity-70 disabled:shadow-none transition-all mt-2"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 my-1">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">Or continue with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </motion.div>

            {/* Social Buttons */}
            <motion.div variants={itemVariants} className="flex flex-row gap-3">
              <motion.button
                whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialLogin("google")}
                disabled={isLoading || socialLoading !== "none"}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 shadow-sm"
              >
                {socialLoading === "google" ? <Spinner /> : <><FcGoogle size={20} /> <span className="font-medium text-gray-700">Google</span></>}
              </motion.button>
              <motion.button
                whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleSocialLogin("facebook")}
                disabled={isLoading || socialLoading !== "none"}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white py-2.5 rounded-xl text-sm transition-all disabled:opacity-60 shadow-sm"
              >
                {socialLoading === "facebook" ? <Spinner /> : <><FaFacebook className="text-blue-600" size={20} /> <span className="font-medium text-gray-700">Facebook</span></>}
              </motion.button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center text-xs text-gray-600 mt-4">
              Don't have an account?{" "}
              <Link
                href="/auth/register"
                className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                Sign Up Now
              </Link>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}