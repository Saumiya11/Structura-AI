import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { getCostEscalation } from '@/lib/calculations';
import { Calculator, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function CostCalculatorPage() {
  const { enrichedBridges } = useData();
  const [selected, setSelected] = useState('');
  const [delay, setDelay] = useState(0);

  const bridge = enrichedBridges.find(b => b.Bridge_ID === selected);
  const cost = bridge ? bridge.Repair_Cost_Lakhs : 0;

  const projections = useMemo(() =>
    [0, 1, 2, 3, 4, 5].map(y => ({
      year: y === 0 ? 'Now' : `+${y}yr`,
      cost: getCostEscalation(cost, y),
    }))
  , [cost]);

  const totalBudgetNeeded = useMemo(() =>
    enrichedBridges
      .filter(b => b.riskStatus === 'CRITICAL' || b.riskStatus === 'HIGH')
      .reduce((s, b) => s + b.Repair_Cost_Lakhs, 0)
  , [enrichedBridges]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <Calculator className="w-5 h-5 text-accent" /> Predictive Cost Calculator
        </h1>
        <p className="text-xs text-muted-foreground">35% annual cost escalation for delayed repairs</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card p-6 space-y-4">
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Select Bridge</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Choose a bridge...</option>
              {enrichedBridges.map(b => <option key={b.Bridge_ID} value={b.Bridge_ID}>{b.Bridge_Name} — ₹{b.Repair_Cost_Lakhs}L</option>)}
            </select>
          </div>

          {bridge && (
            <>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="text-muted-foreground">Current Cost</div>
                  <div className="text-foreground font-heading font-bold text-lg">₹{cost}L</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="text-muted-foreground">Health</div>
                  <div className="text-foreground font-heading font-bold text-lg">{bridge.Current_Health_Pct}%</div>
                </div>
                <div className="bg-muted/20 rounded-lg p-3">
                  <div className="text-muted-foreground">Risk Score</div>
                  <div className="font-heading font-bold text-lg" style={{ color: bridge.riskScore >= 80 ? '#FF4444' : '#FFB800' }}>{bridge.riskScore}</div>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground">Delay: {delay} years</label>
                <input type="range" min="0" max="5" value={delay} onChange={e => setDelay(+e.target.value)}
                  className="w-full mt-2 accent-accent" />
              </div>

              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-center">
                <div className="text-[10px] text-muted-foreground mb-1">Cost after {delay} year{delay !== 1 ? 's' : ''} delay</div>
                <div className="font-heading text-3xl font-bold text-destructive">₹{getCostEscalation(cost, delay).toFixed(1)}L</div>
                {delay > 0 && <div className="text-xs text-destructive mt-1">+{((getCostEscalation(cost, delay) / cost - 1) * 100).toFixed(0)}% increase</div>}
              </div>
            </>
          )}
        </div>

        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Cost Escalation Projection</h3>
          {cost > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={projections}>
                <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#8892A4' }} />
                <YAxis tick={{ fontSize: 10, fill: '#8892A4' }} />
                <Tooltip contentStyle={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }} formatter={(v: number) => [`₹${v.toFixed(1)}L`, 'Cost']} />
                <Bar dataKey="cost" radius={[4, 4, 0, 0]}>
                  {projections.map((_, i) => <Cell key={i} fill={i === 0 ? '#00D084' : i < 3 ? '#FFB800' : '#FF4444'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-xs">Select a bridge to see projections</div>
          )}
        </div>
      </div>

      {/* City-wide */}
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-accent" /> City-wide Budget Summary
        </h3>
        <p className="text-xs text-muted-foreground mb-4">Total budget needed for Critical + High risk bridges</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <div className="font-heading text-xl font-bold text-destructive">
              ₹{totalBudgetNeeded.toFixed(0)}L
            </div>
            <div className="text-[10px] text-muted-foreground">Immediate Need</div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <div className="font-heading text-xl font-bold text-warning">
              ₹{getCostEscalation(totalBudgetNeeded, 1).toFixed(0)}L
            </div>
            <div className="text-[10px] text-muted-foreground">If delayed 1yr</div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <div className="font-heading text-xl font-bold text-destructive">
              ₹{getCostEscalation(totalBudgetNeeded, 3).toFixed(0)}L
            </div>
            <div className="text-[10px] text-muted-foreground">If delayed 3yr</div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 text-center">
            <div className="font-heading text-xl font-bold text-foreground">
              {enrichedBridges.filter(b => b.riskStatus === 'CRITICAL' || b.riskStatus === 'HIGH').length}
            </div>
            <div className="text-[10px] text-muted-foreground">Bridges needing repair</div>
          </div>
        </div>
      </div>
    </div>
  );
}
