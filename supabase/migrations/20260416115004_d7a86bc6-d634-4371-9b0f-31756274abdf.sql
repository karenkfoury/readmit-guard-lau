
-- Enums for new tables
CREATE TYPE public.sob_level AS ENUM ('none', 'mild', 'moderate', 'severe');
CREATE TYPE public.urgency_level AS ENUM ('low', 'medium', 'high');
CREATE TYPE public.checklist_task_type AS ENUM ('medication', 'followup', 'checkup_form', 'symptom_log');
CREATE TYPE public.followup_type AS ENUM ('in_person', 'telehealth', 'phone_call');
CREATE TYPE public.appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.appointment_created_by AS ENUM ('doctor', 'system', 'patient_request');

-- symptom_logs table
CREATE TABLE public.symptom_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  overall_feeling INT NOT NULL CHECK (overall_feeling BETWEEN 1 AND 5),
  pain_level INT NOT NULL DEFAULT 0 CHECK (pain_level BETWEEN 0 AND 10),
  shortness_of_breath sob_level NOT NULL DEFAULT 'none',
  swelling_fatigue_flags TEXT[] DEFAULT '{}',
  felt_worse BOOLEAN NOT NULL DEFAULT false,
  worse_description TEXT,
  notes TEXT,
  risk_delta NUMERIC,
  urgency urgency_level NOT NULL DEFAULT 'low'
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pat_ins_sl" ON public.symptom_logs FOR INSERT TO public WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "pat_sel_sl" ON public.symptom_logs FOR SELECT TO public USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_sl" ON public.symptom_logs FOR SELECT TO public USING (get_user_role(auth.uid()) = 'doctor'::user_role);

-- checklist_completions table
CREATE TABLE public.checklist_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recovery_day INT NOT NULL,
  task_type checklist_task_type NOT NULL,
  task_reference_id UUID,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  UNIQUE (patient_id, recovery_day, task_type, task_reference_id)
);

ALTER TABLE public.checklist_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pat_ins_cc" ON public.checklist_completions FOR INSERT TO public WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "pat_sel_cc" ON public.checklist_completions FOR SELECT TO public USING (auth.uid() = patient_id);
CREATE POLICY "pat_upd_cc" ON public.checklist_completions FOR UPDATE TO public USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_cc" ON public.checklist_completions FOR SELECT TO public USING (get_user_role(auth.uid()) = 'doctor'::user_role);

-- appointments table
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 30,
  reason TEXT,
  follow_up_type followup_type NOT NULL DEFAULT 'in_person',
  status appointment_status NOT NULL DEFAULT 'scheduled',
  created_by appointment_created_by NOT NULL DEFAULT 'doctor',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "doc_sel_appt" ON public.appointments FOR SELECT TO public USING (get_user_role(auth.uid()) = 'doctor'::user_role);
CREATE POLICY "doc_ins_appt" ON public.appointments FOR INSERT TO public WITH CHECK (get_user_role(auth.uid()) = 'doctor'::user_role);
CREATE POLICY "doc_upd_appt" ON public.appointments FOR UPDATE TO public USING (get_user_role(auth.uid()) = 'doctor'::user_role);
CREATE POLICY "pat_sel_appt" ON public.appointments FOR SELECT TO public USING (auth.uid() = patient_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.symptom_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.checklist_completions;
