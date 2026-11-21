import type { Metadata } from 'next';
import NavBar from '@/components/NavBar';
import './globals.css';

export const metadata: Metadata = {
  title: 'AirPlan — Urban Air Quality Assistant',
  description:
    "Every evening, AirPlan turns tomorrow's smog forecast into a plan for your family: when to walk, which mask, when to open a window.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans antialiased text-slate-800 dark:text-slate-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        >
          Skip to content
        </a>
        <header
          role="banner"
          className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/80"
        >
          <NavBar />
        </header>
        <main
          id="main-content"
          role="main"
          className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8"
        >
          {children}
        </main>
        <footer
          role="contentinfo"
          className="mt-auto border-t border-slate-200/80 bg-white/60 px-4 py-6 text-center text-sm text-slate-500 backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-950/60 dark:text-slate-400"
        >
          <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-xs sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800 dark:text-slate-200">AirPlan</span>
              <span>— Evidence-based urban smog planning &amp; indoor mitigation.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 text-slate-500 dark:text-slate-400">
              <span>Indicative data · Not medical advice</span>
              <span>Minimal data · No tracking</span>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
