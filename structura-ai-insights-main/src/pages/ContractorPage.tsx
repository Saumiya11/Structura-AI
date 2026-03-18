import { useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { HardHat, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function ContractorPage() {
  const { data, enrichedBridges } = useData();
  const contractors = data.contractors;

  const stages = ['Tender', 'Assigned', 'In Progress', 'Completed'];
  const grouped = useMemo(() => {
    const map: Record<string, typeof contractors> = {};
    stages.forEach(s => map[s] = []);
    contractors.forEach(c => {
      const stage = stages.includes(c.Stage) ? c.Stage : 'In Progress';
      map[stage].push(c);
    });
    return map;
  }, [contractors]);

  const slaBreaches = contractors.filter(c => {
    if (!c.SLA_Deadline) return false;
    return new Date() > new Date(c.SLA_Deadline) && c.Stage !== 'Completed';
  });

  if (contractors.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <HardHat className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground text-sm">No contractor data found</p>
        <p className="text-xs text-muted-foreground mt-1">Add entries to the CONTRACTOR_DATA sheet tab</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground">Contractor Tracker</h1>
          <p className="text-xs text-muted-foreground">{contractors.length} contractor entries • {slaBreaches.length} SLA breaches</p>
        </div>
      </div>

      {/* Kanban */}
      <div className="grid md:grid-cols-4 gap-4">
        {stages.map(stage => (
          <div key={stage} className="glass-card p-4">
            <h3 className="font-heading font-semibold text-xs text-foreground mb-3 flex items-center justify-between">
              {stage}
              <span className="bg-muted/50 px-2 py-0.5 rounded-full text-[10px] text-muted-foreground">{grouped[stage].length}</span>
            </h3>
            <div className="space-y-2">
              {grouped[stage].map((c, i) => {
                const bridge = enrichedBridges.find(b => b.Bridge_ID === c.Bridge_ID);
                const breached = c.SLA_Deadline && new Date() > new Date(c.SLA_Deadline) && c.Stage !== 'Completed';
                return (
                  <div key={i} className={`bg-muted/20 rounded-lg p-3 text-xs border ${breached ? 'border-destructive/30' : 'border-transparent'}`}>
                    <div className="text-foreground font-medium mb-1">{bridge?.Bridge_Name || c.Bridge_ID}</div>
                    <div className="text-muted-foreground mb-2">{c.Contractor_Name}</div>
                    <div className="w-full h-1.5 bg-muted/30 rounded-full overflow-hidden mb-1">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${c.Progress_Pct}%` }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{c.Progress_Pct}%</span>
                      <span>₹{c.Budget_Spent_Lakhs}/{c.Budget_Allocated_Lakhs}L</span>
                    </div>
                    {breached && (
                      <div className="flex items-center gap-1 mt-1 text-destructive text-[10px]">
                        <AlertTriangle className="w-3 h-3" /> SLA Breached
                      </div>
                    )}
                  </div>
                );
              })}
              {grouped[stage].length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">None</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Progress Chart */}
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Contractor Progress</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={contractors.map(c => ({ name: c.Contractor_Name.slice(0, 15), progress: c.Progress_Pct }))}>
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8892A4' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8892A4' }} />
            <Tooltip contentStyle={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="progress" radius={[4, 4, 0, 0]}>
              {contractors.map((c, i) => <Cell key={i} fill={c.Progress_Pct >= 80 ? '#00D084' : c.Progress_Pct >= 40 ? '#FFB800' : '#FF4444'} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
