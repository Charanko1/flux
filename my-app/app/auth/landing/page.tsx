"use client";

import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900 hide-scrollbar overflow-y-auto">
      {/* Header */}
      <header className="w-full border-b border-gray-100">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo2.png" alt="Flux logo" className="h-9 w-auto" />
            <span className="font-semibold text-sm tracking-wide">FLUX</span>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/auth/login" className="text-sm text-gray-700 hover:underline">
              Log In
            </Link>
            <Link
              href="/auth/register"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black text-sm font-medium px-4 py-2 rounded-md shadow-sm"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gray-50">
  <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
    
    {/* Kolom Teks */}
    <div className="lg:pr-12 flex flex-col justify-center">
      <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-gray-900">
        Your Personal Flow
        <br />
        <span className="text-yellow-500">in Motion</span>
      </h1>

      <p className="mt-4 text-gray-600 max-w-xl">
        Streamline your productivity with Flux. Track time, manage tasks, 
        and visualize your progress all in one place.
      </p>

      <div className="mt-8">
        <Link
          href="/auth/register"
          className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 
                     text-black font-semibold px-5 py-3 rounded-full shadow"
        >
          Get Started
        </Link>
      </div>
    </div>

    {/* Kolom Gambar */}
    <div className="flex justify-center lg:justify-end items-center">
      <div className="w-full max-w-sm">
        <img src="/logo.png" alt="Flux mark" className="w-full h-auto" />
      </div>
    </div>

  </div>
</section>


      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-8 py-16">
        <h2 className="text-center text-2xl font-semibold text-gray-800">Everything You Need to Stay Productive</h2>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { title: "Task", desc: "Organize and prioritize your tasks to stay on top of everything.", icon: '✓' },
            { title: "Event", desc: "Schedule and manage your events with an intuitive calendar.", icon: '📅' },
            { title: "Finance", desc: "Track your expenses and manage your budget effectively.", icon: '💹' },
            { title: "Notes", desc: "Capture your thoughts and ideas in organized notes.", icon: '📝' },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-yellow-50 text-xl">
                  {f.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{f.title}</div>
                  <div className="mt-1 text-sm text-gray-500">{f.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Dark CTA */}
      <section className="bg-black text-white">
        <div className="max-w-7xl mx-auto px-8 py-20 text-center">
          <h3 className="text-2xl lg:text-3xl font-semibold">Ready to Transform Your Workflow?</h3>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
            Join thousands of users who have already optimized their productivity with Flux.
          </p>

          <div className="mt-8">
            <Link
              href="/auth/register"
              className="inline-block bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6 py-3 rounded-full shadow"
            >
              Start Now!
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-100 bg-white">
        <div className="px-8 py-6 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-3">
            <img src="/logo2.png" alt="Flux" className="h-6 w-auto" />
            <span>© {new Date().getFullYear()} Flux. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Contact</a>
          </div>
        </div>
      </footer>
    </main>
  );
}