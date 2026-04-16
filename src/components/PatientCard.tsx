import { Link } from '@tanstack/react-router';
import type { Patient } from '@/types';
import { RiskBadge, RiskTrendArrow } from './RiskBadge';
import { cn } from '@/lib/utils';
import { Pill, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export function PatientCard({ patient, index = 0 }: { patient: Patient; index?: number }) {
  const latestCheckIn = patient.checkIns.filter(c => c.status === 'completed').pop();
  const needsFollowUp = patient.riskScore >= 50;
  const isHigh = patient.riskScore >= 50;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
    >
      <Link
        to="/doctor/patient/$id"
        params={{ id: patient.id }}
        className="block"
      >
        <div className={cn(
          'rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-all cursor-pointer',
          isHigh && 'border-l-4 border-l-risk-high',
          !isHigh && 'border-lau-border',
        )}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-heading font-semibold text-foreground">{patient.name}</h3>
              <p className="text-sm text-muted-foreground font-body">{patient.age}yo · {patient.diagnosis}</p>
            </div>
            <div className="flex items-center gap-2">
              <RiskTrendArrow current={patient.riskScore} previous={patient.previousRiskScore} />
              <RiskBadge score={patient.riskScore} />
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {latestCheckIn && (
              <span className="inline-flex items-center text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5 font-body">
                Day {latestCheckIn.day} ✓
              </span>
            )}
            {patient.medications.length >= 5 && (
              <span className="inline-flex items-center text-xs text-muted-foreground gap-1">
                <Pill className="h-3 w-3" />
                {patient.medications.length} meds
              </span>
            )}
            {needsFollowUp && (
              <span className="inline-flex items-center text-xs bg-risk-high/10 text-risk-high rounded-full px-2 py-0.5 font-semibold gap-1">
                <AlertTriangle className="h-3 w-3" />
                Needs Follow-Up
              </span>
            )}
          </div>

          <p className="text-xs text-muted-foreground font-body">
            Discharged {patient.dischargeDate} · {Math.ceil((Date.now() - new Date(patient.dischargeDate).getTime()) / 86400000)} days ago
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
