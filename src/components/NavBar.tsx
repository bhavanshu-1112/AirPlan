'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LanguageToggle from '@/components/LanguageToggle';
import type { Language } from '@/lib/i18n';

const links = [
  { href: '/', label: 'Home' },
  { href: '/setup', label: 'Setup' },
  { href: '/plan', label: 'Plan' },
  { href: '/audit', label: 'Audit' },
] as const;

export default function NavBar() {
  const pathname = usePathname();
  const [language, setLanguage] = useState<Language>('en');
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav
      aria-label="Main navigation"
      className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3"
    >
      <Link href="/" className="text-xl font-bold" aria-label="AirPlan home">
        🌬️ AirPlan
      </Link>

      {/* Desktop nav */}
      <div className="hidden items-center gap-4 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`min-h-[44px] min-w-[44px] rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === link.href
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            }`}
            aria-current={pathname === link.href ? 'page' : undefined}
          >
            {link.label}
          </Link>
        ))}
        <LanguageToggle language={language} onToggle={setLanguage} />
      </div>

      {/* Mobile menu button */}
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="min-h-[44px] min-w-[44px] rounded-lg p-2 md:hidden"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
      >
        <span aria-hidden="true" className="text-xl">
          {menuOpen ? '✕' : '☰'}
        </span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute left-0 right-0 top-full z-20 border-b border-gray-200 bg-white p-4 shadow-lg md:hidden dark:border-gray-700 dark:bg-gray-900"
        >
          <div className="flex flex-col gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`min-h-[44px] rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
                aria-current={pathname === link.href ? 'page' : undefined}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2">
              <LanguageToggle language={language} onToggle={setLanguage} />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
