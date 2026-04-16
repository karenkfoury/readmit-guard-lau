import { create } from 'zustand';
import type { UserRole, Patient, Alert, FollowUp } from '@/types';
import { patients as initialPatients, alerts as initialAlerts, followUps as initialFollowUps } from '@/data/patients';

interface AppState {
  role: UserRole;
  setRole: (role: UserRole) => void;
  patients: Patient[];
  updatePatient: (id: string, updates: Partial<Patient>) => void;
  alerts: Alert[];
  acknowledgeAlert: (id: string) => void;
  followUps: FollowUp[];
  updateFollowUp: (id: string, updates: Partial<FollowUp>) => void;
  readmissionsPrevented: number;
  incrementPrevented: () => void;
}

export const useStore = create<AppState>((set) => ({
  role: null,
  setRole: (role) => set({ role }),
  patients: initialPatients,
  updatePatient: (id, updates) => set((s) => ({
    patients: s.patients.map(p => p.id === id ? { ...p, ...updates } : p),
  })),
  alerts: initialAlerts,
  acknowledgeAlert: (id) => set((s) => ({
    alerts: s.alerts.map(a => a.id === id ? { ...a, acknowledged: true } : a),
  })),
  followUps: initialFollowUps,
  updateFollowUp: (id, updates) => set((s) => ({
    followUps: s.followUps.map(f => f.id === id ? { ...f, ...updates } : f),
  })),
  readmissionsPrevented: 3,
  incrementPrevented: () => set((s) => ({ readmissionsPrevented: s.readmissionsPrevented + 1 })),
}));
