export type RiskLevel = 'low' | 'moderate' | 'high';

export interface RiskFactor {
  label: string;
  points: number;
  description: string;
}

export interface CheckIn {
  day: 3 | 7 | 14;
  status: 'completed' | 'pending' | 'upcoming';
  completedAt?: string;
  responses: SurveyResponse;
  riskScoreAfter?: number;
}

export interface SurveyResponse {
  [key: string]: string | number | string[] | boolean | undefined;
}

export interface CarePlan {
  suggestedAssignee: string;
  suggestedRole: 'doctor' | 'nurse' | 'pharmacist' | 'social_worker';
  suggestedAction: string;
  reason: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  diagnosis: string;
  comorbidities: string[];
  dischargeDate: string;
  priorAdmissions: number;
  medications: string[];
  livesAlone: boolean;
  weekendDischarge: boolean;
  riskScore: number;
  previousRiskScore?: number;
  riskFactors: RiskFactor[];
  checkIns: CheckIn[];
  carePlan?: CarePlan;
  assignedClinician?: string;
  avatar?: string;
}

export interface Clinician {
  id: string;
  name: string;
  role: 'physician' | 'nurse' | 'pharmacist' | 'social_worker';
  initials: string;
  color: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'threshold_crossed' | 'significant_increase' | 'self_reported';
  message: string;
  riskScore: number;
  timestamp: string;
  acknowledged: boolean;
  suggestedAssignee: string;
  suggestedRole: string;
}

export interface FollowUp {
  id: string;
  patientId: string;
  patientName: string;
  riskScore: number;
  reason: string;
  suggestedDate: string;
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedClinician: string;
  status: 'today' | 'this_week' | 'upcoming' | 'completed';
}

export type UserRole = 'patient' | 'doctor' | null;
