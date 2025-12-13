import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

// 👇 1. IMPORT DUA PROVIDER INI
import { AuthProvider } from '@/context/AuthContext';
import { NextAuthProvider } from '@/components/NextAuthProvider'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Flux Dashboard',
  description: 'Manage your tasks and finance efficiently',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 👇 2. BUNGKUS PALING LUAR DENGAN NEXTAUTH PROVIDER (GOOGLE) */}
        <NextAuthProvider>
            
            {/* 👇 3. DI DALAMNYA BARU AUTH PROVIDER (LOGIN BIASA) */}
            <AuthProvider>
                {children}
            </AuthProvider>
            
        </NextAuthProvider>
      </body>
    </html>
  );
}