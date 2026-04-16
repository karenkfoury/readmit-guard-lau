import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { DayBubble } from '@/components/patient/DayBubble';
import { DayChecklist } from '@/components/patient/DayChecklist';
import { SymptomLogSheet } from '@/components/patient/SymptomLogSheet';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/patient/')({
  component: PatientDashboardIndex,
});

function PatientDashboardIndex() {
  const { user } = useAuth();
  const { medicalRecord, checkIns, medications, medicationLogs, loading } = usePatientData(user?.id);
  const [symptomSheetOpen, setSymptomSheetOpen] = useState(false);

  const currentDay = medicalRecord?.discharge_date
    ? Math.max(1, Math.ceil((Date.now() - new Date(medicalRecord.discharge_date).getTime()) / 86400000))
    : 1;

  const days = [currentDay - 1, currentDay, currentDay + 1].filter(d => d >= 1);
  const today = new Date().toISOString().split('T')[0];

  const getMedStatusForDay = (dayNum: number) => {
    const isToday = dayNum === currentDay;
    const todayLogs = medicationLogs.filter((l: any) => l.scheduled_at?.startsWith(today) && l.taken);
    return {
      allTaken: isToday ? todayLogs.length >= medications.length && medications.length > 0 : dayNum < currentDay,
      takenCount: isToday ? todayLogs.length : dayNum < currentDay ? medications.length : 0,
      total: medications.length,
    };
  };

  const getCheckInStatus = (dayNum: number) => {
    const ci = checkIns.find((c: any) => c.day_number === dayNum);
    return ci?.status ?? null;
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 rounded-2xl bg-card animate-pulse border border-lau-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Date header */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-heading text-2xl md:text-3xl font-bold text-foreground">{dateStr}</h1>
        <p className="text-sm text-muted-foreground font-body mt-1">
          Day {currentDay} of recovery
          {medicalRecord?.primary_diagnosis && ` · ${medicalRecord.primary_diagnosis}`}
        </p>
      </motion.div>

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {/* Vertical connector line */}
        <div className="absolute left-5 md:left-8 top-6 bottom-6 w-px bg-lau-border" />

        <div className="space-y-4">
          {days.map((dayNum, idx) => {
            const isCurrent = dayNum === currentDay;
            const isPast = dayNum < currentDay;
            const medStatus = getMedStatusForDay(dayNum);
            const ciStatus = getCheckInStatus(dayNum);

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
                <DayChecklist
                  dayNumber={dayNum}
                  isCurrentDay={isCurrent}
                  isPast={isPast}
                  allMedsTaken={medStatus.allTaken}
                  medsTakenCount={medStatus.takenCount}
                  medsTotal={medStatus.total}
                  checkInStatus={ciStatus}
                  onLogSymptoms={() => setSymptomSheetOpen(true)}
                />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Log Symptoms button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <Button
          variant="outline"
          className="rounded-full border-2 border-primary text-primary hover:bg-primary/5 gap-2 px-6"
          onClick={() => setSymptomSheetOpen(true)}
        >
          <Stethoscope className="h-4 w-4" />
          Log Symptoms
        </Button>
      </motion.div>

      <SymptomLogSheet
        open={symptomSheetOpen}
        onOpenChange={setSymptomSheetOpen}
        patientId={user?.id}
      />
    </div>
  );
}
