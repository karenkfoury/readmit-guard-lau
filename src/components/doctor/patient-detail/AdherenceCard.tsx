import { motion } from 'framer-motion';
import type { Patient } from '@/types';

interface AdherenceCardProps {
  patient: Patient;
  adherenceRate: number | null;
  medications: any[];
  medicationLogs: any[];
}

export function AdherenceCard({ patient, adherenceRate, medications, medicationLogs }: AdherenceCardProps) {
  const recentLogs = medicationLogs.filter(
    (l: any) => new Date(l.scheduled_at) > new Date(Date.now() - 7 * 86400000),
  );
  const takenCount = recentLogs.filter((l: any) => l.taken).length;
  const totalCount = recentLogs.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Medication Adherence</h3>
      <div className="flex items-center gap-4 mb-4">
        <span
          className={`text-4xl font-heading font-bold tabular-nums ${
            adherenceRate !== null
              ? adherenceRate >= 90
                ? 'text-risk-low'
                : adherenceRate >= 70
                  ? 'text-risk-moderate'
                  : 'text-risk-high'
              : 'text-muted-foreground'
          }`}
        >
          {adherenceRate !== null ? `${adherenceRate}%` : '—'}
        </span>
        <div>
          <span className="text-sm text-muted-foreground font-body block">7-day adherence</span>
          {totalCount > 0 && (
            <span className="text-xs text-muted-foreground font-body">
              {takenCount} of {totalCount} doses
            </span>
          )}
        </div>
      </div>
      <div className="space-y-2">
        {medications.length > 0
          ? medications.map((med: any) => {
              const medLogs = medicationLogs.filter((l: any) => l.medication_id === med.id);
              const last7 = medLogs.filter(
                (l: any) => new Date(l.scheduled_at) > new Date(Date.now() - 7 * 86400000),
              );
              return (
                <div key={med.id} className="flex items-center gap-2">
                  <span className="text-xs font-body text-lau-anthracite w-28 truncate">{med.name}</span>
                  <div className="flex gap-0.5 flex-1">
                    {Array.from({ length: 7 }).map((_, i) => {
                      const dayLogs = last7.filter((l: any) => {
                        const d = new Date(l.scheduled_at);
                        const target = new Date(Date.now() - (6 - i) * 86400000);
                        return d.toDateString() === target.toDateString();
                      });
                      const allTaken = dayLogs.length > 0 && dayLogs.every((l: any) => l.taken);
                      const partial =
                        dayLogs.length > 0 && dayLogs.some((l: any) => l.taken) && !allTaken;
                      const missed = dayLogs.length > 0 && dayLogs.every((l: any) => !l.taken);
                      return (
                        <div
                          key={i}
                          className={`h-3 flex-1 rounded-sm ${
                            allTaken
                              ? 'bg-risk-low'
                              : partial
                                ? 'bg-risk-moderate'
                                : missed
                                  ? 'bg-risk-high'
                                  : 'bg-lau-border'
                          }`}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })
          : patient.medications.map((m) => (
              <span
                key={m}
                className="text-xs bg-lau-green-tint text-primary px-2 py-0.5 rounded-full font-body mr-1"
              >
                {m}
              </span>
            ))}
      </div>
    </motion.div>
  );
}
