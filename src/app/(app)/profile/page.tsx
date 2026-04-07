import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { getAuthedUserContext, getProfileSummary } from "@/lib/supabase/queries";

export default async function ProfilePage() {
  const context = await getAuthedUserContext();

  if (!context) {
    return null;
  }

  const profile = await getProfileSummary(context.user.id);

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge className="bg-surface-muted text-foreground">Profile</Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Your profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
            View the data collected during onboarding and reopen the setup flow if you want to update it.
          </p>
        </div>
      </section>

      <Card>
        <CardBody className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground/60">Display name</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{profile?.displayName ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground/60">Goal</p>
              <p className="mt-1 text-lg font-semibold text-foreground capitalize">{profile?.goal ?? "-"}</p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground/60">Height</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {profile?.heightCm ? `${profile.heightCm} cm` : "-"}
              </p>
            </div>
            <div className="rounded-2xl border border-line bg-surface-muted px-4 py-4">
              <p className="text-sm font-medium text-foreground/60">Experience level</p>
              <p className="mt-1 text-lg font-semibold text-foreground capitalize">
                {profile?.experienceLevel ?? "-"}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding">
              <span className="inline-flex h-11 items-center justify-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-foreground transition-colors hover:bg-surface-muted">
                Update onboarding
              </span>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}