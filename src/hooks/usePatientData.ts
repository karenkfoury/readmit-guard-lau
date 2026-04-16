import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function usePatientData(patientId: string | undefined) {
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [ehrIntake, setEhrIntake] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!patientId) return;
    setLoading(true);
    const [mr, v, med, ml, ci, rs, n, ehr, cm, sl, appt] = await Promise.all([
      supabase.from('medical_records').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('vitals').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
      supabase.from('medications').select('*').eq('patient_id', patientId).eq('active', true),
      supabase.from('medication_logs').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: false }),
      supabase.from('check_ins').select('*').eq('patient_id', patientId).order('day_number', { ascending: true }),
      supabase.from('risk_scores').select('*').eq('patient_id', patientId).order('calculated_at', { ascending: false }),
      supabase.from('notifications').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('ehr_intake_responses').select('*').eq('patient_id', patientId).single(),
      supabase.from('chat_messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: true }),
      supabase.from('symptom_logs').select('*').eq('patient_id', patientId).order('logged_at', { ascending: false }),
      supabase.from('appointments').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: true }),
    ]);
    setMedicalRecord(mr.data);
    setVitals(v.data || []);
    setMedications(med.data || []);
    setMedicationLogs(ml.data || []);
    setCheckIns(ci.data || []);
    setRiskScores(rs.data || []);
    setNotifications(n.data || []);
    setEhrIntake(ehr.data);
    setChatMessages(cm.data || []);
    setSymptomLogs(sl.data || []);
    setAppointments(appt.data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [patientId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!patientId) return;
    const channel = supabase.channel(`patient-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_scores', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptom_logs', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [patientId]);

  const latestRisk = riskScores[0];
  const previousRisk = riskScores[1];

  return {
    medicalRecord, vitals, medications, medicationLogs, checkIns,
    riskScores, notifications, ehrIntake, chatMessages, symptomLogs, appointments,
    latestRisk, previousRisk, loading, refresh,
  };
}
