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
        'bg-green-100 text-green-900 border-2 border-solid border-green-600 dark:bg-green-950 dark:text-green-200 dark:border-green-400',
    },
  ],
  [
    'moderate',
    {
      label: 'Moderate',
      icon: '⚠',
      className:
        'bg-yellow-100 text-yellow-950 border-2 border-dashed border-yellow-600 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-400',
    },
  ],
  [
    'unhealthy for sensitive groups',
    {
      label: 'Unhealthy for Sensitive Groups',
      icon: '△',
      className:
        'bg-orange-100 text-orange-950 border-2 border-dotted border-orange-600 dark:bg-orange-950 dark:text-orange-200 dark:border-orange-400',
    },
  ],
  [
    'unhealthy',
    {
      label: 'Unhealthy',
      icon: '✕',
      className:
        'bg-red-100 text-red-950 border-4 border-double border-red-600 dark:bg-red-950 dark:text-red-200 dark:border-red-400',
    },
  ],
  [
    'very unhealthy',
    {
      label: 'Very Unhealthy',
      icon: '⊗',
      className:
        'bg-purple-100 text-purple-950 border-2 border-dashed ring-2 ring-purple-500 border-purple-600 dark:bg-purple-950 dark:text-purple-200 dark:border-purple-400 dark:ring-purple-400',
    },
  ],
  [
    'hazardous',
    {
      label: 'Hazardous',
      icon: '☠',
      className:
        'bg-[#7e0023] text-white border-4 border-solid ring-2 ring-rose-900 border-[#4d0015] dark:bg-[#7e0023] dark:text-white dark:border-rose-400 dark:ring-rose-300',
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
  const matched = CATEGORY_MAP.get(normalized);
  if (matched !== undefined) {
    return matched;
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
  const baseClasses = `inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold ${styleClasses}`;
  const fullClassName = className !== undefined ? `${baseClasses} ${className}` : baseClasses;

  return (
    <span className={fullClassName} aria-label={label}>
      <span aria-hidden="true" className="select-none font-bold">
        {icon}
      </span>
      <span>{label}</span>
    </span>
  );
}

export default AqiBadge;
