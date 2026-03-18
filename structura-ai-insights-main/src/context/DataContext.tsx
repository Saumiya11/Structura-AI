import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { AppData, SheetConnection, BridgeWithRisk } from '@/types/bridge';
import { fetchSheetData } from '@/lib/sheets';
import { enrichBridges } from '@/lib/calculations';

interface DataContextType {
  data: AppData;
  enrichedBridges: BridgeWithRisk[];
  connections: SheetConnection[];
  activeConnection: SheetConnection | null;
  isConnected: boolean;
  isSyncing: boolean;
  lastSynced: Date | null;
  syncError: string | null;
  autoSync: boolean;
  setAutoSync: (v: boolean) => void;
  addConnection: (conn: Omit<SheetConnection, 'id' | 'connectedAt' | 'lastSynced'>) => Promise<AppData>;
  removeConnection: (id: string) => void;
  setActiveConnection: (id: string) => void;
  syncNow: () => Promise<void>;
}

const emptyData: AppData = { bridges: [], inspections: [], citizenReports: [], contractors: [] };

const DataContext = createContext<DataContextType>({
  data: emptyData,
  enrichedBridges: [],
  connections: [],
  activeConnection: null,
  isConnected: false,
  isSyncing: false,
  lastSynced: null,
  syncError: null,
  autoSync: true,
  setAutoSync: () => {},
  addConnection: async () => emptyData,
  removeConnection: () => {},
  setActiveConnection: () => {},
  syncNow: async () => {},
});

export const useData = () => useContext(DataContext);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(emptyData);
  const [connections, setConnections] = useState<SheetConnection[]>(() => {
    try { return JSON.parse(localStorage.getItem('structura_connections') || '[]'); }
    catch { return []; }
  });
  const [activeId, setActiveId] = useState<string>(() => localStorage.getItem('structura_active') || '');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const activeConnection = connections.find(c => c.id === activeId) || null;
  const isConnected = !!activeConnection;

  const enrichedBridges = React.useMemo(
    () => enrichBridges(data.bridges, data.inspections, data.citizenReports),
    [data.bridges, data.inspections, data.citizenReports]
  );

  const persistConnections = useCallback((conns: SheetConnection[]) => {
    localStorage.setItem('structura_connections', JSON.stringify(conns));
  }, []);

  const doSync = useCallback(async (url: string) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const result = await fetchSheetData(url);
      setData(result);
      setLastSynced(new Date());
      return result;
    } catch (e: any) {
      setSyncError(e.message || 'Sync failed');
      throw e;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!activeConnection) return;
    await doSync(activeConnection.url);
    const updated = connections.map(c =>
      c.id === activeConnection.id ? { ...c, lastSynced: new Date().toISOString() } : c
    );
    setConnections(updated);
    persistConnections(updated);
  }, [activeConnection, connections, doSync, persistConnections]);

  const addConnection = useCallback(async (conn: Omit<SheetConnection, 'id' | 'connectedAt' | 'lastSynced'>) => {
    const result = await doSync(conn.url);
    const newConn: SheetConnection = {
      ...conn,
      id: Date.now().toString(),
      connectedAt: new Date().toISOString(),
      lastSynced: new Date().toISOString(),
    };
    const updated = [...connections, newConn];
    setConnections(updated);
    setActiveId(newConn.id);
    persistConnections(updated);
    localStorage.setItem('structura_active', newConn.id);
    return result;
  }, [connections, doSync, persistConnections]);

  const removeConnection = useCallback((id: string) => {
    const updated = connections.filter(c => c.id !== id);
    setConnections(updated);
    persistConnections(updated);
    if (activeId === id) {
      const newActive = updated[0]?.id || '';
      setActiveId(newActive);
      localStorage.setItem('structura_active', newActive);
      if (!newActive) setData(emptyData);
    }
  }, [connections, activeId, persistConnections]);

  const setActiveConnectionFn = useCallback((id: string) => {
    setActiveId(id);
    localStorage.setItem('structura_active', id);
    const conn = connections.find(c => c.id === id);
    if (conn) doSync(conn.url);
  }, [connections, doSync]);

  // Auto-sync
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (autoSync && activeConnection) {
      intervalRef.current = setInterval(() => { doSync(activeConnection.url); }, 15 * 60 * 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [autoSync, activeConnection, doSync]);

  // Initial load
  useEffect(() => {
    if (activeConnection) doSync(activeConnection.url);
  }, [activeId]); // eslint-disable-line

  return (
    <DataContext.Provider value={{
      data, enrichedBridges, connections, activeConnection, isConnected, isSyncing,
      lastSynced, syncError, autoSync, setAutoSync,
      addConnection, removeConnection, setActiveConnection: setActiveConnectionFn, syncNow,
    }}>
      {children}
    </DataContext.Provider>
  );
}
