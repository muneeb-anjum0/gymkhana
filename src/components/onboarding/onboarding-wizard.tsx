"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  getDefaultSplitPreset,
  splitPresets,
  trainingDayLabels,
  trainingFocusOptions,
} from "@/lib/data/split-presets";
import type { ProfileSummary } from "@/types/domain";
import type { Database } from "@/types/database";

const onboardingSchema = z.object({
  displayName: z.string().min(2, "Enter a display name.").max(60),
  heightCm: z.number().int().min(120, "Enter a realistic height.").max(240),
  experienceLevel: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["strength", "hypertrophy", "fat-loss", "general-fitness"]),
  splitKey: z.enum(["upper-lower", "push-pull-legs", "full-body", "custom"]),
  sessionsPerWeek: z.number().int().min(2).max(7),
  monday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
  tuesday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
  wednesday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
  thursday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
  friday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
  saturday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
  sunday: z.enum(["rest", "upper", "lower", "push", "pull", "legs", "full-body", "mobility", "cardio", "custom"]),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

interface OnboardingWizardProps {
  profile: ProfileSummary | null;
  userId: string;
}

export function OnboardingWizard({ profile, userId }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const defaultPreset = useMemo(
    () => splitPresets.find((preset) => preset.key === profile?.splitKey) ?? getDefaultSplitPreset(),
    [profile?.splitKey],
  );

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      heightCm: profile?.heightCm ?? 175,
      experienceLevel: profile?.experienceLevel ?? "intermediate",
      goal: profile?.goal ?? "hypertrophy",
      splitKey: profile?.splitKey ?? defaultPreset.key,
      sessionsPerWeek: profile?.sessionsPerWeek ?? defaultPreset.sessionsPerWeek,
      monday: defaultPreset.mapping.monday,
      tuesday: defaultPreset.mapping.tuesday,
      wednesday: defaultPreset.mapping.wednesday,
      thursday: defaultPreset.mapping.thursday,
      friday: defaultPreset.mapping.friday,
      saturday: defaultPreset.mapping.saturday,
      sunday: defaultPreset.mapping.sunday,
    },
  });

  const selectedSplit = useWatch({ control: form.control, name: "splitKey" });

  useEffect(() => {
    const preset = splitPresets.find((item) => item.key === selectedSplit);

    if (!preset) {
      return;
    }

    if (selectedSplit !== "custom") {
      form.setValue("sessionsPerWeek", preset.sessionsPerWeek);
      trainingDayLabels.forEach(({ key }) => {
        form.setValue(key, preset.mapping[key]);
      });
    }
  }, [form, selectedSplit]);

  async function saveProfile(values: OnboardingValues) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Set the Supabase environment variables to save onboarding data.");
      return;
    }

    const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
      id: userId,
      display_name: values.displayName,
      height_cm: values.heightCm,
      experience_level: values.experienceLevel,
      goal: values.goal,
      split_key: values.splitKey,
      sessions_per_week: values.sessionsPerWeek,
      weekly_mapping: {
        monday: values.monday,
        tuesday: values.tuesday,
        wednesday: values.wednesday,
        thursday: values.thursday,
        friday: values.friday,
        saturday: values.saturday,
        sunday: values.sunday,
      },
      onboarding_complete: true,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from("profiles").upsert(profilePayload as never);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Onboarding complete. Redirecting to your dashboard...");
    window.location.assign("/dashboard");
  }

  const stepLabels = ["Profile", "Training", "Weekly map"];

  async function handleNext() {
    const fieldsByStep: Array<Array<keyof OnboardingValues>> = [
      ["displayName", "heightCm", "experienceLevel"],
      ["goal", "splitKey", "sessionsPerWeek"],
      trainingDayLabels.map(({ key }) => key),
    ];

    const isValid = await form.trigger(fieldsByStep[step]);

    if (!isValid) {
      return;
    }

    if (step < 2) {
      setStep((current) => current + 1);
      return;
    }

    await form.handleSubmit(saveProfile)();
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          {stepLabels.map((label, index) => (
            <div key={label} className="flex items-center gap-3 text-sm font-medium text-foreground/70">
              <span
                className={
                  index <= step
                    ? "flex h-8 w-8 items-center justify-center rounded-full bg-accent text-white"
                    : "flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-foreground/50"
                }
              >
                {index + 1}
              </span>
              <span>{label}</span>
            </div>
          ))}
        </div>
        <p className="text-sm text-foreground/60">Step {step + 1} of 3</p>
      </CardHeader>

      <CardBody className="space-y-6">
        {step === 0 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" {...form.register("displayName")} />
              {form.formState.errors.displayName ? (
                <p className="text-sm text-red-700">{form.formState.errors.displayName.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input id="heightCm" type="number" {...form.register("heightCm", { valueAsNumber: true })} />
              {form.formState.errors.heightCm ? (
                <p className="text-sm text-red-700">{form.formState.errors.heightCm.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Training level</Label>
              <Select id="experienceLevel" {...form.register("experienceLevel")}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="goal">Primary goal</Label>
              <Select id="goal" {...form.register("goal")}>
                <option value="strength">Strength</option>
                <option value="hypertrophy">Hypertrophy</option>
                <option value="fat-loss">Fat loss</option>
                <option value="general-fitness">General fitness</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitKey">Split</Label>
              <Select id="splitKey" {...form.register("splitKey")}>
                {splitPresets.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionsPerWeek">Sessions per week</Label>
              <Input
                id="sessionsPerWeek"
                type="number"
                {...form.register("sessionsPerWeek", { valueAsNumber: true })}
              />
            </div>

            <div className="sm:col-span-2 rounded-2xl border border-line bg-surface-muted px-4 py-4 text-sm text-foreground/70">
              {splitPresets.find((preset) => preset.key === selectedSplit)?.description}
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-5">
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-4 text-sm text-foreground/70">
              Set the focus for each day. Custom weeks can mix rest, mobility, and training blocks.
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {trainingDayLabels.map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{label}</Label>
                  <Select id={key} {...form.register(key)}>
                    {trainingFocusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {message ? <p className="text-sm text-foreground/70">{message}</p> : null}
      </CardBody>

      <CardFooter className="flex items-center justify-between gap-3">
        <Button
          disabled={step === 0 || form.formState.isSubmitting}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          variant="secondary"
        >
          Back
        </Button>

        <Button disabled={form.formState.isSubmitting} onClick={() => void handleNext()}>
          {step === 2 ? "Finish onboarding" : "Continue"}
        </Button>
      </CardFooter>
    </Card>
  );
}