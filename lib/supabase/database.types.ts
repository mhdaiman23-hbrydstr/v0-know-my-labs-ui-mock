export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      interpretations: {
        Row: {
          id: string
          set_id: string
          summary: string | null
          flags: Json | null
          considerations: Json | null
          lifestyle: Json | null
          questions: Json | null
          safety_notice: string | null
          model: string | null
          created_at: string
        }
        Insert: {
          id?: string
          set_id: string
          summary?: string | null
          flags?: Json | null
          considerations?: Json | null
          lifestyle?: Json | null
          questions?: Json | null
          safety_notice?: string | null
          model?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          set_id?: string
          summary?: string | null
          flags?: Json | null
          considerations?: Json | null
          lifestyle?: Json | null
          questions?: Json | null
          safety_notice?: string | null
          model?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "interpretations_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "lab_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_results: {
        Row: {
          id: string
          set_id: string
          code: string | null
          name: string | null
          panel: string | null
          value_raw: number | null
          unit_raw: string | null
          value_si: number | null
          unit_si: string | null
          created_at: string
        }
        Insert: {
          id?: string
          set_id: string
          code?: string | null
          name?: string | null
          panel?: string | null
          value_raw?: number | null
          unit_raw?: string | null
          value_si?: number | null
          unit_si?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          set_id?: string
          code?: string | null
          name?: string | null
          panel?: string | null
          value_raw?: number | null
          unit_raw?: string | null
          value_si?: number | null
          unit_si?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_results_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "lab_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      lab_sets: {
        Row: {
          id: string
          user_id: string
          source: string | null
          input_units: string | null
          parse_method: string | null
          status: string | null
          panel_selection: string[] | null
          demographics: Json | null
          collected_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          source?: string | null
          input_units?: string | null
          parse_method?: string | null
          status?: string | null
          panel_selection?: string[] | null
          demographics?: Json | null
          collected_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          source?: string | null
          input_units?: string | null
          parse_method?: string | null
          status?: string | null
          panel_selection?: string[] | null
          demographics?: Json | null
          collected_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "lab_sets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          age: string | null
          sex: string | null
          ethnicity: string | null
          height: string | null
          weight: string | null
          fasting_status: string | null
          units: string | null
          reference_set: string | null
          medications: string[] | null
          medical_conditions: string[] | null
          lifestyle: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: string | null
          sex?: string | null
          ethnicity?: string | null
          height?: string | null
          weight?: string | null
          fasting_status?: string | null
          units?: string | null
          reference_set?: string | null
          medications?: string[] | null
          medical_conditions?: string[] | null
          lifestyle?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: string | null
          sex?: string | null
          ethnicity?: string | null
          height?: string | null
          weight?: string | null
          fasting_status?: string | null
          units?: string | null
          reference_set?: string | null
          medications?: string[] | null
          medical_conditions?: string[] | null
          lifestyle?: Json | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type LabSet = Database["public"]["Tables"]["lab_sets"]["Row"]
export type LabSetInsert = Database["public"]["Tables"]["lab_sets"]["Insert"]
export type LabSetUpdate = Database["public"]["Tables"]["lab_sets"]["Update"]

export type LabResult = Database["public"]["Tables"]["lab_results"]["Row"]
export type LabResultInsert = Database["public"]["Tables"]["lab_results"]["Insert"]
export type LabResultUpdate = Database["public"]["Tables"]["lab_results"]["Update"]

export type Interpretation = Database["public"]["Tables"]["interpretations"]["Row"]
export type InterpretationInsert = Database["public"]["Tables"]["interpretations"]["Insert"]
export type InterpretationUpdate = Database["public"]["Tables"]["interpretations"]["Update"]

export type UserProfile = Database["public"]["Tables"]["user_profiles"]["Row"]
export type UserProfileInsert = Database["public"]["Tables"]["user_profiles"]["Insert"]
export type UserProfileUpdate = Database["public"]["Tables"]["user_profiles"]["Update"]

export interface Demographics {
  age?: number
  sex?: "male" | "female" | "other"
  ethnicity?: string
  height?: number
  weight?: number
  fasting_status?: "fasting" | "non_fasting" | "unknown"
  units?: "metric" | "imperial"
}

export interface InterpretationFlags {
  [marker: string]: {
    status: "normal" | "high" | "low" | "critical"
    message?: string
    severity?: "info" | "warning" | "error"
  }
}

export interface InterpretationConsiderations {
  [category: string]: string[]
}

export interface LifestyleRecommendations {
  diet?: string[]
  exercise?: string[]
  sleep?: string[]
  stress?: string[]
  supplements?: string[]
}

export interface DoctorQuestions {
  immediate?: string[]
  followup?: string[]
  monitoring?: string[]
}
