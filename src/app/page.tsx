import MythBuster from '@/components/MythBuster';

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section aria-labelledby="hero-heading" className="text-center">
        <h1 id="hero-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tomorrow&apos;s Smog, Today&apos;s Plan
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
          Every evening, AirPlan turns tomorrow&apos;s smog forecast into a plan for your family:
          when to walk, which mask, when to open a window. It shows how much exposure each choice
          saves — and the math is on screen.
        </p>
      </section>

      <section aria-labelledby="features-heading">
        <h2 id="features-heading" className="sr-only">
          Features
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <a
            href="/setup"
            className="group rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-700"
          >
            <span className="text-3xl" aria-hidden="true">
              📋
            </span>
            <h3 className="mt-3 text-lg font-semibold group-hover:text-blue-600">
              Tomorrow&apos;s Plan
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Personalized hourly plan with exposure math for every recommendation.
            </p>
          </a>

          <a
            href="/audit"
            className="group rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-700"
          >
            <span className="text-3xl" aria-hidden="true">
              📸
            </span>
            <h3 className="mt-3 text-lg font-semibold group-hover:text-blue-600">Indoor Audit</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Upload a room photo to identify ventilation issues and pollution sources.
            </p>
          </a>

          <a
            href="#myths-heading"
            className="group rounded-xl border border-gray-200 p-6 transition-shadow hover:shadow-lg dark:border-gray-700"
          >
            <span className="text-3xl" aria-hidden="true">
              🔍
            </span>
            <h3 className="mt-3 text-lg font-semibold group-hover:text-blue-600">Myth Buster</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Verified facts about indoor air, masks, and pollution — with sources.
            </p>
          </a>
        </div>
      </section>

      <section
        aria-labelledby="cta-heading"
        className="rounded-xl border border-gray-200 p-6 text-center dark:border-gray-700"
      >
        <h2 id="cta-heading" className="text-xl font-semibold">
          Get Started
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Set up your household profile to get a personalized air quality plan.
        </p>
        <div className="mt-4">
          <a
            href="/setup"
            className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Household Profile
          </a>
        </div>
        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
          🔗 Or try with demo data:{' '}
          <a href="/plan?id=demo-a" className="underline hover:text-blue-600">
            Sharma Family
          </a>
          {' | '}
          <a href="/plan?id=demo-b" className="underline hover:text-blue-600">
            Gupta Couple
          </a>
        </p>
      </section>

      <MythBuster />
    </div>
  );
}
