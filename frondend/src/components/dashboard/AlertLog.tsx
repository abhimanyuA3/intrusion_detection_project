import { cn } from '@/lib/utils';
import type { AlertEntry } from '@/types/sensor';

const severityStyles: Record<AlertEntry['severity'], string> = {
  low: 'text-muted-foreground bg-muted',
  medium: 'text-warning bg-warning/10',
  high: 'text-destructive bg-destructive/10',
  critical: 'text-destructive bg-destructive/20 font-semibold',
};

interface AlertLogProps {
  alerts: AlertEntry[];
}

export function AlertLog({ alerts }: AlertLogProps) {
  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h2 className="font-mono text-xs uppercase tracking-wider text-primary">
          Alert Log
        </h2>
      </div>
      <div className="max-h-[300px] overflow-auto">
        {alerts.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground font-mono">No alerts.</p>
        ) : (
          <div className="divide-y divide-border">
            {alerts.map(alert => (
              <div key={alert.id} className="px-4 py-2 flex items-center gap-3 text-xs font-mono">
                <span className={cn('px-1.5 py-0.5 rounded text-[10px] uppercase', severityStyles[alert.severity])}>
                  {alert.severity}
                </span>
                <span className="text-muted-foreground flex-shrink-0">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-foreground truncate">{alert.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
