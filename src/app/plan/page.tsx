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

function PlanHeader({
  plan,
  isHi,
  language,
  onLanguageToggle,
}: {
  plan: Plan;
  isHi: boolean;
  language: Language;
  onLanguageToggle: (lang: Language) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white/80 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/70">
      <div>
        <div className="flex items-center gap-2">
          <span
            className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"
            aria-hidden="true"
          />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isHi ? 'दैनिक कार्य योजना' : 'Personalized Daily Brief'}
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl dark:text-white">
          {isHi ? 'वायु गुणवत्ता कार्य योजना' : 'Air Quality Action Plan'}
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <span className="rounded-md bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
            📅 {plan.forecastDate}
          </span>
          <span>·</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono dark:bg-slate-800">
            ID: {plan.householdId}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <SharePlan plan={plan} />
        <LanguageToggle language={language} onToggle={onLanguageToggle} />
      </div>
    </div>
  );
}

function TopActionsSection({
  topActions,
  isHi,
  language,
}: {
  topActions: Plan['topActions'];
  isHi: boolean;
  language: Language;
}) {
  return (
    <section aria-labelledby="top-actions-heading" className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            ⚡
          </span>
          <h2
            id="top-actions-heading"
            className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
          >
            {isHi ? 'शीर्ष अनुशंसित कार्य' : 'Top Recommended Actions'}
          </h2>
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {topActions.length} {isHi ? 'प्राथमिकता कार्य' : 'Priority Actions'}
        </span>
      </div>

      <div className="space-y-5">
        {topActions.map((action, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-xs backdrop-blur-xs transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-slate-700"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-xs">
                {idx + 1}
              </span>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {action.action}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {action.reason}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-400 mr-1">
                    {isHi ? 'लागू सदस्य:' : 'Applies to:'}
                  </span>
                  {action.memberNames.map((name) => (
                    <span
                      key={name}
                      className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <ImpactCard card={action.impactCard} language={language} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MemberPlansSection({
  memberPlans,
  isHi,
}: {
  memberPlans: Plan['memberPlans'];
  isHi: boolean;
}) {
  return (
    <section aria-labelledby="member-plans-heading" className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sm text-sky-700 dark:bg-sky-950 dark:text-sky-300">
          👨‍👩‍👧‍👦
        </span>
        <h2
          id="member-plans-heading"
          className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
        >
          {isHi ? 'व्यक्तिगत सदस्य योजना' : 'Individual Member Plans'}
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {memberPlans.map((mp) => (
          <div
            key={mp.memberName}
            className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-xs backdrop-blur-xs dark:border-slate-800/90 dark:bg-slate-900/60"
          >
            <div>
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <MemberChip name={mp.memberName} ageGroup="" sensitivity="" />
              </div>

              <dl className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div className="rounded-xl border border-sky-100 bg-sky-50/50 p-2.5 dark:border-sky-900/50 dark:bg-sky-950/20">
                  <dt className="font-semibold text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <span>🕐</span>
                    <span>{isHi ? 'बाहर जाने का सबसे अच्छा समय' : 'Best Outdoor Window'}</span>
                  </dt>
                  <dd className="mt-1 font-medium text-slate-700 dark:text-slate-200">
                    {mp.bestOutdoorWindow}
                  </dd>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white/60 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/40">
                  <dt className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>😷</span>
                    <span>{isHi ? 'मास्क अनुशंसा' : 'Mask Recommendation'}</span>
                  </dt>
                  <dd className="mt-1 text-slate-600 dark:text-slate-300">
                    {mp.maskRecommendation}
                  </dd>
                </div>

                <div className="rounded-xl border border-slate-200/80 bg-white/60 p-2.5 dark:border-slate-800/80 dark:bg-slate-900/40">
                  <dt className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <span>🪟</span>
                    <span>{isHi ? 'वेंटिलेशन विंडो' : 'Ventilation Window'}</span>
                  </dt>
                  <dd className="mt-1 text-slate-600 dark:text-slate-300">
                    {mp.ventilationWindow}
                  </dd>
                </div>

                {mp.skip.length > 0 && (
                  <div className="rounded-xl border border-rose-100 bg-rose-50/50 p-2.5 dark:border-rose-900/50 dark:bg-rose-950/20">
                    <dt className="font-semibold text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                      <span>🚫</span>
                      <span>{isHi ? 'टालने योग्य गतिविधियां' : 'Activities to Avoid'}</span>
                    </dt>
                    <dd className="mt-1.5">
                      <ul className="space-y-1">
                        {mp.skip.map((s) => (
                          <li
                            key={s}
                            className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300"
                          >
                            <span aria-hidden="true" className="text-xs">
                              ✕
                            </span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanErrorView({ error, onRetry }: { error: string; onRetry: () => void }) {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
        Air Quality Action Plan
      </h1>
      <div
        role="alert"
        className="rounded-2xl border border-rose-300 bg-rose-50/90 p-6 text-rose-800 shadow-sm dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
      >
        <div className="flex items-start gap-3">
          <span className="text-2xl" aria-hidden="true">
            ⚠️
          </span>
          <div>
            <p className="text-base font-semibold">Unable to load air quality plan</p>
            <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{error}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-4 min-h-[44px] min-w-[44px] rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 dark:bg-rose-500 dark:hover:bg-rose-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
            Air Quality Action Plan
          </h1>
          <LanguageToggle language={language} onToggle={handleLanguageToggle} />
        </div>
        <div className="rounded-2xl border border-slate-200/80 bg-white/70 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60">
          <p className="mb-4 text-sm font-medium text-slate-500">
            Calculating exposure and optimal windows...
          </p>
          <LoadingSkeleton lines={6} />
        </div>
      </div>
    );
  }

  if (error !== undefined) {
    return <PlanErrorView error={error} onRetry={handleRetry} />;
  }

  if (plan === undefined) return null;

  const isHi = language === 'hi';

  return (
    <div className="space-y-10">
      <PlanHeader
        plan={plan}
        isHi={isHi}
        language={language}
        onLanguageToggle={handleLanguageToggle}
      />

      <div className="rounded-2xl border border-slate-200/90 bg-gradient-to-r from-slate-50 via-white to-slate-50 p-6 shadow-xs dark:border-slate-800/90 dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-900">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {isHi ? 'पूर्वानुमानित वायु गुणवत्ता श्रेणी' : 'Forecasted Air Quality Category'}
            </span>
            <div className="pt-1">
              <AqiBadge band={plan.aqiBand} />
            </div>
          </div>
          <div className="sm:text-right text-xs text-slate-500 dark:text-slate-400">
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {isHi ? 'भौतिक मॉडल द्वारा संचालित' : 'Powered by Deterministic Physics'}
            </p>
            <p className="mt-0.5">
              {isHi ? 'अपडेट किया गया:' : 'Generated:'}{' '}
              {new Date(plan.generatedAt).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <TopActionsSection topActions={plan.topActions} isHi={isHi} language={language} />

      <MemberPlansSection memberPlans={plan.memberPlans} isHi={isHi} />

      <div
        className="rounded-2xl border border-amber-200/90 bg-amber-50/70 p-4 text-xs sm:text-sm text-amber-900 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
        role="note"
      >
        <div className="flex items-start gap-2.5">
          <span className="text-lg" aria-hidden="true">
            ℹ️
          </span>
          <p className="leading-relaxed">
            <strong className="font-semibold">Notice:</strong> {plan.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <h1 className="text-2xl font-bold sm:text-3xl text-slate-900 dark:text-white">
            Air Quality Action Plan
          </h1>
          <LoadingSkeleton lines={6} />
        </div>
      }
    >
      <PlanContent />
    </Suspense>
  );
}
