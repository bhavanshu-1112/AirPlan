import mythsData from '@/content/myths.json';
import { z } from 'zod/v4';

const MythSchema = z.object({
  id: z.string(),
  claim: z.string(),
  verdict: z.union([z.boolean(), z.string()]),
  explanation: z.string(),
  source: z.string(),
});

type Myth = z.infer<typeof MythSchema>;

/** Pre-validated myth data. */
const myths: Myth[] = mythsData.map((item) => MythSchema.parse(item));

function VerdictBadge({ verdict }: { verdict: boolean | string }) {
  if (verdict === true) {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
        ✓ True
      </span>
    );
  }
  if (verdict === 'partial') {
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300">
        ≈ Partial
      </span>
    );
  }
  return (
    <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-300 bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800 dark:border-rose-700 dark:bg-rose-950/80 dark:text-rose-300">
      ✕ False
    </span>
  );
}

export default function MythBuster() {
  return (
    <section aria-labelledby="myths-heading" className="mt-12 space-y-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm text-sky-700 dark:bg-sky-950/80 dark:text-sky-300">
            🔍
          </span>
          <h2
            id="myths-heading"
            className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white"
          >
            Air Quality Myth Buster
          </h2>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Science-backed truth on popular air cleaning lore, backed by WHO, EPA, and peer-reviewed
          aerosol physics.
        </p>
      </div>

      <div className="space-y-3">
        {myths.map((myth) => (
          <details
            key={myth.id}
            className="group rounded-2xl border border-slate-200/90 bg-white/80 p-1 shadow-xs transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-slate-700"
          >
            <summary className="flex min-h-[48px] cursor-pointer items-center justify-between gap-3 px-4 py-3 font-semibold text-slate-800 hover:text-blue-600 focus:outline-none dark:text-slate-200 dark:hover:text-sky-400">
              <div className="flex items-center gap-3">
                <VerdictBadge verdict={myth.verdict} />
                <span className="text-sm sm:text-base">{myth.claim}</span>
              </div>
              <span
                className="text-slate-400 transition-transform group-open:rotate-180 dark:text-slate-500"
                aria-hidden="true"
              >
                ▼
              </span>
            </summary>
            <div className="border-t border-slate-100 px-4 py-3.5 dark:border-slate-800/80">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {myth.explanation}
              </p>
              <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-500 dark:text-slate-400">Source:</span>
                <span className="italic">{myth.source}</span>
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
