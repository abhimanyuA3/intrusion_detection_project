import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SystemMode, SensorType, ModeOverride } from '@/types/sensor';

interface ModeContextType {
  globalMode: SystemMode;
  setGlobalMode: (mode: SystemMode) => void;
  toggleGlobalMode: () => void;
  overrides: ModeOverride[];
  setModuleMode: (sensorId: SensorType, mode: SystemMode) => void;
  clearOverride: (sensorId: SensorType) => void;
  getEffectiveMode: (sensorId: SensorType) => SystemMode;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [globalMode, setGlobalMode] = useState<SystemMode>('demo');
  const [overrides, setOverrides] = useState<ModeOverride[]>([]);

  const toggleGlobalMode = useCallback(() => {
    setGlobalMode(prev => (prev === 'demo' ? 'real' : 'demo'));
  }, []);

  const setModuleMode = useCallback((sensorId: SensorType, mode: SystemMode) => {
    setOverrides(prev => {
      const filtered = prev.filter(o => o.sensorId !== sensorId);
      return [...filtered, { sensorId, mode }];
    });
  }, []);

  const clearOverride = useCallback((sensorId: SensorType) => {
    setOverrides(prev => prev.filter(o => o.sensorId !== sensorId));
  }, []);

  const getEffectiveMode = useCallback((sensorId: SensorType): SystemMode => {
    const override = overrides.find(o => o.sensorId === sensorId);
    return override ? override.mode : globalMode;
  }, [overrides, globalMode]);

  return (
    <ModeContext.Provider value={{
      globalMode,
      setGlobalMode,
      toggleGlobalMode,
      overrides,
      setModuleMode,
      clearOverride,
      getEffectiveMode,
    }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (!context) throw new Error('useMode must be used within ModeProvider');
  return context;
}
