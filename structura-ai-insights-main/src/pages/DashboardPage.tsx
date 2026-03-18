import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { getRiskStatusColor } from '@/lib/calculations';
import { Building2, AlertTriangle, Activity, Clock, Link2, Download, Search, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useState, useMemo } from 'react';

const COLORS = { CRITICAL: '#FF4444', HIGH: '#FFB800', MODERATE: '#FF8C00', ROUTINE: '#00D084' };

export default function DashboardPage() {
  const { enrichedBridges, data, isConnected } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const criticalCount = enrichedBridges.filter(b => b.riskStatus === 'CRITICAL').length;
  const avgHealth = enrichedBridges.length > 0
    ? Math.round(enrichedBridges.reduce((s, b) => s + b.Current_Health_Pct, 0) / enrichedBridges.length)
    : 0;
  const overdueCount = enrichedBridges.filter(b => {
    if (!b.Last_Inspection_Date) return true;
    return (Date.now() - new Date(b.Last_Inspection_Date).getTime()) > 180 * 24 * 60 * 60 * 1000;
  }).length;

  const filtered = useMemo(() => {
    let list = [...enrichedBridges].sort((a, b) => b.riskScore - a.riskScore);
    if (statusFilter !== 'ALL') list = list.filter(b => b.riskStatus === statusFilter);
    if (search) list = list.filter(b =>
      b.Bridge_Name.toLowerCase().includes(search.toLowerCase()) ||
      b.Bridge_ID.toLowerCase().includes(search.toLowerCase()) ||
      b.City.toLowerCase().includes(search.toLowerCase())
    );
    return list;
  }, [enrichedBridges, statusFilter, search]);

  const statusDist = useMemo(() => {
    const map: Record<string, number> = { CRITICAL: 0, HIGH: 0, MODERATE: 0, ROUTINE: 0 };
    enrichedBridges.forEach(b => map[b.riskStatus]++);
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [enrichedBridges]);

  const topRisk = useMemo(() =>
    [...enrichedBridges].sort((a, b) => b.riskScore - a.riskScore).slice(0, 8).map(b => ({
      name: b.Bridge_ID,
      score: b.riskScore,
      fill: COLORS[b.riskStatus],
    }))
  , [enrichedBridges]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">No data connected yet</h2>
        <p className="text-sm text-muted-foreground mb-6">Connect your Google Sheet to get started</p>
        <div className="flex gap-3">
          <Link to="/connect" className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition flex items-center gap-2">
            <Link2 className="w-4 h-4" /> Connect Sheet
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Command Center</h1>
        <p className="text-xs text-muted-foreground">Real-time infrastructure health overview</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Bridges', value: enrichedBridges.length, icon: Building2, accent: 'text-accent' },
          { label: 'Critical Alerts', value: criticalCount, icon: AlertTriangle, accent: 'text-destructive' },
          { label: 'Avg Health', value: `${avgHealth}%`, icon: Activity, accent: avgHealth > 60 ? 'text-success' : 'text-warning' },
          { label: 'Inspections Overdue', value: overdueCount, icon: Clock, accent: 'text-warning' },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{kpi.label}</span>
              <kpi.icon className={`w-4 h-4 ${kpi.accent}`} />
            </div>
            <div className={`font-heading text-3xl font-bold ${kpi.accent}`}>{kpi.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 lg:col-span-2">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Risk Scores — Top Bridges</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topRisk}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#8892A4' }} />
              <YAxis tick={{ fontSize: 10, fill: '#8892A4' }} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="score" radius={[4, 4, 0, 0]}>
                {topRisk.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                {statusDist.map((entry, i) => <Cell key={i} fill={COLORS[entry.name as keyof typeof COLORS]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 justify-center">
            {statusDist.map(s => (
              <div key={s.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[s.name as keyof typeof COLORS] }} />
                {s.name}: {s.value}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Priority Table */}
      <div className="glass-card p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h3 className="font-heading font-semibold text-sm text-foreground">Priority Matrix</h3>
          <div className="flex gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search bridges..."
                className="pl-8 pr-3 py-1.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-48"
              />
            </div>
            {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'ROUTINE'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition ${
                  statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground text-left border-b border-border">
                <th className="pb-2 font-medium">ID</th>
                <th className="pb-2 font-medium">Name</th>
                <th className="pb-2 font-medium">City</th>
                <th className="pb-2 font-medium">Risk</th>
                <th className="pb-2 font-medium">Status</th>
                <th className="pb-2 font-medium">Health</th>
                <th className="pb-2 font-medium">Last Inspection</th>
                <th className="pb-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 20).map((b, i) => (
                <tr key={b.Bridge_ID} className="border-b border-border/30 hover:bg-muted/20 transition">
                  <td className="py-2.5 font-mono text-accent">{b.Bridge_ID}</td>
                  <td className="py-2.5 text-foreground font-medium">{b.Bridge_Name}</td>
                  <td className="py-2.5 text-muted-foreground">{b.City}</td>
                  <td className="py-2.5 font-bold" style={{ color: COLORS[b.riskStatus] }}>{b.riskScore}</td>
                  <td className="py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getRiskStatusColor(b.riskStatus)}`}>
                      {b.riskStatus}
                    </span>
                  </td>
                  <td className="py-2.5 text-foreground">{b.Current_Health_Pct}%</td>
                  <td className="py-2.5 text-muted-foreground">{b.Last_Inspection_Date || '—'}</td>
                  <td className="py-2.5">
                    <Link to={`/bridge/${b.Bridge_ID}`} className="text-accent hover:text-accent/80 transition">
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">No bridges match your filters</div>
          )}
        </div>
      </div>
    </div>
  );
}
