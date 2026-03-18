import { useState, useEffect, useRef } from 'react';
import { useData } from '@/context/DataContext';
import { Radio, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function useSensorSim(baseline: number, variance: number) {
  const [history, setHistory] = useState<{ t: string; v: number }[]>([]);
  useEffect(() => {
    const interval = setInterval(() => {
      const v = Math.max(0, baseline + (Math.random() - 0.5) * variance * 2);
      setHistory(prev => {
        const next = [...prev, { t: new Date().toLocaleTimeString(), v: Math.round(v * 10) / 10 }];
        return next.slice(-20);
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [baseline, variance]);
  return history;
}

export default function IoTPage() {
  const { enrichedBridges } = useData();
  const [selected, setSelected] = useState('');
  const bridge = enrichedBridges.find(b => b.Bridge_ID === selected) || enrichedBridges[0];

  const traffic = bridge ? bridge.Daily_Traffic_Count / 1000 : 5;
  const health = bridge ? bridge.Current_Health_Pct : 70;
  const heavy = bridge ? bridge.Heavy_Vehicle_Pct : 30;

  const vibData = useSensorSim(100 - health, 15);
  const loadData = useSensorSim(heavy, 10);
  const tempData = useSensorSim(32, 5);
  const tiltData = useSensorSim(0.5, 0.3);
  const acousticData = useSensorSim(100 - health * 0.8, 12);
  const windData = useSensorSim(15, 8);

  const sensors = [
    { name: 'Vibration', unit: 'Hz', data: vibData, color: '#00C2FF' },
    { name: 'Load Stress', unit: '%', data: loadData, color: '#FFB800' },
    { name: 'Temperature', unit: '°C', data: tempData, color: '#FF4444' },
    { name: 'Tilt Angle', unit: '°', data: tiltData, color: '#00D084' },
    { name: 'Acoustic Emission', unit: 'dB', data: acousticData, color: '#9B59B6' },
    { name: 'Wind Speed', unit: 'km/h', data: windData, color: '#1E5FFF' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent" /> Live IoT Sensors
          </h1>
          <p className="text-xs text-muted-foreground">Simulated from sheet data baselines • Updates every 3s</p>
        </div>
        <select value={selected} onChange={e => setSelected(e.target.value)}
          className="px-3 py-2 bg-muted/30 border border-border rounded-lg text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option value="">Select bridge...</option>
          {enrichedBridges.map(b => <option key={b.Bridge_ID} value={b.Bridge_ID}>{b.Bridge_Name}</option>)}
        </select>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sensors.map(s => (
          <div key={s.name} className="glass-card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-foreground">{s.name}</span>
              <span className="text-lg font-heading font-bold" style={{ color: s.color }}>
                {s.data.length > 0 ? s.data[s.data.length - 1].v : '—'} {s.unit}
              </span>
            </div>
            <ResponsiveContainer width="100%" height={100}>
              <LineChart data={s.data}>
                <Line type="monotone" dataKey="v" stroke={s.color} strokeWidth={2} dot={false} />
                <XAxis dataKey="t" hide />
                <YAxis hide />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      <div className="glass-card p-4 text-center text-xs text-muted-foreground">
        <Activity className="w-4 h-4 inline mr-1" />
        Connect physical IoT hardware for real sensor feeds
      </div>
    </div>
  );
}
