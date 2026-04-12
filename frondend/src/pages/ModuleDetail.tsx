import { useParams, Navigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { sensorModules } from '@/data/mock/sensors';
import { useMode } from '@/context/ModeContext';
import { CameraFeed } from '@/modules/camera/CameraFeed';
import { PirModule } from '@/modules/pir/PirModule';
import { UltrasonicModule } from '@/modules/ultrasonic/UltrasonicModule';
import { WifiCsiModule } from '@/modules/wifi-csi/WifiCsiModule';
import { ThermalModule } from '@/modules/thermal/ThermalModule';
import { InfraredModule } from '@/modules/infrared/InfraredModule';
import type { SensorType } from '@/types/sensor';
import { cn } from '@/lib/utils';

const moduleComponents: Record<SensorType, React.ComponentType> = {
  camera: CameraFeed,
  pir: PirModule,
  ultrasonic: UltrasonicModule,
  'wifi-csi': WifiCsiModule,
  thermal: ThermalModule,
  infrared: InfraredModule,
};

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { getEffectiveMode, setModuleMode, clearOverride, globalMode } = useMode();

  const sensor = sensorModules.find(s => s.id === moduleId);
  if (!sensor) return <Navigate to="/" replace />;

  const ModuleComponent = moduleComponents[sensor.id];
  const effectiveMode = getEffectiveMode(sensor.id);
  const hasOverride = effectiveMode !== globalMode;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-mono text-lg font-bold tracking-wider uppercase text-primary">
              {sensor.name}
            </h1>
            <p className="text-xs text-muted-foreground font-mono">{sensor.description}</p>
          </div>
        </div>

        {/* Per-module mode override */}
        <div className="flex items-center gap-2">
          {hasOverride && (
            <button
              onClick={() => clearOverride(sensor.id)}
              className="text-[10px] font-mono text-muted-foreground hover:text-foreground underline"
            >
              Reset to global
            </button>
          )}
          <div className="flex rounded-md border border-border overflow-hidden">
            {(['demo', 'real'] as const).map(m => (
              <button
                key={m}
                onClick={() => setModuleMode(sensor.id, m)}
                className={cn(
                  'px-3 py-1 text-xs font-mono uppercase transition-colors',
                  effectiveMode === m
                    ? m === 'demo' ? 'bg-warning/20 text-warning' : 'bg-success/20 text-success'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Module content */}
      <ModuleComponent />
    </div>
  );
}
