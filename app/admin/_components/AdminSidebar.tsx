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
  icon: string;
};

type AdminSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

const iconPaths: Record<string, string> = {
  dashboard: "M3 9h18M3 15h18M9 3v18M15 3v18",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  image:
    "M4 4h16v16H4zM8 11l3-3 2 2 3-3 2 2M9 9a1 1 0 1 0 0-.01",
  newspaper: "M4 4h16v16H4zM8 8h8M8 12h8M8 16h5",
  building:
    "M3 21h18M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M15 21V9h2a2 2 0 0 1 2 2v10M9 7h2M9 11h2M9 15h2",
  tag: "M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  user:
    "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
  lazisnu:
    "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z",
  coin:
    "M12 22c5.5 0 10-4.5 10-10S17.5 2 12 2 2 6.5 2 12s4.5 10 10 10zM12 6v12M9.5 9.5 12 7l2.5 2.5M9.5 14.5 12 17l2.5-2.5",
};

function MenuIcon({ name }: { name: string }) {
  const d = iconPaths[name];
  if (!d) return null;
  return (
    <svg
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='2'
      strokeLinecap='round'
      strokeLinejoin='round'
      className='h-5 w-5 shrink-0'
      aria-hidden='true'>
      <path d={d} />
    </svg>
  );
}

const mainMenu: MenuItem[] = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { name: "Sambutan Rois", href: "/admin/sambutan-ketua", icon: "chat" },
  { name: "Sambutan Tanfidziyah", href: "/admin/sambutan-tanfidziyah", icon: "chat" },
  { name: "Daftar Pengurus", href: "/admin/daftar-pengurus", icon: "users" },
  { name: "Banner Image", href: "/admin/banner-image", icon: "image" },
  { name: "Berita", href: "/admin/berita", icon: "newspaper" },
];

const dataMenu: MenuItem[] = [
  { name: "Data Ranting/Lembaga", href: "/admin/data/ranting", icon: "building" },
  { name: "Data Kader", href: "/admin/data/kader", icon: "user" },
  { name: "Data Banom", href: "/admin/data/banom", icon: "tag" },
  { name: "Data Pengguna", href: "/admin/data/pengguna", icon: "users" },
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
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        active
          ? "bg-emerald-500/30 text-white"
          : "text-emerald-50/80 hover:bg-emerald-500/15 hover:text-white"
      } ${collapsed ? "justify-center" : ""}`}>
      <MenuIcon name={item.icon} />
      {!collapsed && <span className='truncate'>{item.name}</span>}
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
          className='hidden h-8 w-8 place-items-center rounded-lg border border-emerald-200/20 text-emerald-100 transition hover:bg-emerald-500/20 lg:grid'>
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
            item={{ name: "Lazisnu", href: "/admin/lazisnu/koin-nu", icon: "lazisnu" }}
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
              <span className='flex items-center gap-3'>
                <MenuIcon name='lazisnu' />
                Lazisnu
              </span>
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
                    item={{ name: "Koin Nu", href: "/admin/lazisnu/koin-nu", icon: "coin" }}
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
