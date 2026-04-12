import type { SensorModule, AlertEntry, SensorReading } from '@/types/sensor';

/** Default sensor module definitions */
export const sensorModules: SensorModule[] = [
  {
    id: 'camera',
    name: 'Camera',
    description: 'Visual surveillance feed with motion detection',
    icon: 'Camera',
    status: 'online',
    mode: 'demo',
    lastUpdate: new Date().toISOString(),
    isAvailable: true,
  },
  {
    id: 'pir',
    name: 'PIR Motion',
    description: 'Passive infrared motion detection sensor',
    icon: 'Activity',
    status: 'online',
    mode: 'demo',
    lastUpdate: new Date().toISOString(),
    isAvailable: true,
  },
  {
    id: 'ultrasonic',
    name: 'Ultrasonic',
    description: 'Distance measurement and proximity detection',
    icon: 'Radio',
    status: 'online',
    mode: 'demo',
    lastUpdate: new Date().toISOString(),
    isAvailable: true,
  },
  {
    id: 'wifi-csi',
    name: 'Wi-Fi CSI',
    description: 'Channel state information for presence detection',
    icon: 'Wifi',
    status: 'online',
    mode: 'demo',
    lastUpdate: new Date().toISOString(),
    isAvailable: true,
  },
  {
    id: 'thermal',
    name: 'Thermal',
    description: 'Thermal imaging for heat signature detection',
    icon: 'Thermometer',
    status: 'online',
    mode: 'demo',
    lastUpdate: new Date().toISOString(),
    isAvailable: true,
  },
  {
    id: 'infrared',
    name: 'Infrared',
    description: 'Night vision infrared camera feed',
    icon: 'Eye',
    status: 'online',
    mode: 'demo',
    lastUpdate: new Date().toISOString(),
    isAvailable: true,
  },
];

/** Generate mock alerts */
export function generateMockAlerts(count = 10): AlertEntry[] {
  const severities: AlertEntry['severity'][] = ['low', 'medium', 'high', 'critical'];
  const sensorIds = sensorModules.map(s => s.id);
  const messages = [
    'Motion detected in Zone A',
    'Unusual heat signature detected',
    'Distance threshold breached',
    'Wi-Fi CSI anomaly detected',
    'PIR sensor triggered',
    'Infrared camera: movement detected',
    'Multiple sensor correlation alert',
    'Perimeter breach attempt',
    'Sensor calibration drift detected',
    'Signal interference detected',
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: `alert-${i}`,
    timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
    sensorId: sensorIds[Math.floor(Math.random() * sensorIds.length)],
    severity: severities[Math.floor(Math.random() * severities.length)],
    message: messages[i % messages.length],
  })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

/** Generate mock sensor readings for charts */
export function generateMockReadings(count = 20): SensorReading[] {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 3000).toISOString(),
    value: Math.random() * 100,
    unit: '%',
    label: `T-${count - i}`,
  }));
}

/** Generate ultrasonic distance readings */
export function generateUltrasonicReadings(count = 30): SensorReading[] {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 2000).toISOString(),
    value: 50 + Math.sin(i * 0.3) * 40 + Math.random() * 10,
    unit: 'cm',
    label: `T-${count - i}`,
  }));
}

/** Generate thermal grid data (8x8 grid like AMG8833) */
export function generateThermalGrid(): number[][] {
  return Array.from({ length: 8 }, () =>
    Array.from({ length: 8 }, () => 20 + Math.random() * 15)
  );
}

/** Generate PIR motion events */
export function generatePirEvents(count = 15): { timestamp: string; triggered: boolean; zone: string }[] {
  const zones = ['Zone A', 'Zone B', 'Zone C', 'Hallway', 'Entrance'];
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(Date.now() - (count - i) * 5000).toISOString(),
    triggered: Math.random() > 0.6,
    zone: zones[Math.floor(Math.random() * zones.length)],
  }));
}
