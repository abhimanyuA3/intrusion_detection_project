import { useMemo } from 'react';
import { sensorModules, generateMockAlerts } from '@/data/mock/sensors';
import { SensorCard } from '@/components/dashboard/SensorCard';
import { AlertLog } from '@/components/dashboard/AlertLog';
import { SystemHealth } from '@/components/dashboard/SystemHealth';

export default function Dashboard() {
  const alerts = useMemo(() => generateMockAlerts(), []);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="font-mono text-lg font-bold tracking-wider uppercase text-primary">
          Dashboard
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Real-time sensor overview and alert monitoring
        </p>
      </div>

      {/* Grid: sensor cards + system health */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {sensorModules.map(sensor => (
              <SensorCard key={sensor.id} sensor={sensor} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <SystemHealth />
        </div>
      </div>

      {/* Alert log */}
      <AlertLog alerts={alerts} />
    </div>
  );
}
