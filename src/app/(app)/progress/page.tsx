import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { BodyweightTracker } from "@/components/progress/bodyweight-tracker";
import { getAuthedUserContext, getBodyweightEntries } from "@/lib/supabase/queries";

export default async function ProgressPage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const entries = await getBodyweightEntries(context.user.id);
  const latest = entries.at(-1);
  const starting = entries[0];
  const delta = latest && starting ? latest.weightKg - starting.weightKg : null;

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="bg-surface-muted text-foreground">Progress</Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Bodyweight tracking</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
            Track scale weight, watch the trend line, and keep the log simple enough to use consistently.
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardBody>
            <p className="text-sm font-medium text-foreground/60">Latest weigh-in</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {latest ? `${latest.weightKg.toFixed(1)} kg` : "-"}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-foreground/60">Change</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {delta === null ? "-" : `${delta > 0 ? "+" : ""}${delta.toFixed(1)} kg`}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-sm font-medium text-foreground/60">Entries</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">{entries.length}</p>
          </CardBody>
        </Card>
      </section>

      <BodyweightTracker entries={entries} userId={context.user.id} />
    </div>
  );
}