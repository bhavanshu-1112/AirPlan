'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AqiBadge from '@/components/AqiBadge';
import ImpactCard from '@/components/ImpactCard';
import MemberChip from '@/components/MemberChip';
import SharePlan from '@/components/SharePlan';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import LanguageToggle from '@/components/LanguageToggle';
import type { Plan } from '@/lib/schemas/plan';
import type { Language } from '@/lib/i18n';

function PlanContent() {
  const searchParams = useSearchParams();
  const householdId = searchParams.get('id') ?? 'demo-a';
  const [language, setLanguage] = useState<Language>('en');
  const [plan, setPlan] = useState<Plan | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ householdId, language }),
        });
        if (!res.ok) {
          const errData = (await res.json()) as { error?: { message?: string } };
          throw new Error(errData.error?.message ?? `HTTP ${res.status}`);
        }
        const data = (await res.json()) as Plan;
        if (!isCancelled) {
          setPlan(data);
          setError(undefined);
          setLoading(false);
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load plan');
          setLoading(false);
        }
      }
    };
    void load();
    return () => {
      isCancelled = true;
    };
  }, [householdId, language, retryCount]);

  const handleRetry = useCallback(() => {
    setRetryCount((c) => c + 1);
    setError(undefined);
    setLoading(true);
  }, []);

  const handleLanguageToggle = useCallback((lang: Language) => {
    setLanguage(lang);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Air Quality Action Plan</h1>
          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error !== undefined) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Air Quality Action Plan</h1>
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          <p className="font-medium">⚠ {error}</p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-2 min-h-[44px] min-w-[44px] rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (plan === undefined) return null;

  const isHi = language === 'hi';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">
            {isHi ? 'वायु गुणवत्ता कार्य योजना' : 'Air Quality Action Plan'}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {plan.forecastDate} · {plan.householdId}
          </p>
        </div>
        <LanguageToggle language={language} onToggle={handleLanguageToggle} />
      </div>

      <AqiBadge band={plan.aqiBand} />

      {/* Top Actions */}
      <section aria-labelledby="top-actions-heading">
        <h2 id="top-actions-heading" className="text-xl font-bold">
          {isHi ? 'शीर्ष अनुशंसित कार्य' : 'Top Recommended Actions'}
        </h2>
        <div className="mt-4 space-y-4">
          {plan.topActions.map((action, idx) => (
            <div key={idx} className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-semibold">{action.action}</p>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{action.reason}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {action.memberNames.map((name) => (
                      <span
                        key={name}
                        className="inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <ImpactCard card={action.impactCard} language={language} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Member Plans */}
      <section aria-labelledby="member-plans-heading">
        <h2 id="member-plans-heading" className="text-xl font-bold">
          {isHi ? 'व्यक्तिगत सदस्य योजना' : 'Individual Member Plans'}
        </h2>
        <div className="mt-4 space-y-4">
          {plan.memberPlans.map((mp) => (
            <div
              key={mp.memberName}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
            >
              <MemberChip name={mp.memberName} ageGroup="" sensitivity="" />
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">
                    {isHi ? 'बाहर जाने का सबसे अच्छा समय' : 'Best Outdoor Window'}
                  </dt>
                  <dd>{mp.bestOutdoorWindow}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">
                    {isHi ? 'मास्क अनुशंसा' : 'Mask Recommendation'}
                  </dt>
                  <dd>{mp.maskRecommendation}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500 dark:text-gray-400">
                    {isHi ? 'वेंटिलेशन विंडो' : 'Ventilation Window'}
                  </dt>
                  <dd>{mp.ventilationWindow}</dd>
                </div>
                {mp.skip.length > 0 && (
                  <div>
                    <dt className="font-medium text-gray-500 dark:text-gray-400">
                      {isHi ? 'टालने योग्य गतिविधियां' : 'Activities to Avoid'}
                    </dt>
                    <dd>
                      <ul className="list-inside list-disc">
                        {mp.skip.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          ))}
        </div>
      </section>

      {/* Disclaimer */}
      <div
        className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200"
        role="note"
      >
        ⚠ {plan.disclaimer}
      </div>

      <SharePlan plan={plan} />
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PlanContent />
    </Suspense>
  );
}
