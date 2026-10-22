"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GraduationCap, Lock, Mail, ArrowRight, Eye, EyeOff, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Gagal melakukan login.");
      }

      // Berhasil login, arahkan ke dashboard
      router.push(callbackUrl);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Terjadi kesalahan tak terduga.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("budi.santoso@mahasiswa.ac.id");
    setPassword("Rahasia123!");
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-zinc-950 to-slate-950 text-zinc-100 flex items-center justify-center p-4 relative overflow-hidden">
      {/* GLOW DECORATIONS */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* LOGO & HEADING */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              StudyFlow
            </span>
          </Link>
          <p className="text-xs text-zinc-400">
            Masuk untuk mengakses jadwal kuliah, tugas, dan otomasi nilai
          </p>
        </div>

        {/* LOGIN CARD */}
        <Card className="border-zinc-800 bg-zinc-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl font-bold text-white">Selamat Datang Kembali</CardTitle>
            <CardDescription className="text-xs text-zinc-400">
              Gunakan email kampus dan password kamu untuk masuk.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ERROR ALERT */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-400" />
                  Email Mahasiswa
                </label>
                <input
                  type="email"
                  required
                  placeholder="nama@mahasiswa.ac.id"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-indigo-400" />
                    Password
                  </label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isLoading}
                className="w-full gap-2 shadow-indigo-500/25 mt-2"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>

            {/* QUICK FILL DEMO BUTTON */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full py-2 px-3 text-xs font-medium text-indigo-400 bg-indigo-950/30 hover:bg-indigo-950/60 border border-indigo-800/40 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Isi Data Akun Uji Coba (Demo Fast Fill)</span>
              </button>
            </div>

            <div className="text-center pt-3 border-t border-zinc-800/80">
              <p className="text-xs text-zinc-400">
                Belum punya akun StudyFlow?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
                >
                  Daftar akun baru
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-zinc-400 text-xs">
          Memuat formulir login...
        </div>
      }
    >
      <LoginForm />
    </React.Suspense>
  );
}
