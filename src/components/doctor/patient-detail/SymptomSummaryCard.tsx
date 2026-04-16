import { motion } from 'framer-motion';
import { Thermometer } from 'lucide-react';
import type { CheckIn } from '@/types';

interface SymptomSummaryCardProps {
  latestSymptom: any;
  latestCompleted?: CheckIn;
}

function sobLabel(v: string) {
  return v === 'none' ? 'None' : v === 'mild' ? 'Mild' : v === 'moderate' ? 'Moderate' : 'Severe';
}

function feelingLabel(v: number) {
  return ['', 'Bad', 'Not great', 'Okay', 'Good', 'Great'][v] || '';
}

function FlagChip({ label, variant }: { label: string; variant: 'high' | 'moderate' | 'low' }) {
  const styles = {
    high: 'bg-risk-high-bg text-risk-high',
    moderate: 'bg-risk-moderate-bg text-risk-moderate',
    low: 'bg-lau-green-tint text-primary',
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${styles[variant]}`}>{label}</span>;
}

export function SymptomSummaryCard({ latestSymptom, latestCompleted }: SymptomSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-4 flex items-center gap-2">
        <Thermometer className="h-5 w-5 text-primary" /> Symptom Summary
      </h3>
      {latestSymptom ? (
        <div className="space-y-3">
          <p className="text-sm font-body text-lau-anthracite">
            Reports {sobLabel(latestSymptom.shortness_of_breath)} shortness of breath
            {latestSymptom.swelling_fatigue_flags?.length > 0 &&
              `, ${latestSymptom.swelling_fatigue_flags.join(', ').toLowerCase()}`}
            {latestSymptom.felt_worse && ', and feeling worse than before'}.{' '}Pain level{' '}
            {latestSymptom.pain_level}/10. Overall feeling: {feelingLabel(latestSymptom.overall_feeling)}.
          </p>
          <p className="text-xs text-muted-foreground font-body">
            Logged {new Date(latestSymptom.logged_at).toLocaleString()}
          </p>
          <div className="flex flex-wrap gap-2">
            {latestSymptom.felt_worse && <FlagChip label="Feeling worse" variant="high" />}
            {(latestSymptom.shortness_of_breath === 'moderate' ||
              latestSymptom.shortness_of_breath === 'severe') && (
              <FlagChip label={`SOB: ${sobLabel(latestSymptom.shortness_of_breath)}`} variant="moderate" />
            )}
            {latestSymptom.swelling_fatigue_flags?.map((f: string) => (
              <FlagChip key={f} label={f} variant="low" />
            ))}
          </div>
        </div>
      ) : latestCompleted ? (
        <div className="space-y-3">
          <p className="text-sm font-body text-lau-anthracite">
            Day {latestCompleted.day} check-in: symptoms {String(latestCompleted.responses.symptomsStatus || 'N/A')},
            SOB {String(latestCompleted.responses.shortnessOfBreath || 'N/A')}.
          </p>
          <p className="text-xs text-muted-foreground font-body">From Day {latestCompleted.day} check-in</p>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground font-body">No symptom data yet</p>
      )}
    </motion.div>
  );
}
