import type { SplitPreset } from "@/types/domain";

export const splitPresets: SplitPreset[] = [
  {
    key: "upper-lower",
    name: "Upper / Lower",
    description: "Balanced four-day split for strength and size with predictable recovery.",
    sessionsPerWeek: 4,
    mapping: {
      monday: "upper",
      tuesday: "lower",
      wednesday: "rest",
      thursday: "upper",
      friday: "lower",
      saturday: "mobility",
      sunday: "rest",
    },
  },
  {
    key: "push-pull-legs",
    name: "Push / Pull / Legs",
    description: "Classic six-day rotation for higher training frequency and focused volume.",
    sessionsPerWeek: 6,
    mapping: {
      monday: "push",
      tuesday: "pull",
      wednesday: "legs",
      thursday: "push",
      friday: "pull",
      saturday: "legs",
      sunday: "rest",
    },
  },
  {
    key: "full-body",
    name: "Full Body",
    description: "Three sessions per week with enough recovery for beginners or busy schedules.",
    sessionsPerWeek: 3,
    mapping: {
      monday: "full-body",
      tuesday: "rest",
      wednesday: "full-body",
      thursday: "rest",
      friday: "full-body",
      saturday: "mobility",
      sunday: "rest",
    },
  },
  {
    key: "custom",
    name: "Custom Week",
    description: "Build your own week with manual focus mapping for each day.",
    sessionsPerWeek: 4,
    mapping: {
      monday: "upper",
      tuesday: "rest",
      wednesday: "lower",
      thursday: "rest",
      friday: "upper",
      saturday: "lower",
      sunday: "rest",
    },
  },
];

export const trainingDayLabels: Array<{
  key: keyof SplitPreset["mapping"];
  label: string;
}> = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

export const trainingFocusOptions = [
  { label: "Rest", value: "rest" },
  { label: "Upper", value: "upper" },
  { label: "Lower", value: "lower" },
  { label: "Push", value: "push" },
  { label: "Pull", value: "pull" },
  { label: "Legs", value: "legs" },
  { label: "Full Body", value: "full-body" },
  { label: "Mobility", value: "mobility" },
  { label: "Cardio", value: "cardio" },
  { label: "Custom", value: "custom" },
] as const;

export function getDefaultSplitPreset() {
  const preset = splitPresets[0];

  if (!preset) {
    throw new Error("At least one split preset must be configured.");
  }

  return preset;
}