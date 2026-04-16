import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, TrendingUp, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { supabase } from '@/integrations/supabase/client';
import { recalculateRiskForPatient } from '@/lib/recalculateRisk';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export const Route = createFileRoute('/patient/vitals')({
  component: VitalsPage,
});

const vitalFields = [
  { key: 'weight_kg', label: 'Weight (kg)', unit: 'kg', icon: '⚖️' },
  { key: 'blood_pressure_systolic', label: 'BP Systolic', unit: 'mmHg', icon: '💓' },
  { key: 'blood_pressure_diastolic', label: 'BP Diastolic', unit: 'mmHg', icon: '💓' },
  { key: 'heart_rate_bpm', label: 'Heart Rate', unit: 'bpm', icon: '❤️' },
  { key: 'temperature_c', label: 'Temperature', unit: '°C', icon: '🌡️' },
  { key: 'oxygen_saturation', label: 'SpO₂', unit: '%', icon: '🫁' },
  { key: 'pain_scale_0_10', label: 'Pain', unit: '/10', icon: '😣' },
];

function VitalsPage() {
  const { user } = useAuth();
  const { vitals, refresh, loading } = usePatientData(user?.id);
  const [showModal, setShowModal] = useState(false);
  const [newVitals, setNewVitals] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const latest = vitals[0] || {};
  const sourceLabel = (s: string) => s === 'hospital' ? 'From Hospital' : s === 'chatbot_extracted' ? 'Auto from chat' : 'Self-reported';

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const data: any = { patient_id: user.id, source: 'patient_self_report', is_edited_by_patient: true };
    Object.entries(newVitals).forEach(([k, v]) => { if (v) data[k] = Number(v); });
    await supabase.from('vitals').insert(data);
    await recalculateRiskForPatient(user.id, 'manual');
    setNewVitals({});
    setShowModal(false);
    setSaving(false);
    refresh();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Vitals</h1>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full font-heading font-semibold text-sm hover:bg-lau-green-dark transition-colors">
          <Plus className="h-4 w-4" /> Log Vitals
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-card animate-pulse border border-lau-border" />)}
        </div>
      ) : (
        <div className="grid gap-3">
          {vitalFields.map((field, i) => {
            const value = latest[field.key as keyof typeof latest];
            const trendData = vitals.slice(0, 10).reverse().map(v => ({ val: v[field.key as keyof typeof v] })).filter(d => d.val != null);

            return (
              <motion.div key={field.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="rounded-xl border border-lau-border bg-card p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{field.icon}</span>
                    <div>
                      <p className="text-sm font-body text-muted-foreground">{field.label}</p>
                      <p className="text-xl font-heading font-bold text-foreground">
                        {value != null ? `${value} ${field.unit}` : '—'}
                      </p>
                    </div>
                  </div>
                  {trendData.length > 1 && (
                    <div className="w-24 h-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={trendData}>
                          <Line type="monotone" dataKey="val" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                {latest.source && (
                  <span className="text-[10px] mt-1 inline-block px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">
                    {sourceLabel(latest.source)}
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/50 z-50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-card rounded-2xl border border-lau-border p-6 w-full max-w-md shadow-lg" onClick={e => e.stopPropagation()}>
            <h2 className="font-heading text-lg font-bold text-foreground mb-4">Log New Vitals</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {vitalFields.map(field => (
                <div key={field.key}>
                  <label className="text-sm font-body text-muted-foreground mb-1 block">{field.label} ({field.unit})</label>
                  <input type="number" value={newVitals[field.key] || ''} onChange={e => setNewVitals(prev => ({ ...prev, [field.key]: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl border border-lau-border bg-background text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    placeholder={`Enter ${field.label.toLowerCase()}`} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-full border border-lau-border font-heading font-semibold text-sm hover:bg-accent transition-colors">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex-1 py-2 rounded-full bg-primary text-primary-foreground font-heading font-semibold text-sm hover:bg-lau-green-dark transition-colors disabled:opacity-50">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
