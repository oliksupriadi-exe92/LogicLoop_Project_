import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudyFlow - Otomasi Kuliah Cerdas untuk Mahasiswa",
  description:
    "Kelola mata kuliah, tugas, jadwal, dan kalkulator nilai otomatis dengan pengingat deadline cerdas.",
  keywords: [
    "StudyFlow",
    "manajemen tugas kuliah",
    "kalkulator nilai mahasiswa",
    "jadwal kuliah",
    "otomasi kuliah",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 dark:bg-zinc-950 dark:text-zinc-100 selection:bg-indigo-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
