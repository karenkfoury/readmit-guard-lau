import { CalendarPlus, Phone, MessageSquare, MoreHorizontal } from 'lucide-react';
import { RiskGauge } from '@/components/RiskGauge';
import { RiskTrendArrow } from '@/components/RiskBadge';
import { PatientRiskBadge } from '@/components/doctor/PatientRiskBadge';
import { Button } from '@/components/ui/button';
import { getRiskLevel, getRiskCategoryLabel } from '@/lib/riskEngine';
import type { Patient } from '@/types';

interface HeaderBandProps {
  patient: Patient;
  daysSinceDischarge: number;
  onAddToSchedule: () => void;
}

export function HeaderBand({ patient, daysSinceDischarge, onAddToSchedule }: HeaderBandProps) {
  const riskLevel = getRiskLevel(patient.riskScore);
  const riskCategoryLabel = getRiskCategoryLabel(patient.riskScore);

  return (
    <div className="grid md:grid-cols-3 gap-6 mb-6">
      <div className="md:col-span-2 rounded-2xl border border-lau-border bg-card p-6 shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-lau-green-tint flex items-center justify-center text-primary font-heading font-bold text-xl">
              {patient.name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </div>
            <div>
              <h1 className="font-heading text-2xl md:text-3xl font-bold text-lau-anthracite">
                {patient.name}
              </h1>
              <p className="text-muted-foreground font-body">
                {patient.age}yo · {patient.gender === 'M' ? 'Male' : 'Female'}
              </p>
              <div className="flex gap-2 mt-1 flex-wrap">
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-body font-semibold">
                  {patient.diagnosis}
                </span>
                {patient.comorbidities.map((c) => (
                  <span
                    key={c}
                    className="text-xs bg-lau-bg text-muted-foreground px-2 py-0.5 rounded-full font-body"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button onClick={onAddToSchedule} className="rounded-full gap-2">
              <CalendarPlus className="h-4 w-4" /> Add to Schedule
            </Button>
            {patient.phone && (
              <a href={`tel:${patient.phone}`}>
                <Button variant="outline" className="rounded-full gap-2">
                  <Phone className="h-4 w-4" /> Call
                </Button>
              </a>
            )}
            {patient.email && (
              <a href={`mailto:${patient.email}`}>
                <Button variant="outline" className="rounded-full gap-2">
                  <MessageSquare className="h-4 w-4" /> Message
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm font-body text-muted-foreground">
          <span>Discharged {patient.dischargeDate}</span>
          <span className="text-lau-anthracite font-semibold">{daysSinceDischarge} days post-discharge</span>
        </div>
      </div>

      {/* Risk Gauge */}
      <div className="rounded-2xl border border-lau-border bg-card p-6 shadow-sm flex flex-col items-center justify-center">
        <RiskGauge score={patient.riskScore} size={160} />
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-xs font-heading font-bold uppercase tracking-wide ${
              riskLevel === 'high'
                ? 'text-risk-high'
                : riskLevel === 'moderate'
                  ? 'text-risk-moderate'
                  : 'text-risk-low'
            }`}
          >
            {riskCategoryLabel}
          </span>
          <RiskTrendArrow current={patient.riskScore} previous={patient.previousRiskScore} />
          {patient.previousRiskScore !== undefined && (
            <span className="text-xs text-muted-foreground font-body">
              {patient.riskScore > patient.previousRiskScore ? '+' : ''}
              {patient.riskScore - patient.previousRiskScore} pts
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
