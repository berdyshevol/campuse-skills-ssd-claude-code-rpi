import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Campus SkillSwap",
  description: "A student marketplace for trading skills and services.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white/60 mt-12">
            <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-500 flex justify-between">
              <span>Campus SkillSwap — built with Django + Next.js</span>
              <span>{new Date().getFullYear()}</span>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
