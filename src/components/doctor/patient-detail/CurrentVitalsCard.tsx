import { motion } from 'framer-motion';
import { Activity, Weight, Heart, Thermometer, Droplets, Wind } from 'lucide-react';
import type { CheckIn } from '@/types';

interface CurrentVitalsCardProps {
  latestVital: any;
  latestCompleted?: CheckIn;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function VitalItem({
  label,
  value,
  icon,
  source,
  time,
  alert: isAlert,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  source?: string;
  time?: string;
  alert?: boolean;
}) {
  return (
    <div className={`bg-lau-bg rounded-xl p-3 ${isAlert ? 'ring-1 ring-risk-high/30' : ''}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <span className="text-primary/60">{icon}</span>
        <span className="text-[10px] text-muted-foreground font-body">{label}</span>
      </div>
      <p className={`font-body font-semibold text-sm tabular-nums ${isAlert ? 'text-risk-high' : 'text-lau-anthracite'}`}>
        {value}
      </p>
      {source && <p className="text-[9px] text-muted-foreground font-body mt-0.5">{source.replace(/_/g, ' ')}</p>}
      {time && <p className="text-[9px] text-muted-foreground font-body">{timeAgo(time)}</p>}
    </div>
  );
}

export function CurrentVitalsCard({ latestVital, latestCompleted }: CurrentVitalsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm"
    >
      <h3 className="font-heading font-semibold text-lau-anthracite mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-primary" /> Current Vitals
      </h3>
      {latestVital ? (
        <div className="grid grid-cols-2 gap-3">
          {latestVital.weight_kg && (
            <VitalItem
              label="Weight"
              value={`${latestVital.weight_kg} kg`}
              icon={<Weight className="h-4 w-4" />}
              source={latestVital.source}
              time={latestVital.recorded_at}
            />
          )}
          {latestVital.blood_pressure_systolic && (
            <VitalItem
              label="Blood Pressure"
              value={`${latestVital.blood_pressure_systolic}/${latestVital.blood_pressure_diastolic}`}
              icon={<Heart className="h-4 w-4" />}
              source={latestVital.source}
              time={latestVital.recorded_at}
            />
          )}
          {latestVital.heart_rate_bpm && (
            <VitalItem
              label="Heart Rate"
              value={`${latestVital.heart_rate_bpm} bpm`}
              icon={<Heart className="h-4 w-4" />}
              source={latestVital.source}
              time={latestVital.recorded_at}
            />
          )}
          {latestVital.temperature_c && (
            <VitalItem
              label="Temperature"
              value={`${latestVital.temperature_c}°C`}
              icon={<Thermometer className="h-4 w-4" />}
              source={latestVital.source}
              time={latestVital.recorded_at}
            />
          )}
          {latestVital.oxygen_saturation && (
            <VitalItem
              label="O₂ Sat"
              value={`${latestVital.oxygen_saturation}%`}
              icon={<Droplets className="h-4 w-4" />}
              source={latestVital.source}
              time={latestVital.recorded_at}
              alert={latestVital.oxygen_saturation < 95}
            />
          )}
          {latestVital.respiratory_rate && (
            <VitalItem
              label="Resp. Rate"
              value={`${latestVital.respiratory_rate}/min`}
              icon={<Wind className="h-4 w-4" />}
              source={latestVital.source}
              time={latestVital.recorded_at}
            />
          )}
        </div>
      ) : (
        <div className="text-sm text-muted-foreground font-body">
          {latestCompleted?.responses?.weight ? (
            <div className="grid grid-cols-2 gap-3">
              <VitalItem
                label="Weight"
                value={`${latestCompleted.responses.weight} kg`}
                icon={<Weight className="h-4 w-4" />}
                source="check-in"
              />
              <VitalItem
                label="SOB"
                value={String(latestCompleted.responses.shortnessOfBreath || 'N/A')}
                icon={<Wind className="h-4 w-4" />}
                source="check-in"
              />
              <VitalItem
                label="Symptoms"
                value={String(latestCompleted.responses.symptomsStatus || 'N/A')}
                icon={<Activity className="h-4 w-4" />}
                source="check-in"
              />
            </div>
          ) : (
            'No vitals recorded yet'
          )}
        </div>
      )}
    </motion.div>
  );
}
