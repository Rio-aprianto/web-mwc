"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Playfair_Display } from "next/font/google";

import { saveAdminUser } from "@/lib/admin-session";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        setError(payload?.message ?? "Email atau password tidak sesuai.");
        return;
      }

      const payload = (await response.json()) as {
        pengguna?: {
          id: number;
          nama: string;
          role: string;
          email: string;
        };
      };

      if (payload.pengguna) {
        saveAdminUser(payload.pengguna);
      }

      router.replace("/admin/dashboard");
    } catch {
      setError("Gagal terhubung ke server. Coba lagi beberapa saat.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className='min-h-screen bg-[radial-gradient(circle_at_top,#e6efe7_0,#f8faf8_42%,#edf3ee_100%)] px-4 py-8 text-emerald-950 sm:px-6 lg:px-8'>
      <div className='mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center'>
        <div className='grid w-full overflow-hidden rounded-4xl border border-emerald-900/10 bg-white/85 shadow-[0_24px_80px_rgba(12,72,59,0.14)] backdrop-blur md:grid-cols-[1.1fr_0.9fr]'>
          <section className='relative isolate flex flex-col justify-between overflow-hidden bg-linear-to-br from-emerald-950 via-emerald-900 to-lime-800 px-6 py-8 text-white sm:px-10 sm:py-10'>
            <div className='absolute -left-16 top-10 h-44 w-44 rounded-full bg-white/10 blur-3xl' />
            <div className='absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-lime-300/10 blur-3xl' />

            <div className='relative z-10 space-y-4'>
              <span className='inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/80'>
                Admin Access
              </span>
              <h1
                className={`${playfairDisplay.className} max-w-md text-4xl leading-[0.95] font-semibold tracking-[0.03em] sm:text-5xl`}>
                Login ke Panel Admin MWC NU Karanganyar
              </h1>
              <p className='max-w-md text-sm leading-7 text-white/80 sm:text-base'>
                Gunakan akun admin untuk mengelola berita, data, dan konten
                publik dengan aman.
              </p>
            </div>

            <div className='relative z-10 mt-10 grid gap-3 text-sm text-white/80 sm:grid-cols-2'>
              <div className='rounded-2xl border border-white/10 bg-white/10 p-4'>
                Akses cepat ke dashboard admin
              </div>
              <div className='rounded-2xl border border-white/10 bg-white/10 p-4'>
                Didesain untuk pengelolaan konten internal
              </div>
            </div>
          </section>

          <section className='flex items-center justify-center px-6 py-8 sm:px-10 sm:py-12'>
            <div className='w-full max-w-md'>
              <div className='mb-8'>
                <p className='text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600'>
                  Assalamu’alaikum Warahmatullahi Wabarakatuh
                </p>
                <h2 className='mt-3 text-3xl font-bold text-emerald-950'>
                  Selamat datang kembali
                </h2>
                <p className='mt-3 text-sm leading-7 text-slate-600'>
                  Login terlebih dahulu untuk melanjutkan ke halaman
                  pengelolaan.
                </p>
              </div>

              <form className='space-y-5' onSubmit={handleSubmit}>
                <label className='block space-y-2'>
                  <span className='text-sm font-medium text-slate-700'>
                    Email
                  </span>
                  <input
                    type='email'
                    name='email'
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete='email'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  />
                </label>

                <label className='block space-y-2'>
                  <span className='text-sm font-medium text-slate-700'>
                    Password
                  </span>
                  <input
                    type='password'
                    name='password'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete='current-password'
                    className='w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10'
                  />
                </label>

                {error ? (
                  <p className='rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
                    {error}
                  </p>
                ) : null}

                <div className='flex items-center justify-between gap-4 text-sm'>
                  <label className='flex items-center gap-2 text-slate-600'>
                    <input
                      type='checkbox'
                      name='remember'
                      className='h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500'
                    />
                    Ingat saya
                  </label>

                  {/* <a
                    href='mailto:admin@mwcnu.id'
                    className='font-medium text-emerald-700 transition hover:text-emerald-800'>
                    Lupa password?
                  </a> */}
                </div>

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-500'>
                  {isSubmitting ? "Memproses..." : "Masuk ke Admin"}
                </button>
              </form>

              <div className='mt-6 flex items-center justify-between text-sm text-slate-500'>
                <span>Belum kembali ke beranda?</span>
                <Link
                  href='/'
                  className='font-semibold text-emerald-700 transition hover:text-emerald-800'>
                  Kembali ke landing page
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
