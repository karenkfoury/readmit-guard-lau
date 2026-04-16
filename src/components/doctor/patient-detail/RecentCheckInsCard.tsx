import { motion } from 'framer-motion';
import { RiskBadge } from '@/components/RiskBadge';
import type { Patient } from '@/types';

interface RecentCheckInsCardProps {
  patient: Patient;
}

export function RecentCheckInsCard({ patient }: RecentCheckInsCardProps) {
  const completedCheckIns = patient.checkIns.filter((c) => c.status === 'completed');

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-4">Recent Check-In Answers</h3>
      <div className="space-y-4">
        {completedCheckIns.map((c) => (
          <div key={c.day} className="bg-lau-bg rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-heading font-semibold text-sm text-lau-anthracite">Day {c.day}</span>
              {c.riskScoreAfter !== undefined && <RiskBadge score={c.riskScoreAfter} size="sm" />}
            </div>
            {c.completedAt && (
              <p className="text-[10px] text-muted-foreground font-body mb-2">
                {new Date(c.completedAt).toLocaleString()}
              </p>
            )}
            <div className="space-y-1">
              {Object.entries(c.responses)
                .filter(
                  ([_, v]) =>
                    v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0),
                )
                .map(([k, v]) => {
                  const riskContrib = getRiskContrib(k, v);
                  return (
                    <div key={k} className="flex justify-between text-xs font-body">
                      <span className="text-muted-foreground capitalize">
                        {k.replace(/([A-Z])/g, ' $1')}
                      </span>
                      <span className="text-lau-anthracite font-semibold flex items-center gap-1">
                        {Array.isArray(v) ? v.join(', ') : String(v)}
                        {riskContrib > 0 && (
                          <span className="text-[9px] text-risk-high bg-risk-high-bg px-1 rounded">
                            +{riskContrib} pts
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
        {completedCheckIns.length === 0 && (
          <p className="text-sm text-muted-foreground font-body">No completed check-ins yet</p>
        )}
      </div>
    </motion.div>
  );
}

function getRiskContrib(key: string, value: any): number {
  if (key === 'weightGainReported' && value === 'yes') return 15;
  if (key === 'symptomsStatus' && value === 'worsening') return 18;
  if (key === 'shortnessOfBreath' && (value === 'moderate' || value === 'severe')) return 12;
  if (key === 'missedDoses' && value === '3+') return 15;
  if (key === 'needsMedicalAttention' && value === 'yes') return 20;
  if (key === 'sideEffects' && Array.isArray(value) && value.length > 0) return 8;
  if (key === 'overallRating' && typeof value === 'number' && value < 5) return 12;
  return 0;
}
