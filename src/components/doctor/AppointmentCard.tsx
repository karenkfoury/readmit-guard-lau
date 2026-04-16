import { motion } from 'framer-motion';
import { Clock, Video, Phone, MapPin } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { PatientRiskBadge } from './PatientRiskBadge';

interface AppointmentItem {
  id: string;
  patientId?: string;
  patientName: string;
  patientAge?: number;
  patientDiagnosis?: string;
  riskScore: number;
  time: string | null;
  duration: number | null;
  reason: string;
  type: string | null;
  priority: string;
  status: string;
  source: string;
  assignedClinician: string | null;
}

interface AppointmentCardProps {
  item: AppointmentItem;
  index: number;
  onMarkComplete: () => void;
  onCancel?: () => void;
}

function typeIcon(type: string | null) {
  if (type === 'telehealth') return <Video className="h-3.5 w-3.5" />;
  if (type === 'phone_call') return <Phone className="h-3.5 w-3.5" />;
  return <MapPin className="h-3.5 w-3.5" />;
}

export function AppointmentCard({ item, index, onMarkComplete, onCancel }: AppointmentCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border border-lau-border bg-card p-4 shadow-sm"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-semibold text-sm text-lau-anthracite">{item.patientName}</h3>
        {item.riskScore > 0 && <PatientRiskBadge score={item.riskScore} size="sm" />}
      </div>

      {(item.patientAge || item.patientDiagnosis) && (
        <p className="text-xs text-muted-foreground font-body mb-1">
          {item.patientAge && `${item.patientAge}yo`}
          {item.patientAge && item.patientDiagnosis && ' · '}
          {item.patientDiagnosis}
        </p>
      )}

      {item.time && (
        <div className="flex items-center gap-2 text-xs text-lau-anthracite font-body mb-1">
          <Clock className="h-3 w-3" />
          <span className="font-heading font-bold tabular-nums">{item.time}</span>
          {item.duration && <span className="text-muted-foreground">({item.duration} min)</span>}
        </div>
      )}

      <p className="text-xs text-muted-foreground font-body mb-2">{item.reason}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase ${
              item.status === 'completed'
                ? 'bg-risk-low-bg text-risk-low'
                : item.status === 'cancelled'
                  ? 'bg-lau-bg text-muted-foreground'
                  : 'bg-lau-green-tint text-primary'
            }`}
          >
            {item.status}
          </span>
          {item.type && (
            <span className="text-[10px] text-muted-foreground font-body flex items-center gap-1">
              {typeIcon(item.type)} {item.type?.replace('_', ' ')}
            </span>
          )}
        </div>
        {item.assignedClinician && (
          <span className="text-[10px] text-muted-foreground font-body">{item.assignedClinician}</span>
        )}
      </div>

      <div className="flex gap-2 mt-3">
        {item.patientId && (
          <Link
            to="/doctor/patient/$id"
            params={{ id: item.patientId }}
            className="flex-1 text-xs py-2 rounded-full border border-lau-border text-lau-anthracite font-semibold hover:bg-lau-green-tint transition-colors text-center"
          >
            View Patient
          </Link>
        )}
        {item.status === 'scheduled' && (
          <button
            onClick={onMarkComplete}
            className="flex-1 text-xs py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:bg-lau-green-dark transition-colors"
          >
            Mark Complete
          </button>
        )}
        {item.status === 'scheduled' && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs py-2 px-3 rounded-full border border-lau-border text-muted-foreground font-semibold hover:bg-risk-high-bg hover:text-risk-high transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </motion.div>
  );
}
