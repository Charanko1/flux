"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// 1. Import Komponen "Atas" (Above the Fold) secara biasa
// Ini harus muncul instan, jadi jangan di-lazy load.
import { Navbar, HeroSection } from "@/components/landing/Sections";

// 2. Import Komponen "Bawah" (Below the Fold) pakai Dynamic Import
// Browser gak akan download kodingan berat ini di detik pertama.
// Efeknya: Main thread kosong, navigasi jadi jauh lebih responsif.
const FeaturesSection = dynamic(() => 
  import("@/components/landing/Sections").then((mod) => mod.FeaturesSection),
  { ssr: true } // Tetap dirender di server biar SEO aman, tapi hydration-nya belakangan
);

const CTASection = dynamic(() => 
  import("@/components/landing/Sections").then((mod) => mod.CTASection)
);

const Footer = dynamic(() => 
  import("@/components/landing/Sections").then((mod) => mod.Footer)
);

export default function LandingPage() {
  const router = useRouter();

  // 3. JURUS RAHASIA: Prefetch Halaman Auth
  useEffect(() => {
    // Perintah ini nyuruh browser: "Eh, tolong download-in halaman login & register
    // diem-diem di background SEKARANG."
    // Hasilnya: Pas user klik tombol Login, halamannya udah siap 100%.
    router.prefetch("/login");
    router.prefetch("/register");
  }, [router]);

  return (
    <main className="min-h-screen bg-white text-gray-900 hide-scrollbar overflow-x-hidden selection:bg-yellow-200">
      
      {/* Bagian ini dirender duluan (Prioritas Utama) */}
      <Navbar />
      <HeroSection />
      
      {/* Bagian ini dirender belakangan sambil jalan */}
      <FeaturesSection />
      <CTASection />
      <Footer />

    </main>
  );
}