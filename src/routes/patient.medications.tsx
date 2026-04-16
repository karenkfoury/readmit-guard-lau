import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Pill, Check, X, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/patient/medications')({
  component: MedicationsPage,
});

function MedicationsPage() {
  const { user } = useAuth();
  const { medications, medicationLogs, refresh, loading } = usePatientData(user?.id);
  const [tab, setTab] = useState<'today' | 'all'>('today');
  const [marking, setMarking] = useState<string | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayLogs = medicationLogs.filter(l => l.scheduled_at?.startsWith(today));
  const takenCount = todayLogs.filter(l => l.taken).length;
  const totalCount = medications.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  const handleTaken = async (medId: string) => {
    if (!user) return;
    setMarking(medId);
    await supabase.from('medication_logs').insert({
      medication_id: medId,
      patient_id: user.id,
      scheduled_at: new Date().toISOString(),
      taken: true,
      taken_at: new Date().toISOString(),
    });
    setMarking(null);
    refresh();
  };

  const handleSkipped = async (medId: string, reason: string) => {
    if (!user) return;
    setMarking(medId);
    await supabase.from('medication_logs').insert({
      medication_id: medId,
      patient_id: user.id,
      scheduled_at: new Date().toISOString(),
      taken: false,
      skipped_reason: reason,
    });
    setMarking(null);
    refresh();
  };

  const isTakenToday = (medId: string) => todayLogs.some(l => l.medication_id === medId && l.taken);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-foreground">Medications</h1>
      </div>

      {/* Adherence Ring */}
      <div className="rounded-xl border border-lau-border bg-card p-5 shadow-sm flex items-center gap-4">
        <div className="relative h-16 w-16">
          <svg className="h-16 w-16 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-lau-border)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-primary)" strokeWidth="3"
              strokeDasharray={`${adherencePercent} ${100 - adherencePercent}`} strokeLinecap="round" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-sm font-heading font-bold text-primary">{adherencePercent}%</span>
        </div>
        <div>
          <p className="font-heading font-semibold text-foreground">{takenCount} of {totalCount} doses taken today</p>
          <p className="text-sm text-muted-foreground font-body">Keep up the great work!</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <button onClick={() => setTab('today')} className={`flex-1 py-2 rounded-md text-sm font-heading font-semibold transition-colors ${tab === 'today' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
          Today's Schedule
        </button>
        <button onClick={() => setTab('all')} className={`flex-1 py-2 rounded-md text-sm font-heading font-semibold transition-colors ${tab === 'all' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}>
          All Medications
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 rounded-xl bg-card animate-pulse border border-lau-border" />)}
        </div>
      ) : tab === 'today' ? (
        <div className="space-y-3">
          {medications.map((med, i) => {
            const taken = isTakenToday(med.id);
            return (
              <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`rounded-xl border bg-card p-4 shadow-sm transition-all ${taken ? 'border-risk-low/50 opacity-70' : 'border-lau-border'}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${taken ? 'bg-risk-low/10 text-risk-low' : 'bg-primary/10 text-primary'}`}>
                      {taken ? <Check className="h-5 w-5" /> : <Pill className="h-5 w-5" />}
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-foreground">{med.name}</p>
                      <p className="text-xs text-muted-foreground font-body">{med.dosage} · {med.frequency}</p>
                      {med.instructions && <p className="text-xs text-muted-foreground font-body mt-0.5">{med.instructions}</p>}
                    </div>
                  </div>
                  {!taken && (
                    <div className="flex gap-2">
                      <button onClick={() => handleTaken(med.id)} disabled={marking === med.id}
                        className="px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:bg-lau-green-dark transition-colors disabled:opacity-50">
                        ✓ Taken
                      </button>
                      <button onClick={() => handleSkipped(med.id, 'skipped')} disabled={marking === med.id}
                        className="px-3 py-1.5 rounded-full border border-lau-border text-xs font-semibold hover:bg-accent transition-colors disabled:opacity-50">
                        Skip
                      </button>
                    </div>
                  )}
                  {taken && <span className="text-xs text-risk-low font-body font-semibold">✓ Done</span>}
                </div>
              </motion.div>
            );
          })}
          {medications.length === 0 && (
            <div className="text-center py-12 text-muted-foreground font-body">
              <Pill className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No medications prescribed yet.
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {medications.map((med, i) => (
            <motion.div key={med.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-lau-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <Pill className="h-5 w-5 text-primary" />
                <h3 className="font-heading font-semibold text-foreground">{med.name}</h3>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm font-body">
                <div><span className="text-muted-foreground">Dosage:</span> <span className="text-foreground font-semibold">{med.dosage}</span></div>
                <div><span className="text-muted-foreground">Frequency:</span> <span className="text-foreground font-semibold">{med.frequency}</span></div>
                {med.prescribing_doctor && <div><span className="text-muted-foreground">Doctor:</span> <span className="text-foreground font-semibold">{med.prescribing_doctor}</span></div>}
                {med.start_date && <div><span className="text-muted-foreground">Since:</span> <span className="text-foreground font-semibold">{med.start_date}</span></div>}
              </div>
              {med.instructions && <p className="text-xs text-muted-foreground font-body mt-2 italic">{med.instructions}</p>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
