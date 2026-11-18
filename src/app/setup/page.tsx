import HouseholdForm from '@/components/HouseholdForm';

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <section aria-labelledby="setup-heading">
        <h1 id="setup-heading" className="text-2xl font-bold sm:text-3xl">
          Set Up Your Household
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Tell us about your family, home, and daily routine. We&apos;ll use this to generate a
          personalized air quality plan based on tomorrow&apos;s forecast.
        </p>
      </section>
      <HouseholdForm />
    </div>
  );
}
