"use client";



import { useState } from "react";

import { useRouter } from "next/navigation";

import { FaUser, FaLock, FaEye, FaEyeSlash, FaFacebook } from "react-icons/fa";

import { MdOutlineEmail } from "react-icons/md";

import { FcGoogle } from "react-icons/fc";

import Image from "next/image";



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

        <div className="relative z-10 bg-white/70 backdrop-blur-sm shadow-xl rounded-2xl p-10 flex flex-col items-center max-w-md">

          <Image src="/logo2.png" alt="Logo" width={160} height={160} priority />

          <h1 className="text-3xl font-bold mt-4 text-gray-900">FLUX</h1>

          <p className="text-sm text-gray-700 mt-2 font-medium tracking-wide">

            YOUR PERSONAL FLOW IN MOTION

          </p>

        </div>

      </div>



      {/* ================= RIGHT SIDE (FORM AREA) ================= */}

      {/* justify-center penting agar form ada di tengah vertikal */}

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center h-full relative lg:bg-white overflow-y-auto [&::-webkit-scrollbar]:hidden">

       

        {/* --- MOBILE BACKGROUND --- */}

        <div className="lg:hidden absolute inset-0 z-0">

            <FluxBackground />

            <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

        </div>



        {/* --- CONTAINER FORM --- */}

        {/* UPDATED: Padding saya kurangi jadi p-5 (sebelumnya p-6/p-8) biar lebih hemat tempat */}

        <div className="relative z-10 w-full max-w-[340px] sm:max-w-sm bg-white/90 lg:bg-transparent p-5 sm:p-8 rounded-2xl shadow-2xl lg:shadow-none lg:p-0 border border-white/20 lg:border-none backdrop-blur-md lg:backdrop-blur-none mx-4">

         

          {/* Mobile Branding - UPDATED: Margin dikurangi drastis (mb-2) */}

          <div className="lg:hidden flex flex-col items-center mb-2 text-center">

             <div className="relative w-16 h-16 mb-1 drop-shadow-md"> {/* Logo diperkecil dikit jadi w-16 */}

                <Image src="/logo2.png" alt="Logo Mobile" fill className="object-contain" />

             </div>

             <h1 className="text-xl font-bold text-gray-900 drop-shadow-sm">FLUX</h1>

             <p className="text-[10px] text-gray-600 font-medium tracking-widest">FLOW IN MOTION</p>

          </div>



          <button

            onClick={() => router.push("/auth/landing")}

            className="text-[10px] sm:text-xs text-gray-600 lg:text-gray-700 mb-2 hover:underline transition-colors hover:text-amber-600 flex items-center"

          >

            ← Back to Home

          </button>



          <h1 className="text-xl sm:text-2xl font-bold mb-1 text-gray-900">

            Sign Up

          </h1>

          {/* Margin bawah dikurangi jadi mb-3 */}

          <p className="text-gray-600 lg:text-gray-700 text-xs mb-3">

            Create your account to get started

          </p>



          {error && (

            <div className="bg-red-50 border border-red-200 text-red-700 px-2 py-1.5 rounded-lg mb-3 text-[10px] text-center font-medium">

              {error}

            </div>

          )}



          {/* UPDATED: Gap antar input diperkecil jadi gap-2 (sebelumnya gap-3) */}

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">

            {/* Username */}

            <div className="relative group">

              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />

              <input

                type="text"

                placeholder="Choose a username"

                value={form.username}

                onChange={(e) => setForm({ ...form, username: e.target.value })}

                disabled={isLoading}

                // Padding input sedikit diperkecil (py-2) tapi tetap nyaman

                className="border border-gray-300 bg-white/80 lg:bg-white py-2 pl-9 pr-3 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm lg:shadow-none"

                required

              />

            </div>



            {/* Email */}

            <div className="relative group">

              <MdOutlineEmail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 text-sm sm:text-lg group-focus-within:text-amber-600 transition-colors" />

              <input

                type="email"

                placeholder="name@gmail.com"

                value={form.email}

                onChange={(e) => setForm({ ...form, email: e.target.value })}

                disabled={isLoading}

                className="border border-gray-300 bg-white/80 lg:bg-white py-2 pl-9 pr-3 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm lg:shadow-none"

                required

              />

            </div>



            {/* Password */}

            <div className="relative group">

              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 text-xs sm:text-sm group-focus-within:text-amber-600 transition-colors" />

              <input

                type={showPassword ? "text" : "password"}

                placeholder="Create a password"

                value={form.password}

                onChange={(e) => setForm({ ...form, password: e.target.value })}

                disabled={isLoading}

                className="border border-gray-300 bg-white/80 lg:bg-white py-2 pl-9 pr-9 rounded-xl w-full text-xs sm:text-sm text-gray-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all shadow-sm lg:shadow-none"

                required

                minLength={8}

              />

              <button

                type="button"

                onClick={() => setShowPassword(!showPassword)}

                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 lg:text-gray-400 hover:text-gray-700 p-1"

              >

                {showPassword ? <FaEyeSlash /> : <FaEye />}

              </button>

            </div>



            {/* Terms - Text diperkecil jadi text-[10px] */}

            <div className="flex items-start gap-2 mt-1">

              <input

                type="checkbox"

                id="terms"

                className="mt-0.5 h-3 w-3 text-amber-500 border-gray-300 rounded focus:ring-amber-400 cursor-pointer flex-shrink-0"

                required

              />

              <label htmlFor="terms" className="text-[10px] sm:text-xs text-gray-700 cursor-pointer select-none leading-tight">

                By creating an account, you agree to the{" "}

                <a href="#" className="font-semibold text-amber-600 hover:underline">Terms & Conditions</a>

                {" "}and{" "}

                <a href="#" className="font-semibold text-amber-600 hover:underline">Privacy Policy</a>.

              </label>

            </div>



            {/* Submit Button - Padding vertikal dikurangi dikit (py-2) */}

            <button

              type="submit"

              className="bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md shadow-amber-200/50 py-2 rounded-xl font-semibold text-sm hover:shadow-lg hover:from-amber-500 hover:to-amber-600 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed transition-all mt-1"

              disabled={isLoading}

            >

              {isLoading ? "Loading..." : "Sign Up"}

            </button>



            {/* Divider */}

            <div className="flex items-center gap-3 my-1.5">

              <div className="flex-grow border-t border-gray-300"></div>

              <span className="text-gray-500 text-[10px] uppercase tracking-wider">Or sign up with</span>

              <div className="flex-grow border-t border-gray-300"></div>

            </div>



            {/* Social Buttons - Py dikurangi jadi py-2 */}

            <div className="flex flex-row gap-2">

              <button

                type="button"

                disabled={isLoading}

                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-50 transition-all disabled:opacity-60 shadow-sm lg:shadow-none"

              >

                <FcGoogle size={18} />

                <span className="font-medium text-gray-700">Google</span>

              </button>

              <button

                type="button"

                disabled={isLoading}

                className="flex-1 flex items-center justify-center gap-2 border border-gray-300 bg-white py-2 rounded-xl text-xs sm:text-sm hover:bg-gray-50 transition-all disabled:opacity-60 shadow-sm lg:shadow-none"

              >

                <FaFacebook className="text-blue-600" size={18} />

                <span className="font-medium text-gray-700">Facebook</span>

              </button>

            </div>



            <p className="text-center text-[10px] sm:text-xs text-gray-600 mt-1">

              Already have an account?{" "}

              <button

                type="button"

                onClick={() => router.push("/auth/login")}

                className="font-bold text-amber-600 lg:text-amber-500 hover:text-amber-700 hover:underline"

              >

                Log in

              </button>

            </p>

          </form>

        </div>

      </div>

    </div>

  );

}