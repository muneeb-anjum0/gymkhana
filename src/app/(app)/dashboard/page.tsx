import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getAuthedUserContext, getDashboardMetrics, getProfileSummary, getWorkoutHistory } from "@/lib/supabase/queries";
import { getDefaultSplitPreset, splitPresets } from "@/lib/data/split-presets";
import { formatShortDate } from "@/lib/utils/date";

export default async function DashboardPage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const [profile, metrics, history] = await Promise.all([
    getProfileSummary(context.user.id),
    getDashboardMetrics(context.user.id),
    getWorkoutHistory(context.user.id),
  ]);

  const currentSplit = splitPresets.find((preset) => preset.key === profile?.splitKey) ?? getDefaultSplitPreset();

  const metricCards = [
    {
      label: "Workouts this week",
      value: metrics.workoutsThisWeek,
      detail: `${metrics.completionRate}% of target`,
    },
    {
      label: "Sets logged",
      value: metrics.totalSetsThisWeek,
      detail: "Tracked this week",
    },
    {
      label: "Volume",
      value: `${Math.round(metrics.totalVolumeKg).toLocaleString()} kg`,
      detail: "Estimated total volume",
    },
    {
      label: "Bodyweight trend",
      value: metrics.bodyweightDeltaKg === null ? "-" : `${metrics.bodyweightDeltaKg > 0 ? "+" : ""}${metrics.bodyweightDeltaKg.toFixed(1)} kg`,
      detail: "Change across weigh-ins",
    },
  ];

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Badge className="bg-surface-muted text-foreground">Dashboard</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Training overview</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
              Your weekly summary, current split, and recent training activity in one place.
            </p>
          </div>
        </div>

        <Link href="/training">
          <span className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted">
            Log workout
          </span>
        </Link>
      </section>

      {!profile?.onboardingComplete ? (
        <Card>
          <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Setup</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Finish onboarding to unlock the full dashboard.
              </h2>
              <p className="mt-2 text-sm leading-6 text-foreground/70">
                Add your height, goal, and weekly split so the app can tailor the schedule.
              </p>
            </div>
            <Link
              href="/onboarding"
              className="inline-flex h-11 items-center justify-center rounded-full bg-accent px-4 text-sm font-medium text-white transition-colors hover:bg-accent-strong"
            >
              Continue onboarding
            </Link>
          </CardBody>
        </Card>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metricCards.map((card) => (
          <Card key={card.label}>
            <CardBody>
              <p className="text-sm font-medium text-foreground/60">{card.label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{card.value}</p>
              <p className="mt-2 text-sm text-foreground/65">{card.detail}</p>
            </CardBody>
          </Card>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.96fr_1.04fr]">
        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Split</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                {currentSplit.name}
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm leading-6 text-foreground/70">{currentSplit.description}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(currentSplit.mapping).map(([day, focus]) => {
                const dayLabel = day.charAt(0).toUpperCase() + day.slice(1);

                return (
                  <div key={day} className="rounded-2xl border border-line bg-surface-muted px-4 py-3">
                    <p className="text-sm font-medium text-foreground/70">{dayLabel}</p>
                    <p className="mt-1 text-base font-semibold capitalize text-foreground">{focus}</p>
                  </div>
                );
              })}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Recent</p>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                Latest workouts
              </h2>
            </div>
          </CardHeader>
          <CardBody className="space-y-3">
            {history.length > 0 ? (
              history.slice(0, 4).map((session) => (
                <div key={session.id} className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{session.name}</p>
                      <p className="text-sm text-foreground/65">
                        {formatShortDate(session.workoutDate)}
                        {session.templateName ? ` • ${session.templateName}` : ""}
                      </p>
                    </div>
                    <div className="text-right text-sm text-foreground/65">
                      <p>{session.totalSets} sets</p>
                      <p>{Math.round(session.totalVolumeKg).toLocaleString()} kg</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-line bg-surface-muted px-4 py-8 text-sm text-foreground/60">
                No workouts logged yet. Start with the training page and save your first session.
              </div>
            )}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}