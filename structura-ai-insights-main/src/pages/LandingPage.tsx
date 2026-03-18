import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import {
  Building2, Satellite, CloudRain, Users, Car, Brain, Smartphone,
  Zap, Bot, Map, FileText, Radio, HardHat, ArrowRight, AlertTriangle, Shield
} from 'lucide-react';

const features = [
  { icon: Satellite, title: 'Satellite Crack Detection', desc: 'AI-powered visual analysis of structural deterioration' },
  { icon: CloudRain, title: 'Environmental Stress Predictor', desc: 'Weather and seismic impact forecasting' },
  { icon: Users, title: 'Citizen Sensor Network', desc: 'Crowdsourced damage reporting with AI severity scoring' },
  { icon: Car, title: 'Traffic-Load Stress Modeling', desc: 'Real-time load analysis vs design capacity' },
  { icon: Brain, title: 'AI Priority Engine', desc: 'Multi-factor risk scoring for repair prioritization' },
  { icon: Smartphone, title: 'Digital Passport', desc: 'Complete bridge lifecycle documentation' },
  { icon: Zap, title: 'Disaster Simulator', desc: 'Pre-compute vulnerability under earthquake, flood, cyclone' },
  { icon: Bot, title: 'StructuraBot AI Chatbot', desc: 'Query your bridge data with natural language' },
  { icon: Map, title: 'India Risk Heatmap', desc: 'State-wise infrastructure health visualization' },
  { icon: FileText, title: 'PDF Report Export', desc: 'Government-ready inspection & risk reports' },
  { icon: Radio, title: 'Live IoT Sensors', desc: 'Real-time structural health monitoring dashboard' },
  { icon: HardHat, title: 'Contractor Tracker', desc: 'SLA compliance and repair progress monitoring' },
];

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="font-heading text-4xl md:text-5xl font-bold text-foreground glow-text">
        {value.toLocaleString()}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const { data, enrichedBridges, isConnected } = useData();
  const criticalCount = enrichedBridges.filter(b => b.riskStatus === 'CRITICAL').length;
  const states = new Set(data.bridges.map(b => b.State)).size;
  const reportsThisYear = data.citizenReports.filter(r => new Date(r.Report_Date).getFullYear() === new Date().getFullYear()).length;

  return (
    <div className="min-h-screen bg-background blueprint-grid">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Building2 className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-heading font-bold text-foreground">STRUCTURA AI</span>
          </div>
          <div className="flex gap-3">
            <Link to="/connect" className="px-4 py-2 text-xs font-medium text-foreground border border-border rounded-lg hover:bg-muted/50 transition">
              Connect Sheet
            </Link>
            <Link to="/dashboard" className="px-4 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-destructive/30 bg-destructive/10 text-destructive text-xs mb-6">
              <AlertTriangle className="w-3 h-3" /> A bridge collapses in India every 17 days
            </div>
            <h1 className="font-heading text-5xl md:text-7xl font-extrabold text-foreground leading-tight mb-6">
              India's Infrastructure<br />
              <span className="text-accent glow-text">Doesn't Have to Fail</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10">
              AI-powered early warning system for bridges, flyovers & critical infrastructure — powered by your live Google Sheets data
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/connect" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-heading font-semibold hover:bg-primary/90 transition text-sm">
                Connect Google Sheet <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-xl font-heading font-semibold hover:bg-muted/50 transition text-sm">
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 border-y border-border bg-card/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatedCounter value={data.bridges.length} label="Bridges Monitored" />
          <AnimatedCounter value={criticalCount} label="Critical Alerts" />
          <AnimatedCounter value={states} label="States Covered" />
          <AnimatedCounter value={reportsThisYear} label="Citizen Reports" />
        </div>
      </section>

      {/* Warning Cards */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-12">The Crisis Is Real</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { num: '351', label: 'Bridge collapses in India (2010–2024)', icon: AlertTriangle },
              { num: '₹2.4L Cr', label: 'Estimated repair backlog nationwide', icon: Shield },
              { num: '60%', label: 'Bridges past design life without assessment', icon: Building2 },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="glass-card p-6 text-center border-destructive/20"
              >
                <card.icon className="w-8 h-8 text-destructive mx-auto mb-3" />
                <div className="font-heading text-3xl font-bold text-destructive mb-2">{card.num}</div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 bg-card/20">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-heading text-3xl font-bold text-foreground text-center mb-4">Platform Capabilities</h2>
          <p className="text-muted-foreground text-center mb-12">12 integrated modules for complete infrastructure lifecycle management</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="glass-card-hover p-5"
              >
                <f.icon className="w-6 h-6 text-accent mb-3" />
                <h3 className="font-heading font-semibold text-sm text-foreground mb-1">{f.title}</h3>
                <p className="text-xs text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Ready to Protect Your Infrastructure?</h2>
        <p className="text-muted-foreground mb-8">Connect your Google Sheet and get real-time risk intelligence in under 2 minutes</p>
        <Link to="/connect" className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-heading font-semibold hover:bg-primary/90 transition">
          Get Started <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        <p>STRUCTURA AI — Predicting failures. Saving lives.</p>
      </footer>
    </div>
  );
}
