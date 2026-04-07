import type { Json } from "./json";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          height_cm: number | null;
          experience_level: string | null;
          goal: string | null;
          split_key: string | null;
          sessions_per_week: number | null;
          weekly_mapping: Json | null;
          onboarding_complete: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          height_cm?: number | null;
          experience_level?: string | null;
          goal?: string | null;
          split_key?: string | null;
          sessions_per_week?: number | null;
          weekly_mapping?: Json | null;
          onboarding_complete?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
        Update: {
          display_name?: string | null;
          height_cm?: number | null;
          experience_level?: string | null;
          goal?: string | null;
          split_key?: string | null;
          sessions_per_week?: number | null;
          weekly_mapping?: Json | null;
          onboarding_complete?: boolean;
          updated_at?: string;
        };
      };
      exercise_library: {
        Row: {
          id: string;
          slug: string;
          name: string;
          category: string;
          primary_muscle: string;
          secondary_muscles: string[] | null;
          equipment: string;
          default_sets: number;
          default_reps: string;
          instructions: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          category: string;
          primary_muscle: string;
          secondary_muscles?: string[] | null;
          equipment: string;
          default_sets: number;
          default_reps: string;
          instructions: string;
          created_at?: string;
        };
        Update: {
          slug?: string;
          name?: string;
          category?: string;
          primary_muscle?: string;
          secondary_muscles?: string[] | null;
          equipment?: string;
          default_sets?: number;
          default_reps?: string;
          instructions?: string;
        };
      };
        Relationships: [];
      workout_templates: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          split_key: string | null;
          day_key: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          split_key?: string | null;
          day_key?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          name?: string;
          split_key?: string | null;
          day_key?: string | null;
          notes?: string | null;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          template_id: string | null;
          workout_date: string;
          name: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          template_id?: string | null;
          workout_date: string;
          name: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          template_id?: string | null;
          workout_date?: string;
          name?: string;
          notes?: string | null;
        };
      };
      workout_sets: {
        Row: {
          id: string;
          session_id: string;
          exercise_slug: string;
          exercise_name: string;
          set_number: number;
          reps: number | null;
          weight_kg: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          exercise_slug: string;
          exercise_name: string;
          set_number: number;
          reps?: number | null;
          weight_kg?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          exercise_slug?: string;
          exercise_name?: string;
          set_number?: number;
          reps?: number | null;
          weight_kg?: number | null;
          notes?: string | null;
        };
      };
      bodyweight_entries: {
        Row: {
          id: string;
          user_id: string;
          logged_at: string;
          weight_kg: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          logged_at: string;
          weight_kg: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
        Update: {
          logged_at?: string;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
          weight_kg?: number;
          notes?: string | null;
        };
      };
    };
  };
}