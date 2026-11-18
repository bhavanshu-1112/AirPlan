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

  return (
    <div className="space-y-3">
      <div className="relative">
        <label
          htmlFor="photo-upload"
          className="flex min-h-[120px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 text-center hover:border-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:hover:border-blue-400"
        >
          <span className="text-3xl" aria-hidden="true">
            📸
          </span>
          <span className="mt-2 text-sm font-medium">
            {processing ? 'Processing...' : 'Click or drag to upload a room photo'}
          </span>
          <span id="photo-requirements" className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            JPEG, PNG, or WebP, max 5 MB
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
        <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
          ⚠ {error}
        </p>
      )}

      {preview !== undefined && (
        <div className="mt-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Room preview"
            className="max-h-64 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      )}
    </div>
  );
}
