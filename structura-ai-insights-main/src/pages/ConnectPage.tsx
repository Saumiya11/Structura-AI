import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download, Link2, CheckCircle2, AlertCircle, Building2, Loader2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { validateSheetUrl } from '@/lib/sheets';
import { downloadTemplate } from '@/lib/template';
import { AppData } from '@/types/bridge';

export default function ConnectPage() {
  const navigate = useNavigate();
  const { addConnection } = useData();
  const [url, setUrl] = useState('');
  const [dept, setDept] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AppData | null>(null);

  const handleConnect = async () => {
    setError('');
    if (!validateSheetUrl(url)) { setError('Invalid Google Sheets URL. Please check the format.'); return; }
    if (!dept.trim()) { setError('Please enter a department name.'); return; }
    setLoading(true);
    try {
      const data = await addConnection({ url, departmentName: dept.trim(), cityRegion: city.trim() });
      setResult(data);
    } catch (e: any) {
      setError(e.message || 'Failed to connect. Make sure sharing is set to "Anyone with link can view".');
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 max-w-md w-full text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-success mx-auto mb-4" />
          <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Connection Successful</h2>
          <p className="text-sm text-muted-foreground mb-6">{dept}</p>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { n: result.bridges.length, l: 'Bridges imported' },
              { n: result.inspections.length, l: 'Inspection records' },
              { n: result.citizenReports.length, l: 'Citizen reports' },
              { n: result.contractors.length, l: 'Contractor entries' },
            ].map((s, i) => (
              <div key={i} className="bg-muted/30 rounded-lg p-3">
                <div className="font-heading text-xl font-bold text-foreground">{s.n}</div>
                <div className="text-[10px] text-muted-foreground">{s.l}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-semibold hover:bg-primary/90 transition text-sm"
          >
            Go to Dashboard →
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background blueprint-grid flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 max-w-lg w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-foreground">Connect Your Google Sheet</h1>
            <p className="text-xs text-muted-foreground">Follow the steps below to get started</p>
          </div>
        </div>

        {/* Step 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">1</span>
            <span className="text-xs font-medium text-foreground">Download our template</span>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 border border-border rounded-lg text-xs text-foreground hover:bg-muted/50 transition w-full"
          >
            <Download className="w-4 h-4 text-accent" />
            Download STRUCTURA AI Template.xlsx
          </button>
        </div>

        {/* Step 2 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">2</span>
            <span className="text-xs font-medium text-foreground">Upload to Google Sheets</span>
          </div>
          <div className="bg-muted/20 rounded-lg p-3 text-[11px] text-muted-foreground space-y-1">
            <p>• Go to sheets.google.com</p>
            <p>• File → Import → Upload your .xlsx file</p>
            <p>• Set sharing: <strong className="text-foreground">Anyone with link can VIEW</strong></p>
          </div>
        </div>

        {/* Step 3 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">3</span>
            <span className="text-xs font-medium text-foreground">Paste your sheet URL</span>
          </div>
          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://docs.google.com/spreadsheets/d/..."
            className="w-full px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        {/* Step 4 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">4</span>
            <span className="text-xs font-medium text-foreground">Name this connection</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              value={dept}
              onChange={e => setDept(e.target.value)}
              placeholder="PWD Maharashtra"
              className="px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="Mumbai"
              className="px-3 py-2.5 bg-muted/30 border border-border rounded-lg text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-destructive text-xs mb-4 bg-destructive/10 px-3 py-2 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={handleConnect}
          disabled={loading}
          className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-heading font-semibold hover:bg-primary/90 transition text-sm flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Connecting...</> : <><Link2 className="w-4 h-4" /> Connect & Sync Now</>}
        </button>
      </motion.div>
    </div>
  );
}
