import type { JSX } from 'react';

const DEFAULT_LOADING_TEXT = 'Loading...';
const DEFAULT_BAR_COUNT = 4;
const MIN_BAR_COUNT = 1;

const SKELETON_BAR_WIDTHS = ['w-3/4', 'w-full', 'w-5/6', 'w-2/3'] as const;

export interface LoadingSkeletonProps {
  readonly className?: string | undefined;
  readonly text?: string | undefined;
  readonly lines?: number | undefined;
}

export function LoadingSkeleton({
  className,
  text = DEFAULT_LOADING_TEXT,
  lines = DEFAULT_BAR_COUNT,
}: LoadingSkeletonProps = {}): JSX.Element {
  const barCount = typeof lines === 'number' && lines >= MIN_BAR_COUNT ? lines : DEFAULT_BAR_COUNT;

  const bars = Array.from({ length: barCount }, (_, index) => {
    const widthIndex = index % SKELETON_BAR_WIDTHS.length;
    // eslint-disable-next-line security/detect-object-injection
    return SKELETON_BAR_WIDTHS[widthIndex] ?? 'w-full';
  });

  const containerClassName = className ? `w-full space-y-3 ${className}` : 'w-full space-y-3';

  return (
    <div role="status" aria-busy="true" className={containerClassName}>
      <span className="sr-only">{text}</span>
      {bars.map((widthClass, index) => (
        <div
          key={index}
          className={`h-4 rounded-md bg-gray-200 animate-pulse motion-reduce:animate-none dark:bg-gray-700 ${widthClass}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default LoadingSkeleton;
