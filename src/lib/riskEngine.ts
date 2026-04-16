import type { Patient, RiskFactor, CheckIn, CarePlan } from '@/types';

export function calculateBaseRisk(patient: Patient): RiskFactor[] {
  const factors: RiskFactor[] = [];
  if (patient.age > 65) factors.push({ label: 'Age over 65', points: 8, description: `Patient is ${patient.age} years old` });
  if (patient.comorbidities.length >= 2) factors.push({ label: 'Multiple comorbidities', points: 10, description: `${patient.comorbidities.join(', ')}` });
  if (patient.priorAdmissions >= 2) factors.push({ label: '2+ prior admissions', points: 15, description: `${patient.priorAdmissions} admissions in past 12 months` });
  if (patient.medications.length >= 5) factors.push({ label: 'Polypharmacy', points: 8, description: `Taking ${patient.medications.length} medications` });
  if (patient.livesAlone) factors.push({ label: 'Lives alone', points: 10, description: 'Social isolation flag — limited support at home' });
  if (patient.weekendDischarge) factors.push({ label: 'Weekend discharge', points: 5, description: 'Discharged on weekend — reduced follow-up access' });
  return factors;
}

export function calculateSurveyRisk(checkIn: CheckIn): RiskFactor[] {
  const factors: RiskFactor[] = [];
  const r = checkIn.responses;
  if (r.weightGainReported === 'yes') factors.push({ label: 'Weight gain reported', points: 15, description: `Weight gain reported on Day ${checkIn.day}` });
  if (r.symptomsStatus === 'worsening') factors.push({ label: 'Worsening symptoms', points: 18, description: 'Patient reports symptoms are getting worse' });
  if (r.shortnessOfBreath === 'moderate' || r.shortnessOfBreath === 'severe') factors.push({ label: 'Shortness of breath', points: 12, description: `${r.shortnessOfBreath} shortness of breath reported` });
  if (r.missedDoses === '3+') factors.push({ label: 'Missed 3+ medication doses', points: 15, description: 'Significant medication non-adherence' });
  if (r.sideEffects && (r.sideEffects as string[]).length > 0) factors.push({ label: 'Side effects reported', points: 8, description: `Side effects: ${(r.sideEffects as string[]).join(', ')}` });
  if (typeof r.overallRating === 'number' && r.overallRating < 5) factors.push({ label: 'Low self-assessment', points: 12, description: `Patient self-rated overall condition ${r.overallRating}/10` });
  if (r.needsMedicalAttention === 'yes') factors.push({ label: 'Requests medical attention', points: 20, description: 'Patient actively requesting medical attention' });
  return factors;
}

export function computeRiskScore(patient: Patient): { score: number; factors: RiskFactor[] } {
  const baseFactors = calculateBaseRisk(patient);
  const surveyFactors = patient.checkIns
    .filter(c => c.status === 'completed')
    .flatMap(c => calculateSurveyRisk(c));
  const allFactors = [...baseFactors, ...surveyFactors];
  const score = Math.min(100, allFactors.reduce((sum, f) => sum + f.points, 0));
  return { score, factors: allFactors.sort((a, b) => b.points - a.points) };
}

export function getRiskLevel(score: number): 'low' | 'moderate' | 'high' {
  if (score >= 50) return 'high';
  if (score >= 30) return 'moderate';
  return 'low';
}

export function generateCarePlan(patient: Patient): CarePlan {
  const latestCheckIn = patient.checkIns.filter(c => c.status === 'completed').pop();
  const r = latestCheckIn?.responses || {};

  if (r.symptomsStatus === 'worsening' || r.weightGainReported === 'yes' || r.shortnessOfBreath === 'severe') {
    return { suggestedAssignee: 'Dr. Karim Haddad', suggestedRole: 'doctor', suggestedAction: 'Call patient within 24 hours', reason: 'Symptom escalation detected', priority: 'urgent' };
  }
  if (r.missedDoses === '3+' || (r.sideEffects && (r.sideEffects as string[]).length > 0)) {
    return { suggestedAssignee: 'Lina Farah', suggestedRole: 'pharmacist', suggestedAction: 'Medication reconciliation call', reason: 'Medication adherence concern', priority: 'high' };
  }
  if (r.needsMedicalAttention === 'yes') {
    return { suggestedAssignee: 'Dr. Karim Haddad', suggestedRole: 'doctor', suggestedAction: 'Schedule follow-up appointment', reason: 'Patient requested medical attention', priority: 'urgent' };
  }
  return { suggestedAssignee: 'Nour Saleh', suggestedRole: 'nurse', suggestedAction: 'Routine check-in call', reason: 'General monitoring', priority: 'medium' };
}

export function shouldTriggerAlert(currentScore: number, previousScore?: number): boolean {
  if (previousScore === undefined) return currentScore >= 50;
  if (previousScore < 50 && currentScore >= 50) return true;
  if (currentScore - previousScore >= 15) return true;
  return false;
}
