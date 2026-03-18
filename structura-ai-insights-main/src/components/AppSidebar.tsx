import { NavLink as RRNavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, Radio, Map, Calculator,
  Zap, HardHat, MessageSquare, Bot, Settings, Link2, RefreshCw
} from 'lucide-react';
import { useData } from '@/context/DataContext';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/bridges', label: 'Bridge Registry', icon: Building2 },
  { path: '/citizen', label: 'Citizen Reports', icon: Users },
  { path: '/iot', label: 'Live IoT Sensors', icon: Radio },
  { path: '/heatmap', label: 'India Heatmap', icon: Map },
  { path: '/cost-calculator', label: 'Cost Calculator', icon: Calculator },
  { path: '/simulator', label: 'Disaster Simulator', icon: Zap },
  { path: '/contractors', label: 'Contractor Tracker', icon: HardHat },
  { path: '/whatsapp', label: 'WhatsApp Alerts', icon: MessageSquare },
  { path: '/structurabot', label: 'StructuraBot', icon: Bot },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const location = useLocation();
  const { activeConnection, syncNow, isSyncing } = useData();

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border z-40 flex flex-col transition-all duration-300",
      collapsed ? "w-16" : "w-60"
    )}>
      {/* Logo */}
      <div className="p-4 flex items-center gap-2 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Building2 className="w-4 h-4 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <h1 className="font-heading font-bold text-sm text-foreground leading-tight">STRUCTURA AI</h1>
            <p className="text-[10px] text-muted-foreground">Predicting failures. Saving lives.</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {navItems.map(item => {
          const active = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <RRNavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs mb-0.5 transition-colors",
                active
                  ? "bg-primary/10 text-primary font-medium border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </RRNavLink>
          );
        })}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-3 border-t border-sidebar-border space-y-2">
          {activeConnection && (
            <>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Link2 className="w-3 h-3" />
                <span className="truncate">{activeConnection.departmentName}</span>
              </div>
              <button
                onClick={() => syncNow()}
                disabled={isSyncing}
                className="flex items-center gap-2 text-[10px] text-accent hover:text-accent/80 transition-colors"
              >
                <RefreshCw className={cn("w-3 h-3", isSyncing && "animate-spin")} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </button>
            </>
          )}
        </div>
      )}

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
      >
        {collapsed ? '›' : '‹'}
      </button>
    </aside>
  );
}
