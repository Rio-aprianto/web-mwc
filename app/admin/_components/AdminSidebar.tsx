"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  getAdminFirstName,
  loadAdminUserSnapshot,
  type AdminSessionUser,
} from "@/lib/admin-session";

type MenuItem = {
  name: string;
  href: string;
};

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const mainMenu: MenuItem[] = [
  { name: "Dashboard", href: "/admin/dashboard" },
  { name: "Sambutan Rois", href: "/admin/sambutan-ketua" },
  { name: "Sambutan Tanfidziyah", href: "/admin/sambutan-tanfidziyah" },
  { name: "Daftar Pengurus", href: "/admin/daftar-pengurus" },
  { name: "Banner Image", href: "/admin/banner-image" },
  { name: "Berita", href: "/admin/berita" },
];

const dataMenu: MenuItem[] = [
  { name: "Data Ranting", href: "/admin/data/ranting" },
  { name: "Data Kader", href: "/admin/data/kader" },
  { name: "Data Banom", href: "/admin/data/banom" },
  { name: "Data Pengguna", href: "/admin/data/pengguna" },
];

function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: MenuItem;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <Link
      href={item.href}
      title={item.name}
      className={`block rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-emerald-500/30 text-white"
          : "text-emerald-50/80 hover:bg-emerald-500/15 hover:text-white"
      } ${collapsed ? "text-center" : ""}`}>
      {collapsed ? item.name.charAt(0) : item.name}
    </Link>
  );
}

export default function AdminSidebar({
  collapsed,
  onToggle,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [isLazisnuOpen, setIsLazisnuOpen] = useState(true);
  const adminUser = useSyncExternalStore<AdminSessionUser | null>(
    () => () => {},
    loadAdminUserSnapshot,
    () => null,
  );
  const lazisnuActive = useMemo(
    () => pathname.startsWith("/admin/lazisnu"),
    [pathname],
  );

  const firstName = getAdminFirstName(adminUser?.nama);

  return (
    <aside className='bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-800 p-4 text-emerald-50'>
      <div className='mb-6 flex items-center justify-between gap-2'>
        <div
          className={`flex items-center gap-3 ${collapsed ? "mx-auto" : ""}`}>
          <div className='grid h-10 w-10 place-items-center rounded-lg bg-emerald-500'>
            <span className='text-lg font-bold text-white'>NU</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className='text-2xl font-bold text-white'>
                Hai! {firstName}
              </h2>
              {adminUser?.role ? (
                <p className='text-xs text-emerald-100/70'>{adminUser.role}</p>
              ) : null}
            </div>
          )}
        </div>

        <button
          type='button'
          onClick={onToggle}
          aria-label={collapsed ? "Tampilkan sidebar" : "Minimalkan sidebar"}
          title={collapsed ? "Expand" : "Minimize"}
          className='grid h-8 w-8 place-items-center rounded-lg border border-emerald-200/20 text-emerald-100 transition hover:bg-emerald-500/20'>
          <svg
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='h-4 w-4'
            aria-hidden='true'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d={collapsed ? "M9 6l6 6-6 6" : "M15 6l-6 6 6 6"}
            />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <p className='mb-3 text-xs tracking-[0.16em] text-emerald-200/70 uppercase'>
          Menu Utama
        </p>
      )}
      <nav className='space-y-1.5'>
        {mainMenu.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            active={pathname === item.href}
            collapsed={collapsed}
          />
        ))}
      </nav>

      <div className='mt-7'>
        {!collapsed && (
          <p className='mb-3 text-xs tracking-[0.16em] text-emerald-200/70 uppercase'>
            Data
          </p>
        )}
        <nav className='space-y-1.5'>
          {dataMenu.map((item) => (
            <SidebarLink
              key={item.href}
              item={item}
              active={pathname === item.href}
              collapsed={collapsed}
            />
          ))}
        </nav>
      </div>

      <div className='mt-7'>
        {!collapsed && (
          <p className='mb-3 text-xs tracking-[0.16em] text-emerald-200/70 uppercase'>
            Lazisnu
          </p>
        )}

        {collapsed ? (
          <SidebarLink
            item={{ name: "Lazisnu", href: "/admin/lazisnu/koin-nu" }}
            active={lazisnuActive}
            collapsed={collapsed}
          />
        ) : (
          <div className='space-y-1.5'>
            <button
              type='button'
              onClick={() => setIsLazisnuOpen((prev) => !prev)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                lazisnuActive
                  ? "bg-emerald-500/20 text-white"
                  : "text-emerald-50/80 hover:bg-emerald-500/15 hover:text-white"
              }`}>
              <span>Lazisnu</span>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className={`h-4 w-4 transition ${isLazisnuOpen ? "rotate-180" : ""}`}
                aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 9l6 6 6-6'
                />
              </svg>
            </button>

            {isLazisnuOpen && (
              <div className='ml-2 border-l border-emerald-200/20 pl-2'>
                <SidebarLink
                  item={{ name: "Koin Nu", href: "/admin/lazisnu/koin-nu" }}
                  active={pathname === "/admin/lazisnu/koin-nu"}
                  collapsed={false}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {collapsed ? (
        <div className='mt-8 flex justify-center'>
          <Link
            href='/'
            title='Ke Halaman Publik'
            className='grid h-9 w-9 place-items-center rounded-md bg-emerald-500 text-white transition hover:bg-emerald-400'>
            <svg
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              className='h-4 w-4'
              aria-hidden='true'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M3 10.5l9-7 9 7M5.5 8.5V20h13V8.5M10 20v-6h4v6'
              />
            </svg>
          </Link>
        </div>
      ) : (
        <div className='mt-8 rounded-xl border border-emerald-100/10 bg-white/8 p-4'>
          <p className='text-xs text-emerald-100/70'>Aksi Cepat</p>
          <p className='mt-2 text-sm'>
            Kelola konten dan data organisasi dari panel ini.
          </p>
          <Link
            href='/'
            className='mt-3 inline-flex rounded-md bg-emerald-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-400'>
            Ke Halaman Publik
          </Link>
        </div>
      )}
    </aside>
  );
}
