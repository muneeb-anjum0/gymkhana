import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getAuthedUserContext, getProfileSummary } from "@/lib/supabase/queries";
import { getDefaultSplitPreset, splitPresets, trainingDayLabels } from "@/lib/data/split-presets";

export default async function SchedulePage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const profile = await getProfileSummary(context.user.id);
  const preset = splitPresets.find((item) => item.key === profile?.splitKey) ?? getDefaultSplitPreset();
  const mapping = profile?.weeklyMapping ?? preset.mapping;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="bg-surface-muted text-foreground">Schedule</Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Weekly schedule</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
            See how the split maps onto the week, then adjust the plan if your schedule changes.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Plan</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{preset.name}</h2>
          </div>
        </CardHeader>
        <CardBody className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {trainingDayLabels.map(({ key, label }) => (
            <div key={key} className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
              <p className="text-sm font-semibold text-foreground/70">{label}</p>
              <p className="mt-2 text-lg font-semibold capitalize text-foreground">{mapping[key]}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}