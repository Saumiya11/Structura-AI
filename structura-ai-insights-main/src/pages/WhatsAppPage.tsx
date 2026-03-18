import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { MessageSquare, Phone, User, Send } from 'lucide-react';

export default function WhatsAppPage() {
  const { enrichedBridges } = useData();
  const [threshold, setThreshold] = useState(70);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  const officers = useMemo(() => {
    const map: Record<string, { name: string; phone: string; designation: string; bridges: string[] }> = {};
    enrichedBridges.forEach(b => {
      if (!b.Officer_Name) return;
      if (!map[b.Officer_Name]) {
        map[b.Officer_Name] = { name: b.Officer_Name, phone: b.Officer_Phone, designation: b.Officer_Designation, bridges: [] };
      }
      map[b.Officer_Name].bridges.push(b.Bridge_Name);
    });
    return Object.values(map);
  }, [enrichedBridges]);

  const alertBridges = enrichedBridges.filter(b => b.riskScore >= threshold);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-success" /> WhatsApp Alert Center
        </h1>
        <p className="text-xs text-muted-foreground">Configure automated alerts for officers</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Officers */}
        <div className="glass-card p-5">
          <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Officers ({officers.length})</h3>
          {officers.length === 0 ? (
            <p className="text-xs text-muted-foreground">No officer data in sheet</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {officers.map(o => (
                <div key={o.name} className={`bg-muted/20 rounded-lg p-3 text-xs cursor-pointer transition ${selectedOfficer === o.name ? 'border border-accent/30' : 'border border-transparent hover:border-border'}`}
                  onClick={() => setSelectedOfficer(o.name)}>
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-foreground font-medium">{o.name}</span>
                  </div>
                  <div className="flex gap-3 text-muted-foreground">
                    <span>{o.designation}</span>
                    <span className="text-accent">{o.phone}</span>
                    <span>{o.bridges.length} bridges</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alert Config */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Alert Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Risk threshold: {threshold}</label>
                <input type="range" min="30" max="100" value={threshold} onChange={e => setThreshold(+e.target.value)}
                  className="w-full mt-2 accent-accent" />
              </div>
              <div className="text-xs text-muted-foreground">
                {alertBridges.length} bridge{alertBridges.length !== 1 ? 's' : ''} above threshold
              </div>
            </div>
          </div>

          {/* WhatsApp Preview */}
          <div className="glass-card p-5">
            <h3 className="font-heading font-semibold text-sm text-foreground mb-4">Message Preview</h3>
            <div className="bg-success/5 border border-success/20 rounded-xl p-4 text-xs space-y-2">
              <div className="text-success font-medium">📱 WhatsApp Alert</div>
              <div className="text-foreground">
                ⚠️ STRUCTURA AI Alert<br /><br />
                {alertBridges.length > 0 ? (
                  <>
                    Bridge: {alertBridges[0].Bridge_Name}<br />
                    Risk Score: {alertBridges[0].riskScore}/100<br />
                    Status: {alertBridges[0].riskStatus}<br />
                    Health: {alertBridges[0].Current_Health_Pct}%<br /><br />
                    Immediate inspection recommended.<br />
                    — STRUCTURA AI
                  </>
                ) : 'No bridges above threshold'}
              </div>
            </div>
            <button className="w-full mt-3 py-2.5 bg-success/20 text-success rounded-xl text-xs font-medium hover:bg-success/30 transition flex items-center justify-center gap-2">
              <Send className="w-3.5 h-3.5" /> Test Send (Preview Only)
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-card p-3 text-center">
              <div className="font-heading text-lg font-bold text-foreground">{officers.length}</div>
              <div className="text-[10px] text-muted-foreground">Officers</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="font-heading text-lg font-bold text-foreground">{alertBridges.length}</div>
              <div className="text-[10px] text-muted-foreground">Alerts Active</div>
            </div>
            <div className="glass-card p-3 text-center">
              <div className="font-heading text-lg font-bold text-foreground">{enrichedBridges.length}</div>
              <div className="text-[10px] text-muted-foreground">Bridges Covered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
