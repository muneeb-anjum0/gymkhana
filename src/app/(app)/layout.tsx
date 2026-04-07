import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { getAuthedUserContext, getProfileSummary } from "@/lib/supabase/queries";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const context = await getAuthedUserContext();

  if (!context) {
    redirect("/login");
  }

  const profile = await getProfileSummary(context.user.id);

  return (
    <AppShell
      displayName={profile?.displayName ?? context.user.email ?? "Athlete"}
      email={context.user.email ?? ""}
      onboardingComplete={profile?.onboardingComplete ?? false}
    >
      {children}
    </AppShell>
  );
}