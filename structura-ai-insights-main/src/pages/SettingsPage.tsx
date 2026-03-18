import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Settings, Download, RefreshCw, Trash2, Link2, Database } from 'lucide-react';
import { downloadTemplate } from '@/lib/template';

export default function SettingsPage() {
  const { connections, removeConnection, syncNow, isSyncing, autoSync, setAutoSync } = useData();

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-5 h-5 text-accent" /> Settings
        </h1>
        <p className="text-xs text-muted-foreground">Manage connections and preferences</p>
      </div>

      {/* Connections */}
      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <Link2 className="w-4 h-4 text-accent" /> Google Sheet Connections
        </h3>
        {connections.length === 0 ? (
          <p className="text-xs text-muted-foreground">No connections configured</p>
        ) : (
          <div className="space-y-3">
            {connections.map(c => (
              <div key={c.id} className="bg-muted/20 rounded-lg p-4 text-xs flex items-center justify-between">
                <div>
                  <div className="text-foreground font-medium">{c.departmentName}</div>
                  <div className="text-muted-foreground">{c.cityRegion} • Connected {new Date(c.connectedAt).toLocaleDateString()}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => syncNow()} disabled={isSyncing}
                    className="p-2 hover:bg-muted/50 rounded-lg transition text-muted-foreground hover:text-foreground">
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  </button>
                  <button onClick={() => removeConnection(c.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Auto-sync */}
      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Sync Settings</h3>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-foreground">Auto-sync every 15 minutes</div>
            <div className="text-[10px] text-muted-foreground">Automatically fetch latest data from Google Sheets</div>
          </div>
          <button onClick={() => setAutoSync(!autoSync)}
            className={`w-10 h-5 rounded-full transition ${autoSync ? 'bg-accent' : 'bg-muted'}`}>
            <div className={`w-4 h-4 rounded-full bg-foreground transition-transform ${autoSync ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Template */}
      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4 flex items-center gap-2">
          <Database className="w-4 h-4 text-accent" /> Template & Data
        </h3>
        <button onClick={downloadTemplate}
          className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-xs text-foreground hover:bg-muted/50 transition">
          <Download className="w-4 h-4 text-accent" /> Download STRUCTURA AI Template
        </button>
        <p className="text-[10px] text-muted-foreground mt-2">
          Pre-formatted .xlsx with 4 sheets: BRIDGE_MASTER, INSPECTION_HISTORY, CITIZEN_REPORTS, CONTRACTOR_DATA
        </p>
      </div>
    </div>
  );
}
