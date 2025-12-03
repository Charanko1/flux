"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 hide-scrollbar overflow-x-hidden selection:bg-yellow-200">
      
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <img src="/logo2.png" alt="Flux logo" className="h-8 w-auto" />
            <span className="font-bold text-base tracking-wide">FLUX</span>
          </motion.div>

          <nav className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
              Log In
            </Link>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/auth/register"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-bold px-4 py-2 rounded-md shadow-sm transition-all"
              >
                Sign Up
              </Link>
            </motion.div>
          </nav>
        </div>
      </header>

      {/* Hero Section - KEMBALI KE bg-gray-50 */}
      <section className="relative bg-gray-50 pt-28 pb-12 lg:pt-36 lg:pb-20 overflow-hidden border-b border-gray-100">
        
        {/* Dekorasi tetap ada tapi lebih subtle agar masuk dengan bg-gray-50 */}
        <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-yellow-100/60 rounded-full blur-3xl opacity-60 translate-x-1/3 -translate-y-1/4"></div>

        <div className="max-w-6xl mx-auto px-5 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:pr-8 flex flex-col justify-center"
          >
            <motion.h1 variants={fadeInUp} className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              Your Personal Flow <br />
              <span className="text-yellow-500">
                in Motion
              </span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="mt-3 text-base text-gray-600 max-w-lg leading-relaxed">
              Streamline your productivity with Flux. Track time, manage tasks, 
              and visualize your progress all in one place.
            </motion.p>

            <motion.div variants={fadeInUp} className="mt-6 flex gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow hover:shadow-lg transition-all text-sm"
              >
                Get Started
              </Link>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center lg:justify-end items-center relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="w-full max-w-sm relative z-10"
            >
               <img src="/logo.png" alt="Flux mark" className="w-full h-auto drop-shadow-xl relative" />
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-5 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl font-semibold text-gray-800">Everything You Need to Stay Productive</h2>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: "Task", desc: "Organize and prioritize your tasks effortlessly.", icon: '✓' },
            { title: "Event", desc: "Schedule and manage your events visually.", icon: '📅' },
            { title: "Finance", desc: "Track your expenses and manage budget.", icon: '💹' },
            { title: "Notes", desc: "Capture your thoughts and ideas instantly.", icon: '📝' },
          ].map((f, index) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              // KEMBALI KE bg-gray-50 agar kontras dengan section putih
              className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-yellow-300 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-700 text-xl">
                  {f.icon}
                </div>
                <div>
                   <h3 className="text-base font-bold text-gray-900">{f.title}</h3>
                   <p className="mt-1 text-sm text-gray-500 leading-snug">{f.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section - Black */}
      <section className="bg-black text-white px-5 py-16">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
            <h3 className="text-2xl md:text-3xl font-semibold mb-4">Ready to Transform Your Workflow?</h3>
            <p className="text-gray-300 max-w-xl mx-auto text-base mb-8">
                Join thousands of users who have already optimized their productivity with Flux.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
                href="/auth/register"
                className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-8 py-3 rounded-full shadow-lg transition-all"
            >
                Start Now!
            </Link>
            </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo2.png" alt="Flux" className="h-5 w-auto" />
            <span>© {new Date().getFullYear()} Flux. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-black hover:underline transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-black hover:underline transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-black hover:underline transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}