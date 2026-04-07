import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getAuthedUserContext, getWorkoutHistory } from "@/lib/supabase/queries";
import { formatShortDate } from "@/lib/utils/date";

export default async function HistoryPage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const history = await getWorkoutHistory(context.user.id);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="bg-surface-muted text-foreground">History</Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Workout history</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
            Review recent sessions, volume, and the day you trained without digging through raw records.
          </p>
        </div>
      </section>

      <Card>
        <CardHeader>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Sessions</p>
        </CardHeader>
        <CardBody className="space-y-3">
          {history.length > 0 ? (
            history.map((session) => (
              <div key={session.id} className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{session.name}</p>
                    <p className="text-sm text-foreground/65">
                      {formatShortDate(session.workoutDate)}
                      {session.templateName ? ` • ${session.templateName}` : ""}
                    </p>
                  </div>
                  <div className="flex gap-4 text-sm text-foreground/65">
                    <span>{session.totalSets} sets</span>
                    <span>{Math.round(session.totalVolumeKg).toLocaleString()} kg</span>
                  </div>
                </div>
                {session.notes ? <p className="mt-3 text-sm leading-6 text-foreground/70">{session.notes}</p> : null}
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-line bg-surface-muted px-4 py-8 text-sm text-foreground/60">
              No history yet. Once you save your first workout it will show up here.
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}