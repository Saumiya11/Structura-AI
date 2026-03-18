import { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Zap, AlertTriangle, Shield, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const disasters = ['Earthquake', 'Cyclone', 'Flood', 'Extreme Heat'];

export default function SimulatorPage() {
  const { enrichedBridges } = useData();
  const [type, setType] = useState(0);
  const [magnitude, setMagnitude] = useState(6);
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<{ name: string; id: string; status: string; officer: string }[] | null>(null);

  const runSim = () => {
    setRunning(true);
    setResults(null);
    setTimeout(() => {
      const simResults = enrichedBridges.map(b => {
        const threshold = 100 - magnitude * 8;
        let status = 'SAFE';
        if (b.Current_Health_Pct < threshold * 0.5) status = 'FAIL';
        else if (b.Current_Health_Pct < threshold * 0.65) status = 'DAMAGE';
        return { name: b.Bridge_Name, id: b.Bridge_ID, status, officer: b.Officer_Name };
      }).sort((a, b) => {
        const order = { FAIL: 0, DAMAGE: 1, SAFE: 2 };
        return (order[a.status as keyof typeof order] || 2) - (order[b.status as keyof typeof order] || 2);
      });
      setResults(simResults);
      setRunning(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Disaster Pre-Simulation</h1>
        <p className="text-xs text-muted-foreground">Predict infrastructure vulnerability under extreme events</p>
      </div>

      <div className="glass-card p-6">
        <div className="flex gap-2 mb-6">
          {disasters.map((d, i) => (
            <button key={d} onClick={() => setType(i)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition ${type === i ? 'bg-primary text-primary-foreground' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="text-xs text-muted-foreground">Intensity: {magnitude}/10</label>
          <input type="range" min="1" max="10" value={magnitude} onChange={e => setMagnitude(+e.target.value)}
            className="w-full mt-2 accent-accent" />
        </div>

        <button onClick={runSim} disabled={running || enrichedBridges.length === 0}
          className="px-6 py-3 bg-destructive text-destructive-foreground rounded-xl font-heading font-semibold hover:bg-destructive/90 transition text-sm flex items-center gap-2 disabled:opacity-50">
          <Zap className="w-4 h-4" /> {running ? 'Running Simulation...' : 'RUN SIMULATION'}
        </button>

        {running && (
          <div className="mt-4">
            <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 2 }}
                className="h-full bg-destructive rounded-full"
              />
            </div>
          </div>
        )}
      </div>

      {results && (
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">
            Simulation Results — {disasters[type]} (Intensity {magnitude}/10)
          </h3>
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-destructive/10 rounded-lg p-3 text-center">
              <div className="font-heading text-xl font-bold text-destructive">{results.filter(r => r.status === 'FAIL').length}</div>
              <div className="text-[10px] text-muted-foreground">Predicted FAIL</div>
            </div>
            <div className="bg-warning/10 rounded-lg p-3 text-center">
              <div className="font-heading text-xl font-bold text-warning">{results.filter(r => r.status === 'DAMAGE').length}</div>
              <div className="text-[10px] text-muted-foreground">Predicted DAMAGE</div>
            </div>
            <div className="bg-success/10 rounded-lg p-3 text-center">
              <div className="font-heading text-xl font-bold text-success">{results.filter(r => r.status === 'SAFE').length}</div>
              <div className="text-[10px] text-muted-foreground">Predicted SAFE</div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-border">
                  <th className="pb-2 text-left font-medium">Bridge</th>
                  <th className="pb-2 text-left font-medium">ID</th>
                  <th className="pb-2 text-left font-medium">Prediction</th>
                  <th className="pb-2 text-left font-medium">Officer</th>
                </tr>
              </thead>
              <tbody>
                {results.map(r => (
                  <tr key={r.id} className="border-b border-border/30">
                    <td className="py-2 text-foreground">{r.name}</td>
                    <td className="py-2 text-accent font-mono">{r.id}</td>
                    <td className="py-2">
                      <span className="flex items-center gap-1">
                        {r.status === 'FAIL' ? <AlertTriangle className="w-3 h-3 text-destructive" /> :
                         r.status === 'DAMAGE' ? <Shield className="w-3 h-3 text-warning" /> :
                         <CheckCircle2 className="w-3 h-3 text-success" />}
                        <span className={r.status === 'FAIL' ? 'text-destructive' : r.status === 'DAMAGE' ? 'text-warning' : 'text-success'}>
                          {r.status}
                        </span>
                      </span>
                    </td>
                    <td className="py-2 text-muted-foreground">{r.officer}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {enrichedBridges.length === 0 && (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground text-sm">Connect a Google Sheet with bridge data to run simulations</p>
        </div>
      )}
    </div>
  );
}
