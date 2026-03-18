import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Map } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function HeatmapPage() {
  const { enrichedBridges } = useData();

  const stateData = useMemo(() => {
    const map: Record<string, { count: number; totalHealth: number; critical: number }> = {};
    enrichedBridges.forEach(b => {
      if (!b.State) return;
      if (!map[b.State]) map[b.State] = { count: 0, totalHealth: 0, critical: 0 };
      map[b.State].count++;
      map[b.State].totalHealth += b.Current_Health_Pct;
      if (b.riskStatus === 'CRITICAL') map[b.State].critical++;
    });
    return Object.entries(map).map(([state, data]) => ({
      state,
      count: data.count,
      avgHealth: Math.round(data.totalHealth / data.count),
      critical: data.critical,
    })).sort((a, b) => a.avgHealth - b.avgHealth);
  }, [enrichedBridges]);

  const getColor = (health: number) => {
    if (health < 40) return '#FF4444';
    if (health < 60) return '#FFB800';
    if (health < 75) return '#FF8C00';
    return '#00D084';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Map className="w-5 h-5 text-accent" /> India Risk Heatmap
        </h1>
        <p className="text-xs text-muted-foreground">State-wise infrastructure health from imported data</p>
      </div>

      {stateData.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Map className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Import bridge data with State column to see the heatmap</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">State-wise Average Health</h3>
            <ResponsiveContainer width="100%" height={stateData.length * 40 + 40}>
              <BarChart data={stateData} layout="vertical">
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#8892A4' }} />
                <YAxis type="category" dataKey="state" tick={{ fontSize: 10, fill: '#8892A4' }} width={120} />
                <Tooltip contentStyle={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="avgHealth" radius={[0, 4, 4, 0]}>
                  {stateData.map((entry, i) => <Cell key={i} fill={getColor(entry.avgHealth)} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Rankings */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">State Rankings</h3>
            <div className="space-y-2">
              {stateData.map((s, i) => (
                <div key={s.state} className="flex items-center justify-between py-2 border-b border-border/30 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-5">{i + 1}</span>
                    <span className="text-foreground font-medium">{s.state}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">{s.count} bridges</span>
                    <span className="font-medium" style={{ color: getColor(s.avgHealth) }}>{s.avgHealth}%</span>
                    {s.critical > 0 && <span className="text-destructive text-[10px]">{s.critical} critical</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* National Stats */}
      {stateData.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <div className="font-heading text-xl font-bold text-foreground">{stateData.length}</div>
            <div className="text-[10px] text-muted-foreground">States</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-heading text-xl font-bold text-foreground">{enrichedBridges.length}</div>
            <div className="text-[10px] text-muted-foreground">Total Bridges</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-heading text-xl font-bold text-foreground">
              {Math.round(enrichedBridges.reduce((s, b) => s + b.Current_Health_Pct, 0) / (enrichedBridges.length || 1))}%
            </div>
            <div className="text-[10px] text-muted-foreground">National Avg Health</div>
          </div>
          <div className="glass-card p-4 text-center">
            <div className="font-heading text-xl font-bold text-destructive">
              {enrichedBridges.filter(b => b.riskStatus === 'CRITICAL').length}
            </div>
            <div className="text-[10px] text-muted-foreground">Critical Nationwide</div>
          </div>
        </div>
      )}
    </div>
  );
}
