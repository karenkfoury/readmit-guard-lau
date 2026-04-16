import { Link } from '@tanstack/react-router';
import { Checkbox } from '@/components/ui/checkbox';
import { Pill, ClipboardList, Stethoscope } from 'lucide-react';

interface DayChecklistProps {
  dayNumber: number;
  isCurrentDay: boolean;
  isPast: boolean;
  allMedsTaken: boolean;
  medsTakenCount: number;
  medsTotal: number;
  checkInStatus: 'upcoming' | 'pending' | 'completed' | 'missed' | null;
  onLogSymptoms?: () => void;
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
}: DayChecklistProps) {
  const isCheckUpDay = [3, 7, 14].includes(dayNumber);
  const checkUpDone = checkInStatus === 'completed';

  return (
    <div className={`flex-1 rounded-2xl border p-4 ${
      isCurrentDay
        ? 'border-primary/30 bg-card shadow-sm'
        : 'border-lau-border bg-card/60'
    }`}>
      <div className="space-y-3">
        {/* Medication task */}
        <Link to="/patient/medications" className="flex items-start gap-3 group">
          <Checkbox
            checked={allMedsTaken}
            className="mt-0.5 pointer-events-none"
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

        {/* Check-up form task */}
        {isCheckUpDay && (
          <Link
            to="/patient/checkin/$day"
            params={{ day: String(dayNumber) }}
            className="flex items-start gap-3 group"
          >
            <Checkbox
              checked={checkUpDone}
              className="mt-0.5 pointer-events-none"
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
          <div className="flex items-start gap-3 opacity-60">
            <Checkbox checked={false} className="mt-0.5 pointer-events-none" disabled />
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
