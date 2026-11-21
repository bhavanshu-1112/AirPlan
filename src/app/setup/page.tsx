import HouseholdForm from '@/components/HouseholdForm';

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <section aria-labelledby="setup-heading" className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
          <span>⚙️ Step 1 of 2</span>
          <span>·</span>
          <span>Household Configuration</span>
        </div>
        <h1
          id="setup-heading"
          className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
        >
          Set Up Your Household
        </h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Tell us about your family, home, and daily routine. We&apos;ll use this to generate a
          personalized air quality plan based on tomorrow&apos;s forecast.
        </p>
      </section>

      <HouseholdForm />
    </div>
  );
}
