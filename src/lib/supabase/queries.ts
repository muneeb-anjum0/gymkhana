import { exerciseLibraryBySlug } from "@/lib/data/exercise-library";
import { splitPresets } from "@/lib/data/split-presets";
import { addDays, getWeekStart } from "@/lib/utils/date";
import type {
  BodyweightEntry,
  DashboardMetrics,
  ProfileSummary,
  TrainingSplitKey,
  WeeklyMapping,
  WorkoutSessionSummary,
} from "@/types/domain";

import { createSupabaseServerClient } from "./server";

type ProfileRow = {
  id: string;
  display_name: string | null;
  height_cm: number | null;
  experience_level: string | null;
  goal: string | null;
  split_key: string | null;
  sessions_per_week: number | null;
  weekly_mapping: unknown | null;
  onboarding_complete: boolean;
};

type WorkoutSessionRow = {
  id: string;
  workout_date: string;
  name: string;
  notes: string | null;
  template_id: string | null;
};

type WorkoutTemplateRow = {
  id: string;
  name: string;
  split_key: string | null;
  day_key: string | null;
  notes: string | null;
};

type WorkoutSetRow = {
  session_id: string;
  reps: number | null;
  weight_kg: number | null;
};

type BodyweightRow = {
  id: string;
  logged_at: string;
  weight_kg: number;
  notes: string | null;
};

function toWeeklyMapping(value: unknown): WeeklyMapping | null {
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

async function getSupabaseOrNull() {
  return createSupabaseServerClient();
}

export async function getAuthedUserContext() {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    supabase,
    user,
  };
}

export async function getProfileSummary(userId: string): Promise<ProfileSummary | null> {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return null;
  }

  const { data } = await supabase.from("profiles").select("*").eq("id", userId).maybeSingle();
  const profileRow = data as ProfileRow | null;

  if (!profileRow) {
    return null;
  }

  return {
    id: profileRow.id,
    displayName: profileRow.display_name,
    heightCm: profileRow.height_cm,
    experienceLevel: (profileRow.experience_level as ProfileSummary["experienceLevel"]) ?? null,
    goal: (profileRow.goal as ProfileSummary["goal"]) ?? null,
    splitKey: (profileRow.split_key as TrainingSplitKey) ?? null,
    sessionsPerWeek: profileRow.sessions_per_week,
    onboardingComplete: profileRow.onboarding_complete,
    weeklyMapping: toWeeklyMapping(profileRow.weekly_mapping),
  };
}

export async function getWorkoutHistory(userId: string): Promise<WorkoutSessionSummary[]> {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [];
  }

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, workout_date, name, notes, template_id")
    .eq("user_id", userId)
    .order("workout_date", { ascending: false })
    .limit(20);

  const sessionRows = sessions as WorkoutSessionRow[] | null;

  if (!sessionRows?.length) {
    return [];
  }

  const templateIds = sessionRows.map((session) => session.template_id).filter(Boolean) as string[];
  const { data: templates } = templateIds.length
    ? await supabase
        .from("workout_templates")
        .select("id, name")
        .in("id", templateIds)
    : { data: [] };

  const templateRows = templates as WorkoutTemplateRow[] | null;

  const templateNameById = new Map(templateRows?.map((template) => [template.id, template.name]));
  const sessionIds = sessionRows.map((session) => session.id);
  const { data: sets } = await supabase
    .from("workout_sets")
    .select("session_id, reps, weight_kg, set_number")
    .in("session_id", sessionIds);

  const setRows = sets as WorkoutSetRow[] | null;

  return sessionRows.map((session) => {
    const sessionSets = setRows?.filter((set) => set.session_id === session.id) ?? [];
    const totalVolumeKg = sessionSets.reduce((total, set) => {
      if (typeof set.reps !== "number" || typeof set.weight_kg !== "number") {
        return total;
      }

      return total + set.reps * Number(set.weight_kg);
    }, 0);

    return {
      id: session.id,
      workoutDate: session.workout_date,
      name: session.name,
      templateName: session.template_id ? templateNameById.get(session.template_id) ?? null : null,
      notes: session.notes,
      totalSets: sessionSets.length,
      totalVolumeKg,
    };
  });
}

export async function getWorkoutTemplates(userId: string) {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("workout_templates")
    .select("id, name, split_key, day_key, notes, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const templateRows = data as WorkoutTemplateRow[] | null;

  return (
    templateRows?.map((template) => ({
      id: template.id,
      name: template.name,
      splitKey: (template.split_key as TrainingSplitKey) ?? null,
      dayKey: template.day_key,
      notes: template.notes,
    })) ?? []
  );
}

export async function getBodyweightEntries(userId: string): Promise<BodyweightEntry[]> {
  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return [];
  }

  const { data } = await supabase
    .from("bodyweight_entries")
    .select("id, logged_at, weight_kg, notes")
    .eq("user_id", userId)
    .order("logged_at", { ascending: true });

  const bodyweightRows = data as BodyweightRow[] | null;

  return (
    bodyweightRows?.map((entry) => ({
      id: entry.id,
      loggedAt: entry.logged_at,
      weightKg: Number(entry.weight_kg),
      notes: entry.notes,
    })) ?? []
  );
}

export async function getDashboardMetrics(userId: string): Promise<DashboardMetrics> {
  const today = new Date();
  const weekStart = getWeekStart(today);
  const weekStartIso = weekStart.toISOString().slice(0, 10);
  const nextWeekIso = addDays(weekStart, 7).toISOString().slice(0, 10);

  const supabase = await getSupabaseOrNull();

  if (!supabase) {
    return {
      workoutsThisWeek: 0,
      totalSetsThisWeek: 0,
      totalVolumeKg: 0,
      bodyweightDeltaKg: null,
      completionRate: 0,
    };
  }

  const { data: sessions } = await supabase
    .from("workout_sessions")
    .select("id, workout_date")
    .eq("user_id", userId)
    .gte("workout_date", weekStartIso)
    .lt("workout_date", nextWeekIso);

  const sessionRows = sessions as Array<{ id: string; workout_date: string }> | null;

  const sessionIds = sessionRows?.map((session) => session.id) ?? [];
  const { data: sets } = sessionIds.length
    ? await supabase
        .from("workout_sets")
        .select("session_id, reps, weight_kg")
        .in("session_id", sessionIds)
    : { data: [] };

  const setRows = sets as WorkoutSetRow[] | null;

  const { data: bodyweightEntries } = await supabase
    .from("bodyweight_entries")
    .select("logged_at, weight_kg")
    .eq("user_id", userId)
    .order("logged_at", { ascending: true });

  const bodyweightRows = bodyweightEntries as Array<{ logged_at: string; weight_kg: number }> | null;

  const workoutsThisWeek = sessionRows?.length ?? 0;
  const totalSetsThisWeek = setRows?.length ?? 0;
  const totalVolumeKg = setRows?.reduce((total, set) => {
    if (typeof set.reps !== "number" || typeof set.weight_kg !== "number") {
      return total;
    }

    return total + set.reps * Number(set.weight_kg);
  }, 0) ?? 0;

  const bodyweightDeltaKg =
    bodyweightRows && bodyweightRows.length > 1
      ? Number(
          bodyweightRows[bodyweightRows.length - 1]?.weight_kg ?? 0,
        ) - Number(bodyweightRows[0]?.weight_kg ?? 0)
      : null;

  const targetSessions = splitPresets.find((preset) => preset.key !== "custom")?.sessionsPerWeek ?? 4;

  return {
    workoutsThisWeek,
    totalSetsThisWeek,
    totalVolumeKg,
    bodyweightDeltaKg,
    completionRate: Math.min(100, Math.round((workoutsThisWeek / targetSessions) * 100)),
  };
}

export async function getExerciseCatalog() {
  return [...exerciseLibraryBySlug.values()];
}