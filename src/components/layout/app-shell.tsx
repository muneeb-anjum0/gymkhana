"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/training", label: "Training" },
  { href: "/schedule", label: "Schedule" },
  { href: "/history", label: "History" },
  { href: "/progress", label: "Progress" },
  { href: "/profile", label: "Profile" },
];

interface AppShellProps {
  displayName: string;
  email: string;
  onboardingComplete: boolean;
  children: React.ReactNode;
}

export function AppShell({ displayName, email, onboardingComplete, children }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-surface/92 px-5 py-6 lg:border-b-0 lg:border-r">
        <div className="sticky top-6 flex h-[calc(100vh-3rem)] flex-col justify-between gap-8">
          <div className="space-y-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">Liftline</p>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{displayName}</h1>
              <p className="mt-1 text-sm text-foreground/60">{email}</p>
            </div>

            <nav className="space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-2xl px-4 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-accent text-white shadow-sm"
                        : "text-foreground/70 hover:bg-black/5 hover:text-foreground",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {!onboardingComplete ? (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-900">
                Finish onboarding to unlock the dashboard summary and split-aware planning.
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-2xl border border-line bg-surface px-4 py-3 text-left text-sm font-medium text-foreground/70 transition hover:bg-surface-muted hover:text-foreground"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 px-4 py-4 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}