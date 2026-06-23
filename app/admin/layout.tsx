"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { clearAdminUser } from "@/lib/admin-session";
import AdminSidebar from "./_components/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });
    } finally {
      clearAdminUser();
      router.replace("/auth");
    }
  };

  return (
    <main className='min-h-screen bg-emerald-50 text-slate-900'>
      <div
        style={
          {
            "--admin-sidebar-width": isSidebarCollapsed ? "88px" : "280px",
          } as CSSProperties
        }
        className='grid min-h-screen grid-cols-1 lg:grid-cols-[var(--admin-sidebar-width)_1fr]'>
        <AdminSidebar
          collapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed((prev) => !prev)}
        />

        <section className='p-4 sm:p-6'>
          <header className='mb-5 rounded-xl bg-emerald-950 p-3 text-white sm:p-4'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div>
                <p className='text-xs tracking-[0.14em] text-emerald-200 uppercase'>
                  Selamat Datang Di
                </p>
                <h1 className='text-xl font-semibold'>
                  Panel Pengelolaan Website
                </h1>
              </div>

              <div className='flex items-center gap-3'>
                <button
                  type='button'
                  onClick={handleLogout}
                  className='rounded-lg border border-white/20 px-3 py-2 text-sm transition hover:bg-emerald-500/20'>
                  Logout
                </button>
                <div className='grid h-10 w-10 place-items-center rounded-full bg-emerald-500 font-semibold'>
                  NU
                </div>
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
