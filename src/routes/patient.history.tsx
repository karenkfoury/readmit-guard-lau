import { createFileRoute } from '@tanstack/react-router';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';

export const Route = createFileRoute('/patient/history')({
  component: PatientHistory,
});

function PatientHistory() {
  const { user } = useAuth();
  const { checkIns, vitals, chatMessages, loading } = usePatientData(user?.id);

  const completed = checkIns.filter((c: any) => c.status === 'completed');

  if (loading) {
    return <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 rounded-xl bg-card animate-pulse border border-lau-border" />)}</div>;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-heading text-2xl font-bold text-foreground">History</h1>

      {completed.length === 0 && vitals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground font-body">No history yet. Complete check-ins and log vitals to see your timeline.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {completed.map((c: any, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="rounded-xl border border-lau-border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-heading font-semibold text-foreground">Day {c.day_number} Check-In</h3>
                <span className="text-xs text-muted-foreground font-body">
                  {c.completed_at ? new Date(c.completed_at).toLocaleDateString() : ''}
                </span>
              </div>
              {c.risk_delta !== null && (
                <p className="text-sm font-body text-muted-foreground mb-3">
                  Risk change: <span className={`font-semibold ${c.risk_delta > 0 ? 'text-risk-high' : 'text-risk-low'}`}>
                    {c.risk_delta > 0 ? '+' : ''}{c.risk_delta}%
                  </span>
                </p>
              )}
              {c.responses && Object.keys(c.responses).length > 0 && (
                <div className="space-y-1">
                  {Object.entries(c.responses as Record<string, any>).filter(([_, v]) => v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)).map(([key, val]) => (
                    <div key={key} className="flex justify-between text-sm font-body">
                      <span className="text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="text-foreground font-semibold">{Array.isArray(val) ? val.join(', ') : String(val)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}

          {vitals.length > 0 && (
            <>
              <h2 className="font-heading text-lg font-semibold text-foreground mt-6">Recent Vitals</h2>
              {vitals.slice(0, 5).map((v: any, i: number) => (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="rounded-xl border border-lau-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-body">
                      {v.source === 'hospital' ? 'Hospital' : v.source === 'chatbot_extracted' ? 'From Chat' : 'Self-reported'}
                    </span>
                    <span className="text-xs text-muted-foreground font-body">{new Date(v.recorded_at).toLocaleDateString()}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm font-body">
                    {v.weight_kg && <div><span className="text-muted-foreground">Weight:</span> <span className="font-semibold text-foreground">{v.weight_kg} kg</span></div>}
                    {v.heart_rate_bpm && <div><span className="text-muted-foreground">HR:</span> <span className="font-semibold text-foreground">{v.heart_rate_bpm} bpm</span></div>}
                    {v.oxygen_saturation && <div><span className="text-muted-foreground">SpO₂:</span> <span className="font-semibold text-foreground">{v.oxygen_saturation}%</span></div>}
                    {v.blood_pressure_systolic && <div><span className="text-muted-foreground">BP:</span> <span className="font-semibold text-foreground">{v.blood_pressure_systolic}/{v.blood_pressure_diastolic}</span></div>}
                  </div>
                </motion.div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
