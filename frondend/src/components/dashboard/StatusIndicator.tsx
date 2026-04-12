import { cn } from '@/lib/utils';
import type { SensorStatus } from '@/types/sensor';

const statusStyles: Record<SensorStatus, string> = {
  online: 'bg-success',
  offline: 'bg-muted-foreground',
  warning: 'bg-warning',
  error: 'bg-destructive',
};

interface StatusIndicatorProps {
  status: SensorStatus;
  pulse?: boolean;
  className?: string;
}

export function StatusIndicator({ status, pulse = true, className }: StatusIndicatorProps) {
  return (
    <span className={cn('relative flex h-2.5 w-2.5', className)}>
      {pulse && status === 'online' && (
        <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', statusStyles[status])} />
      )}
      <span className={cn('relative inline-flex h-2.5 w-2.5 rounded-full', statusStyles[status])} />
    </span>
  );
}
