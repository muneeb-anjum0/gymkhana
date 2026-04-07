"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { upsertProfileDocument } from "@/lib/firebase/mutations";
import {
  getDefaultSplitPreset,
  splitPresets,
  trainingDayLabels,
  trainingFocusOptions,
} from "@/lib/data/split-presets";
import type { ProfileSummary } from "@/types/domain";

const profileSchema = z.object({
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

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileEditorProps {
  profile: ProfileSummary | null;
  userId: string;
}

export function ProfileEditor({ profile, userId }: ProfileEditorProps) {
  const [message, setMessage] = useState<string | null>(null);

  const defaultPreset = useMemo(
    () => splitPresets.find((preset) => preset.key === profile?.splitKey) ?? getDefaultSplitPreset(),
    [profile?.splitKey],
  );

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: profile?.displayName ?? "",
      heightCm: profile?.heightCm ?? 175,
      experienceLevel: profile?.experienceLevel ?? "intermediate",
      goal: profile?.goal ?? "hypertrophy",
      splitKey: profile?.splitKey ?? defaultPreset.key,
      sessionsPerWeek: profile?.sessionsPerWeek ?? defaultPreset.sessionsPerWeek,
      monday: profile?.weeklyMapping?.monday ?? defaultPreset.mapping.monday,
      tuesday: profile?.weeklyMapping?.tuesday ?? defaultPreset.mapping.tuesday,
      wednesday: profile?.weeklyMapping?.wednesday ?? defaultPreset.mapping.wednesday,
      thursday: profile?.weeklyMapping?.thursday ?? defaultPreset.mapping.thursday,
      friday: profile?.weeklyMapping?.friday ?? defaultPreset.mapping.friday,
      saturday: profile?.weeklyMapping?.saturday ?? defaultPreset.mapping.saturday,
      sunday: profile?.weeklyMapping?.sunday ?? defaultPreset.mapping.sunday,
    },
  });

  const selectedSplit = useWatch({ control: form.control, name: "splitKey" });

  useEffect(() => {
    const preset = splitPresets.find((item) => item.key === selectedSplit);

    if (!preset || selectedSplit === "custom") {
      return;
    }

    form.setValue("sessionsPerWeek", preset.sessionsPerWeek);
    trainingDayLabels.forEach(({ key }) => {
      form.setValue(key, preset.mapping[key]);
    });
  }, [form, selectedSplit]);

  async function saveProfile(values: ProfileFormValues) {
    try {
      await upsertProfileDocument(userId, {
        userId,
        email: null,
        displayName: values.displayName,
        heightCm: values.heightCm,
        experienceLevel: values.experienceLevel,
        goal: values.goal,
        splitKey: values.splitKey,
        sessionsPerWeek: values.sessionsPerWeek,
        weeklyMapping: {
          monday: values.monday,
          tuesday: values.tuesday,
          wednesday: values.wednesday,
          thursday: values.thursday,
          friday: values.friday,
          saturday: values.saturday,
          sunday: values.sunday,
        },
        onboardingComplete: true,
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save profile changes.");
      return;
    }

    setMessage("Profile saved.");
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Edit profile</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
            Update your training details
          </h2>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(saveProfile)}>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" {...form.register("displayName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heightCm">Height (cm)</Label>
              <Input id="heightCm" type="number" {...form.register("heightCm", { valueAsNumber: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experienceLevel">Experience level</Label>
              <Select id="experienceLevel" {...form.register("experienceLevel")}>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="goal">Goal</Label>
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
          </div>

          {selectedSplit === "custom" ? (
            <div className="space-y-4 rounded-3xl border border-line bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground/70">
                Custom weeks let you set a focus for every day.
              </p>
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
          ) : (
            <div className="rounded-3xl border border-line bg-surface-muted px-4 py-4 text-sm text-foreground/70">
              The selected split controls the weekly mapping automatically.
            </div>
          )}

          {message ? <p className="text-sm text-foreground/70">{message}</p> : null}

          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}