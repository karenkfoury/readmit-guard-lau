import { supabase } from '@/integrations/supabase/client';
import { calculateRisk } from './riskCalculator';

export async function recalculateRiskForPatient(
  patientId: string,
  source: 'initial_ehr' | 'checkin_day_3' | 'checkin_day_7' | 'checkin_day_14' | 'chatbot' | 'manual'
) {
  // Fetch all data needed
  const [mrRes, ehrRes, ciRes, vRes, medRes, mlRes] = await Promise.all([
    supabase.from('medical_records').select('*').eq('patient_id', patientId).limit(1).single(),
    supabase.from('ehr_intake_responses').select('*').eq('patient_id', patientId).single(),
    supabase.from('check_ins').select('*').eq('patient_id', patientId).eq('status', 'completed').order('day_number', { ascending: false }),
    supabase.from('vitals').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }).limit(5),
    supabase.from('medications').select('*').eq('patient_id', patientId).eq('active', true),
    supabase.from('medication_logs').select('*').eq('patient_id', patientId).order('scheduled_at', { ascending: false }).limit(30),
  ]);

  const mr = mrRes.data;
  const ehr = ehrRes.data;
  const checkIns = ciRes.data || [];
  const vitals = vRes.data || [];
  const meds = medRes.data || [];
  const logs = mlRes.data || [];

  // Calculate age from profile
  const { data: profile } = await supabase.from('profiles').select('date_of_birth').eq('id', patientId).single();
  const age = profile?.date_of_birth
    ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 86400000))
    : undefined;

  // Latest check-in responses
  const latestCheckIn = checkIns[0];
  const responses = latestCheckIn?.responses as Record<string, any> || {};

  // Adherence rate (last 7 days)
  const recentLogs = logs.filter(l => {
    const d = new Date(l.scheduled_at);
    return d > new Date(Date.now() - 7 * 86400000);
  });
  const adherenceRate = recentLogs.length > 0
    ? recentLogs.filter(l => l.taken).length / recentLogs.length
    : undefined;

  // Calculate weekend discharge
  const dischargeDay = mr?.discharge_date ? new Date(mr.discharge_date).getDay() : undefined;
  const weekendDischarge = dischargeDay === 0 || dischargeDay === 6;

  const result = calculateRisk({
    age,
    comorbidities: mr?.comorbidities || [],
    priorAdmissions: mr?.prior_admissions_12mo || 0,
    medicationCount: meds.length,
    livesAlone: ehr?.lives_alone || false,
    weekendDischarge,
    hasCaregiver: ehr?.has_caregiver || false,
    recentFalls: ehr?.recent_falls || false,
    smokingStatus: ehr?.smoking_status || undefined,
    exerciseFrequency: ehr?.exercise_frequency || undefined,
    weightGainReported: responses.weightGainReported,
    symptomsStatus: responses.symptomsStatus,
    shortnessOfBreath: responses.shortnessOfBreath,
    missedDoses: responses.missedDoses,
    sideEffects: responses.sideEffects,
    overallRating: responses.overallRating,
    needsMedicalAttention: responses.needsMedicalAttention,
    adherenceRate,
    oxygenSaturation: vitals[0]?.oxygen_saturation || undefined,
    heartRate: vitals[0]?.heart_rate_bpm || undefined,
  });

  // Insert new risk score
  await supabase.from('risk_scores').insert({
    patient_id: patientId,
    score: result.score,
    source,
    contributing_factors: result.factors as any,
  });

  return result;
}
