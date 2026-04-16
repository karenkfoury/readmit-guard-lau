import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useChecklist(patientId: string | undefined) {
  const [completions, setCompletions] = useState<Record<string, boolean>>({});
  const [appointments, setAppointments] = useState<any[]>([]);

  const fetchData = useCallback(async () => {
    if (!patientId) return;
    const [apptRes, ccRes] = await Promise.all([
      supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'scheduled')
        .order('scheduled_at'),
      supabase.from('checklist_completions').select('*').eq('patient_id', patientId),
    ]);
    setAppointments(apptRes.data || []);
    const map: Record<string, boolean> = {};
    (ccRes.data || []).forEach((c: any) => {
      const key = c.task_reference_id
        ? `${c.task_type}_${c.task_reference_id}`
        : `${c.task_type}_day${c.recovery_day}`;
      map[key] = c.completed;
    });
    setCompletions(map);
  }, [patientId]);

  useEffect(() => {
    fetchData();
    if (!patientId) return;
    const ch = supabase
      .channel(`checklist-${patientId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'appointments',
        filter: `patient_id=eq.${patientId}`,
      }, () => fetchData())
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'checklist_completions',
        filter: `patient_id=eq.${patientId}`,
      }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [patientId, fetchData]);

  const toggleTask = useCallback(
    async (currentDay: number, taskType: string, refId?: string) => {
      if (!patientId) return;
      const key = refId ? `${taskType}_${refId}` : `${taskType}_day${currentDay}`;
      const newVal = !completions[key];
      setCompletions((prev) => ({ ...prev, [key]: newVal }));

      try {
        await supabase.from('checklist_completions').upsert(
          {
            patient_id: patientId,
            recovery_day: currentDay,
            task_type: taskType as any,
            task_reference_id: refId || null,
            completed: newVal,
            completed_at: newVal ? new Date().toISOString() : null,
          },
          { onConflict: 'patient_id,recovery_day,task_type,task_reference_id' },
        );
      } catch {
        setCompletions((prev) => ({ ...prev, [key]: !newVal }));
      }
    },
    [patientId, completions],
  );

  return { completions, appointments, toggleTask, refetch: fetchData };
}
