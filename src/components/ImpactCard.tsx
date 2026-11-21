'use client';

import { useState } from 'react';
import type { ImpactCard as ImpactCardType } from '@/lib/schemas/plan';

interface ImpactCardProps {
  card: ImpactCardType;
  language?: 'en' | 'hi' | undefined;
}

function ExposureBar({
  label,
  value,
  widthPct,
  color,
}: {
  label: string;
  value: number;
  widthPct: number;
  color: string;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>{label}</span>
        <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
          {value.toFixed(1)} µg/m³·h
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(widthPct, 2)}%` }}
          role="presentation"
        />
      </div>
    </div>
  );
}

function MathDetail({
  card,
  isHi,
  detailsId,
}: {
  card: ImpactCardType;
  isHi: boolean;
  detailsId: string;
}) {
  return (
    <div
      id={detailsId}
      className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 p-3.5 text-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2 text-xs font-semibold text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <span>{isHi ? 'गणितीय सूत्र' : 'Mathematical Formula (ASHRAE / EPA)'}</span>
        <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-mono text-[10px] dark:bg-slate-800">
          Deterministic
        </span>
      </div>
      <p className="mt-2 overflow-x-auto rounded-lg bg-white p-2 font-mono text-xs text-sky-800 ring-1 ring-slate-200/60 dark:bg-slate-950 dark:text-sky-300 dark:ring-slate-800">
        {card.formula}
      </p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 dark:border-slate-700 dark:text-slate-400">
              <th className="pb-1.5 font-semibold">{isHi ? 'इनपुट पैरामीटर' : 'Input Parameter'}</th>
              <th className="pb-1.5 text-right font-semibold">{isHi ? 'मान' : 'Model Value'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-mono dark:divide-slate-800">
            {Object.entries(card.inputs).map(([key, val]) => (
              <tr key={key} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40">
                <td className="py-1 text-slate-700 dark:text-slate-300 font-sans">{key}</td>
                <td className="py-1 text-right text-slate-900 dark:text-slate-100 font-semibold">
                  {val}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SavedStats({ card, isHi }: { card: ImpactCardType; isHi: boolean }) {
  return (
    <div className="mt-3.5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      <div className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-2.5 dark:border-emerald-900/60 dark:bg-emerald-950/40">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300 text-sm">
          📉
        </span>
        <div>
          <p className="text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            {isHi ? 'कुल एक्सपोजर बचत' : 'Exposure Saved'}
          </p>
          <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
            {card.exposureSaved.toFixed(1)} µg/m³·h
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/60 p-2.5 dark:border-slate-800 dark:bg-slate-900/60">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-sm">
          🚬
        </span>
        <div>
          <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
            {isHi ? 'सिगरेट समतुल्य' : 'Cigarette Equiv. Saved'}
          </p>
          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {card.cigaretteEquivalentSaved.toFixed(2)}{' '}
            <span className="text-[10px] font-normal text-slate-400">
              ({isHi ? 'अनुमानित' : 'rough analogy'})
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

function RangeInfo({ card, isHi }: { card: ImpactCardType; isHi: boolean }) {
  return (
    <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
      <div className="flex items-center gap-2 font-mono text-[11px]">
        <span className="text-slate-400 font-sans">{isHi ? 'सीमा:' : 'Uncertainty Range:'}</span>
        <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
          [{card.range.low.toFixed(1)} – {card.range.high.toFixed(1)}] µg/m³·h
        </span>
      </div>
      <span className="text-[10px] text-slate-400 dark:text-slate-500">
        Source: {card.dataSourceLabel}
      </span>
    </div>
  );
}

function getPercentSaved(before: number, after: number): number {
  if (before <= 0) return 0;
  return Math.round(((before - after) / before) * 100);
}

function MathToggleButton({
  expanded,
  isHi,
  detailsId,
  onClick,
}: {
  expanded: boolean;
  isHi: boolean;
  detailsId: string;
  onClick: () => void;
}) {
  let label = 'Show the math';
  if (expanded) {
    label = isHi ? 'गणना छिपाएं' : 'Hide the math';
  } else if (isHi) {
    label = 'गणना दिखाएं';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-controls={detailsId}
      className="mt-3 inline-flex min-h-[44px] min-w-[44px] items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-sky-400 dark:hover:text-sky-300"
    >
      <span aria-hidden="true">{expanded ? '▲' : '▼'}</span>
      <span>{label}</span>
    </button>
  );
}

export default function ImpactCard({ card, language }: ImpactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isHi = language === 'hi';
  const detailsId = `math-${card.title.replace(/\s+/g, '-').toLowerCase()}`;

  const maxExposure = Math.max(card.beforeExposure, card.afterExposure, 1);
  const beforeWidth = Math.min((card.beforeExposure / maxExposure) * 100, 100);
  const afterWidth = Math.min((card.afterExposure / maxExposure) * 100, 100);
  const percentSaved = getPercentSaved(card.beforeExposure, card.afterExposure);

  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white/90 p-4 shadow-xs backdrop-blur-xs transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/70 dark:hover:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-base font-bold text-slate-900 dark:text-white">{card.title}</h4>
        {percentSaved > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            ↓ {percentSaved}% {isHi ? 'कम' : 'less exposure'}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2.5">
        <ExposureBar
          label={isHi ? 'पहले (बिना उपाय)' : 'Before (No Action)'}
          value={card.beforeExposure}
          widthPct={beforeWidth}
          color="bg-gradient-to-r from-rose-500 to-red-600"
        />
        <ExposureBar
          label={isHi ? 'बाद में (सुझाव के साथ)' : 'After (With Recommendation)'}
          value={card.afterExposure}
          widthPct={afterWidth}
          color="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
      </div>

      <SavedStats card={card} isHi={isHi} />
      <RangeInfo card={card} isHi={isHi} />

      <MathToggleButton
        expanded={expanded}
        isHi={isHi}
        detailsId={detailsId}
        onClick={() => setExpanded(!expanded)}
      />

      {expanded && <MathDetail card={card} isHi={isHi} detailsId={detailsId} />}
    </div>
  );
}
