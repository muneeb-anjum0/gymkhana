"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardBody, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { deleteWorkoutTemplateDocument, saveWorkoutTemplate } from "@/lib/firebase/mutations";
import { splitPresets } from "@/lib/data/split-presets";

const templateSchema = z.object({
  name: z.string().min(2, "Give the template a name.").max(80),
  splitKey: z.enum(["", "upper-lower", "push-pull-legs", "full-body", "custom"]),
  dayKey: z.enum(["", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  notes: z.string().max(240).optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface WorkoutTemplateSummary {
  id: string;
  name: string;
  splitKey: string | null;
  dayKey: string | null;
  notes: string | null;
}

interface TemplateManagerProps {
  templates: WorkoutTemplateSummary[];
  userId: string;
}

const emptyTemplate: TemplateFormValues = {
  name: "",
  splitKey: "",
  dayKey: "",
  notes: "",
};

export function TemplateManager({ templates: initialTemplates, userId }: TemplateManagerProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const editingTemplate = useMemo(
    () => templates.find((template) => template.id === editingId) ?? null,
    [editingId, templates],
  );

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: emptyTemplate,
  });

  function startEditing(template: WorkoutTemplateSummary) {
    setEditingId(template.id);
    form.reset({
      name: template.name,
      splitKey: (template.splitKey ?? "") as TemplateFormValues["splitKey"],
      dayKey: (template.dayKey ?? "") as TemplateFormValues["dayKey"],
      notes: template.notes ?? "",
    });
  }

  function clearForm() {
    setEditingId(null);
    setMessage(null);
    form.reset(emptyTemplate);
  }

  async function onSubmit(values: TemplateFormValues) {
    try {
      const templateId = await saveWorkoutTemplate(userId, editingId, {
        name: values.name,
        splitKey: values.splitKey || null,
        dayKey: values.dayKey || null,
        notes: values.notes?.trim() ? values.notes : null,
      });

      if (editingId) {
        setTemplates((current) =>
          current.map((template) =>
            template.id === editingId
              ? {
                  ...template,
                  name: values.name,
                  splitKey: values.splitKey || null,
                  dayKey: values.dayKey || null,
                  notes: values.notes?.trim() ? values.notes : null,
                }
              : template,
          ),
        );
      } else {
        setTemplates((current) => [
          {
            id: templateId,
            name: values.name,
            splitKey: values.splitKey || null,
            dayKey: values.dayKey || null,
            notes: values.notes?.trim() ? values.notes : null,
          },
          ...current,
        ]);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save template.");
      return;
    }

    setMessage(editingId ? "Template updated." : "Template created.");
    clearForm();
    router.refresh();
  }

  async function removeTemplate(templateId: string) {
    const confirmed = window.confirm("Delete this template?");

    if (!confirmed) {
      return;
    }

    try {
      await deleteWorkoutTemplateDocument(templateId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to delete template.");
      return;
    }

    setTemplates((current) => current.filter((template) => template.id !== templateId));
    setMessage("Template deleted.");
    if (editingId === templateId) {
      clearForm();
    }
    router.refresh();
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <Card>
        <CardHeader>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
              {editingTemplate ? "Edit template" : "New template"}
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
              {editingTemplate ? editingTemplate.name : "Create a workout template"}
            </h2>
          </div>
        </CardHeader>

        <CardBody className="space-y-5">
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-2">
              <Label htmlFor="name">Template name</Label>
              <Input id="name" placeholder="Push day A" {...form.register("name")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="splitKey">Split</Label>
              <Select id="splitKey" {...form.register("splitKey")}>
                <option value="">No split assigned</option>
                {splitPresets.map((preset) => (
                  <option key={preset.key} value={preset.key}>
                    {preset.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dayKey">Day</Label>
              <Select id="dayKey" {...form.register("dayKey")}>
                <option value="">No day assigned</option>
                <option value="monday">Monday</option>
                <option value="tuesday">Tuesday</option>
                <option value="wednesday">Wednesday</option>
                <option value="thursday">Thursday</option>
                <option value="friday">Friday</option>
                <option value="saturday">Saturday</option>
                <option value="sunday">Sunday</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" placeholder="Warm-up notes, rep targets, tempo" {...form.register("notes")} />
            </div>

            {message ? <p className="text-sm text-foreground/70">{message}</p> : null}

            <div className="flex flex-wrap gap-3">
              <Button disabled={form.formState.isSubmitting} type="submit">
                {form.formState.isSubmitting ? "Saving..." : editingTemplate ? "Update template" : "Create template"}
              </Button>

              {editingTemplate ? (
                <Button onClick={clearForm} type="button" variant="secondary">
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </CardBody>

        <CardFooter className="text-sm text-foreground/60">
          Templates are lightweight presets. Sessions are still logged separately.
        </CardFooter>
      </Card>

      <div className="space-y-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <Card key={template.id} className={editingId === template.id ? "ring-2 ring-accent/30" : ""}>
              <CardBody className="space-y-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{template.name}</h3>
                    <p className="text-sm text-foreground/60">
                      {template.splitKey ?? "No split"}
                      {template.dayKey ? ` • ${template.dayKey}` : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => startEditing(template)} size="sm" type="button" variant="secondary">
                      Edit
                    </Button>
                    <Button onClick={() => void removeTemplate(template.id)} size="sm" type="button" variant="ghost">
                      Delete
                    </Button>
                  </div>
                </div>

                {template.notes ? <p className="text-sm leading-6 text-foreground/70">{template.notes}</p> : null}
              </CardBody>
            </Card>
          ))
        ) : (
          <Card>
            <CardBody className="rounded-3xl text-sm leading-6 text-foreground/65">
              No templates yet. Create one to speed up your next workout log.
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}