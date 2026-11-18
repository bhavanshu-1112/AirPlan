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
      className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 motion-reduce:transition-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-offset-gray-900"
    >
      <span
        lang="en"
        className={
          isEn
            ? 'font-bold text-gray-900 dark:text-white'
            : 'font-normal text-gray-500 dark:text-gray-400'
        }
      >
        EN
      </span>
      <span className="mx-1 text-gray-400 dark:text-gray-500"> | </span>
      <span
        lang="hi"
        className={
          isHi
            ? 'font-bold text-gray-900 dark:text-white'
            : 'font-normal text-gray-500 dark:text-gray-400'
        }
      >
        हि
      </span>
    </button>
  );
}

export default LanguageToggle;
