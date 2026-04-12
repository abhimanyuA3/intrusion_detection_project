import { useState, useEffect } from 'react';
import { Thermometer } from 'lucide-react';
import { useMode } from '@/context/ModeContext';
import { generateThermalGrid } from '@/data/mock/sensors';

function tempToColor(temp: number): string {
  const norm = Math.max(0, Math.min(1, (temp - 18) / 20));
  if (norm < 0.3) return `hsl(240, 80%, ${30 + norm * 60}%)`;
  if (norm < 0.6) return `hsl(${120 - (norm - 0.3) * 400}, 80%, 50%)`;
  return `hsl(${0}, ${80 + norm * 20}%, ${55 - norm * 15}%)`;
}

export function ThermalModule() {
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode('thermal');
  const [grid, setGrid] = useState(generateThermalGrid());

  useEffect(() => {
    if (mode !== 'demo') return;
    const interval = setInterval(() => {
      setGrid(generateThermalGrid());
    }, 2000);
    return () => clearInterval(interval);
  }, [mode]);

  if (mode === 'real') {
    return (
      <div className="glass-panel rounded-lg p-6 flex flex-col items-center justify-center min-h-[300px] gap-3">
        <Thermometer className="h-10 w-10 text-muted-foreground" />
        <p className="font-mono text-sm text-muted-foreground">Hardware Not Connected</p>
      </div>
    );
  }

  const maxTemp = Math.max(...grid.flat());
  const minTemp = Math.min(...grid.flat());

  return (
    <div className="glass-panel rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-xs uppercase tracking-wider text-primary">Thermal Imaging — Demo</h3>
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {minTemp.toFixed(1)}°C — {maxTemp.toFixed(1)}°C
        </span>
      </div>
      <div className="p-4 flex justify-center">
        <div className="grid grid-cols-8 gap-1">
          {grid.flat().map((temp, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-sm flex items-center justify-center text-[8px] font-mono"
              style={{ backgroundColor: tempToColor(temp), color: temp > 28 ? '#000' : '#fff' }}
              title={`${temp.toFixed(1)}°C`}
            >
              {temp.toFixed(0)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
