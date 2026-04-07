import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { WorkoutLogger } from "@/components/training/workout-logger";
import { exerciseLibrary } from "@/lib/data/exercise-library";
import { getDefaultSplitPreset, splitPresets } from "@/lib/data/split-presets";
import { getAuthedUserContext, getProfileSummary, getWorkoutTemplates } from "@/lib/supabase/queries";

export default async function TrainingPage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const [profile, templates] = await Promise.all([
    getProfileSummary(context.user.id),
    getWorkoutTemplates(context.user.id),
  ]);

  const activeSplit = splitPresets.find((preset) => preset.key === profile?.splitKey) ?? getDefaultSplitPreset();

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="bg-surface-muted text-foreground">Training</Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Templates and quick logging</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
            Use the starter library below, follow your current split, and log the session once the work is done.
          </p>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <WorkoutLogger templateOptions={templates} userId={context.user.id} />

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Current split</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  {activeSplit.name}
                </h2>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <p className="text-sm leading-6 text-foreground/70">{activeSplit.description}</p>
              <div className="space-y-2">
                {Object.entries(activeSplit.mapping).map(([day, focus]) => (
                  <div key={day} className="flex items-center justify-between rounded-2xl border border-line bg-surface-muted px-4 py-3 text-sm">
                    <span className="font-medium capitalize text-foreground/70">{day}</span>
                    <span className="font-semibold capitalize text-foreground">{focus}</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Exercise library</p>
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                  Seeded movement catalog
                </h2>
              </div>
            </CardHeader>
            <CardBody className="grid gap-3 sm:grid-cols-2">
              {exerciseLibrary.map((exercise) => (
                <div key={exercise.slug} className="rounded-2xl border border-line bg-surface-muted p-4">
                  <p className="font-semibold text-foreground">{exercise.name}</p>
                  <p className="mt-1 text-sm text-foreground/65">
                    {exercise.primaryMuscle} • {exercise.defaultSets} x {exercise.defaultReps}
                  </p>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
}