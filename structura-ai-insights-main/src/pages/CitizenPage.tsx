import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { Users, AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function CitizenPage() {
  const { data, enrichedBridges } = useData();
  const [selectedBridge, setSelectedBridge] = useState('');
  const [severity, setSeverity] = useState(5);
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const reports = data.citizenReports.sort((a, b) => new Date(b.Report_Date).getTime() - new Date(a.Report_Date).getTime());
  const totalReports = reports.length;
  const reportsThisMonth = reports.filter(r => {
    const d = new Date(r.Report_Date);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const handleSubmit = () => {
    if (!selectedBridge || !description.trim()) return;
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
    setDescription('');
    setSeverity(5);
  };

  const bridge = enrichedBridges.find(b => b.Bridge_ID === selectedBridge);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground">Citizen Sensor Network</h1>
        <p className="text-xs text-muted-foreground">See Something? Report It. Save Lives.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Report Form */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-heading font-semibold text-sm text-foreground">Submit a Report</h3>

          {submitted && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 bg-success/10 border border-success/30 text-success px-4 py-3 rounded-lg text-xs">
              <CheckCircle2 className="w-4 h-4" />
              Report submitted — AI Severity: {severity}/10 {bridge ? `— Forwarded to ${bridge.Officer_Name}` : ''}
            </motion.div>
          )}

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Bridge</label>
            <select value={selectedBridge} onChange={e => setSelectedBridge(e.target.value)}
              className="w-full mt-1 px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
              <option value="">Select bridge...</option>
              {enrichedBridges.map(b => <option key={b.Bridge_ID} value={b.Bridge_ID}>{b.Bridge_Name} ({b.Bridge_ID})</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Severity ({severity}/10)</label>
            <input type="range" min="1" max="10" value={severity} onChange={e => setSeverity(+e.target.value)}
              className="w-full mt-2 accent-accent" />
          </div>

          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3}
              placeholder="Describe the damage or issue..."
              className="w-full mt-1 px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none" />
          </div>

          <button onClick={handleSubmit} disabled={!selectedBridge || !description.trim()}
            className="w-full py-2.5 bg-primary text-primary-foreground rounded-xl font-medium text-sm hover:bg-primary/90 transition flex items-center justify-center gap-2 disabled:opacity-50">
            <Send className="w-4 h-4" /> Submit Report
          </button>
        </div>

        {/* Stats + Feed */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-4 text-center">
              <div className="font-heading text-xl font-bold text-foreground">{totalReports}</div>
              <div className="text-[10px] text-muted-foreground">Total Reports</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="font-heading text-xl font-bold text-foreground">{reportsThisMonth}</div>
              <div className="text-[10px] text-muted-foreground">This Month</div>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="font-heading text-xl font-bold text-accent">
                {reports.filter(r => r.Status === 'Resolved').length}
              </div>
              <div className="text-[10px] text-muted-foreground">Resolved</div>
            </div>
          </div>

          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-3">Recent Reports</h3>
            {reports.length === 0 ? (
              <p className="text-xs text-muted-foreground">No citizen reports yet</p>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {reports.slice(0, 10).map(r => (
                  <div key={r.Report_ID} className="bg-muted/20 rounded-lg p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-foreground font-medium">{r.Bridge_ID}</span>
                      <span className="text-muted-foreground">{r.Report_Date}</span>
                    </div>
                    <p className="text-muted-foreground">{r.Description}</p>
                    <div className="flex gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.Severity_1_to_10 >= 7 ? 'risk-critical' : 'risk-routine'}`}>
                        {r.Severity_1_to_10}/10
                      </span>
                      <span className="text-muted-foreground">{r.Status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
