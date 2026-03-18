import { useParams, Link } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { getRiskStatusColor, getCostEscalation } from '@/lib/calculations';
import { ArrowLeft, FileText, ExternalLink, Building2, MapPin, Calendar, User, Wrench } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { useState, useMemo } from 'react';

export default function BridgeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { enrichedBridges, data } = useData();
  const [tab, setTab] = useState(0);

  const bridge = enrichedBridges.find(b => b.Bridge_ID === id);
  if (!bridge) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Building2 className="w-12 h-12 text-muted-foreground mb-3" />
        <p className="text-muted-foreground">Bridge not found</p>
        <Link to="/dashboard" className="text-accent text-sm mt-2">← Back to Dashboard</Link>
      </div>
    );
  }

  const inspections = data.inspections
    .filter(i => i.Bridge_ID === id)
    .sort((a, b) => new Date(a.Inspection_Date).getTime() - new Date(b.Inspection_Date).getTime());

  const reports = data.citizenReports.filter(r => r.Bridge_ID === id);
  const contractor = data.contractors.filter(c => c.Bridge_ID === id);
  const age = new Date().getFullYear() - bridge.Year_Built;

  const healthData = inspections.map(i => ({
    date: i.Inspection_Date,
    health: i.Health_Score_Pct,
  }));
  if (healthData.length === 0) healthData.push({ date: 'Current', health: bridge.Current_Health_Pct });

  const tabs = ['Overview', 'Env. Stress', 'Traffic Load', 'Citizen Reports', 'Satellite', 'Inspections'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition flex items-center gap-1 mb-2">
            <ArrowLeft className="w-3 h-3" /> Back to Dashboard
          </Link>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-3">
            {bridge.Bridge_Name}
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium ${getRiskStatusColor(bridge.riskStatus)}`}>
              {bridge.riskStatus}
            </span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">{bridge.Bridge_ID} • {bridge.City}, {bridge.State}</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 border border-border rounded-lg text-xs text-foreground hover:bg-muted/50 transition">
            <FileText className="w-3.5 h-3.5" /> Export PDF
          </button>
        </div>
      </div>

      {/* Digital Passport + Health */}
      <div className="grid lg:grid-cols-3 gap-4">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Digital Passport</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {[
              { l: 'Material', v: bridge.Material },
              { l: 'Year Built', v: bridge.Year_Built },
              { l: 'Age', v: `${age} years` },
              { l: 'Span', v: `${bridge.Span_Meters}m` },
              { l: 'Lanes', v: bridge.Number_of_Lanes },
              { l: 'Design Load', v: `${bridge.Design_Load_Tonnes}T` },
              { l: 'Daily Traffic', v: bridge.Daily_Traffic_Count.toLocaleString() },
              { l: 'Heavy Vehicles', v: `${bridge.Heavy_Vehicle_Pct}%` },
              { l: 'Pending Repairs', v: bridge.Pending_Repairs },
              { l: 'Repair Cost', v: `₹${bridge.Repair_Cost_Lakhs}L` },
              { l: 'Remaining Life', v: `${bridge.remainingLife} yrs` },
              { l: 'Designer', v: bridge.Designer },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-muted-foreground text-[10px] uppercase tracking-wider">{item.l}</div>
                <div className="text-foreground font-medium mt-0.5">{item.v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs">
            <User className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-foreground">{bridge.Officer_Name}</span>
            <span className="text-muted-foreground">{bridge.Officer_Designation}</span>
            <span className="text-accent">{bridge.Officer_Phone}</span>
          </div>
        </div>
        <div className="glass-card p-6 flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(218, 30%, 22%)" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={bridge.riskScore >= 80 ? '#FF4444' : bridge.riskScore >= 60 ? '#FFB800' : bridge.riskScore >= 40 ? '#FF8C00' : '#00D084'}
                strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${bridge.Current_Health_Pct * 2.51} 251`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-heading text-2xl font-bold text-foreground">{bridge.Current_Health_Pct}%</span>
              <span className="text-[10px] text-muted-foreground">Health</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-xs text-muted-foreground">Risk Score</div>
            <div className="font-heading text-3xl font-bold" style={{ color: bridge.riskScore >= 80 ? '#FF4444' : bridge.riskScore >= 60 ? '#FFB800' : '#00D084' }}>
              {bridge.riskScore}
            </div>
          </div>
        </div>
      </div>

      {/* Health Timeline */}
      <div className="glass-card p-5">
        <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Health Timeline</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={healthData}>
            <defs>
              <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00C2FF" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00C2FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8892A4' }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#8892A4' }} />
            <Tooltip contentStyle={{ background: '#112240', border: '1px solid #1e3a5f', borderRadius: 8, fontSize: 11 }} />
            <ReferenceLine y={35} stroke="#FF4444" strokeDasharray="5 5" label={{ value: 'Critical', fill: '#FF4444', fontSize: 10 }} />
            <Area type="monotone" dataKey="health" stroke="#00C2FF" fill="url(#healthGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex gap-1 border-b border-border mb-4 overflow-x-auto">
          {tabs.map((t, i) => (
            <button
              key={t}
              onClick={() => setTab(i)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap transition border-b-2 ${
                tab === i ? 'border-accent text-accent' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === 0 && (
          <div className="glass-card p-5">
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Bridge Overview</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div><span className="text-muted-foreground">Age Factor</span><div className="text-foreground font-medium">{bridge.ageFactor.toFixed(1)}</div></div>
              <div><span className="text-muted-foreground">Traffic Factor</span><div className="text-foreground font-medium">{bridge.trafficLoadFactor.toFixed(1)}</div></div>
              <div><span className="text-muted-foreground">Inspection Factor</span><div className="text-foreground font-medium">{bridge.inspectionOverdueFactor.toFixed(1)}</div></div>
              <div><span className="text-muted-foreground">Citizen Factor</span><div className="text-foreground font-medium">{bridge.citizenFactor.toFixed(1)}</div></div>
            </div>
            {bridge.Notes && <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-3">{bridge.Notes}</p>}
          </div>
        )}
        {tab === 1 && (
          <div className="glass-card p-5 space-y-3">
            <h4 className="font-heading font-semibold text-sm text-foreground">Environmental Stress Indicators</h4>
            {[
              { label: 'Monsoon Risk', value: bridge.Latitude > 8 && bridge.Latitude < 20 ? 75 : 40 },
              { label: 'Thermal Stress', value: bridge.Material === 'Steel' ? 60 : bridge.Material === 'Steel-Concrete' ? 45 : 30 },
              { label: 'Seismic Zone', value: bridge.Latitude > 25 ? 70 : 40 },
            ].map((s, i) => (
              <div key={i}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="text-foreground">{s.value}%</span>
                </div>
                <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${s.value}%`, background: s.value > 60 ? '#FF4444' : s.value > 40 ? '#FFB800' : '#00D084' }} />
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 2 && (
          <div className="glass-card p-5 space-y-4">
            <h4 className="font-heading font-semibold text-sm text-foreground">Traffic Load Analysis</h4>
            <div className="text-xs text-muted-foreground">
              Bridge receiving <strong className="text-foreground">{bridge.Design_Load_Tonnes > 0 ? Math.round((bridge.Daily_Traffic_Count / (bridge.Design_Load_Tonnes * 100)) * 100) : 0}%</strong> of design capacity
            </div>
            <div className="w-full h-4 bg-muted/30 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${Math.min(bridge.Design_Load_Tonnes > 0 ? (bridge.Daily_Traffic_Count / (bridge.Design_Load_Tonnes * 100)) * 100 : 0, 100)}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div><span className="text-muted-foreground">Daily Traffic</span><div className="text-foreground font-medium">{bridge.Daily_Traffic_Count.toLocaleString()}</div></div>
              <div><span className="text-muted-foreground">Heavy Vehicles</span><div className="text-foreground font-medium">{bridge.Heavy_Vehicle_Pct}%</div></div>
              <div><span className="text-muted-foreground">Design Load</span><div className="text-foreground font-medium">{bridge.Design_Load_Tonnes}T</div></div>
            </div>
          </div>
        )}
        {tab === 3 && (
          <div className="glass-card p-5">
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Citizen Reports ({reports.length})</h4>
            {reports.length === 0 ? (
              <p className="text-xs text-muted-foreground">No citizen reports for this bridge</p>
            ) : (
              <div className="space-y-3">
                {reports.map(r => (
                  <div key={r.Report_ID} className="bg-muted/20 rounded-lg p-3 text-xs">
                    <div className="flex justify-between mb-1">
                      <span className="text-foreground font-medium">{r.Report_ID}</span>
                      <span className="text-muted-foreground">{r.Report_Date}</span>
                    </div>
                    <p className="text-muted-foreground mb-2">{r.Description}</p>
                    <div className="flex gap-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${r.Severity_1_to_10 >= 7 ? 'risk-critical' : r.Severity_1_to_10 >= 4 ? 'risk-high' : 'risk-routine'}`}>
                        Severity: {r.Severity_1_to_10}/10
                      </span>
                      <span className="text-muted-foreground">{r.Status}</span>
                      {r.AI_Verdict && <span className="text-accent">{r.AI_Verdict}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {tab === 4 && (
          <div className="glass-card p-5 text-center">
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Satellite Analysis</h4>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-muted/20 rounded-lg p-8 text-xs text-muted-foreground">Before Image Placeholder</div>
              <div className="bg-muted/20 rounded-lg p-8 text-xs text-muted-foreground">After Image Placeholder</div>
            </div>
            <p className="text-xs text-muted-foreground">Connect satellite imagery API for live analysis</p>
          </div>
        )}
        {tab === 5 && (
          <div className="glass-card p-5">
            <h4 className="font-heading font-semibold text-sm text-foreground mb-3">Inspection History ({inspections.length})</h4>
            {inspections.length === 0 ? (
              <p className="text-xs text-muted-foreground">No inspection records found. Add data to the INSPECTION_HISTORY sheet.</p>
            ) : (
              <div className="space-y-3">
                {inspections.map((ins, i) => (
                  <div key={i} className="bg-muted/20 rounded-lg p-3 text-xs flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-accent mt-1 shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-foreground font-medium">{ins.Inspection_Date}</span>
                        <span className="text-muted-foreground">{ins.Inspector_Name}</span>
                      </div>
                      <p className="text-muted-foreground">{ins.Findings}</p>
                      <div className="flex gap-3 mt-1">
                        <span>Health: {ins.Health_Score_Pct}%</span>
                        <span className={ins.Severity === 'High' || ins.Severity === 'Critical' ? 'text-destructive' : 'text-muted-foreground'}>
                          {ins.Severity}
                        </span>
                        <span className={ins.Repairs_Done === 'No' ? 'text-destructive' : 'text-success'}>
                          Repairs: {ins.Repairs_Done}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
