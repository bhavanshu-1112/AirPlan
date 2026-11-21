'use client';

import { useState, useRef, useCallback } from 'react';

interface PhotoUploadProps {
  onUpload: (file: File) => void;
  disabled?: boolean | undefined;
}

const MAX_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 1280;
const ACCEPTED = 'image/jpeg,image/png,image/webp';

export default function PhotoUpload({ onUpload, disabled }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const resizeAndUpload = useCallback(
    (file: File) => {
      setProcessing(true);
      setError(undefined);

      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setError('Could not process image');
          setProcessing(false);
          URL.revokeObjectURL(url);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (!blob) {
              setError('Could not process image');
              setProcessing(false);
              return;
            }
            const resized = new File([blob], file.name, { type: file.type });
            const previewUrl = URL.createObjectURL(resized);
            setPreview(previewUrl);
            setProcessing(false);
            onUpload(resized);
          },
          file.type,
          0.85,
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        setError('Could not read image file');
        setProcessing(false);
      };

      img.src = url;
    },
    [onUpload],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > MAX_SIZE) {
        setError('File exceeds maximum size of 5 MB');
        return;
      }

      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError('Only JPEG, PNG, and WebP files are accepted');
        return;
      }

      resizeAndUpload(file);
    },
    [resizeAndUpload],
  );

  // Quick sample photo generator for easy one-click testing
  const handleSampleClick = useCallback(() => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw stylized room background
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(0, 0, 640, 480);

      // Floor
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(0, 360, 640, 120);

      // Window with draft gaps
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(80, 60, 200, 240);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 60, 200, 240);
      ctx.strokeRect(80, 180, 200, 1);
      ctx.strokeRect(180, 60, 1, 240);

      // Air purifier in corner
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(360, 260, 70, 100);

      // Gas stove
      ctx.fillStyle = '#334155';
      ctx.fillRect(480, 280, 120, 80);

      // Label text
      ctx.fillStyle = '#1e293b';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Sample Living Room & Kitchen Audit', 40, 40);

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const sampleFile = new File([blob], 'sample-room-audit.jpg', { type: 'image/jpeg' });
          resizeAndUpload(sampleFile);
        },
        'image/jpeg',
        0.9,
      );
    } catch {
      // Fail gracefully
    }
  }, [resizeAndUpload]);

  return (
    <div className="space-y-4">
      {/* Sample photo button */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-blue-200/80 bg-blue-50/60 p-3 text-xs dark:border-blue-900/60 dark:bg-slate-900/60">
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          💡 No photo on hand? Test the vision analysis instantly:
        </span>
        <button
          type="button"
          onClick={handleSampleClick}
          disabled={disabled === true || processing}
          className="inline-flex min-h-[44px] items-center rounded-lg bg-blue-600 px-3.5 py-1.5 font-bold text-white shadow-2xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          ⚡ Load Sample Room Photo
        </button>
      </div>

      <div className="relative">
        <label
          htmlFor="photo-upload"
          className="flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 p-8 text-center backdrop-blur-xs transition-all hover:border-blue-500 hover:bg-blue-50/30 dark:border-slate-700 dark:bg-slate-900/60 dark:hover:border-blue-400 dark:hover:bg-slate-800/40"
        >
          <span
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-3xl shadow-xs dark:bg-sky-950"
            aria-hidden="true"
          >
            📸
          </span>
          <span className="mt-3 text-base font-bold text-slate-800 dark:text-slate-200">
            {processing ? 'Processing image...' : 'Click or drag room photo here'}
          </span>
          <span className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Take a photo showing your windows, kitchen stove, or air purifier position
          </span>
          <span
            id="photo-requirements"
            className="mt-2 inline-block rounded-md bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            JPEG, PNG, or WebP (max 5 MB)
          </span>
        </label>
        <input
          ref={inputRef}
          id="photo-upload"
          type="file"
          accept={ACCEPTED}
          onChange={handleChange}
          disabled={disabled === true || processing}
          aria-describedby="photo-requirements"
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>

      {error !== undefined && (
        <p
          role="alert"
          className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
        >
          ⚠️ {error}
        </p>
      )}

      {preview !== undefined && (
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
            Uploaded Room Image
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Room preview"
            className="max-h-72 w-full rounded-xl object-contain bg-slate-950/10"
          />
        </div>
      )}
    </div>
  );
}
