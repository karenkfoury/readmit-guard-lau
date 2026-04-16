DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('patient', 'doctor');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.vitals_source AS ENUM ('hospital', 'patient_self_report', 'chatbot_extracted');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.checkin_status AS ENUM ('upcoming', 'pending', 'completed', 'missed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.risk_source AS ENUM ('initial_ehr', 'checkin_day_3', 'checkin_day_7', 'checkin_day_14', 'chatbot', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.chat_role AS ENUM ('user', 'assistant', 'system');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
DO $$ BEGIN
  CREATE TYPE public.notification_type AS ENUM ('medication_reminder', 'checkin_due', 'care_team_message', 'risk_alert');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'patient',
  full_name TEXT NOT NULL DEFAULT '',
  date_of_birth DATE, gender TEXT, phone TEXT, email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS public.user_role LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT role FROM public.profiles WHERE id = _user_id LIMIT 1 $$;

CREATE POLICY "sel_own_profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "upd_own_profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "ins_own_profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "doc_sel_profiles" ON public.profiles FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), NEW.email, COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role,'patient'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  admission_date DATE, discharge_date DATE, length_of_stay_days INT,
  primary_diagnosis TEXT, secondary_diagnoses TEXT[], prior_admissions_12mo INT DEFAULT 0,
  comorbidities TEXT[], allergies TEXT[], discharge_summary TEXT, attending_physician TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_mr" ON public.medical_records FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_mr" ON public.medical_records FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "doc_ins_mr" ON public.medical_records FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.vitals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source public.vitals_source NOT NULL DEFAULT 'patient_self_report',
  weight_kg NUMERIC, blood_pressure_systolic INT, blood_pressure_diastolic INT,
  heart_rate_bpm INT, temperature_c NUMERIC, oxygen_saturation NUMERIC,
  respiratory_rate INT, blood_glucose NUMERIC, pain_scale_0_10 INT,
  notes TEXT, is_edited_by_patient BOOLEAN DEFAULT false
);
ALTER TABLE public.vitals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_v" ON public.vitals FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "pat_ins_v" ON public.vitals FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "pat_upd_v" ON public.vitals FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_v" ON public.vitals FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL, dosage TEXT, frequency TEXT, time_slots JSONB DEFAULT '[]',
  start_date DATE, end_date DATE, prescribing_doctor TEXT, instructions TEXT, active BOOLEAN DEFAULT true
);
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_med" ON public.medications FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_med" ON public.medications FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "doc_ins_med" ON public.medications FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.medication_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id UUID NOT NULL REFERENCES public.medications(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL, taken BOOLEAN DEFAULT false, taken_at TIMESTAMPTZ, skipped_reason TEXT
);
ALTER TABLE public.medication_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_ml" ON public.medication_logs FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "pat_ins_ml" ON public.medication_logs FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "pat_upd_ml" ON public.medication_logs FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_ml" ON public.medication_logs FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  day_number INT NOT NULL CHECK (day_number IN (3, 7, 14)),
  status public.checkin_status NOT NULL DEFAULT 'upcoming',
  scheduled_date DATE, completed_at TIMESTAMPTZ, responses JSONB DEFAULT '{}', risk_delta NUMERIC
);
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_ci" ON public.check_ins FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "pat_upd_ci" ON public.check_ins FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "pat_ins_ci" ON public.check_ins FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "doc_sel_ci" ON public.check_ins FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.risk_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  score NUMERIC NOT NULL CHECK (score >= 0 AND score <= 100),
  calculated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source public.risk_source NOT NULL, contributing_factors JSONB DEFAULT '[]'
);
ALTER TABLE public.risk_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_rs" ON public.risk_scores FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "doc_sel_rs" ON public.risk_scores FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "pat_ins_rs" ON public.risk_scores FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "doc_ins_rs" ON public.risk_scores FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.chat_role NOT NULL, content TEXT NOT NULL,
  extracted_vitals JSONB, risk_impact NUMERIC, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_cm" ON public.chat_messages FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "pat_ins_cm" ON public.chat_messages FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "doc_sel_cm" ON public.chat_messages FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type public.notification_type NOT NULL, title TEXT NOT NULL, body TEXT,
  scheduled_for TIMESTAMPTZ DEFAULT now(), read BOOLEAN DEFAULT false, acted_on BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_n" ON public.notifications FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "pat_upd_n" ON public.notifications FOR UPDATE USING (auth.uid() = patient_id);
CREATE POLICY "doc_ins_n" ON public.notifications FOR INSERT WITH CHECK (public.get_user_role(auth.uid()) = 'doctor');
CREATE POLICY "pat_ins_n" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE TABLE public.ehr_intake_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  smoking_status TEXT, alcohol_use TEXT, exercise_frequency TEXT,
  lives_alone BOOLEAN, has_caregiver BOOLEAN, mobility_level TEXT, recent_falls BOOLEAN,
  mental_health_concerns TEXT[], additional_notes TEXT, submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ehr_intake_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pat_sel_ehr" ON public.ehr_intake_responses FOR SELECT USING (auth.uid() = patient_id);
CREATE POLICY "pat_ins_ehr" ON public.ehr_intake_responses FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "doc_sel_ehr" ON public.ehr_intake_responses FOR SELECT USING (public.get_user_role(auth.uid()) = 'doctor');

ALTER PUBLICATION supabase_realtime ADD TABLE public.risk_scores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.check_ins;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.vitals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;