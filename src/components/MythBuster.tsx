import mythsData from '@/content/myths.json';

interface Myth {
  id: string;
  claim: string;
  verdict: boolean | string;
  explanation: string;
  source: string;
}

function VerdictBadge({ verdict }: { verdict: boolean | string }) {
  if (verdict === true) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
        ✓ True
      </span>
    );
  }
  if (verdict === 'partial') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
        ≈ Partial
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
      ✕ False
    </span>
  );
}

export default function MythBuster() {
  const myths = mythsData as Myth[];

  return (
    <section aria-labelledby="myths-heading" className="mt-8">
      <h2 id="myths-heading" className="text-2xl font-bold">
        🔍 Air Quality Myth Buster
      </h2>
      <div className="mt-4 space-y-3">
        {myths.map((myth) => (
          <details key={myth.id} className="rounded-lg border border-gray-200 dark:border-gray-700">
            <summary className="flex min-h-[44px] cursor-pointer items-center gap-3 px-4 py-3 font-medium hover:bg-gray-50 dark:hover:bg-gray-800">
              <VerdictBadge verdict={myth.verdict} />
              <span>{myth.claim}</span>
            </summary>
            <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
              <p className="text-sm text-gray-700 dark:text-gray-300">{myth.explanation}</p>
              <p className="mt-2 text-xs italic text-gray-500 dark:text-gray-400">
                Source: {myth.source}
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
