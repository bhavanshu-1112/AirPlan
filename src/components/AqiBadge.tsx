interface BadgeConfig {
  readonly label: string;
  readonly icon: string;
  readonly className: string;
}

const CATEGORY_MAP: ReadonlyMap<string, BadgeConfig> = new Map<string, BadgeConfig>([
  [
    'good',
    {
      label: 'Good',
      icon: '✓',
      className:
        'bg-emerald-50 text-emerald-800 border-2 border-solid border-emerald-500 shadow-sm dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-500/80',
    },
  ],
  [
    'moderate',
    {
      label: 'Moderate',
      icon: '⚠',
      className:
        'bg-amber-50 text-amber-900 border-2 border-dashed border-amber-500 shadow-sm dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-500/80',
    },
  ],
  [
    'unhealthy for sensitive groups',
    {
      label: 'Unhealthy for Sensitive Groups',
      icon: '△',
      className:
        'bg-orange-50 text-orange-950 border-2 border-dotted border-orange-500 shadow-sm dark:bg-orange-950/70 dark:text-orange-200 dark:border-orange-500/80',
    },
  ],
  [
    'unhealthy',
    {
      label: 'Unhealthy',
      icon: '✕',
      className:
        'bg-red-50 text-red-950 border-2 border-solid ring-1 ring-red-400 border-red-600 shadow-sm dark:bg-red-950/70 dark:text-red-200 dark:border-red-500/80',
    },
  ],
  [
    'very unhealthy',
    {
      label: 'Very Unhealthy',
      icon: '⊗',
      className:
        'bg-purple-50 text-purple-950 border-2 border-solid ring-2 ring-purple-400 border-purple-600 shadow-sm dark:bg-purple-950/70 dark:text-purple-200 dark:border-purple-400',
    },
  ],
  [
    'hazardous',
    {
      label: 'Hazardous',
      icon: '☠',
      className:
        'bg-[#7e0023] text-white border-2 border-solid ring-2 ring-rose-500 border-rose-900 shadow-sm dark:bg-[#7e0023] dark:text-white dark:border-rose-400 dark:ring-rose-300',
    },
  ],
]);

const UNKNOWN_CONFIG: BadgeConfig = {
  label: 'Unknown',
  icon: '?',
  className:
    'bg-gray-100 text-gray-800 border border-dashed border-gray-400 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600',
};

function getBadgeConfig(band: string): BadgeConfig {
  const normalized = band.trim().toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ');
  const directMatch = CATEGORY_MAP.get(normalized);
  if (directMatch !== undefined) {
    return directMatch;
  }

  // Priority check for substring matches (handles "Very Unhealthy (AQI 250–300)", etc.)
  const priorityKeys = [
    'hazardous',
    'very unhealthy',
    'unhealthy for sensitive groups',
    'unhealthy',
    'moderate',
    'good',
  ];
  for (const key of priorityKeys) {
    if (normalized.includes(key)) {
      const config = CATEGORY_MAP.get(key);
      if (config) {
        return {
          ...config,
          label: band.trim(),
        };
      }
    }
  }

  const fallbackLabel = band.trim() || UNKNOWN_CONFIG.label;
  return {
    label: fallbackLabel,
    icon: UNKNOWN_CONFIG.icon,
    className: UNKNOWN_CONFIG.className,
  };
}

export interface AqiBadgeProps {
  band: string;
  className?: string | undefined;
}

export function AqiBadge({ band, className }: AqiBadgeProps) {
  const { label, icon, className: styleClasses } = getBadgeConfig(band);
  const baseClasses = `inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-sm font-semibold tracking-wide ${styleClasses}`;
  const fullClassName = className !== undefined ? `${baseClasses} ${className}` : baseClasses;

  return (
    <span className={fullClassName} aria-label={label}>
      <span aria-hidden="true" className="select-none font-bold text-base">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
}

export default AqiBadge;
