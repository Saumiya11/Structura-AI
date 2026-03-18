import { Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { getRiskStatusColor } from '@/lib/calculations';
import { Search, ChevronRight, Building2 } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function BridgeRegistryPage() {
  const { enrichedBridges, isConnected } = useData();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return enrichedBridges;
    return enrichedBridges.filter(b =>
      b.Bridge_Name.toLowerCase().includes(search.toLowerCase()) ||
      b.Bridge_ID.toLowerCase().includes(search.toLowerCase()) ||
      b.City.toLowerCase().includes(search.toLowerCase()) ||
      b.State.toLowerCase().includes(search.toLowerCase())
    );
  }, [enrichedBridges, search]);

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Building2 className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">Connect a Google Sheet to view bridges</p>
        <Link to="/connect" className="text-accent text-sm mt-2">Connect Sheet →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Bridge Registry</h1>
          <p className="text-xs text-muted-foreground">{enrichedBridges.length} bridges imported</p>
        </div>
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            className="pl-8 pr-3 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-56" />
        </div>
      </div>
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(b => (
          <Link key={b.Bridge_ID} to={`/bridge/${b.Bridge_ID}`} className="glass-card-hover p-5 block">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-heading font-semibold text-sm text-foreground">{b.Bridge_Name}</h3>
                <p className="text-[10px] text-muted-foreground">{b.Bridge_ID} • {b.City}, {b.State}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${getRiskStatusColor(b.riskStatus)}`}>{b.riskStatus}</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-[10px]">
              <div><span className="text-muted-foreground">Health</span><div className="text-foreground font-medium">{b.Current_Health_Pct}%</div></div>
              <div><span className="text-muted-foreground">Risk</span><div className="font-medium" style={{ color: b.riskScore >= 80 ? '#FF4444' : b.riskScore >= 60 ? '#FFB800' : '#00D084' }}>{b.riskScore}</div></div>
              <div><span className="text-muted-foreground">Age</span><div className="text-foreground font-medium">{new Date().getFullYear() - b.Year_Built} yrs</div></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
