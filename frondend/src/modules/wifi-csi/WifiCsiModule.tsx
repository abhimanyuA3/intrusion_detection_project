import { useState, useEffect } from 'react';
import { Wifi, Heart, Wind, Activity } from 'lucide-react';
import { useMode } from '@/context/ModeContext';
import { Canvas } from '@react-three/fiber';
import { RuViewScene } from './RuViewScene';

export function WifiCsiModule() {
  const { getEffectiveMode } = useMode();
  const mode = getEffectiveMode('wifi-csi');
  
  // Real-time bouncing demo metrics
  const [metrics, setMetrics] = useState({
    heartRate: 121,
    respiration: 24,
    confidence: 80,
    rssi: -38,
    variance: 2.60,
    motion: 0.132
  });

  useEffect(() => {
    if (mode !== 'demo') return;
    const interval = setInterval(() => {
      setMetrics(prev => ({
        heartRate: prev.heartRate + (Math.floor(Math.random() * 5) - 2),
        respiration: prev.respiration + (Math.floor(Math.random() * 3) - 1),
        confidence: Math.min(100, Math.max(60, prev.confidence + (Math.floor(Math.random() * 5) - 2))),
        rssi: prev.rssi + (Math.random() * 4 - 2),
        variance: Math.max(0.5, prev.variance + (Math.random() * 0.4 - 0.2)),
        motion: Math.max(0.01, prev.motion + (Math.random() * 0.04 - 0.02))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [mode]);

  if (mode === 'real') {
    return (
      <div className="glass-panel rounded-lg p-6 flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Wifi className="h-10 w-10 text-muted-foreground" />
        <p className="font-mono text-sm text-muted-foreground">Hardware Not Connected</p>
      </div>
    );
  }

  // Demo RuView UI
  return (
    <div className="relative w-full h-[600px] bg-[#050510] rounded-lg overflow-hidden border border-[#1e293b] shadow-inner font-sans">
      
      {/* Top Left Branding Overlay */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="text-[#4ade80]">π</span> RuView
        </h2>
        <p className="text-[#94a3b8] text-[10px] font-mono tracking-[0.2em] uppercase mt-1 opacity-70">
          WIFI DENSEPOSE SENSING OBSERVATORY
        </p>
      </div>

      {/* Main 3D Canvas rendering the scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 8, 15], fov: 45 }}>
          <RuViewScene />
        </Canvas>
      </div>

      {/* VITAL SIGNS panel (Left) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 w-[220px] bg-[#0a0f1c]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 z-10 flex flex-col gap-6 shadow-2xl">
        <h3 className="text-[#94a3b8] text-[10px] font-mono tracking-[0.15em] font-semibold uppercase mb-1">
          Vital Signs
        </h3>
        
        {/* Heart Rate */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#ef4444]">
            <Heart className="w-[14px] h-[14px] fill-current animate-pulse" />
            <span className="text-[10px] tracking-wide font-mono text-[#94a3b8] font-semibold">HEART RATE</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-[#ef4444] font-mono tracking-tighter">{metrics.heartRate}</span>
            <span className="text-[10px] text-[#94a3b8] tracking-widest uppercase">BPM</span>
          </div>
          <div className="h-[2px] w-full bg-[#1e293b] mt-1 relative rounded overflow-hidden">
             <div className="absolute inset-y-0 left-0 bg-[#ef4444] rounded transition-all duration-1000" style={{ width: '85%' }} />
          </div>
        </div>

        {/* Respiration */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[#14b8a6]">
            <Wind className="w-[14px] h-[14px]" />
            <span className="text-[10px] tracking-wide font-mono text-[#94a3b8] font-semibold">RESPIRATION</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-3xl font-bold text-[#14b8a6] font-mono tracking-tighter">{metrics.respiration}</span>
            <span className="text-[10px] text-[#94a3b8] tracking-widest uppercase">RPM</span>
          </div>
          <div className="h-[2px] w-full bg-[#1e293b] mt-1 relative rounded overflow-hidden">
             <div className="absolute inset-y-0 left-0 bg-[#14b8a6] rounded transition-all duration-1000" style={{ width: '60%' }} />
          </div>
        </div>
        
        {/* Confidence */}
        <div className="flex flex-col gap-1 mt-2">
          <div className="flex items-center gap-2 text-[#eab308]">
            <Activity className="w-[14px] h-[14px]" />
            <span className="text-[10px] tracking-wide font-mono text-[#94a3b8] font-semibold">CONFIDENCE</span>
          </div>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-4xl font-bold text-[#4ade80] font-mono tracking-tighter">{metrics.confidence}</span>
            <span className="text-sm font-bold text-[#4ade80]">%</span>
          </div>
          <div className="h-1 w-full bg-[#1e293b] mt-1 rounded overflow-hidden">
             <div className="h-full bg-[#4ade80] rounded transition-all duration-1000" style={{ width: `${metrics.confidence}%` }} />
          </div>
        </div>
      </div>

      {/* WIFI SIGNAL panel (Right) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[220px] bg-[#0a0f1c]/80 backdrop-blur-md border border-[#1e293b] rounded-xl p-5 z-10 shadow-2xl">
        <h3 className="text-[#94a3b8] text-[10px] font-mono tracking-[0.15em] font-semibold uppercase mb-4">
          WIFI SIGNAL
        </h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-[11px] font-mono tracking-wide">
            <span className="text-[#64748b]">RSSI</span>
            <span className="text-[#3b82f6] font-bold">{metrics.rssi.toFixed(0)} dBm</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono tracking-wide">
            <span className="text-[#64748b]">Variance</span>
            <span className="text-[#3b82f6] font-bold">{metrics.variance.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono tracking-wide">
            <span className="text-[#64748b]">Motion</span>
            <span className="text-[#3b82f6] font-bold">{metrics.motion.toFixed(3)}</span>
          </div>
          <div className="flex justify-between items-center text-[11px] font-mono tracking-wide">
            <span className="text-[#64748b]">Persons</span>
            <div className="flex items-center gap-2">
              <span className="text-[#3b82f6] font-bold">1</span>
              <div className="flex gap-1 ml-1">
                <div className="h-[4px] w-[4px] bg-[#4ade80] rounded-full"></div>
                <div className="h-[4px] w-[4px] bg-[#334155] rounded-full"></div>
                <div className="h-[4px] w-[4px] bg-[#334155] rounded-full"></div>
                <div className="h-[4px] w-[4px] bg-[#334155] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[#1e293b] pt-4">
          <h3 className="text-[#94a3b8] text-[10px] font-mono tracking-[0.15em] font-semibold uppercase mb-3">
            PRESENCE
          </h3>
          <div className="w-full bg-[#111827] border border-[#22c55e]/20 rounded p-2.5 flex justify-center items-center">
             <span className="text-[#4ade80] font-mono font-bold tracking-widest text-[11px]">PRESENT</span>
          </div>
        </div>
      </div>
      
      {/* Bottom Toggles */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        <button className="px-3 py-1 rounded-full border border-[#f59e0b] text-[#f59e0b] bg-[#f59e0b]/5 text-[9px] font-mono font-semibold tracking-widest transition-all hover:bg-[#f59e0b]/20">
          GESTURE
        </button>
        <button className="px-3 py-1 rounded-full border border-[#10b981] text-[#10b981] bg-[#10b981]/10 text-[9px] font-mono font-semibold tracking-widest transition-all hover:bg-[#10b981]/20">
          GAIT
        </button>
      </div>

      {/* Top right buttons (Demo / Settings) */}
      <div className="absolute top-6 right-6 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 bg-[#022c22] border border-[#064e3b] px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-[#4ade80]" />
          <span className="text-[#4ade80] text-[10px] font-mono font-bold tracking-widest">DEMO</span>
        </div>
      </div>
    </div>
  );
}
