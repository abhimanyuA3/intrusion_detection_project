import { useState, useEffect } from 'react';
import { useMode } from '@/context/ModeContext';

export interface PiStatus {
  motion: boolean;
  object_close: boolean;
  human_detected: boolean;
}

export function usePiSensor(sensorId?: string) {
  const { getEffectiveMode } = useMode();
  
  // If sensorId is provided, check its mode. Otherwise default to global check.
  const mode = sensorId ? getEffectiveMode(sensorId as any) : 'real';

  const [status, setStatus] = useState<PiStatus>({
    motion: false,
    object_close: false,
    human_detected: false,
  });
  
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'real') return;

    let mounted = true;
    
    const fetchStatus = async () => {
      const piHost = import.meta.env.VITE_PI_HOST || 'http://localhost:5000';
      
      try {
        const res = await fetch(`${piHost}/status`, {
          // ensure short timeout so frontend doesn't hang forever
          signal: AbortSignal.timeout(2000)
        });
        
        if (!res.ok) throw new Error('API Error');
        
        const data = await res.json();
        if (mounted) {
          setStatus(data);
          setError(null);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.name === 'TimeoutError' ? 'Connection Timeout' : 'Offline');
        }
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 1 second
    const interval = setInterval(fetchStatus, 1000);
    
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [mode]);

  return { status, error, isRealMode: mode === 'real' };
}
