export default function HomePage() {
  return (
    <div className="space-y-8">
      <section aria-labelledby="hero-heading" className="text-center">
        <h1 id="hero-heading" className="text-3xl font-bold tracking-tight sm:text-4xl">
          Tomorrow&apos;s Smog, Today&apos;s Plan
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
          Every evening, AirPlan turns tomorrow&apos;s smog forecast into a plan for your family:
          when to walk, which mask, when to open a window. It shows how much exposure each choice
          saves — and the math is on screen.
        </p>
      </section>

      <section aria-labelledby="get-started" className="rounded-xl border border-gray-200 p-6 dark:border-gray-700">
        <h2 id="get-started" className="text-xl font-semibold">
          Get Started
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Set up your household profile to get a personalized air quality plan.
        </p>
        <div className="mt-4 flex flex-wrap gap-3" role="group" aria-label="Quick actions">
          <a
            href="/setup"
            className="inline-flex min-h-[44px] min-w-[44px] items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create Household Profile
          </a>
        </div>
      </section>
    </div>
  );
}
