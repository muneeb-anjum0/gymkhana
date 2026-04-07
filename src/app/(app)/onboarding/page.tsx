import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { getAuthedUserContext, getProfileSummary } from "@/lib/supabase/queries";

export default async function OnboardingPage() {
  const context = await getAuthedUserContext();

  if (!context) {
    redirect("/login");
  }

  const profile = await getProfileSummary(context.user.id);

  if (profile?.onboardingComplete) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-3">
        <Badge className="bg-surface-muted text-foreground">Onboarding</Badge>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Set up your training profile</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground/70">
            This keeps the first setup lightweight while still giving the app enough context to shape your week.
          </p>
        </div>
      </div>

      <Card>
        <CardBody>
          <OnboardingWizard profile={profile} userId={context.user.id} />
        </CardBody>
      </Card>
    </div>
  );
}