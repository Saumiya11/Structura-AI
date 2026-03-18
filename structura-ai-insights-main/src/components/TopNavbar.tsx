import { RefreshCw, Bell, ChevronDown } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

export function TopNavbar() {
  const { activeConnection, connections, setActiveConnection, syncNow, isSyncing, lastSynced, syncError } = useData();

  const timeSince = lastSynced
    ? Math.round((Date.now() - lastSynced.getTime()) / 60000)
    : null;
  const syncLabel = isSyncing ? 'Syncing...'
    : syncError ? 'Sync failed'
    : timeSince !== null ? `Last synced: ${timeSince < 1 ? 'just now' : `${timeSince} min ago`}`
    : 'Not synced';

  const statusDot = isSyncing ? 'bg-warning' : syncError ? 'bg-destructive' : lastSynced ? 'bg-success' : 'bg-muted-foreground';

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur flex items-center px-4 gap-4 shrink-0">
      {/* Department selector */}
      {connections.length > 0 && (
        <div className="relative group">
          <button className="flex items-center gap-2 text-xs text-foreground bg-muted/50 px-3 py-1.5 rounded-lg hover:bg-muted transition">
            <span className="font-medium">{activeConnection?.departmentName || 'Select'}</span>
            <ChevronDown className="w-3 h-3" />
          </button>
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[200px]">
            {connections.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveConnection(c.id)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/50 transition",
                  c.id === activeConnection?.id ? "text-accent" : "text-foreground"
                )}
              >
                {c.departmentName} — {c.cityRegion}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1" />

      {/* Sync */}
      <div className="flex items-center gap-2">
        <div className={cn("w-2 h-2 rounded-full", statusDot)} />
        <span className="text-[11px] text-muted-foreground">{syncLabel}</span>
        <button
          onClick={() => syncNow()}
          disabled={isSyncing}
          className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition"
        >
          <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
        </button>
      </div>

      {/* Alerts */}
      <button className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition relative">
        <Bell className="w-4 h-4" />
      </button>
    </header>
  );
}
