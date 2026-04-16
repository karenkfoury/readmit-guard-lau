import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { useRecoveryDay, getDayDateString } from '@/hooks/useRecoveryDay';
import { useChecklist } from '@/hooks/useChecklist';
import { RecoveryTimeline } from '@/components/patient/RecoveryTimeline';
import { SymptomLogSheet } from '@/components/patient/SymptomLogSheet';
import { Button } from '@/components/ui/button';

export const Route = createFileRoute('/patient/')({
  component: PatientDashboardIndex,
});

function PatientDashboardIndex() {
  const { user } = useAuth();
  const { medicalRecord, checkIns, medications, medicationLogs, loading } = usePatientData(user?.id);
  const [symptomSheetOpen, setSymptomSheetOpen] = useState(false);

  const { currentDay, days } = useRecoveryDay(medicalRecord?.discharge_date);
  const { completions, appointments, toggleTask } = useChecklist(user?.id);

  const today = new Date().toISOString().split('T')[0];

  const getMedStatusForDay = (dayNum: number) => {
    const isToday = dayNum === currentDay;
    const todayLogs = medicationLogs.filter((l: any) => l.scheduled_at?.startsWith(today) && l.taken);
    return {
      allTaken: isToday
        ? todayLogs.length >= medications.length && medications.length > 0
        : dayNum < currentDay,
      takenCount: isToday ? todayLogs.length : dayNum < currentDay ? medications.length : 0,
      total: medications.length,
    };
  };

  const getCheckInStatus = (dayNum: number) => {
    const ci = checkIns.find((c: any) => c.day_number === dayNum);
    return ci?.status ?? null;
  };

  const getAppointmentsForDay = (dayNum: number) => {
    if (!medicalRecord?.discharge_date) return [];
    const dayStr = getDayDateString(medicalRecord.discharge_date, dayNum);
    return appointments.filter((a: any) => a.scheduled_at?.startsWith(dayStr));
  };

  const handleToggleTask = (taskType: string, refId?: string) => {
    toggleTask(currentDay, taskType, refId);
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-card animate-pulse border border-lau-border" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* A1.1 Current date display */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-baseline justify-between"
      >
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-lau-anthracite">{dateStr}</h1>
        <span className="text-sm text-lau-anthracite/70 font-body">
          {currentDay === 0 ? 'Day of discharge' : `Day ${currentDay} of recovery`}
        </span>
      </motion.div>

      {medicalRecord?.primary_diagnosis && (
        <p className="text-sm text-muted-foreground font-body -mt-4">
          {medicalRecord.primary_diagnosis}
        </p>
      )}

      {/* A1.2 + A1.3 Recovery timeline with checklists */}
      <RecoveryTimeline
        days={days}
        currentDay={currentDay}
        getMedStatusForDay={getMedStatusForDay}
        getCheckInStatus={getCheckInStatus}
        getAppointmentsForDay={getAppointmentsForDay}
        completions={completions}
        onToggleTask={handleToggleTask}
        onLogSymptoms={() => setSymptomSheetOpen(true)}
      />

      {/* A1.4 Log Symptoms button */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex justify-end"
      >
        <Button
          variant="outline"
          className="rounded-full border-2 border-primary text-primary hover:bg-primary/5 gap-2 px-6 h-11"
          onClick={() => setSymptomSheetOpen(true)}
        >
          <Activity className="h-4 w-4" />
          Log Symptoms
        </Button>
      </motion.div>

      {/* A1.5 Symptom Log Sheet */}
      <SymptomLogSheet
        open={symptomSheetOpen}
        onOpenChange={setSymptomSheetOpen}
        patientId={user?.id}
      />
    </div>
  );
}
