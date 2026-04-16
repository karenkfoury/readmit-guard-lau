// Server-side risk calculation logic (used by server functions)
// Mirrors the transparent weighted formula from v1

interface RiskFactor {
  factor: string;
  weight: number;
  explanation: string;
}

interface RiskInput {
  age?: number;
  comorbidities?: string[];
  priorAdmissions?: number;
  medicationCount?: number;
  livesAlone?: boolean;
  weekendDischarge?: boolean;
  hasCaregiver?: boolean;
  recentFalls?: boolean;
  smokingStatus?: string;
  exerciseFrequency?: string;
  // Survey responses
  weightGainReported?: string;
  symptomsStatus?: string;
  shortnessOfBreath?: string;
  missedDoses?: string;
  sideEffects?: string[];
  overallRating?: number;
  needsMedicalAttention?: string;
  // Vitals
  latestWeight?: number;
  previousWeight?: number;
  oxygenSaturation?: number;
  heartRate?: number;
  // Adherence
  adherenceRate?: number;
  // Chat signals
  chatUrgency?: string;
}

export function calculateRisk(input: RiskInput): { score: number; factors: RiskFactor[] } {
  const factors: RiskFactor[] = [];

  // Base EHR factors
  if (input.age && input.age > 65) {
    factors.push({ factor: 'Age over 65', weight: 8, explanation: `Patient is ${input.age} years old` });
  }
  if (input.comorbidities && input.comorbidities.length >= 2) {
    factors.push({ factor: 'Multiple comorbidities', weight: 10, explanation: input.comorbidities.join(', ') });
  }
  if (input.priorAdmissions && input.priorAdmissions >= 2) {
    factors.push({ factor: '2+ prior admissions', weight: 15, explanation: `${input.priorAdmissions} admissions in past 12 months` });
  }
  if (input.medicationCount && input.medicationCount >= 5) {
    factors.push({ factor: 'Polypharmacy', weight: 8, explanation: `Taking ${input.medicationCount} medications` });
  }
  if (input.livesAlone) {
    factors.push({ factor: 'Lives alone', weight: 10, explanation: 'Social isolation — limited support at home' });
  }
  if (input.weekendDischarge) {
    factors.push({ factor: 'Weekend discharge', weight: 5, explanation: 'Discharged on weekend — reduced follow-up access' });
  }
  if (!input.hasCaregiver && input.livesAlone) {
    factors.push({ factor: 'No caregiver', weight: 5, explanation: 'No designated caregiver available' });
  }
  if (input.recentFalls) {
    factors.push({ factor: 'Recent falls', weight: 8, explanation: 'History of recent falls' });
  }
  if (input.smokingStatus === 'current') {
    factors.push({ factor: 'Current smoker', weight: 5, explanation: 'Active smoking increases recovery risk' });
  }

  // Survey factors
  if (input.weightGainReported === 'yes') {
    factors.push({ factor: 'Weight gain reported', weight: 15, explanation: 'Weight gain since discharge' });
  }
  if (input.symptomsStatus === 'worsening') {
    factors.push({ factor: 'Worsening symptoms', weight: 18, explanation: 'Patient reports symptoms getting worse' });
  }
  if (input.shortnessOfBreath === 'moderate' || input.shortnessOfBreath === 'severe') {
    factors.push({ factor: 'Shortness of breath', weight: 12, explanation: `${input.shortnessOfBreath} shortness of breath` });
  }
  if (input.missedDoses === '3+') {
    factors.push({ factor: 'Missed 3+ medication doses', weight: 15, explanation: 'Significant medication non-adherence' });
  }
  if (input.sideEffects && input.sideEffects.length > 0) {
    factors.push({ factor: 'Side effects reported', weight: 8, explanation: `Side effects: ${input.sideEffects.join(', ')}` });
  }
  if (typeof input.overallRating === 'number' && input.overallRating < 5) {
    factors.push({ factor: 'Low self-assessment', weight: 12, explanation: `Self-rated condition ${input.overallRating}/10` });
  }
  if (input.needsMedicalAttention === 'yes') {
    factors.push({ factor: 'Requests medical attention', weight: 20, explanation: 'Patient actively requesting medical attention' });
  }

  // Adherence factor
  if (input.adherenceRate !== undefined && input.adherenceRate < 0.7) {
    factors.push({ factor: 'Poor medication adherence', weight: 12, explanation: `Only ${Math.round(input.adherenceRate * 100)}% adherence rate` });
  }

  // Vitals-based
  if (input.oxygenSaturation && input.oxygenSaturation < 92) {
    factors.push({ factor: 'Low oxygen saturation', weight: 15, explanation: `SpO2 at ${input.oxygenSaturation}%` });
  }
  if (input.heartRate && (input.heartRate > 100 || input.heartRate < 50)) {
    factors.push({ factor: 'Abnormal heart rate', weight: 10, explanation: `Heart rate: ${input.heartRate} bpm` });
  }

  // Chat urgency
  if (input.chatUrgency === 'high') {
    factors.push({ factor: 'High urgency from chat', weight: 15, explanation: 'AI detected high-urgency symptoms in conversation' });
  }

  const score = Math.min(100, factors.reduce((sum, f) => sum + f.weight, 0));
  return { score, factors: factors.sort((a, b) => b.weight - a.weight) };
}
