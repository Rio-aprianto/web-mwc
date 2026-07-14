"use client";
import Image from "next/image";
import { useState } from "react";

type MenuItem = {
  label: string;
  href: string;
};

const menuItems: MenuItem[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Sambutan", href: "#tentang" },
  { label: "Pengurus", href: "#program" },
  { label: "Berita", href: "#berita" },
  { label: "Kontak", href: "#kontak" },
];

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function animateScrollTo(targetY: number, duration = 900) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  if (reduceMotion) {
    window.scrollTo(0, targetY);
    return;
  }

  let startTime: number | null = null;

  const step = (timestamp: number) => {
    if (!startTime) startTime = timestamp;

    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

export default function TopNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigate = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();

    const targetId = href.replace("#", "");
    const targetElement = document.getElementById(targetId);

    if (!targetElement) return;

    const header = document.querySelector("header");
    const headerOffset =
      header instanceof HTMLElement ? header.offsetHeight + 12 : 76;
    const targetY =
      targetElement.getBoundingClientRect().top + window.scrollY - headerOffset;

    animateScrollTo(targetY);
    history.replaceState(null, "", href);
    setIsMenuOpen(false);
  };

  return (
    <header className='fixed inset-x-0 top-0 z-50 border-b border-white/15 bg-emerald-950/75 backdrop-blur'>
      <nav className='relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 text-white'>
        <a
          href='#beranda'
          className='text-sm font-semibold tracking-[0.2em]'
          onClick={(event) => handleNavigate(event, "#beranda")}>
          <Image
            src='/logo1.png'
            alt='MWC NU'
            width={250}
            height={250}
            className='h-full w-auto object-contain'
            loading='eager'
          />
        </a>

        <button
          type='button'
          className='inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/25 text-white transition hover:bg-white/10 md:hidden'
          aria-label='Buka menu navigasi'
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((prev) => !prev)}>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            className='h-5 w-5'>
            {isMenuOpen ? (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6 18L18 6M6 6l12 12'
              />
            ) : (
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M4 6h16M4 12h16M4 18h16'
              />
            )}
          </svg>
        </button>

        <ul className='hidden items-center gap-4 overflow-x-auto text-sm font-medium whitespace-nowrap md:flex'>
          {menuItems.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                className='transition hover:text-lime-300'
                onClick={(event) => handleNavigate(event, item.href)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {isMenuOpen && (
          <ul className='absolute top-16 right-4 left-4 space-y-1 rounded-xl border border-white/20 bg-emerald-950/95 p-3 text-sm font-medium shadow-lg md:hidden'>
            {menuItems.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className='block rounded-md px-3 py-2 transition hover:bg-white/10 hover:text-lime-300'
                  onClick={(event) => handleNavigate(event, item.href)}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </nav>
    </header>
  );
}
