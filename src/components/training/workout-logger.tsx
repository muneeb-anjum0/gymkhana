"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { exerciseLibrary } from "@/lib/data/exercise-library";
import type { Database } from "@/types/database";

const workoutLoggerSchema = z.object({
  workoutDate: z.string().min(1, "Select a date."),
  templateId: z.string().optional(),
  name: z.string().min(2, "Give the session a name.").max(80),
  notes: z.string().max(500).optional(),
  exercises: z
    .array(
      z
        .object({
          exerciseSlug: z.string().min(1, "Choose an exercise."),
          notes: z.string().max(160).optional(),
          sets: z
            .array(
              z.object({
                reps: z.string().optional(),
                weightKg: z.string().optional(),
              }),
            )
            .length(3),
        })
        .superRefine((exercise, context) => {
          exercise.sets.forEach((set, index) => {
            if (set.reps && Number.isNaN(Number(set.reps))) {
              context.addIssue({
                code: "custom",
                path: ["sets", index, "reps"],
                message: "Enter a valid number.",
              });
            }

            if (set.weightKg && Number.isNaN(Number(set.weightKg))) {
              context.addIssue({
                code: "custom",
                path: ["sets", index, "weightKg"],
                message: "Enter a valid number.",
              });
            }
          });

          const hasLoggedSet = exercise.sets.some(
            (set) => Boolean(set.reps?.trim() || set.weightKg?.trim()),
          );

          if (!hasLoggedSet) {
            context.addIssue({
              code: "custom",
              path: ["sets"],
              message: "Enter at least one rep or weight value.",
            });
          }
        }),
    )
    .min(1, "Add at least one exercise."),
});

type WorkoutLoggerValues = z.infer<typeof workoutLoggerSchema>;

interface WorkoutLoggerProps {
  templateOptions: Array<{ id: string; name: string }>;
  userId: string;
}

const emptySet = { reps: "", weightKg: "" };

function createExerciseBlock() {
  return {
    exerciseSlug: exerciseLibrary[0]?.slug ?? "",
    notes: "",
    sets: [{ ...emptySet }, { ...emptySet }, { ...emptySet }],
  };
}

const emptyWorkout = {
  workoutDate: new Date().toISOString().slice(0, 10),
  templateId: "",
  name: "Upper body session",
  notes: "",
  exercises: [createExerciseBlock()],
};

export function WorkoutLogger({ templateOptions, userId }: WorkoutLoggerProps) {
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<WorkoutLoggerValues>({
    resolver: zodResolver(workoutLoggerSchema),
    defaultValues: emptyWorkout,
  });

  const exercises = useFieldArray({
    control: form.control,
    name: "exercises",
  });

  async function onSubmit(values: WorkoutLoggerValues) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Set the Supabase environment variables to save workouts.");
      return;
    }

    const sessionPayload: Database["public"]["Tables"]["workout_sessions"]["Insert"] = {
      user_id: userId,
      template_id: values.templateId || null,
      workout_date: values.workoutDate,
      name: values.name,
      notes: values.notes ?? null,
    };

    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert(sessionPayload as never)
      .select("id")
      .single();

    const createdSession = session as { id: string } | null;

    if (sessionError || !createdSession) {
      setMessage(sessionError?.message ?? "Unable to create the workout session.");
      return;
    }

    const setRows = values.exercises.flatMap((exercise) => {
      const exerciseOption = exerciseLibrary.find((item) => item.slug === exercise.exerciseSlug);

      if (!exerciseOption) {
        return [];
      }

      return exercise.sets.flatMap((set, index) => {
        const reps = set.reps?.trim() ? Number(set.reps) : null;
        const weightKg = set.weightKg?.trim() ? Number(set.weightKg) : null;

        if (reps === null && weightKg === null) {
          return [];
        }

        return {
          session_id: createdSession.id,
          exercise_slug: exerciseOption.slug,
          exercise_name: exerciseOption.name,
          set_number: index + 1,
          reps,
          weight_kg: weightKg,
          notes: exercise.notes ?? null,
        };
      });
    });

    if (setRows.length > 0) {
      const { error: setsError } = await supabase.from("workout_sets").insert(setRows as never);

      if (setsError) {
        setMessage(setsError.message);
        return;
      }
    }

    setMessage("Workout saved.");
    form.reset(emptyWorkout);
  }

  return (
    <Card>
      <CardHeader>
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Quick log</p>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">Log today’s session</h2>
        </div>
      </CardHeader>

      <CardBody className="space-y-6">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="workoutDate">Date</Label>
              <Input id="workoutDate" type="date" {...form.register("workoutDate")} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="name">Session name</Label>
              <Input id="name" {...form.register("name")} />
            </div>

            <div className="space-y-2 md:col-span-3">
              <Label htmlFor="templateId">Template</Label>
              <Select id="templateId" {...form.register("templateId")}>
                <option value="">No template</option>
                {templateOptions.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">
                Exercises
              </h3>
              <Button
                onClick={() => exercises.append(createExerciseBlock())}
                size="sm"
                type="button"
                variant="secondary"
              >
                Add exercise
              </Button>
            </div>

            <div className="space-y-4">
              {exercises.fields.map((field, exerciseIndex) => (
                <Card key={field.id} className="bg-surface">
                  <CardBody className="space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="grid flex-1 gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor={`exercise-${exerciseIndex}`}>Exercise</Label>
                          <Select id={`exercise-${exerciseIndex}`} {...form.register(`exercises.${exerciseIndex}.exerciseSlug`)}>
                            {exerciseLibrary.map((exercise) => (
                              <option key={exercise.slug} value={exercise.slug}>
                                {exercise.name}
                              </option>
                            ))}
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`exercise-notes-${exerciseIndex}`}>Exercise notes</Label>
                          <Input
                            id={`exercise-notes-${exerciseIndex}`}
                            placeholder="Tempo, cues, setup"
                            {...form.register(`exercises.${exerciseIndex}.notes`)}
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => exercises.remove(exerciseIndex)}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      {[0, 1, 2].map((setIndex) => (
                        <div key={setIndex} className="space-y-3 rounded-2xl border border-line p-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/50">
                            Set {setIndex + 1}
                          </p>
                          <div className="space-y-2">
                            <Label htmlFor={`reps-${exerciseIndex}-${setIndex}`}>Reps</Label>
                            <Input
                              id={`reps-${exerciseIndex}-${setIndex}`}
                              inputMode="numeric"
                              placeholder="8"
                              {...form.register(`exercises.${exerciseIndex}.sets.${setIndex}.reps`)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`weight-${exerciseIndex}-${setIndex}`}>Weight (kg)</Label>
                            <Input
                              id={`weight-${exerciseIndex}-${setIndex}`}
                              inputMode="decimal"
                              placeholder="100"
                              {...form.register(`exercises.${exerciseIndex}.sets.${setIndex}.weightKg`)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {form.formState.errors.exercises?.[exerciseIndex] ? (
                      <p className="text-sm text-red-700">
                        {form.formState.errors.exercises[exerciseIndex]?.sets?.message ??
                          form.formState.errors.exercises[exerciseIndex]?.exerciseSlug?.message}
                      </p>
                    ) : null}
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Session notes</Label>
            <Textarea id="notes" placeholder="What felt strong today?" {...form.register("notes")} />
          </div>

          {message ? <p className="text-sm text-foreground/70">{message}</p> : null}

          <Button disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting ? "Saving..." : "Save workout"}
          </Button>
        </form>
      </CardBody>
    </Card>
  );
}