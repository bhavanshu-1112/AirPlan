'use client';

import { useEffect, useRef, useState } from 'react';
import type { Plan } from '@/lib/schemas/plan';

const COPIED_DURATION_MS = 2000;
const DISPLAY_INDEX_OFFSET = 1;

export interface SharePlanProps {
  plan: Plan;
  className?: string | undefined;
}

function formatAction(action: Plan['topActions'][number], index: number): string {
  const displayNum = index + DISPLAY_INDEX_OFFSET;
  const { title, exposureSaved, beforeExposure, afterExposure, cigaretteEquivalentSaved } =
    action.impactCard;
  const members = action.memberNames.length > 0 ? action.memberNames.join(', ') : 'All members';

  return [
    `${displayNum}. ${action.action}`,
    `   Target Members: ${members}`,
    `   Impact Card: ${title}`,
    `   Exposure Saved: ${exposureSaved} µg/m³ (Before: ${beforeExposure} µg/m³, After: ${afterExposure} µg/m³)`,
    `   Cigarette Equivalent Saved: ${cigaretteEquivalentSaved} cig/day`,
    `   Reason: ${action.reason}`,
  ].join('\n');
}

function formatMemberPlan(member: Plan['memberPlans'][number]): string {
  const skipList = member.skip.length > 0 ? member.skip.join(', ') : 'None';

  return [
    `- ${member.memberName}:`,
    `  * Best Outdoor Window: ${member.bestOutdoorWindow}`,
    `  * Mask Recommendation: ${member.maskRecommendation}`,
    `  * Ventilation Window: ${member.ventilationWindow}`,
    `  * Activities to Avoid: ${skipList}`,
  ].join('\n');
}

export function generatePlanSummary(plan: Plan): string {
  const actionsSummary = plan.topActions.map(formatAction).join('\n\n');
  const membersSummary = plan.memberPlans.map(formatMemberPlan).join('\n\n');

  return [
    '=== AirPlan - Air Quality Action Plan ===',
    `Household ID: ${plan.householdId}`,
    `Date: ${plan.forecastDate}`,
    `AQI Band: ${plan.aqiBand}`,
    '',
    '--- Top Recommended Actions ---',
    actionsSummary,
    '',
    '--- Member Plans ---',
    membersSummary,
    '',
    '--- Disclaimer ---',
    plan.disclaimer,
  ].join('\n');
}

export function SharePlan({ plan, className }: SharePlanProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async (): Promise<void> => {
    const summary = generatePlanSummary(plan);
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
        setCopied(true);

        if (timerRef.current !== null) {
          clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(() => {
          setCopied(false);
        }, COPIED_DURATION_MS);
      }
    } catch {
      // Fail silently without console.log
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy plan summary as text"
      className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        copied
          ? 'bg-green-700 text-white focus:ring-green-500 dark:bg-green-600'
          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600'
      }${className ? ` ${className}` : ''}`}
    >
      {copied ? '✓ Copied!' : '📋 Share Plan'}
    </button>
  );
}

export default SharePlan;
