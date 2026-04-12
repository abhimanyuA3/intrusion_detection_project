/** Sensor module types for the IDS platform */

export type SensorType = 'camera' | 'wifi-csi' | 'thermal' | 'infrared' | 'ultrasonic' | 'pir';

export type SystemMode = 'real' | 'demo';

export type SensorStatus = 'online' | 'offline' | 'warning' | 'error';

export interface SensorModule {
  id: SensorType;
  name: string;
  description: string;
  icon: string;
  status: SensorStatus;
  mode: SystemMode;
  lastUpdate: string;
  isAvailable: boolean;
}

export interface AlertEntry {
  id: string;
  timestamp: string;
  sensorId: SensorType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
}

export interface SensorReading {
  timestamp: string;
  value: number;
  unit: string;
  label: string;
}

export interface ModeOverride {
  sensorId: SensorType;
  mode: SystemMode;
}
