import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { exerciseLibrary } from "@/lib/data/exercise-library";
import { splitPresets } from "@/lib/data/split-presets";

const highlights = [
  {
    title: "Fast workout logging",
    description: "Log sets, reps, and weight without fighting the UI or clicking through clutter.",
  },
  {
    title: "Split-aware planning",
    description: "Prebuilt splits and custom weekly mappings keep the calendar practical.",
  },
  {
    title: "Simple progress tracking",
    description: "Bodyweight history and session summaries are easy to read at a glance.",
  },
];

export default function MarketingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
      <section className="grid flex-1 gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-10">
        <div className="space-y-8 py-6 lg:py-0">
          <Badge className="bg-surface/90 text-accent">Version 1 gym tracker</Badge>

          <div className="space-y-5">
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
              A clean place to plan lifts, log work, and see progress without noise.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-foreground/72">
              Liftline gives you email/password auth, a focused onboarding flow, split planning,
              workout templates, quick logging, bodyweight trends, and a clear weekly dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
              <Link
                href="/signup"
                className="inline-flex h-12 items-center justify-center rounded-full bg-accent px-5 text-base font-medium text-white shadow-sm transition-colors hover:bg-accent-strong"
              >
                Create account
              </Link>
              <Link
                href="/login"
                className="inline-flex h-12 items-center justify-center rounded-full border border-line bg-surface px-5 text-base font-medium text-foreground transition-colors hover:bg-surface-muted"
              >
                Sign in
              </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((item) => (
              <Card key={item.title} className="bg-surface/90">
                <CardBody>
                  <h2 className="text-base font-semibold text-foreground">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-foreground/68">{item.description}</p>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-5 p-6 sm:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                    Dashboard preview
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                    Built for a real training week
                  </h2>
                </div>
                <div className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white">
                  4 day split
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {splitPresets.slice(0, 3).map((preset) => (
                  <div key={preset.key} className="rounded-2xl border border-line bg-surface-muted p-4">
                    <p className="text-sm font-semibold text-foreground">{preset.name}</p>
                    <p className="mt-1 text-sm leading-6 text-foreground/68">{preset.description}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-3xl border border-line bg-surface-muted p-5">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">
                    Exercise library
                  </p>
                  <p className="text-sm text-foreground/60">{exerciseLibrary.length} movements</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {exerciseLibrary.slice(0, 6).map((exercise) => (
                    <span
                      key={exercise.slug}
                      className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-medium text-foreground/70"
                    >
                      {exercise.name}
                    </span>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </main>
  );
}