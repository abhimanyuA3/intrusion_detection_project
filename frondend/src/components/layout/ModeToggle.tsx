import { useMode } from '@/context/ModeContext';

export function ModeToggle() {
  const { globalMode, toggleGlobalMode } = useMode();
  const isDemo = globalMode === 'demo';

  return (
    <button
      onClick={toggleGlobalMode}
      className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-border font-mono text-xs uppercase tracking-wider transition-all hover:border-primary/50"
    >
      <span className={`h-2 w-2 rounded-full ${isDemo ? 'bg-warning animate-pulse-glow' : 'bg-success'}`} />
      <span className="text-muted-foreground">Mode:</span>
      <span className={isDemo ? 'text-warning' : 'text-success'}>
        {globalMode}
      </span>
    </button>
  );
}
