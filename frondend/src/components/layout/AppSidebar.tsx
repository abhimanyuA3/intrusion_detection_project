import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Camera, Activity, Radio, Wifi, Thermometer, Eye, Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/module/camera', icon: Camera, label: 'Camera' },
  { to: '/module/pir', icon: Activity, label: 'PIR Motion' },
  { to: '/module/ultrasonic', icon: Radio, label: 'Ultrasonic' },
  { to: '/module/wifi-csi', icon: Wifi, label: 'Wi-Fi CSI' },
  { to: '/module/thermal', icon: Thermometer, label: 'Thermal' },
  { to: '/module/infrared', icon: Eye, label: 'Infrared' },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-border bg-sidebar">
      <div className="p-4 border-b border-border">
        <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Sensor Modules
        </p>
      </div>

      <nav className="flex-1 p-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono transition-all',
                isActive
                  ? 'bg-accent text-primary glow-cyan'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border">
        <NavLink
          to="/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
