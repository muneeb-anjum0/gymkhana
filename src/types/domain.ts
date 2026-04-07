export type TrainingSplitKey =
  | "upper-lower"
  | "push-pull-legs"
  | "full-body"
  | "custom";

export type TrainingDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type TrainingFocus =
  | "rest"
  | "upper"
  | "lower"
  | "push"
  | "pull"
  | "legs"
  | "full-body"
  | "mobility"
  | "cardio"
  | "custom";

export type TrainingGoal = "strength" | "hypertrophy" | "fat-loss" | "general-fitness";

export type ExperienceLevel = "beginner" | "intermediate" | "advanced";

export interface WeeklyMapping {
  monday: TrainingFocus;
  tuesday: TrainingFocus;
  wednesday: TrainingFocus;
  thursday: TrainingFocus;
  friday: TrainingFocus;
  saturday: TrainingFocus;
  sunday: TrainingFocus;
}

export interface ExerciseSeed {
  slug: string;
  name: string;
  category: "compound" | "accessory" | "isolation" | "conditioning";
  primaryMuscle: string;
  equipment: string;
  defaultSets: number;
  defaultReps: string;
  instructions: string;
}

export interface SplitPreset {
  key: TrainingSplitKey;
  name: string;
  description: string;
  sessionsPerWeek: number;
  mapping: WeeklyMapping;
}

export interface ProfileSummary {
  id: string;
  displayName: string | null;
  heightCm: number | null;
  experienceLevel: ExperienceLevel | null;
  goal: TrainingGoal | null;
  splitKey: TrainingSplitKey | null;
  sessionsPerWeek: number | null;
  onboardingComplete: boolean;
  weeklyMapping: WeeklyMapping | null;
}

export interface BodyweightEntry {
  id: string;
  loggedAt: string;
  weightKg: number;
  notes: string | null;
}

export interface WorkoutSessionSummary {
  id: string;
  workoutDate: string;
  name: string;
  templateName: string | null;
  notes: string | null;
  totalSets: number;
  totalVolumeKg: number;
}

export interface DashboardMetrics {
  workoutsThisWeek: number;
  totalSetsThisWeek: number;
  totalVolumeKg: number;
  bodyweightDeltaKg: number | null;
  completionRate: number;
}