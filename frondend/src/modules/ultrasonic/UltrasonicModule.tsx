import { useState, useEffect } from 'react';
import { Radio } from 'lucide-react';
import { useMode } from '@/context/ModeContext';
import { generateUltrasonicReadings } from '@/data/mock/sensors';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export function UltrasonicModule() {
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode('ultrasonic');
  const [readings, setReadings] = useState(generateUltrasonicReadings());

  useEffect(() => {
    if (mode !== 'demo') return;
    const interval = setInterval(() => {
      setReadings(prev => {
        const newReading = {
          timestamp: new Date().toISOString(),
          value: 50 + Math.sin(Date.now() * 0.001) * 40 + Math.random() * 10,
          unit: 'cm',
          label: `T-0`,
        };
        return [...prev.slice(1), newReading].map((r, i) => ({ ...r, label: `T-${30 - i}` }));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [mode]);

  if (mode === 'real') {
    return (
      <div className="glass-panel rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Radio className="h-10 w-10 text-muted-foreground" />
        <p className="font-mono text-sm text-muted-foreground">Hardware Not Connected</p>
      </div>
    );
  }

  const currentDistance = readings[readings.length - 1]?.value.toFixed(1) ?? '—';

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-primary">Ultrasonic Distance — Demo</h3>
        </div>
        <span className="font-mono text-lg font-bold text-primary">{currentDistance} cm</span>
      </div>
      <div className="p-4 h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={readings}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 15% 18%)" />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'hsl(215 12% 55%)' }} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215 12% 55%)' }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: 'hsl(220 20% 10%)', border: '1px solid hsl(220 15% 18%)', fontFamily: 'JetBrains Mono', fontSize: 11 }}
              labelStyle={{ color: 'hsl(185 100% 50%)' }}
            />
            <Line type="monotone" dataKey="value" stroke="hsl(185, 100%, 50%)" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
