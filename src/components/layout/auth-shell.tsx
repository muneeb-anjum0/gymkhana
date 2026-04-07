import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardBody } from "@/components/ui/card";

interface AuthShellProps {
  title: string;
  description: string;
  eyebrow: string;
  footer: {
    label: string;
    href: string;
    linkText: string;
  };
  children: React.ReactNode;
}

export function AuthShell({ title, description, eyebrow, footer, children }: AuthShellProps) {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="flex flex-col justify-between rounded-[2rem] border border-line bg-[linear-gradient(160deg,rgba(15,118,110,0.16),rgba(255,253,248,0.85))] p-8 shadow-[0_20px_60px_rgba(16,24,40,0.08)] sm:p-10">
          <div className="max-w-xl space-y-6">
            <Badge className="bg-white/70 text-foreground">{eyebrow}</Badge>
            <div className="space-y-4">
              <h1 className="max-w-lg text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-foreground/72 sm:text-lg">
                {description}
              </p>
            </div>
          </div>

          <div className="mt-16 grid gap-3 sm:grid-cols-2">
            <Card className="bg-white/80">
              <CardBody>
                <p className="text-sm font-medium text-foreground/60">Built for</p>
                <p className="mt-2 text-lg font-semibold">Consistency over complexity</p>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  Fast logging, clean templates, and enough structure to keep training moving.
                </p>
              </CardBody>
            </Card>
            <Card className="bg-white/80">
              <CardBody>
                <p className="text-sm font-medium text-foreground/60">Data model</p>
                <p className="mt-2 text-lg font-semibold">Supabase-first</p>
                <p className="mt-2 text-sm leading-6 text-foreground/70">
                  Auth, profile, and training data are wired for row-level security from day one.
                </p>
              </CardBody>
            </Card>
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <Card>
            <CardBody className="space-y-6 p-8 sm:p-10">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accent">
                  Liftline
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                  {title}
                </h2>
                <p className="text-sm leading-6 text-foreground/70">{description}</p>
              </div>

              {children}

              <p className="text-sm text-foreground/60">
                {footer.label}{" "}
                <Link className="font-semibold text-accent hover:text-accent-strong" href={footer.href}>
                  {footer.linkText}
                </Link>
              </p>
            </CardBody>
          </Card>
        </section>
      </div>
    </div>
  );
}