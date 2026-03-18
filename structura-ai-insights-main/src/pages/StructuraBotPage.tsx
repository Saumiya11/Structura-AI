import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { getCostEscalation } from '@/lib/calculations';
import { Bot, Send, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Message {
  role: 'user' | 'bot';
  text: string;
  actions?: { label: string; to: string }[];
}

const SUGGESTIONS = [
  'Which bridges need urgent attention?',
  'What is total repair budget needed?',
  'Show bridges older than 30 years',
  'Which state has most critical bridges?',
  'Which bridges haven\'t been inspected in 1 year?',
];

export default function StructuraBotPage() {
  const { enrichedBridges, data } = useData();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Hello! I\'m StructuraBot. Ask me anything about your bridge data. I query your imported Google Sheet data directly.' },
  ]);
  const [input, setInput] = useState('');

  const processQuery = (q: string): Message => {
    const lower = q.toLowerCase();

    if (lower.includes('urgent') || lower.includes('critical') || lower.includes('attention')) {
      const critical = enrichedBridges.filter(b => b.riskStatus === 'CRITICAL');
      if (critical.length === 0) return { role: 'bot', text: 'No bridges are currently at Critical risk level.' };
      const list = critical.slice(0, 5).map(b => `• ${b.Bridge_Name} (${b.Bridge_ID}) — Risk: ${b.riskScore}, Health: ${b.Current_Health_Pct}%`).join('\n');
      return { role: 'bot', text: `🚨 ${critical.length} bridge(s) need urgent attention:\n\n${list}`, actions: critical.slice(0, 3).map(b => ({ label: b.Bridge_Name, to: `/bridge/${b.Bridge_ID}` })) };
    }

    if (lower.includes('budget') || lower.includes('repair cost') || lower.includes('total cost')) {
      const total = enrichedBridges.filter(b => b.riskStatus === 'CRITICAL' || b.riskStatus === 'HIGH').reduce((s, b) => s + b.Repair_Cost_Lakhs, 0);
      return { role: 'bot', text: `💰 Total repair budget for Critical + High risk bridges: ₹${total.toFixed(0)} Lakhs\n\nIf delayed by 2 years: ₹${getCostEscalation(total, 2).toFixed(0)} Lakhs (+${((getCostEscalation(total, 2) / total - 1) * 100).toFixed(0)}%)` };
    }

    if (lower.includes('older than 30') || lower.includes('30 years')) {
      const old = enrichedBridges.filter(b => new Date().getFullYear() - b.Year_Built > 30);
      if (old.length === 0) return { role: 'bot', text: 'No bridges older than 30 years found in your data.' };
      const list = old.slice(0, 5).map(b => `• ${b.Bridge_Name} — Built: ${b.Year_Built} (${new Date().getFullYear() - b.Year_Built} yrs)`).join('\n');
      return { role: 'bot', text: `🏗️ ${old.length} bridge(s) older than 30 years:\n\n${list}` };
    }

    if (lower.includes('state') && lower.includes('critical')) {
      const map: Record<string, number> = {};
      enrichedBridges.filter(b => b.riskStatus === 'CRITICAL').forEach(b => { map[b.State] = (map[b.State] || 0) + 1; });
      const sorted = Object.entries(map).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) return { role: 'bot', text: 'No critical bridges found.' };
      return { role: 'bot', text: `🗺️ States with most critical bridges:\n\n${sorted.map(([s, c]) => `• ${s}: ${c} critical`).join('\n')}` };
    }

    if (lower.includes('inspect') && (lower.includes('1 year') || lower.includes('year'))) {
      const cutoff = Date.now() - 365 * 24 * 60 * 60 * 1000;
      const overdue = enrichedBridges.filter(b => !b.Last_Inspection_Date || new Date(b.Last_Inspection_Date).getTime() < cutoff);
      if (overdue.length === 0) return { role: 'bot', text: 'All bridges have been inspected within the last year.' };
      return { role: 'bot', text: `⏰ ${overdue.length} bridge(s) haven't been inspected in over 1 year:\n\n${overdue.slice(0, 5).map(b => `• ${b.Bridge_Name} — Last: ${b.Last_Inspection_Date || 'Never'}`).join('\n')}` };
    }

    if (lower.includes('responsible') || lower.includes('officer') || lower.includes('who')) {
      const name = lower.replace(/who is responsible for |who manages |officer for /gi, '').trim().replace(/[?"']/g, '');
      const found = enrichedBridges.find(b => b.Bridge_Name.toLowerCase().includes(name) || b.Bridge_ID.toLowerCase() === name);
      if (found) return { role: 'bot', text: `👤 Responsible officer for ${found.Bridge_Name}:\n\n• ${found.Officer_Name}\n• ${found.Officer_Designation}\n• ${found.Officer_Phone}` };
      return { role: 'bot', text: 'Bridge not found. Try using the exact bridge name or ID.' };
    }

    if (lower.includes('delay') && lower.includes('repair')) {
      const match = enrichedBridges[0];
      if (!match) return { role: 'bot', text: 'No bridge data available.' };
      return { role: 'bot', text: `📊 Cost of delaying ${match.Bridge_Name} repairs:\n\n• Now: ₹${match.Repair_Cost_Lakhs}L\n• 1yr: ₹${getCostEscalation(match.Repair_Cost_Lakhs, 1).toFixed(1)}L\n• 2yr: ₹${getCostEscalation(match.Repair_Cost_Lakhs, 2).toFixed(1)}L\n• 3yr: ₹${getCostEscalation(match.Repair_Cost_Lakhs, 3).toFixed(1)}L` };
    }

    return { role: 'bot', text: `I can help with:\n• Bridge risk status and health\n• Budget calculations\n• Officer information\n• Inspection overdue alerts\n• Cost escalation projections\n\nTry asking one of the suggested questions!` };
  };

  const handleSend = (text?: string) => {
    const q = text || input.trim();
    if (!q) return;
    setMessages(prev => [...prev, { role: 'user', text: q }]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, processQuery(q)]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-2 mb-4">
        <Bot className="w-5 h-5 text-accent" />
        <h1 className="font-heading text-xl font-bold text-foreground">StructuraBot</h1>
        <span className="text-[10px] text-muted-foreground">— Queries your live sheet data</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-xl px-4 py-3 text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'glass-card'}`}>
              <pre className="whitespace-pre-wrap font-mono text-xs">{m.text}</pre>
              {m.actions && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {m.actions.map(a => (
                    <Link key={a.to} to={a.to} className="px-2 py-1 bg-accent/20 text-accent rounded text-[10px] hover:bg-accent/30 transition flex items-center gap-1">
                      {a.label} <ArrowRight className="w-2.5 h-2.5" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
        {SUGGESTIONS.map(s => (
          <button key={s} onClick={() => handleSend(s)}
            className="px-3 py-1.5 bg-muted/30 border border-border rounded-lg text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/50 transition whitespace-nowrap shrink-0">
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask StructuraBot about your bridge data..."
          className="flex-1 px-4 py-3 bg-muted/30 border border-border rounded-xl text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <button onClick={() => handleSend()} className="px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
