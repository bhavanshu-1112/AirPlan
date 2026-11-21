'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from '@/components/LanguageToggle';
import type { Language } from '@/lib/i18n';

const links = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/setup', label: 'Setup', icon: '📋' },
  { href: '/plan', label: 'Plan', icon: '📊' },
  { href: '/audit', label: 'Audit', icon: '📸' },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8"
    >
      <Link href="/" className="group flex items-center gap-2.5" aria-label="AirPlan home">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-lg shadow-sm shadow-sky-500/25 ring-1 ring-sky-400/30 transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          🌬️
        </span>
        <span className="flex flex-col">
          <span className="text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-400">
            AirPlan
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            AI Air Quality
          </span>
        </span>
      </Link>

      {/* Desktop nav */}
      <div className="hidden items-center gap-2 md:flex">
        <div className="flex items-center gap-1 rounded-2xl border border-slate-200/80 bg-slate-100/60 p-1 dark:border-slate-800 dark:bg-slate-900/60">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-white text-blue-700 shadow-sm shadow-slate-200/50 dark:bg-slate-800 dark:text-sky-300 dark:shadow-none'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span aria-hidden="true" className="text-base">
                  {link.icon}
                </span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="ml-2 flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 lg:inline-flex dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"
              aria-hidden="true"
            />
            Live Forecast
          </span>
          <LanguageToggle language={language} onToggle={setLanguage} />
        </div>
      </div>

      {/* Mobile menu button */}
      <div className="flex items-center gap-2 md:hidden">
        <LanguageToggle language={language} onToggle={setLanguage} />
        <button
          type="button"
          onClick={() => setMenuOpen(!menuOpen)}
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span aria-hidden="true" className="text-xl">
            {menuOpen ? '✕' : '☰'}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-30 border-b border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-md md:hidden dark:border-slate-800 dark:bg-slate-900/95"
        >
          <div className="flex flex-col gap-1.5">
            {links.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex min-h-[44px] items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-semibold ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm dark:bg-blue-500'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}
