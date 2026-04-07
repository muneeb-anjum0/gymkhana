import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { TemplateManager } from "@/components/templates/template-manager";
import { getDefaultSplitPreset, splitPresets } from "@/lib/data/split-presets";
import { getAuthedUserContext, getProfileSummary, getWorkoutTemplates } from "@/lib/firebase/queries";

export default async function TemplatesPage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const [profile, templates] = await Promise.all([
    getProfileSummary(context.user.id),
    getWorkoutTemplates(context.user.id),
  ]);

  const currentSplit = splitPresets.find((preset) => preset.key === profile?.splitKey) ?? getDefaultSplitPreset();

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Badge className="bg-surface-muted text-foreground">Templates</Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Workout templates</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
              Create reusable workout presets for the week, then pick them from the training logger.
            </p>
          </div>
        </div>

        <Link
          href="/training"
          className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted"
        >
          Go to training
        </Link>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-foreground/60">Current split</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{currentSplit.name}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-foreground/60">Saved templates</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{templates.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-foreground/60">Use case</p>
            <p className="mt-2 text-sm leading-6 text-foreground/70">
              Keep template names short and specific so logging stays fast.
            </p>
          </CardBody>
        </Card>
      </section>

      <TemplateManager templates={templates} userId={context.user.id} />
    </div>
  );
}