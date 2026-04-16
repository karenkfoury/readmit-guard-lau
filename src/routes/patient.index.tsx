import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePatientData } from '@/hooks/usePatientData';
import { DayBubble } from '@/components/patient/DayBubble';
import { DayChecklist } from '@/components/patient/DayChecklist';
import { SymptomLogSheet } from '@/components/patient/SymptomLogSheet';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const Route = createFileRoute('/patient/')({
  component: PatientDashboardIndex,
});

function PatientDashboardIndex() {
  const { user } = useAuth();
  const { medicalRecord, checkIns, medications, medicationLogs, loading } = usePatientData(user?.id);
  const [symptomSheetOpen, setSymptomSheetOpen] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [completions, setCompletions] = useState<Record<string, boolean>>({});

  // Fetch appointments and checklist completions
  useEffect(() => {
    if (!user?.id) return;
    const fetchExtra = async () => {
      const [apptRes, ccRes] = await Promise.all([
        supabase.from('appointments').select('*').eq('patient_id', user.id).eq('status', 'scheduled').order('scheduled_at'),
        supabase.from('checklist_completions').select('*').eq('patient_id', user.id),
      ]);
      setAppointments(apptRes.data || []);
      const map: Record<string, boolean> = {};
      (ccRes.data || []).forEach((c: any) => {
        const key = c.task_reference_id ? `${c.task_type}_${c.task_reference_id}` : `${c.task_type}_day${c.recovery_day}`;
        map[key] = c.completed;
      });
      setCompletions(map);
    };
    fetchExtra();

    // Realtime for appointments
    const ch = supabase.channel(`patient-appt-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${user.id}` }, () => fetchExtra())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'checklist_completions', filter: `patient_id=eq.${user.id}` }, () => fetchExtra())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const currentDay = medicalRecord?.discharge_date
    ? Math.max(0, Math.ceil((Date.now() - new Date(medicalRecord.discharge_date).getTime()) / 86400000))
    : 1;

  const days = currentDay === 0
    ? [0, 1]
    : currentDay === 1
      ? [1, 2]
      : [currentDay - 1, currentDay, currentDay + 1];

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

  const getAppointmentsForDay = (dayNum: number) => {
    if (!medicalRecord?.discharge_date) return [];
    const dischargeDate = new Date(medicalRecord.discharge_date);
    const dayDate = new Date(dischargeDate);
    dayDate.setDate(dayDate.getDate() + dayNum);
    const dayStr = dayDate.toISOString().split('T')[0];
    return appointments.filter(a => a.scheduled_at?.startsWith(dayStr));
  };

  const handleToggleTask = useCallback(async (taskType: string, refId?: string) => {
    if (!user?.id) return;
    const key = refId ? `${taskType}_${refId}` : `${taskType}_day${currentDay}`;
    const newVal = !completions[key];
    setCompletions(prev => ({ ...prev, [key]: newVal }));

    try {
      await supabase.from('checklist_completions').upsert({
        patient_id: user.id,
        recovery_day: currentDay,
        task_type: taskType as any,
        task_reference_id: refId || null,
        completed: newVal,
        completed_at: newVal ? new Date().toISOString() : null,
      }, { onConflict: 'patient_id,recovery_day,task_type,task_reference_id' });
    } catch {
      setCompletions(prev => ({ ...prev, [key]: !newVal }));
    }
  }, [user?.id, currentDay, completions]);

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
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-baseline justify-between">
        <h1 className="font-heading text-2xl md:text-3xl font-semibold text-lau-anthracite">{dateStr}</h1>
        <span className="text-sm text-lau-anthracite/70 font-body">
          Day {currentDay} of recovery
        </span>
      </motion.div>

      {medicalRecord?.primary_diagnosis && (
        <p className="text-sm text-muted-foreground font-body -mt-4">
          {medicalRecord.primary_diagnosis}
        </p>
      )}

      {/* Timeline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        {/* Vertical connector line */}
        <div className="absolute left-[44px] top-6 bottom-6 w-px">
          <div className="w-full h-full bg-lau-border" />
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
                <DayChecklist
                  dayNumber={dayNum}
                  isCurrentDay={isCurrent}
                  isPast={isPast}
                  allMedsTaken={medStatus.allTaken}
                  medsTakenCount={medStatus.takenCount}
                  medsTotal={medStatus.total}
                  checkInStatus={ciStatus}
                  onLogSymptoms={() => setSymptomSheetOpen(true)}
                  appointments={dayAppts.map(a => ({
                    id: a.id,
                    doctor_name: a.doctor_name || undefined,
                    scheduled_at: a.scheduled_at,
                    reason: a.reason,
                  }))}
                  checklistCompletions={completions}
                  onToggleTask={handleToggleTask}
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
          className="rounded-full border-2 border-primary text-primary hover:bg-primary/5 gap-2 px-6 h-11"
          onClick={() => setSymptomSheetOpen(true)}
        >
          <Activity className="h-4 w-4" />
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
