'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import PhotoUpload from '@/components/PhotoUpload';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface AuditFinding {
  category: string;
  observation: string;
  confidence: number;
  suggestedFix: string;
  paramAdjustment?: Record<string, unknown> | undefined;
}

const categoryIcons: Record<string, string> = {
  ventilation: '🪟',
  source: '🔥',
  purifier: '💨',
  general: '📋',
};

const categoryLabels: Record<string, string> = {
  ventilation: 'Ventilation & Infiltration',
  source: 'Indoor Emission Source',
  purifier: 'Purifier Placement',
  general: 'General Room Layout',
};

export default function AuditPage() {
  const [findings, setFindings] = useState<AuditFinding[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError(undefined);
    setFindings(undefined);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/audit', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = (await res.json()) as { error?: { message?: string } };
        throw new Error(errData.error?.message ?? `HTTP ${res.status}`);
      }

      const data = (await res.json()) as { findings: AuditFinding[] };
      setFindings(data.findings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="space-y-10">
      <section aria-labelledby="audit-heading" className="space-y-2">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300">
          <span>🔍 Computer Vision Audit</span>
          <span>·</span>
          <span>Indoor Vulnerability Detection</span>
        </div>
        <h1
          id="audit-heading"
          className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl dark:text-white"
        >
          Indoor Air Quality Audit
        </h1>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300">
          Upload a photo of your room to identify air quality risks — ventilation issues, pollution
          sources, and purifier placement.
        </p>
      </section>

      <PhotoUpload onUpload={handleUpload} disabled={loading} />

      {loading && (
        <div className="space-y-3 rounded-2xl border border-slate-200/90 bg-white/80 p-6 shadow-xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/60">
          <p className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
              aria-hidden="true"
            />
            <span>Analyzing room architecture and air filtration bottlenecks...</span>
          </p>
          <LoadingSkeleton lines={4} />
        </div>
      )}

      {error !== undefined && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-300 bg-rose-50/90 p-4 text-sm font-medium text-rose-800 shadow-xs dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        >
          ⚠️ {error}
        </div>
      )}

      {findings !== undefined && (
        <section aria-labelledby="findings-heading" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                ✓
              </span>
              <h2
                id="findings-heading"
                className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-white"
              >
                Audit Findings
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {findings.length} Detected Factor{findings.length === 1 ? '' : 's'}
            </span>
          </div>

          {findings.length === 0 ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-5 text-sm font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-300">
              ✓ No air quality risks detected in this photo.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {findings.map((finding, idx) => {
                const icon = categoryIcons[finding.category] ?? '📋';
                const label = categoryLabels[finding.category] ?? finding.category;
                const confPercent = Math.round(finding.confidence * 100);

                return (
                  <div
                    key={idx}
                    className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-xs backdrop-blur-xs transition-all hover:border-slate-300 dark:border-slate-800/90 dark:bg-slate-900/60 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-900 dark:text-white">
                          <span aria-hidden="true" className="text-lg">
                            {icon}
                          </span>
                          <span>{label}</span>
                        </span>
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                          {confPercent}% confidence
                        </span>
                      </div>

                      <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                        {finding.observation}
                      </p>

                      <div className="mt-3.5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/30">
                        <p className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                          <span>🛠️</span>
                          <span>Suggested Fix:</span>
                        </p>
                        <p className="mt-1 font-medium text-emerald-900 dark:text-emerald-200">
                          {finding.suggestedFix}
                        </p>
                      </div>

                      {finding.paramAdjustment && (
                        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          <span className="font-sans font-semibold">Model adjustment:</span>
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 dark:bg-slate-800">
                            {JSON.stringify(finding.paramAdjustment).replace(/[{}\"]/g, '')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-center">
            <Link
              href="/setup"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <span>Update Household Profile with Findings</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
