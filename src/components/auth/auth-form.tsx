"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface AuthFormProps {
  mode: "login" | "signup";
  nextPath?: string;
}

function createAuthSchema(mode: AuthFormProps["mode"]) {
  return z
    .object({
      email: z.string().email("Enter a valid email address."),
      password: z.string().min(8, "Password must be at least 8 characters."),
      confirmPassword: z.string().optional(),
    })
    .superRefine((values, context) => {
      if (mode === "signup" && values.password !== values.confirmPassword) {
        context.addIssue({
          code: "custom",
          path: ["confirmPassword"],
          message: "Passwords do not match.",
        });
      }
    });
}

type AuthFormValues = {
  email: string;
  password: string;
  confirmPassword?: string;
};

export function AuthForm({ mode, nextPath = "/dashboard" }: AuthFormProps) {
  const router = useRouter();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const authSchema = createAuthSchema(mode);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: AuthFormValues) {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setStatusMessage("Set the Supabase environment variables to enable authentication.");
      return;
    }

    setStatusMessage(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setStatusMessage(error.message);
        return;
      }

      router.replace(nextPath);
      router.refresh();
      return;
    }

    const { error, data } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setStatusMessage(error.message);
      return;
    }

    if (data.session) {
      router.replace(nextPath === "/dashboard" ? "/onboarding" : nextPath);
      router.refresh();
      return;
    }

    setStatusMessage("Check your email to confirm the account, then sign in.");
  }

  return (
    <Card>
      <CardBody className="space-y-5 p-8 sm:p-10">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
            {form.formState.errors.email ? (
              <p className="text-sm text-red-700">{form.formState.errors.email.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              {...form.register("password")}
            />
            {form.formState.errors.password ? (
              <p className="text-sm text-red-700">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
              {form.formState.errors.confirmPassword ? (
                <p className="text-sm text-red-700">
                  {form.formState.errors.confirmPassword.message}
                </p>
              ) : null}
            </div>
          ) : null}

          {statusMessage ? <p className="text-sm text-foreground/70">{statusMessage}</p> : null}

          <Button className="w-full" disabled={form.formState.isSubmitting} type="submit">
            {form.formState.isSubmitting
              ? "Working..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
        </form>

        <p className="text-sm text-foreground/60">
          {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
          <Link
            href={mode === "login" ? "/signup" : "/login"}
            className="font-semibold text-accent hover:text-accent-strong"
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </Link>
        </p>
      </CardBody>
    </Card>
  );
}