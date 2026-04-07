"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatShortDate } from "@/lib/utils/date";
import type { BodyweightEntry } from "@/types/domain";
import type { Database } from "@/types/database";

const bodyweightSchema = z.object({
  loggedAt: z.string().min(1, "Choose a date."),
  weightKg: z.number().min(25, "Enter a valid weight.").max(400),
  notes: z.string().max(180).optional(),
});

type BodyweightValues = z.infer<typeof bodyweightSchema>;

interface BodyweightTrackerProps {
  entries: BodyweightEntry[];
  userId: string;
}

export function BodyweightTracker({ entries: initialEntries, userId }: BodyweightTrackerProps) {
  const [entries, setEntries] = useState(initialEntries);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<BodyweightValues>({
    resolver: zodResolver(bodyweightSchema),
    defaultValues: {
      loggedAt: new Date().toISOString().slice(0, 10),
      weightKg: entries.at(-1)?.weightKg ?? 80,
      notes: "",
    },
  });

  const chartData = useMemo(
    () =>
      entries.map((entry) => ({
        label: formatShortDate(entry.loggedAt),
        weightKg: entry.weightKg,
      })),
    [entries],
  );

  async function onSubmit(values: BodyweightValues) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("Set the Supabase environment variables to save bodyweight entries.");
      return;
    }

    const bodyweightPayload: Database["public"]["Tables"]["bodyweight_entries"]["Insert"] = {
      user_id: userId,
      logged_at: values.loggedAt,
      weight_kg: values.weightKg,
      notes: values.notes ?? null,
    };

    const { data, error } = await supabase
      .from("bodyweight_entries")
      .insert(bodyweightPayload as never)
      .select("id, logged_at, weight_kg, notes")
      .single();

    const createdEntry = data as
      | { id: string; logged_at: string; weight_kg: number; notes: string | null }
      | null;

    if (error || !createdEntry) {
      setMessage(error?.message ?? "Unable to save the entry.");
      return;
    }

    setEntries((current) => [
      ...current,
      {
        id: createdEntry.id,
        loggedAt: createdEntry.logged_at,
        weightKg: Number(createdEntry.weight_kg),
        notes: createdEntry.notes,
      },
    ]);

    setMessage("Bodyweight logged.");
    form.reset({
      loggedAt: values.loggedAt,
      weightKg: values.weightKg,
      notes: "",
    });
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
      <Card>
        <CardHeader>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Trend</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Bodyweight history</h2>
          </div>
        </CardHeader>

        <CardBody className="h-[320px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 16, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="bodyweightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f766e" stopOpacity={0.32} />
                    <stop offset="95%" stopColor="#0f766e" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(16,24,40,0.08)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 16,
                    border: "1px solid rgba(16,24,40,0.08)",
                    background: "rgba(255,253,248,0.98)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="weightKg"
                  stroke="#0f766e"
                  fill="url(#bodyweightGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-line bg-surface-muted text-sm text-foreground/60">
              Log a few weigh-ins to see the trend line.
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <div className="space-y-1">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">Log</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">Add a weigh-in</h2>
          </div>
        </CardHeader>

        <CardBody className="space-y-4">
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="loggedAt">Date</Label>
              <Input id="loggedAt" type="date" {...form.register("loggedAt")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightKg">Weight (kg)</Label>
              <Input
                id="weightKg"
                type="number"
                step="0.1"
                {...form.register("weightKg", { valueAsNumber: true })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Cut, bulk, or maintenance context" {...form.register("notes")} />
            </div>

            {message ? <p className="text-sm text-foreground/70">{message}</p> : null}

            <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? "Saving..." : "Save weigh-in"}
            </Button>
          </form>

          <div className="space-y-3 pt-2">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/60">
              Recent entries
            </p>
            <div className="space-y-2">
              {entries.slice(-3).reverse().map((entry) => (
                <div key={entry.id} className="rounded-2xl border border-line px-4 py-3">
                  <p className="font-medium">{entry.weightKg.toFixed(1)} kg</p>
                  <p className="text-sm text-foreground/60">{formatShortDate(entry.loggedAt)}</p>
                </div>
              ))}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}