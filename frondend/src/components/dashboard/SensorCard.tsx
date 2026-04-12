import { useNavigate } from 'react-router-dom';
import { Camera, Activity, Radio, Wifi, Thermometer, Eye, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusIndicator } from './StatusIndicator';
import { useMode } from '@/context/ModeContext';
import type { SensorModule, SensorType } from '@/types/sensor';

const iconMap: Record<string, LucideIcon> = {
  Camera, Activity, Radio, Wifi, Thermometer, Eye,
};

interface SensorCardProps {
  sensor: SensorModule;
}

export function SensorCard({ sensor }: SensorCardProps) {
  const navigate = useNavigate();
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode(sensor.id);
  const Icon = iconMap[sensor.icon] || Camera;

  return (
    <button
      onClick={() => navigate(`/module/${sensor.id}`)}
      className={cn(
        'glass-panel rounded-lg p-4 text-left transition-all hover:border-primary/40 hover:glow-cyan group',
        'flex flex-col gap-3'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-md bg-muted">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-[10px] font-mono uppercase px-1.5 py-0.5 rounded',
            mode === 'demo' ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
          )}>
            {mode}
          </span>
          <StatusIndicator status={sensor.status} />
        </div>
      </div>

      <div>
        <h3 className="font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
          {sensor.name}
        </h3>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {sensor.description}
        </p>
      </div>

      <div className="text-[10px] font-mono text-muted-foreground mt-auto">
        Last update: {new Date(sensor.lastUpdate).toLocaleTimeString()}
      </div>
    </button>
  );
}
