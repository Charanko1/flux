"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { motion, Variants } from "framer-motion"; 

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// 👇 3. Tambahkan ': Variants' juga di sini
const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    // TypeScript sekarang paham kalau "spring" ini aman
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};


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

export default function RegisterPage() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (response.ok) router.push("/auth/login");
      else setError(data.message || "Registrasi gagal.");
    } catch (err) {
      setError("Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* ================= LEFT SIDE (DESKTOP ONLY) ================= */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-800 relative h-full">
        <FluxBackground />
        
        {/* Glass Card Left - Animated */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md border border-white/40"
        >
          {/* Floating Logo */}
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
            className="text-sm text-gray-700 mt-2 font-medium tracking-wide"
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
          className="relative z-10 w-full max-w-[340px] sm:max-w-sm bg-white/90 lg:bg-transparent p-5 sm:p-8 rounded-2xl shadow-2xl lg:shadow-none lg:p-0 border border-white/40 lg:border-none backdrop-blur-md lg:backdrop-blur-none mx-4"
        >
          
          {/* Mobile Branding */}
          <div className="lg:hidden flex flex-col items-center mb-2 text-center">
             <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                <div className="relative w-16 h-16 mb-1 drop-shadow-md">
                    <Image src="/logo2.png" alt="Logo Mobile" fill className="object-contain" />
                </div>
             </motion.div>
             <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm">FLUX</h1>
             <p className="text-[10px] text-gray-600 font-medium tracking-widest">FLOW IN MOTION</p>
          </div>

          <motion.div variants={itemVariants}>
            <button
              onClick={() => router.push("/auth/landing")}
              className="text-[10px] sm:text-xs text-gray-600 lg:text-gray-500 mb-2 hover:underline transition-colors hover:text-amber-600 flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
            </button>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">Sign Up</h1>
            <p className="text-gray-500 lg:text-gray-600 text-xs mb-3">Create your account to get started</p>
          </motion.div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 px-2 py-1.5 rounded-lg mb-3 text-[10px] text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            
            {/* Username */}
            <motion.div variants={itemVariants} className="relative group">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />
              <input
                type="text"
                placeholder="Choose a username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                disabled={isLoading}
                className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2 pl-9 pr-3 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm lg:shadow-none"
                required
              />
            </motion.div>

            {/* Email */}
            <motion.div variants={itemVariants} className="relative group">
              <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-lg group-focus-within:text-amber-600 transition-colors" />
              <input
                type="email"
                placeholder="name@gmail.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                disabled={isLoading}
                className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2 pl-9 pr-3 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm lg:shadow-none"
                required
              />
            </motion.div>

            {/* Password */}
            <motion.div variants={itemVariants} className="relative group">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                disabled={isLoading}
                className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2 pl-9 pr-9 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm lg:shadow-none"
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 transition-colors"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </motion.div>

            {/* Terms */}
            <motion.div variants={itemVariants} className="flex items-start gap-2 mt-1 px-1">
              <input
                type="checkbox"
                id="terms"
                className="mt-0.5 h-3 w-3 text-amber-500 border-gray-300 rounded focus:ring-amber-400 cursor-pointer flex-shrink-0 accent-amber-500"
                required
              />
              <label htmlFor="terms" className="text-[10px] sm:text-xs text-gray-600 cursor-pointer select-none leading-tight">
                By creating an account, you agree to the{" "}
                <a href="#" className="font-semibold text-amber-600 hover:underline">Terms & Conditions</a>
                {" "}and{" "}
                <a href="#" className="font-semibold text-amber-600 hover:underline">Privacy Policy</a>.
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-400/30 py-2 rounded-xl font-semibold text-sm hover:from-amber-500 hover:to-amber-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-2"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Sign Up"}
            </motion.button>

            {/* Divider */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 my-1.5">
              <div className="flex-grow border-t border-gray-200"></div>
              <span className="text-gray-400 text-[10px] uppercase tracking-wider font-medium">Or sign up with</span>
              <div className="flex-grow border-t border-gray-200"></div>
            </motion.div>

            {/* Social Buttons */}
            <motion.div variants={itemVariants} className="flex flex-row gap-2">
              <motion.button
                whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white py-2 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-60 shadow-sm"
              >
                <FcGoogle size={18} />
                <span className="font-medium text-gray-700">Google</span>
              </motion.button>
              <motion.button
                whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
                whileTap={{ scale: 0.98 }}
                type="button"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white py-2 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-60 shadow-sm"
              >
                <FaFacebook className="text-blue-600" size={18} />
                <span className="font-medium text-gray-700">Facebook</span>
              </motion.button>
            </motion.div>

            <motion.p variants={itemVariants} className="text-center text-[10px] sm:text-xs text-gray-600 mt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/auth/login")}
                className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
              >
                Log in
              </button>
            </motion.p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}