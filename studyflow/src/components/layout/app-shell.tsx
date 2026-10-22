"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  GraduationCap,
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Calculator,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [userName, setUserName] = React.useState<string>("Mahasiswa");
  const [userEmail, setUserEmail] = React.useState<string>("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    async function loadUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setUserName(json.data.name);
            setUserEmail(json.data.email);
          }
        }
      } catch {
        // Abaikan
      }
    }
    loadUser();
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navItems: {
    label: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Mata Kuliah",
      href: "/courses",
      icon: BookOpen,
    },
    {
      label: "Manajemen Tugas",
      href: "/tasks",
      icon: CheckSquare,
    },
    {
      label: "Kalkulator Nilai",
      href: "/grades",
      icon: Calculator,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-zinc-100 flex flex-col md:flex-row antialiased selection:bg-indigo-500 selection:text-white">
      {/* MOBILE TOPBAR */}
      <div className="md:hidden sticky top-0 z-50 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 px-4 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-white">StudyFlow</span>
        </Link>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 z-40 bg-zinc-950/95 border-b border-zinc-800 p-4 space-y-3 backdrop-blur-xl">
          <div className="p-3 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center gap-2.5 text-xs">
            <User className="w-4 h-4 text-indigo-400" />
            <div>
              <div className="font-semibold text-zinc-200">{userName}</div>
              <div className="text-zinc-500">{userEmail}</div>
            </div>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400 font-mono">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            className="w-full text-xs text-rose-400 border-rose-900/40 hover:bg-rose-950/30 gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </Button>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 bg-zinc-950 border-r border-zinc-800/80 p-5 sticky top-0 h-screen justify-between">
        <div className="space-y-6">
          {/* LOGO */}
          <Link href="/dashboard" className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-white tracking-tight">StudyFlow</span>
              <div className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">
                Otomasi Mahasiswa
              </div>
            </div>
          </Link>

          {/* USER PROFILE SNIPPET */}
          <div className="p-3 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <User className="w-4 h-4" />
            </div>
            <div className="overflow-hidden">
              <div className="text-xs font-semibold text-zinc-200 truncate">{userName}</div>
              <div className="text-[10px] text-zinc-500 truncate">{userEmail}</div>
            </div>
          </div>

          {/* NAVIGATION LINKS */}
          <nav className="space-y-1.5">
            <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-2">
              Menu Utama
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20 font-bold"
                      : "text-zinc-400 hover:bg-zinc-900/80 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge ? (
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-zinc-800/80 text-zinc-400 border border-zinc-700/50"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* LOGOUT BUTTON */}
        <div className="pt-4 border-t border-zinc-800/80">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            isLoading={isLoggingOut}
            className="w-full text-xs text-rose-400 border-rose-900/40 hover:bg-rose-950/30 hover:text-rose-300 gap-2 justify-center"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Akun</span>
          </Button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
