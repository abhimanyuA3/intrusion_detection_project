import { Shield, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/layout/ModeToggle';

export function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <header className="h-14 border-b border-border glass-panel flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-3">
        <Shield className="h-6 w-6 text-primary" />
        <h1 className="text-sm font-mono font-semibold tracking-wider uppercase text-primary">
          AI-IDS Command Center
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <ModeToggle />
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
