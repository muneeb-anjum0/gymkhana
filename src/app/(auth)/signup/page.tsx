import { AuthForm } from "@/components/auth/auth-form";
import { AuthShell } from "@/components/layout/auth-shell";

export default function SignupPage() {
  return (
    <AuthShell
      eyebrow="Start here"
      title="Create your Liftline account"
      description="Set up a clean training space for your profile, split, workout templates, and progress logs."
      footer={{ label: "Already registered?", href: "/login", linkText: "Sign in" }}
    >
      <AuthForm mode="signup" />
    </AuthShell>
  );
}