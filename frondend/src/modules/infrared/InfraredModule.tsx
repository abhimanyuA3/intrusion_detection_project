import { useState, useEffect } from 'react';
import { Eye } from 'lucide-react';
import { useMode } from '@/context/ModeContext';
import { cn } from '@/lib/utils';
import { usePiSensor } from '@/hooks/usePiSensor';

/** Simulated IR detection zones */
function generateIrZones() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `ir-zone-${i}`,
    name: `Zone ${String.fromCharCode(65 + i)}`,
    intensity: Math.random() * 100,
    detected: Math.random() > 0.6,
  }));
}

export function InfraredModule() {
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode('infrared');
  const [zones, setZones] = useState(generateIrZones());
  
  const { status, error, isRealMode } = usePiSensor('infrared');

  useEffect(() => {
    if (isRealMode) {
      setZones([{
        id: 'real-ir',
        name: 'Pi IR Sensor',
        intensity: status.object_close ? 100 : 0,
        detected: status.object_close,
      }]);
    }
  }, [isRealMode, status.object_close]);

  useEffect(() => {
    if (mode !== 'demo') return;
    const interval = setInterval(() => setZones(generateIrZones()), 2500);
    return () => clearInterval(interval);
  }, [mode]);

  if (mode === 'real' && error) {
    return (
      <div className="glass-panel rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Eye className="h-10 w-10 text-muted-foreground" />
        <p className="font-mono text-sm text-muted-foreground">Hardware Not Connected</p>
        <p className="text-xs text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-xs uppercase tracking-wider text-primary">
          Infrared Detection — {mode === 'real' ? 'Live' : 'Demo'}
        </h3>
        {mode === 'real' && !error && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Connected
          </span>
        )}
      </div>
      <div className="p-4 grid grid-cols-3 gap-3">
        {zones.map(zone => (
          <div
            key={zone.id}
            className={cn(
              'glass-panel rounded-md p-3 text-center transition-all',
              zone.detected && 'border-destructive/50 glow-red'
            )}
          >
            <p className="font-mono text-xs text-muted-foreground">{zone.name}</p>
            <p className={cn(
              'font-mono text-lg font-bold mt-1',
              zone.detected ? 'text-destructive' : 'text-foreground'
            )}>
              {zone.intensity.toFixed(0)}%
            </p>
            <p className={cn(
              'text-[10px] font-mono uppercase mt-1',
              zone.detected ? 'text-destructive' : 'text-success'
            )}>
              {zone.detected ? 'DETECTED' : 'CLEAR'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
