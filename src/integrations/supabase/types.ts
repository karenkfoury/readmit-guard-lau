export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          created_by: Database["public"]["Enums"]["appointment_created_by"]
          doctor_id: string
          duration_minutes: number
          follow_up_type: Database["public"]["Enums"]["followup_type"]
          id: string
          notes: string | null
          patient_id: string
          reason: string | null
          scheduled_at: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: Database["public"]["Enums"]["appointment_created_by"]
          doctor_id: string
          duration_minutes?: number
          follow_up_type?: Database["public"]["Enums"]["followup_type"]
          id?: string
          notes?: string | null
          patient_id: string
          reason?: string | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: Database["public"]["Enums"]["appointment_created_by"]
          doctor_id?: string
          duration_minutes?: number
          follow_up_type?: Database["public"]["Enums"]["followup_type"]
          id?: string
          notes?: string | null
          patient_id?: string
          reason?: string | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          extracted_vitals: Json | null
          id: string
          patient_id: string
          risk_impact: number | null
          role: Database["public"]["Enums"]["chat_role"]
        }
        Insert: {
          content: string
          created_at?: string
          extracted_vitals?: Json | null
          id?: string
          patient_id: string
          risk_impact?: number | null
          role: Database["public"]["Enums"]["chat_role"]
        }
        Update: {
          content?: string
          created_at?: string
          extracted_vitals?: Json | null
          id?: string
          patient_id?: string
          risk_impact?: number | null
          role?: Database["public"]["Enums"]["chat_role"]
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          completed_at: string | null
          day_number: number
          id: string
          patient_id: string
          responses: Json | null
          risk_delta: number | null
          scheduled_date: string | null
          status: Database["public"]["Enums"]["checkin_status"]
        }
        Insert: {
          completed_at?: string | null
          day_number: number
          id?: string
          patient_id: string
          responses?: Json | null
          risk_delta?: number | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["checkin_status"]
        }
        Update: {
          completed_at?: string | null
          day_number?: number
          id?: string
          patient_id?: string
          responses?: Json | null
          risk_delta?: number | null
          scheduled_date?: string | null
          status?: Database["public"]["Enums"]["checkin_status"]
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_completions: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          patient_id: string
          recovery_day: number
          task_reference_id: string | null
          task_type: Database["public"]["Enums"]["checklist_task_type"]
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          patient_id: string
          recovery_day: number
          task_reference_id?: string | null
          task_type: Database["public"]["Enums"]["checklist_task_type"]
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          patient_id?: string
          recovery_day?: number
          task_reference_id?: string | null
          task_type?: Database["public"]["Enums"]["checklist_task_type"]
        }
        Relationships: [
          {
            foreignKeyName: "checklist_completions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ehr_intake_responses: {
        Row: {
          additional_notes: string | null
          alcohol_use: string | null
          exercise_frequency: string | null
          has_caregiver: boolean | null
          id: string
          lives_alone: boolean | null
          mental_health_concerns: string[] | null
          mobility_level: string | null
          patient_id: string
          recent_falls: boolean | null
          smoking_status: string | null
          submitted_at: string
        }
        Insert: {
          additional_notes?: string | null
          alcohol_use?: string | null
          exercise_frequency?: string | null
          has_caregiver?: boolean | null
          id?: string
          lives_alone?: boolean | null
          mental_health_concerns?: string[] | null
          mobility_level?: string | null
          patient_id: string
          recent_falls?: boolean | null
          smoking_status?: string | null
          submitted_at?: string
        }
        Update: {
          additional_notes?: string | null
          alcohol_use?: string | null
          exercise_frequency?: string | null
          has_caregiver?: boolean | null
          id?: string
          lives_alone?: boolean | null
          mental_health_concerns?: string[] | null
          mobility_level?: string | null
          patient_id?: string
          recent_falls?: boolean | null
          smoking_status?: string | null
          submitted_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ehr_intake_responses_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          admission_date: string | null
          allergies: string[] | null
          attending_physician: string | null
          comorbidities: string[] | null
          created_at: string
          discharge_date: string | null
          discharge_summary: string | null
          id: string
          length_of_stay_days: number | null
          patient_id: string
          primary_diagnosis: string | null
          prior_admissions_12mo: number | null
          secondary_diagnoses: string[] | null
        }
        Insert: {
          admission_date?: string | null
          allergies?: string[] | null
          attending_physician?: string | null
          comorbidities?: string[] | null
          created_at?: string
          discharge_date?: string | null
          discharge_summary?: string | null
          id?: string
          length_of_stay_days?: number | null
          patient_id: string
          primary_diagnosis?: string | null
          prior_admissions_12mo?: number | null
          secondary_diagnoses?: string[] | null
        }
        Update: {
          admission_date?: string | null
          allergies?: string[] | null
          attending_physician?: string | null
          comorbidities?: string[] | null
          created_at?: string
          discharge_date?: string | null
          discharge_summary?: string | null
          id?: string
          length_of_stay_days?: number | null
          patient_id?: string
          primary_diagnosis?: string | null
          prior_admissions_12mo?: number | null
          secondary_diagnoses?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medication_logs: {
        Row: {
          id: string
          medication_id: string
          patient_id: string
          scheduled_at: string
          skipped_reason: string | null
          taken: boolean | null
          taken_at: string | null
        }
        Insert: {
          id?: string
          medication_id: string
          patient_id: string
          scheduled_at: string
          skipped_reason?: string | null
          taken?: boolean | null
          taken_at?: string | null
        }
        Update: {
          id?: string
          medication_id?: string
          patient_id?: string
          scheduled_at?: string
          skipped_reason?: string | null
          taken?: boolean | null
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medication_logs_medication_id_fkey"
            columns: ["medication_id"]
            isOneToOne: false
            referencedRelation: "medications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medication_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medications: {
        Row: {
          active: boolean | null
          dosage: string | null
          end_date: string | null
          frequency: string | null
          id: string
          instructions: string | null
          name: string
          patient_id: string
          prescribing_doctor: string | null
          start_date: string | null
          time_slots: Json | null
        }
        Insert: {
          active?: boolean | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          name: string
          patient_id: string
          prescribing_doctor?: string | null
          start_date?: string | null
          time_slots?: Json | null
        }
        Update: {
          active?: boolean | null
          dosage?: string | null
          end_date?: string | null
          frequency?: string | null
          id?: string
          instructions?: string | null
          name?: string
          patient_id?: string
          prescribing_doctor?: string | null
          start_date?: string | null
          time_slots?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "medications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          acted_on: boolean | null
          body: string | null
          created_at: string
          id: string
          patient_id: string
          read: boolean | null
          scheduled_for: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          acted_on?: boolean | null
          body?: string | null
          created_at?: string
          id?: string
          patient_id: string
          read?: boolean | null
          scheduled_for?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          acted_on?: boolean | null
          body?: string | null
          created_at?: string
          id?: string
          patient_id?: string
          read?: boolean | null
          scheduled_for?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          date_of_birth: string | null
          email: string | null
          full_name: string
          gender: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          email?: string | null
          full_name?: string
          gender?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      risk_scores: {
        Row: {
          calculated_at: string
          contributing_factors: Json | null
          id: string
          patient_id: string
          score: number
          source: Database["public"]["Enums"]["risk_source"]
        }
        Insert: {
          calculated_at?: string
          contributing_factors?: Json | null
          id?: string
          patient_id: string
          score: number
          source: Database["public"]["Enums"]["risk_source"]
        }
        Update: {
          calculated_at?: string
          contributing_factors?: Json | null
          id?: string
          patient_id?: string
          score?: number
          source?: Database["public"]["Enums"]["risk_source"]
        }
        Relationships: [
          {
            foreignKeyName: "risk_scores_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      symptom_logs: {
        Row: {
          felt_worse: boolean
          id: string
          logged_at: string
          notes: string | null
          overall_feeling: number
          pain_level: number
          patient_id: string
          risk_delta: number | null
          shortness_of_breath: Database["public"]["Enums"]["sob_level"]
          swelling_fatigue_flags: string[] | null
          urgency: Database["public"]["Enums"]["urgency_level"]
          worse_description: string | null
        }
        Insert: {
          felt_worse?: boolean
          id?: string
          logged_at?: string
          notes?: string | null
          overall_feeling: number
          pain_level?: number
          patient_id: string
          risk_delta?: number | null
          shortness_of_breath?: Database["public"]["Enums"]["sob_level"]
          swelling_fatigue_flags?: string[] | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
          worse_description?: string | null
        }
        Update: {
          felt_worse?: boolean
          id?: string
          logged_at?: string
          notes?: string | null
          overall_feeling?: number
          pain_level?: number
          patient_id?: string
          risk_delta?: number | null
          shortness_of_breath?: Database["public"]["Enums"]["sob_level"]
          swelling_fatigue_flags?: string[] | null
          urgency?: Database["public"]["Enums"]["urgency_level"]
          worse_description?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "symptom_logs_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vitals: {
        Row: {
          blood_glucose: number | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          heart_rate_bpm: number | null
          id: string
          is_edited_by_patient: boolean | null
          notes: string | null
          oxygen_saturation: number | null
          pain_scale_0_10: number | null
          patient_id: string
          recorded_at: string
          respiratory_rate: number | null
          source: Database["public"]["Enums"]["vitals_source"]
          temperature_c: number | null
          weight_kg: number | null
        }
        Insert: {
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          heart_rate_bpm?: number | null
          id?: string
          is_edited_by_patient?: boolean | null
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale_0_10?: number | null
          patient_id: string
          recorded_at?: string
          respiratory_rate?: number | null
          source?: Database["public"]["Enums"]["vitals_source"]
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Update: {
          blood_glucose?: number | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          heart_rate_bpm?: number | null
          id?: string
          is_edited_by_patient?: boolean | null
          notes?: string | null
          oxygen_saturation?: number | null
          pain_scale_0_10?: number | null
          patient_id?: string
          recorded_at?: string
          respiratory_rate?: number | null
          source?: Database["public"]["Enums"]["vitals_source"]
          temperature_c?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vitals_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
    }
    Enums: {
      appointment_created_by: "doctor" | "system" | "patient_request"
      appointment_status: "scheduled" | "completed" | "cancelled" | "no_show"
      chat_role: "user" | "assistant" | "system"
      checkin_status: "upcoming" | "pending" | "completed" | "missed"
      checklist_task_type:
        | "medication"
        | "followup"
        | "checkup_form"
        | "symptom_log"
      followup_type: "in_person" | "telehealth" | "phone_call"
      notification_type:
        | "medication_reminder"
        | "checkin_due"
        | "care_team_message"
        | "risk_alert"
      risk_source:
        | "initial_ehr"
        | "checkin_day_3"
        | "checkin_day_7"
        | "checkin_day_14"
        | "chatbot"
        | "manual"
      sob_level: "none" | "mild" | "moderate" | "severe"
      urgency_level: "low" | "medium" | "high"
      user_role: "patient" | "doctor"
      vitals_source: "hospital" | "patient_self_report" | "chatbot_extracted"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      appointment_created_by: ["doctor", "system", "patient_request"],
      appointment_status: ["scheduled", "completed", "cancelled", "no_show"],
      chat_role: ["user", "assistant", "system"],
      checkin_status: ["upcoming", "pending", "completed", "missed"],
      checklist_task_type: [
        "medication",
        "followup",
        "checkup_form",
        "symptom_log",
      ],
      followup_type: ["in_person", "telehealth", "phone_call"],
      notification_type: [
        "medication_reminder",
        "checkin_due",
        "care_team_message",
        "risk_alert",
      ],
      risk_source: [
        "initial_ehr",
        "checkin_day_3",
        "checkin_day_7",
        "checkin_day_14",
        "chatbot",
        "manual",
      ],
      sob_level: ["none", "mild", "moderate", "severe"],
      urgency_level: ["low", "medium", "high"],
      user_role: ["patient", "doctor"],
      vitals_source: ["hospital", "patient_self_report", "chatbot_extracted"],
    },
  },
} as const
