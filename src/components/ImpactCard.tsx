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
    <div>
      <div className="flex items-center justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono">{value.toFixed(1)} µg/m³·h</span>
      </div>
      <div className="mt-1 h-3 w-full rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-3 rounded-full ${color}`}
          style={{ width: `${widthPct}%` }}
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
      className="mt-2 rounded border border-gray-100 bg-gray-50 p-3 text-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <p className="font-mono text-xs">{card.formula}</p>
      <table className="mt-2 w-full text-xs">
        <thead>
          <tr>
            <th className="text-left font-medium">{isHi ? 'इनपुट' : 'Input'}</th>
            <th className="text-right font-medium">{isHi ? 'मान' : 'Value'}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(card.inputs).map(([key, val]) => (
            <tr key={key} className="border-t border-gray-200 dark:border-gray-700">
              <td className="py-1">{key}</td>
              <td className="py-1 text-right font-mono">{val}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SavedStats({ card, isHi }: { card: ImpactCardType; isHi: boolean }) {
  return (
    <div className="mt-3 flex flex-wrap gap-4 text-sm">
      <div>
        <span className="text-gray-500 dark:text-gray-400">{isHi ? 'बचत' : 'Saved'}: </span>
        <span className="font-bold text-green-700 dark:text-green-400">
          {card.exposureSaved.toFixed(1)} µg/m³·h
        </span>
      </div>
      <div>
        <span className="text-gray-500 dark:text-gray-400">
          🚬 {isHi ? 'सिगरेट समतुल्य' : 'Cigarette equiv.'}{' '}
        </span>
        <span className="font-bold">{card.cigaretteEquivalentSaved.toFixed(2)}</span>
        <span className="ml-1 text-xs italic text-gray-400">
          ({isHi ? 'अनुमानित तुलना' : 'rough analogy'})
        </span>
      </div>
    </div>
  );
}

function RangeInfo({ card, isHi }: { card: ImpactCardType; isHi: boolean }) {
  return (
    <>
      <div className="mt-2 flex gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span>
          {isHi ? 'न्यूनतम' : 'Low'}: {card.range.low.toFixed(1)}
        </span>
        <span>
          {isHi ? 'केंद्रीय' : 'Central'}: {card.range.central.toFixed(1)}
        </span>
        <span>
          {isHi ? 'अधिकतम' : 'High'}: {card.range.high.toFixed(1)}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-400">{card.dataSourceLabel}</p>
    </>
  );
}

export default function ImpactCard({ card, language }: ImpactCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isHi = language === 'hi';
  const detailsId = `math-${card.title.replace(/\s+/g, '-').toLowerCase()}`;

  const maxExposure = Math.max(card.beforeExposure, card.afterExposure, 1);
  const beforeWidth = Math.min((card.beforeExposure / maxExposure) * 100, 100);
  const afterWidth = Math.min((card.afterExposure / maxExposure) * 100, 100);

  return (
    <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
      <h4 className="text-base font-semibold">{card.title}</h4>
      <div className="mt-3 space-y-2">
        <ExposureBar
          label={isHi ? 'पहले' : 'Before'}
          value={card.beforeExposure}
          widthPct={beforeWidth}
          color="bg-red-500"
        />
        <ExposureBar
          label={isHi ? 'बाद में' : 'After'}
          value={card.afterExposure}
          widthPct={afterWidth}
          color="bg-green-500"
        />
      </div>
      <SavedStats card={card} isHi={isHi} />
      <RangeInfo card={card} isHi={isHi} />
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-controls={detailsId}
        className="mt-3 min-h-[44px] min-w-[44px] text-sm font-medium text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-blue-400"
      >
        {expanded ? (isHi ? 'गणना छिपाएं' : 'Hide the math') : isHi ? 'गणना दिखाएं' : 'Show the math'}
      </button>
      {expanded && <MathDetail card={card} isHi={isHi} detailsId={detailsId} />}
    </div>
  );
}
