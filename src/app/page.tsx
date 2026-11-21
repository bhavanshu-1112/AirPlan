import Link from 'next/link';
import MythBuster from '@/components/MythBuster';

export default function HomePage() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section aria-labelledby="hero-heading" className="relative pt-4 text-center sm:pt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/80 px-3.5 py-1 text-xs font-semibold text-sky-800 shadow-xs dark:border-sky-900/60 dark:bg-sky-950/50 dark:text-sky-300">
          <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" aria-hidden="true" />
          <span>Evidence-Based Urban Air Defense · Delhi NCR &amp; Global</span>
        </div>

        <h1
          id="hero-heading"
          className="mx-auto mt-5 max-w-3xl text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl dark:text-white"
        >
          Tomorrow&apos;s Smog,{' '}
          <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-sky-400 dark:via-blue-400 dark:to-indigo-300">
            Today&apos;s Plan
          </span>
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300">
          Every evening, AirPlan turns tomorrow&apos;s smog forecast into a plan for your family:
          when to walk, which mask, when to open a window. It shows how much exposure each choice
          saves — and the math is on screen.
        </p>

        {/* Hero Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/setup"
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-700 hover:shadow-blue-500/35 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <span>Create Household Profile</span>
            <span aria-hidden="true">→</span>
          </Link>

          <Link
            href="/audit"
            className="inline-flex min-h-[48px] min-w-[48px] items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-6 py-3 text-base font-semibold text-slate-700 shadow-xs backdrop-blur-xs transition-all hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <span aria-hidden="true">📸</span>
            <span>Audit Room Air Quality</span>
          </Link>
        </div>

        {/* Key Guarantees Ribbon */}
        <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white/60 p-3 text-center shadow-2xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/40">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              MATH INTEGRITY
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
              100% Deterministic (ASHRAE / EPA)
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white/60 p-3 text-center shadow-2xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/40">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              VULNERABILITY AWARE
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
              Infants, Seniors &amp; Asthmatics
            </p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white/60 p-3 text-center shadow-2xs backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/40">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              PROVABLE SAVINGS
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-200">
              µg/m³ Exposure &amp; Cigarette Equiv.
            </p>
          </div>
        </div>
      </section>

      {/* Instant Demo Scenarios */}
      <section
        aria-labelledby="demo-scenarios-heading"
        className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 via-sky-50/30 to-indigo-50/40 p-6 shadow-xs dark:border-blue-900/40 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2
              id="demo-scenarios-heading"
              className="text-lg font-bold text-slate-900 dark:text-white"
            >
              ⚡ Instant Demo Scenarios
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Test AirPlan immediately with offline realistic forecast fixtures (no keys needed).
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Link
            href="/plan?id=demo-a"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-400">
                  Sharma Family
                </span>
                <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-bold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  AQI 280 · Hazardous
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                South Delhi · 4 members (Baby Sharma, Riya [Asthma], Amit, Priya) · Gas Stove ·
                Leaky Windows
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-sky-400">
              <span>View Tomorrow&apos;s Plan</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>

          <Link
            href="/plan?id=demo-b"
            className="group flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white/95 p-4 shadow-xs transition-all hover:border-blue-400 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-blue-500"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-sky-400">
                  Gupta Couple
                </span>
                <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  AQI 165 · Unhealthy
                </span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">
                Mumbai · 2 seniors (Rajesh &amp; Sunita [Heart Condition]) · Well-Sealed Apartment ·
                Air Purifier
              </p>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-sky-400">
              <span>View Tomorrow&apos;s Plan</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Link
            href="/setup"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 p-6 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-blue-500"
          >
            <div>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-2xl shadow-2xs dark:bg-blue-950/70"
                aria-hidden="true"
              >
                📋
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-sky-400">
                Tomorrow&apos;s Plan
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Personalized hourly plan with exposure math for every recommendation.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Hourly Timetable
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Mask Advice
              </span>
            </div>
          </Link>

          <Link
            href="/audit"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 p-6 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-blue-500"
          >
            <div>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-2xl shadow-2xs dark:bg-emerald-950/70"
                aria-hidden="true"
              >
                📸
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-sky-400">
                Indoor Audit
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Upload a room photo to identify ventilation issues and pollution sources.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Vision AI
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                Draft Detection
              </span>
            </div>
          </Link>

          <a
            href="#myths-heading"
            className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/80 p-6 shadow-xs backdrop-blur-xs transition-all hover:-translate-y-1 hover:border-blue-400 hover:shadow-md dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-blue-500"
          >
            <div>
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-2xl shadow-2xs dark:bg-purple-950/70"
                aria-hidden="true"
              >
                🔍
              </span>
              <h3 className="mt-4 text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-sky-400">
                Myth Buster
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Verified facts about indoor air, masks, and pollution — with sources.
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                WHO / EPA Sourced
              </span>
              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                6 Verified Claims
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Call to Action Container */}
      <section
        aria-labelledby="cta-heading"
        className="rounded-2xl border border-slate-200/90 bg-white/90 p-8 text-center shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/80"
      >
        <h2 id="cta-heading" className="text-2xl font-bold text-slate-900 dark:text-white">
          Get Started
        </h2>
        <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600 sm:text-base dark:text-slate-300">
          Set up your household profile to get a personalized air quality plan.
        </p>
        <div className="mt-5">
          <Link
            href="/setup"
            className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            Create Household Profile
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          🔗 Or try with demo data:{' '}
          <Link
            href="/plan?id=demo-a"
            className="font-semibold text-blue-600 underline hover:text-blue-700 dark:text-sky-400"
          >
            Sharma Family
          </Link>
          {' | '}
          <Link
            href="/plan?id=demo-b"
            className="font-semibold text-blue-600 underline hover:text-blue-700 dark:text-sky-400"
          >
            Gupta Couple
          </Link>
        </p>
      </section>

      {/* Myth Buster */}
      <MythBuster />
    </div>
  );
}
