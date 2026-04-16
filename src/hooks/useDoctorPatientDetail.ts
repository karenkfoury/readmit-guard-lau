import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useDoctorPatientDetail(patientId: string | undefined) {
  const [profile, setProfile] = useState<any>(null);
  const [medicalRecord, setMedicalRecord] = useState<any>(null);
  const [vitals, setVitals] = useState<any[]>([]);
  const [medications, setMedications] = useState<any[]>([]);
  const [medicationLogs, setMedicationLogs] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [riskScores, setRiskScores] = useState<any[]>([]);
  const [symptomLogs, setSymptomLogs] = useState<any[]>([]);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    if (!patientId) return;
    setLoading(true);
    const [pf, mr, v, med, ml, ci, rs, sl, cm, appt] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', patientId).single(),
      supabase.from('medical_records').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }).limit(1).single(),
      supabase.from('vitals').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
      supabase.from('medications').select('*').eq('patient_id', patientId).eq('active', true),
      supabase.from('medication_logs').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: false }),
      supabase.from('check_ins').select('*').eq('patient_id', patientId).order('day_number', { ascending: true }),
      supabase.from('risk_scores').select('*').eq('patient_id', patientId).order('calculated_at', { ascending: false }),
      supabase.from('symptom_logs').select('*').eq('patient_id', patientId).order('logged_at', { ascending: false }),
      supabase.from('chat_messages').select('*').eq('patient_id', patientId).order('created_at', { ascending: true }),
      supabase.from('appointments').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: false }),
    ]);
    setProfile(pf.data);
    setMedicalRecord(mr.data);
    setVitals(v.data || []);
    setMedications(med.data || []);
    setMedicationLogs(ml.data || []);
    setCheckIns(ci.data || []);
    setRiskScores(rs.data || []);
    setSymptomLogs(sl.data || []);
    setChatMessages(cm.data || []);
    setAppointments(appt.data || []);
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [patientId]);

  // Realtime
  useEffect(() => {
    if (!patientId) return;
    const channel = supabase.channel(`doc-patient-${patientId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'risk_scores', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vitals', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'symptom_logs', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'check_ins', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_messages', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `patient_id=eq.${patientId}` }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [patientId]);

  // Computed
  const latestRisk = riskScores[0];
  const previousRisk = riskScores[1];
  const latestVital = vitals[0];
  const latestSymptomLog = symptomLogs[0];

  // Adherence (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
  const recentLogs = medicationLogs.filter(l => new Date(l.scheduled_at) > sevenDaysAgo);
  const adherenceRate = recentLogs.length > 0
    ? Math.round((recentLogs.filter(l => l.taken).length / recentLogs.length) * 100)
    : null;

  return {
    profile, medicalRecord, vitals, medications, medicationLogs,
    checkIns, riskScores, symptomLogs, chatMessages, appointments,
    latestRisk, previousRisk, latestVital, latestSymptomLog,
    adherenceRate, loading, refresh,
  };
}
