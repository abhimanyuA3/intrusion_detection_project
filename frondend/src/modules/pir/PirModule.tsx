import { useState, useEffect, useRef } from 'react';
import { Activity } from 'lucide-react';
import { useMode } from '@/context/ModeContext';
import { generatePirEvents } from '@/data/mock/sensors';
import { cn } from '@/lib/utils';
import { usePiSensor } from '@/hooks/usePiSensor';

export function PirModule() {
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode('pir');
  const [events, setEvents] = useState(generatePirEvents());
  
  const { status, error, isRealMode } = usePiSensor('pir');
  const prevMotionRef = useRef(false);

  useEffect(() => {
    if (isRealMode) {
      if (status.motion !== prevMotionRef.current) {
        prevMotionRef.current = status.motion;
        setEvents(prev => {
          const newEvent = {
            timestamp: new Date().toISOString(),
            triggered: status.motion,
            zone: 'Pi Node',
          };
          return [newEvent, ...prev.slice(0, 14)];
        });
      }
    }
  }, [isRealMode, status.motion]);

  useEffect(() => {
    if (mode !== 'demo') return;
    const interval = setInterval(() => {
      setEvents(prev => {
        const newEvent = {
          timestamp: new Date().toISOString(),
          triggered: Math.random() > 0.5,
          zone: ['Zone A', 'Zone B', 'Zone C', 'Hallway', 'Entrance'][Math.floor(Math.random() * 5)],
        };
        return [newEvent, ...prev.slice(0, 14)];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [mode]);

  if (mode === 'real' && error) {
    return (
      <div className="glass-panel rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Activity className="h-10 w-10 text-muted-foreground" />
        <p className="font-mono text-sm text-muted-foreground">Hardware Not Connected</p>
        <p className="text-xs text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center gap-2">
        <Activity className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-xs uppercase tracking-wider text-primary">
          PIR Motion Events — {mode === 'real' ? 'Live' : 'Demo'}
        </h3>
        {mode === 'real' && !error && (
          <span className="ml-auto flex items-center gap-1 text-[10px] text-success">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Connected
          </span>
        )}
      </div>
      <div className="max-h-[400px] overflow-auto divide-y divide-border">
        {events.map((event, i) => (
          <div key={i} className="px-4 py-2 flex items-center gap-3 text-xs font-mono">
            <span className={cn(
              'h-2 w-2 rounded-full flex-shrink-0',
              event.triggered ? 'bg-destructive animate-pulse-glow' : 'bg-muted-foreground'
            )} />
            <span className="text-muted-foreground flex-shrink-0">
              {new Date(event.timestamp).toLocaleTimeString()}
            </span>
            <span className="text-foreground">{event.zone}</span>
            <span className={event.triggered ? 'text-destructive' : 'text-muted-foreground'}>
              {event.triggered ? 'TRIGGERED' : 'CLEAR'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
