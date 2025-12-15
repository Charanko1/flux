"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FaUser, FaLock, FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa";
import { MdOutlineEmail } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import Image from "next/image";
import { motion, Variants, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react"; 

// 👇 IMPORT WAJIB BUAT GOOGLE & LOGIN
import { signIn, useSession } from "next-auth/react";
import { useAuth } from "@/context/AuthContext";

// --- TYPE DEFINITIONS ---
type SocialLoading = "google" | "facebook" | "none";

interface FormData {
  name: string;
  email: string;
  password: string;
}

// --- VARIAN ANIMASI (FULL) ---
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

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1, 
    transition: { type: "spring", stiffness: 100, damping: 15 } 
  },
};

const Spinner = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="animate-spin h-4 w-4 text-amber-500" />
  </div>
);

const SpinnerWhite = () => (
  <div className="flex items-center justify-center">
    <Loader2 className="animate-spin h-4 w-4 text-white" />
  </div>
);

// --- COMPONENT BACKGROUND (FULL) ---
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

// --- KOMPONEN INPUT OTP (FULL LOGIC - FIXED) ---
const OTP_LENGTH = 6;

const OtpInputs = ({ otp, setOtp, disabled }: { otp: string, setOtp: (otp: string) => void, disabled: boolean }) => {
  // FIX: Inisialisasi useRef dengan tipe yang aman (Sesuai kode Abang)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const otpArray = useMemo(() => otp.padEnd(OTP_LENGTH, ' ').split('').slice(0, OTP_LENGTH), [otp]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value.replace(/\D/g, ''); // Hanya terima angka
    
    if (value.length > 0) {
      const newOtp = otpArray.map((v, i) => (i === index ? value.charAt(0) : v)).join('').trim();
      setOtp(newOtp);

      // Pindah fokus ke input berikutnya
      if (index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    } else {
       // Handle backspace di kotak kosong
       const nativeEvent = e.nativeEvent as any;
       if (nativeEvent.inputType === 'deleteContentBackward') {
         const newOtp = otpArray.map((v, i) => (i === index ? '' : v)).join('').trim();
         setOtp(newOtp);
         
         if (index > 0) {
           inputRefs.current[index - 1]?.focus();
         }
       } else {
         // Hapus digit saat ini
         const newOtp = otpArray.map((v, i) => (i === index ? '' : v)).join('').trim();
         setOtp(newOtp);
       }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Logic Backspace Khusus
    if (e.key === 'Backspace' && index > 0 && otpArray[index] === ' ') {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').substring(0, OTP_LENGTH);
    setOtp(pasteData);

    // Pindah fokus ke kotak terakhir yang diisi
    const lastIndex = Math.min(pasteData.length, OTP_LENGTH) - 1;
    if (lastIndex >= 0) {
       inputRefs.current[lastIndex]?.focus();
    }
  };

  return (
    <div className="flex justify-center space-x-2 sm:space-x-3 mb-4">
      {otpArray.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit === ' ' ? '' : digit} 
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onFocus={(e) => e.target.select()}
          onPaste={index === 0 ? handlePaste : undefined}
          disabled={disabled}
          className={`w-10 h-14 sm:w-12 sm:h-16 text-2xl font-bold text-gray-900 text-center 
                        border-2 rounded-xl caret-amber-600 outline-none 
                        bg-white shadow-inner transition-all duration-200 
                        focus:border-amber-500 focus:shadow-amber-200/50 
                        ${digit !== ' ' && digit !== '' ? 'border-amber-400' : 'border-gray-300'}`}
        />
      ))}
    </div>
  );
};

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth(); // Ambil fungsi login manual dari context
  
  // 1. Setup NextAuth (Google)
  const { data: session, status: googleStatus } = useSession();

  const [formData, setFormData] = useState<FormData>({
    name: "", 
    email: "",
    password: "",
  });
  
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'REGISTER' | 'OTP'>('REGISTER');
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<SocialLoading>("none");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 2. AUTO SYNC: Token Google -> LocalStorage -> Dashboard
  useEffect(() => {
    if (googleStatus === "authenticated" && session) {
      // @ts-ignore
      const token = session.accessToken;
      if (token) {
         login(token); // Simpan token ke LocalStorage
         router.push("/dashboard"); // Redirect paksa
      }
    }
  }, [googleStatus, session, login, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  // --- LOGIC 1: DAFTAR (Mengirim OTP) ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const payload = { name: formData.name, email: formData.email, password: formData.password };
    
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok || response.status === 201) {
        setStep('OTP');
      } else {
        setError(data.error || data.message || "Registrasi gagal.");
      }
    } catch (err) {
      setError("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC 2: VERIFIKASI OTP ---
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.trim().length !== OTP_LENGTH) {
      setError(`Please enter the full ${OTP_LENGTH}-digit code.`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otp.trim() }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Verification failed');

      // SUKSES VERIFIKASI: Login Manual
      if (data.token) {
          login(data.token);
          router.push('/dashboard');
      } else {
          router.push('/auth/login'); 
      }
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat verifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIC 3: SOCIAL LOGIN (Updated for NextAuth) ---
  const handleSocialLogin = (provider: "google" | "facebook") => {
    if (isLoading || socialLoading !== "none" || googleStatus === "loading") return;
    
    setSocialLoading(provider);
    
    if (provider === "google") {
        // Panggil SignIn dari NextAuth
        signIn("google", { callbackUrl: "/dashboard" });
    } else {
        // Facebook Placeholder
        setTimeout(() => {
            alert("Facebook login coming soon!");
            setSocialLoading("none");
        }, 1000);
    }
  };

  const isWorking = isLoading || googleStatus === "loading" || socialLoading !== "none";

  // =================================================================================
  // --- COMPONENT RENDER HELPER ---
  // =================================================================================

  const renderRegisterForm = () => (
    <motion.form 
      key="registerForm"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleRegister} 
      className="flex flex-col gap-2"
    >
      {/* Name Input */}
      <motion.div variants={itemVariants} className="relative group">
        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />
        <input
          type="text"
          name="name" 
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
          disabled={isWorking}
          className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2.5 pl-10 rounded-xl w-full text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm lg:shadow-sm"
          required
        />
      </motion.div>

      {/* Email Input */}
      <motion.div variants={itemVariants} className="relative group">
        <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm sm:text-lg group-focus-within:text-amber-600 transition-colors" />
        <input
          type="email"
          name="email"
          placeholder="name@gmail.com"
          value={formData.email}
          onChange={handleChange}
          disabled={isWorking}
          className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2.5 pl-10 rounded-xl w-full text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm lg:shadow-sm"
          required
        />
      </motion.div>

      {/* Password Input */}
      <motion.div variants={itemVariants} className="relative group">
        <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          disabled={isWorking}
          className="border border-gray-200 bg-gray-50/50 lg:bg-white py-2.5 pl-10 rounded-xl w-full text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400 transition-all shadow-sm lg:shadow-sm"
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
        disabled={isWorking}
      >
        {isLoading ? <SpinnerWhite /> : "Sign Up"}
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
          onClick={() => handleSocialLogin("google")}
          disabled={isWorking}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white py-2 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-60 shadow-sm"
        >
          {googleStatus === "loading" || socialLoading === "google" ? <Spinner /> : <><FcGoogle size={18} /> <span className="font-medium text-gray-700">Google</span></>}
        </motion.button>
        <motion.button
          whileHover={{ y: -2, backgroundColor: "#f9fafb" }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => handleSocialLogin("facebook")}
          disabled={isWorking}
          className="flex-1 flex items-center justify-center gap-2 border border-gray-200 bg-white py-2 rounded-xl text-xs sm:text-sm transition-all disabled:opacity-60 shadow-sm"
        >
          {socialLoading === "facebook" ? <Spinner /> : <><FaFacebook className="text-blue-600" size={18} /> <span className="font-medium text-gray-700">Facebook</span></>}
        </motion.button>
      </motion.div>

      <motion.p variants={itemVariants} className="text-center text-[10px] sm:text-xs text-gray-600 mt-2">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors"
        >
          Log in
        </Link>
      </motion.p>
    </motion.form>
  );

  const renderOtpForm = () => (
    <motion.form
      key="otpForm"
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -300, opacity: 0 }}
      transition={{ duration: 0.3 }}
      onSubmit={handleVerifyOtp} 
      className="flex flex-col gap-4 text-center p-4"
    >
      <h2 className="text-2xl font-bold text-gray-800">Verify Email</h2>
      <p className="text-sm text-gray-500 mb-2">
        We sent a verification code to <b>{formData.email}</b>. Please check your inbox.
      </p>

      {error && <p className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</p>}
      
      {/* INPUT OTP KOTAK-KOTAK BARU */}
      <OtpInputs otp={otp} setOtp={setOtp} disabled={isLoading} />

      {/* TOMBOL VERIFIKASI DENGAN TEMA KUNING/AMBER */}
      <motion.button 
        type="submit" 
        disabled={isLoading} 
        className="bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md shadow-amber-400/30 py-3 rounded-xl font-semibold text-sm hover:from-amber-600 hover:to-amber-700 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex justify-center"
      >
        {isLoading ? <SpinnerWhite /> : "Verify Account"}
      </motion.button>

    </motion.form>
  );


  // =================================================================================
  // --- MAIN RENDER ---
  // =================================================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      
      {/* ================= LEFT SIDE (DESKTOP ONLY) ================= */}
      <div className="hidden lg:flex w-1/2 items-center justify-center bg-gray-800 relative h-full">
        <FluxBackground />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 bg-white/70 backdrop-blur-sm shadow-2xl rounded-2xl p-10 flex flex-col items-center max-w-md border border-white/40"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          >
            <Image src="/logo2.png" alt="Logo" width={160} height={160} priority className="drop-shadow-lg" />
          </motion.div>
          
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-3xl font-bold mt-6 text-gray-900">FLUX</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-sm text-gray-700 mt-2 font-medium tracking-wide">YOUR PERSONAL FLOW IN MOTION</motion.p>
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

          {/* Back to Home Button */}
          <motion.div variants={itemVariants}>
            <button
              onClick={() => router.push("/../../..")}
              className="text-[10px] sm:text-xs text-gray-600 lg:text-gray-500 mb-2 hover:underline transition-colors hover:text-amber-600 flex items-center gap-1 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Home
            </button>
          </motion.div>

          {/* Header */}
          <motion.div variants={itemVariants}>
            <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">{step === 'REGISTER' ? 'Sign Up' : 'Verification'}</h1>
            <p className="text-gray-500 lg:text-gray-600 text-xs mb-3">{step === 'REGISTER' ? 'Create your account to get started' : 'Enter the code sent to your email'}</p>
          </motion.div>

          {/* Error Message Container */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border border-red-200 text-red-700 px-2 py-1.5 rounded-lg mb-3 text-[10px] text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          {/* FORM CONTAINER DENGAN TRANSISI */}
          <AnimatePresence mode="wait">
            {step === 'REGISTER' ? renderRegisterForm() : renderOtpForm()}
          </AnimatePresence>

        </motion.div>
      </div>
    </div>
  );
}