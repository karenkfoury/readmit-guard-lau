import { motion } from 'framer-motion';
import { DayBubble } from './DayBubble';
import { DailyChecklistCard } from './DailyChecklistCard';

interface Appointment {
  id: string;
  doctor_name?: string;
  scheduled_at: string;
  reason?: string;
}

interface RecoveryTimelineProps {
  days: number[];
  currentDay: number;
  getMedStatusForDay: (day: number) => { allTaken: boolean; takenCount: number; total: number };
  getCheckInStatus: (day: number) => 'upcoming' | 'pending' | 'completed' | 'missed' | null;
  getAppointmentsForDay: (day: number) => Appointment[];
  completions: Record<string, boolean>;
  onToggleTask: (taskType: string, refId?: string) => void;
  onLogSymptoms: () => void;
}

export function RecoveryTimeline({
  days,
  currentDay,
  getMedStatusForDay,
  getCheckInStatus,
  getAppointmentsForDay,
  completions,
  onToggleTask,
  onLogSymptoms,
}: RecoveryTimelineProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative"
    >
      {/* Vertical connector line */}
      <div className="absolute left-[44px] top-6 bottom-6 w-px">
        <div className="w-full h-full bg-lau-border relative">
          {/* Completed segment overlay */}
          {days.length > 0 && (
            <div
              className="absolute top-0 left-0 w-full bg-primary transition-all duration-500"
              style={{
                height: `${Math.min(100, (days.filter(d => d < currentDay).length / Math.max(1, days.length - 1)) * 100)}%`,
              }}
            />
          )}
        </div>
      </div>

      <div className="space-y-4">
        {days.map((dayNum, idx) => {
          const isCurrent = dayNum === currentDay;
          const isPast = dayNum < currentDay;
          const medStatus = getMedStatusForDay(dayNum);
          const ciStatus = getCheckInStatus(dayNum);
          const dayAppts = getAppointmentsForDay(dayNum);

          return (
            <motion.div
              key={dayNum}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + idx * 0.08 }}
              className={`flex items-start gap-4 ${isCurrent ? '' : 'opacity-70'}`}
            >
              <div className={`relative z-10 flex-shrink-0 ${isCurrent ? 'mt-0' : 'mt-2'}`}>
                <DayBubble dayNumber={dayNum} isCurrentDay={isCurrent} isCompleted={isPast} />
              </div>
              <DailyChecklistCard
                dayNumber={dayNum}
                isCurrentDay={isCurrent}
                isPast={isPast}
                allMedsTaken={medStatus.allTaken}
                medsTakenCount={medStatus.takenCount}
                medsTotal={medStatus.total}
                checkInStatus={ciStatus}
                onLogSymptoms={onLogSymptoms}
                appointments={dayAppts.map((a) => ({
                  id: a.id,
                  doctor_name: a.doctor_name || undefined,
                  scheduled_at: a.scheduled_at,
                  reason: a.reason,
                }))}
                checklistCompletions={completions}
                onToggleTask={onToggleTask}
              />
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
