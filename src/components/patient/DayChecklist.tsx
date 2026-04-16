import { Link } from '@tanstack/react-router';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill, ClipboardList, Stethoscope, Calendar } from 'lucide-react';

interface Appointment {
  id: string;
  doctor_name?: string;
  scheduled_at: string;
  reason?: string;
}

interface DayChecklistProps {
  dayNumber: number;
  isCurrentDay: boolean;
  isPast: boolean;
  allMedsTaken: boolean;
  medsTakenCount: number;
  medsTotal: number;
  checkInStatus: 'upcoming' | 'pending' | 'completed' | 'missed' | null;
  onLogSymptoms?: () => void;
  appointments?: Appointment[];
  checklistCompletions?: Record<string, boolean>;
  onToggleTask?: (taskType: string, refId?: string) => void;
}

const checkUpDetails: Record<number, string> = {
  3: 'Check weight · Review symptoms',
  7: 'Medication adherence · Side effects',
  14: 'Overall status · Schedule follow-up',
};

export function DayChecklist({
  dayNumber,
  isCurrentDay,
  isPast,
  allMedsTaken,
  medsTakenCount,
  medsTotal,
  checkInStatus,
  appointments = [],
  checklistCompletions = {},
  onToggleTask,
}: DayChecklistProps) {
  const isCheckUpDay = [3, 7, 14].includes(dayNumber);
  const checkUpDone = checkInStatus === 'completed';

  return (
    <div className={`flex-1 rounded-2xl border p-4 ${
      isCurrentDay
        ? 'border-l-4 border-l-primary border-primary/30 bg-card shadow-md p-5'
        : isPast
          ? 'border-lau-border bg-card/60 opacity-90'
          : 'border-lau-border bg-card/60 opacity-90'
    }`}>
      <div className="space-y-3">
        {/* Medication task */}
        <Link to="/patient/medications" className="flex items-start gap-3 group min-h-[44px]">
          <Checkbox
            checked={allMedsTaken}
            className="mt-0.5 pointer-events-none h-6 w-6 rounded-md"
            aria-checked={allMedsTaken}
          />
          <div className="flex-1">
            <p className={`text-sm font-body font-semibold ${allMedsTaken ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
              Take medication
            </p>
            <p className="text-xs text-muted-foreground font-body">
              {isPast
                ? allMedsTaken ? 'All doses taken' : `${medsTakenCount} of ${medsTotal} taken`
                : isCurrentDay
                  ? `${medsTakenCount} of ${medsTotal} taken today`
                  : `${medsTotal} doses scheduled`}
            </p>
          </div>
          <Pill className="h-4 w-4 text-primary/60 mt-0.5" />
        </Link>

        {/* Appointment tasks */}
        {appointments.map(appt => {
          const time = new Date(appt.scheduled_at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
          const done = checklistCompletions[`followup_${appt.id}`] || false;
          return (
            <div key={appt.id} className="flex items-start gap-3 min-h-[44px]">
              <Checkbox
                checked={done}
                onCheckedChange={() => onToggleTask?.('followup', appt.id)}
                className="mt-0.5 h-6 w-6 rounded-md"
                aria-checked={done}
              />
              <div className="flex-1">
                <p className={`text-sm font-body font-semibold ${done ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                  Follow-up{appt.doctor_name ? ` with ${appt.doctor_name}` : ''} at {time}
                </p>
                {appt.reason && <p className="text-xs text-muted-foreground font-body">{appt.reason}</p>}
              </div>
              <Calendar className="h-4 w-4 text-primary/60 mt-0.5" />
            </div>
          );
        })}

        {/* Check-up form task */}
        {isCheckUpDay && (
          <Link
            to="/patient/checkin/$day"
            params={{ day: String(dayNumber) }}
            className="flex items-start gap-3 group min-h-[44px]"
          >
            <Checkbox
              checked={checkUpDone}
              className="mt-0.5 pointer-events-none h-6 w-6 rounded-md"
              aria-checked={checkUpDone}
            />
            <div className="flex-1">
              <p className={`text-sm font-body font-semibold ${checkUpDone ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                Complete Day {dayNumber} check-up
              </p>
              <p className="text-xs text-muted-foreground font-body">
                {checkUpDetails[dayNumber]}
              </p>
            </div>
            <ClipboardList className="h-4 w-4 text-primary/60 mt-0.5" />
          </Link>
        )}

        {/* Symptom log reminder for current day */}
        {isCurrentDay && (
          <div className="flex items-start gap-3 opacity-60 min-h-[44px]">
            <Checkbox checked={false} className="mt-0.5 pointer-events-none h-6 w-6 rounded-md" disabled />
            <div className="flex-1">
              <p className="text-sm font-body text-muted-foreground">Log symptoms</p>
              <p className="text-xs text-muted-foreground font-body">Use the button below</p>
            </div>
            <Stethoscope className="h-4 w-4 text-muted-foreground mt-0.5" />
          </div>
        )}
      </div>
    </div>
  );
}
