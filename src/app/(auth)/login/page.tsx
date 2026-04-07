import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";

interface LoginPageProps {
  searchParams?: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your training dashboard"
      description="Continue logging workouts, tracking bodyweight, and keeping your split on track."
      footer={{ label: "Need an account?", href: "/signup", linkText: "Create one" }}
    >
      <AuthForm mode="login" nextPath={resolvedSearchParams.next} />
    </AuthShell>
  );
}