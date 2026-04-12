import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate('/');
      } else {
        const { error } = await supabase.auth.signUp({ email: email.trim(), password });
        if (error) throw error;
        toast({ title: 'Account created', description: 'Check your email for verification.' });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Authentication failed';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Decorative scanlines */}
      <div className="fixed inset-0 scanline pointer-events-none" />

      <div className="w-full max-w-sm space-y-8 relative z-10">
        {/* Logo */}
        <div className="text-center space-y-3">
          <div className="inline-flex p-3 rounded-lg border border-primary/30 glow-cyan">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="font-mono text-xl font-bold tracking-wider uppercase text-primary">
            AI-IDS
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Intrusion Detection Command Center
          </p>
        </div>

        {/* Auth form */}
        <form onSubmit={handleSubmit} className="glass-panel rounded-lg p-6 space-y-4">
          <div className="flex rounded-md border border-border overflow-hidden mb-4">
            {(['Login', 'Register'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setIsLogin(tab === 'Login')}
                className={cn(
                  'flex-1 py-2 text-xs font-mono uppercase tracking-wider transition-colors',
                  (tab === 'Login') === isLogin
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground mb-1 block">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="operator@ids.mil"
                required
                maxLength={255}
                className="bg-background border-border font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-muted-foreground mb-1 block">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                maxLength={128}
                className="bg-background border-border font-mono text-sm"
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full font-mono uppercase tracking-wider">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLogin ? 'Authenticate' : 'Create Account'}
          </Button>
        </form>

        <p className="text-center text-[10px] font-mono text-muted-foreground">
          Secure Access · Encrypted Connection
        </p>
      </div>
    </div>
  );
}
