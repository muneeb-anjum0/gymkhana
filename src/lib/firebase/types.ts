import type {
  BodyweightEntry,
  DashboardMetrics,
  ExperienceLevel,
  ProfileSummary,
  TrainingGoal,
  TrainingSplitKey,
  WeeklyMapping,
} from "@/types/domain";

export interface FirebaseProfileDoc {
  userId: string;
  email: string | null;
  displayName: string | null;
  heightCm: number | null;
  experienceLevel: ExperienceLevel | null;
  goal: TrainingGoal | null;
  splitKey: TrainingSplitKey | null;
  sessionsPerWeek: number | null;
  weeklyMapping: WeeklyMapping | null;
  onboardingComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseWorkoutTemplateDoc {
  userId: string;
  name: string;
  splitKey: TrainingSplitKey | null;
  dayKey: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FirebaseWorkoutSessionDoc {
  userId: string;
  templateId: string | null;
  templateName: string | null;
  workoutDate: string;
  name: string;
  notes: string | null;
  createdAt: string;
}

export interface FirebaseWorkoutSetDoc {
  userId: string;
  sessionId: string;
  exerciseSlug: string;
  exerciseName: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  notes: string | null;
  createdAt: string;
}

export interface FirebaseBodyweightEntryDoc {
  userId: string;
  loggedAt: string;
  weightKg: number;
  notes: string | null;
  createdAt: string;
}

export interface FirebaseUserContext {
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
}

export function toWeeklyMapping(value: unknown): WeeklyMapping | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const mapping = value as Record<string, unknown>;

  return {
    monday: (mapping.monday as WeeklyMapping["monday"]) ?? "rest",
    tuesday: (mapping.tuesday as WeeklyMapping["tuesday"]) ?? "rest",
    wednesday: (mapping.wednesday as WeeklyMapping["wednesday"]) ?? "rest",
    thursday: (mapping.thursday as WeeklyMapping["thursday"]) ?? "rest",
    friday: (mapping.friday as WeeklyMapping["friday"]) ?? "rest",
    saturday: (mapping.saturday as WeeklyMapping["saturday"]) ?? "rest",
    sunday: (mapping.sunday as WeeklyMapping["sunday"]) ?? "rest",
  };
}

export function profileDocToSummary(profileDoc: FirebaseProfileDoc, userId: string): ProfileSummary {
  return {
    id: userId,
    displayName: profileDoc.displayName,
    heightCm: profileDoc.heightCm,
    experienceLevel: profileDoc.experienceLevel,
    goal: profileDoc.goal,
    splitKey: profileDoc.splitKey,
    sessionsPerWeek: profileDoc.sessionsPerWeek,
    onboardingComplete: profileDoc.onboardingComplete,
    weeklyMapping: profileDoc.weeklyMapping,
  };
}

export function bodyweightDocToEntry(id: string, entryDoc: FirebaseBodyweightEntryDoc): BodyweightEntry {
  return {
    id,
    loggedAt: entryDoc.loggedAt,
    weightKg: entryDoc.weightKg,
    notes: entryDoc.notes,
  };
}

export function createEmptyMetrics(): DashboardMetrics {
  return {
    workoutsThisWeek: 0,
    totalSetsThisWeek: 0,
    totalVolumeKg: 0,
    bodyweightDeltaKg: null,
    completionRate: 0,
  };
}
