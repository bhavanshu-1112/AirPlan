export interface MemberChipProps {
  name: string;
  ageGroup: string;
  sensitivity: string;
  className?: string | undefined;
}

function getAgeGroupIcon(ageGroup: string): string {
  const normalized = ageGroup.trim().toLowerCase();
  switch (normalized) {
    case 'infant':
    case 'baby':
      return '👶';
    case 'child':
    case 'kid':
      return '🧒';
    case 'adult':
      return '👤';
    case 'elderly':
    case 'elder':
    case 'senior':
      return '👴';
    default:
      return '👤';
  }
}

function hasSensitivityAlert(sensitivity: string): boolean {
  const normalized = sensitivity.trim().toLowerCase();
  return (
    normalized === 'asthma' ||
    normalized === 'heart-condition' ||
    normalized === 'heartcondition' ||
    normalized === 'heart condition' ||
    normalized === 'heart_condition'
  );
}

export function MemberChip({ name, ageGroup, sensitivity, className }: MemberChipProps) {
  const ageIcon = getAgeGroupIcon(ageGroup);
  const showAlert = hasSensitivityAlert(sensitivity);

  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-sm font-medium text-slate-800 shadow-xs transition-colors dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <span className={combinedClasses}>
      <span aria-hidden="true" className="text-base">
        {ageIcon}
      </span>
      <span className="font-semibold text-slate-900 dark:text-slate-100">{name}</span>
      {showAlert && (
        <span
          className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
          title={`Sensitivity: ${sensitivity}`}
          aria-label={`Sensitivity: ${sensitivity}`}
        >
          <span aria-hidden="true">⚠</span>
          <span>Alert</span>
        </span>
      )}
    </span>
  );
}

export default MemberChip;
