'use client';

import { useCallback, useEffect } from 'react';
import type { Language } from '@/lib/i18n';

export interface LanguageToggleProps {
  language: Language;
  onToggle: (lang: Language) => void;
}

export function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const handleToggle = useCallback(() => {
    const nextLang: Language = language === 'en' ? 'hi' : 'en';
    if (typeof document !== 'undefined') {
      document.documentElement.lang = nextLang;
    }
    onToggle(nextLang);
  }, [language, onToggle]);

  const isEn = language === 'en';
  const isHi = language === 'hi';

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-pressed={isHi}
      aria-label="Toggle language English / Hindi"
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-slate-200 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-xs transition-all hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 motion-reduce:transition-none dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-offset-slate-900"
    >
      <span className="mr-1.5 text-slate-400 dark:text-slate-500" aria-hidden="true">
        🌐
      </span>
      <span
        lang="en"
        className={`rounded-md px-1.5 py-0.5 transition-colors ${
          isEn
            ? 'bg-blue-600 font-bold text-white shadow-xs dark:bg-blue-500'
            : 'font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        EN
      </span>
      <span className="mx-1 text-slate-300 dark:text-slate-600">/</span>
      <span
        lang="hi"
        className={`rounded-md px-1.5 py-0.5 transition-colors ${
          isHi
            ? 'bg-blue-600 font-bold text-white shadow-xs dark:bg-blue-500'
            : 'font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
        }`}
      >
        HI हिंदी
      </span>
    </button>
  );
}

export default LanguageToggle;
