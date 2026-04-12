import { sensorModules } from '@/data/mock/sensors';
import { StatusIndicator } from './StatusIndicator';
import { useMode } from '@/context/ModeContext';

export function SystemHealth() {
  const { globalMode } = useMode();
  const onlineCount = sensorModules.filter(s => s.status === 'online').length;

  return (
    <div className="glass-panel rounded-lg p-4">
      <h2 className="font-mono text-xs uppercase tracking-wider text-primary mb-4">
        System Health
      </h2>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <p className="text-2xl font-mono font-bold text-foreground">{onlineCount}/{sensorModules.length}</p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">Sensors Online</p>
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-mono font-bold text-foreground uppercase">
            <span className={globalMode === 'demo' ? 'text-warning' : 'text-success'}>{globalMode}</span>
          </p>
          <p className="text-[10px] font-mono uppercase text-muted-foreground">System Mode</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {sensorModules.map(sensor => (
          <div key={sensor.id} className="flex items-center justify-between text-xs font-mono">
            <span className="text-muted-foreground">{sensor.name}</span>
            <StatusIndicator status={sensor.status} />
          </div>
        ))}
      </div>
    </div>
  );
}
