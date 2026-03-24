import { Badge } from '@databricks/appkit-ui/react';

const severityStyles: Record<string, string> = {
  ERROR: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  WARN: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  INFO: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  UNKNOWN: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function SeverityBadge({ severity, count }: { severity: string; count?: number }) {
  const style = severityStyles[severity] ?? severityStyles.UNKNOWN;
  return (
    <Badge variant="outline" className={`${style} border-0 text-xs font-medium`}>
      {severity}{count != null ? ` (${count})` : ''}
    </Badge>
  );
}
