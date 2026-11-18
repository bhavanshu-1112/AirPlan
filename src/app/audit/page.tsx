'use client';

import { useState, useCallback } from 'react';
import PhotoUpload from '@/components/PhotoUpload';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface AuditFinding {
  category: string;
  observation: string;
  confidence: number;
  suggestedFix: string;
}

const categoryIcons: Record<string, string> = {
  ventilation: '🪟',
  source: '🔥',
  purifier: '💨',
  general: '📋',
};

const categoryLabels: Record<string, string> = {
  ventilation: 'Ventilation',
  source: 'Pollution Source',
  purifier: 'Air Purifier',
  general: 'General',
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
    <div className="space-y-6">
      <section aria-labelledby="audit-heading">
        <h1 id="audit-heading" className="text-2xl font-bold sm:text-3xl">
          Indoor Air Quality Audit
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          Upload a photo of your room to identify air quality risks — ventilation issues, pollution
          sources, and purifier placement.
        </p>
      </section>

      <PhotoUpload onUpload={handleUpload} disabled={loading} />

      {loading && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            📸 Analyzing room photo...
          </p>
          <LoadingSkeleton />
        </div>
      )}

      {error !== undefined && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-700 dark:bg-red-900/20 dark:text-red-400"
        >
          ⚠ {error}
        </div>
      )}

      {findings !== undefined && (
        <section aria-labelledby="findings-heading">
          <h2 id="findings-heading" className="text-xl font-bold">
            Audit Findings
          </h2>
          {findings.length === 0 ? (
            <p className="mt-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700 dark:border-green-800 dark:bg-green-900/20 dark:text-green-300">
              ✓ No air quality risks detected in this photo.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {findings.map((finding, idx) => (
                <div
                  key={idx}
                  className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
                >
                  <div className="flex items-center gap-2">
                    <span aria-hidden="true">{categoryIcons[finding.category] ?? '📋'}</span>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium dark:bg-gray-800">
                      {categoryLabels[finding.category] ?? finding.category}
                    </span>
                  </div>
                  <p className="mt-2 text-sm">{finding.observation}</p>

                  {/* Confidence bar */}
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Confidence</span>
                      <span>{Math.round(finding.confidence * 100)}%</span>
                    </div>
                    <div className="mt-1 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${finding.confidence * 100}%` }}
                        role="presentation"
                      />
                    </div>
                  </div>

                  <div className="mt-2 rounded border border-blue-100 bg-blue-50 p-2 text-sm dark:border-blue-800 dark:bg-blue-900/20">
                    <span className="font-medium">Suggested fix: </span>
                    {finding.suggestedFix}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
