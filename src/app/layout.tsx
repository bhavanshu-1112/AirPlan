import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirPlan — Urban Air Quality Assistant',
  description:
    'Every evening, AirPlan turns tomorrow\'s smog forecast into a plan for your family: when to walk, which mask, when to open a window.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          Skip to content
        </a>
        <header role="banner" className="border-b border-gray-200 dark:border-gray-800">
          <nav aria-label="Main navigation" className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
            <span className="text-xl font-bold" aria-label="AirPlan home">
              🌬️ AirPlan
            </span>
          </nav>
        </header>
        <main id="main-content" role="main" className="mx-auto max-w-4xl px-4 py-6">
          {children}
        </main>
        <footer role="contentinfo" className="border-t border-gray-200 px-4 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <p>
            AirPlan is not medical advice. Data is indicative. Consult a physician for health decisions.
          </p>
          <p className="mt-1">
            Privacy: We collect minimal data. No analytics. No tracking.{' '}
            <span className="underline">See docs/SECURITY.md</span>.
          </p>
        </footer>
      </body>
    </html>
  );
}
