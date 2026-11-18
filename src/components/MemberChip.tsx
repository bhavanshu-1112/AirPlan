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

export function MemberChip({
  name,
  ageGroup,
  sensitivity,
  className,
}: MemberChipProps) {
  const ageIcon = getAgeGroupIcon(ageGroup);
  const showAlert = hasSensitivityAlert(sensitivity);

  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200';
  const combinedClasses = className ? `${baseClasses} ${className}` : baseClasses;

  return (
    <span className={combinedClasses}>
      <span aria-hidden="true">{ageIcon}</span>
      <span>{name}</span>
      {showAlert && (
        <span
          className="text-amber-600 dark:text-amber-400"
          title={`Sensitivity: ${sensitivity}`}
          aria-label={`Sensitivity: ${sensitivity}`}
        >
          ⚠
        </span>
      )}
    </span>
  );
}

export default MemberChip;
