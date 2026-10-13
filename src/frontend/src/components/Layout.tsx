import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { Link, useRouterState } from "@tanstack/react-router";
import { LogIn, LogOut, NotebookPen } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Catat" },
  { to: "/rekap", label: "Rekap" },
  { to: "/ringkasan", label: "Ringkasan" },
  { to: "/item", label: "Jenis Item" },
] as const;

export function Layout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoggingIn, login, clear } = useInternetIdentity();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-card shadow-subtle">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-6">
          <Link
            to="/"
            data-ocid="nav.link"
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <NotebookPen className="size-5" aria-hidden="true" />
            </span>
            <span className="flex flex-col leading-tight">
              <span className="font-display text-lg font-bold tracking-tight text-foreground">
                Dapur Ledger
              </span>
              <span className="text-xs text-muted-foreground">
                Rekap harian nasi &amp; lauk
              </span>
            </span>
          </Link>

          <nav
            aria-label="Navigasi utama"
            className="flex flex-wrap items-center gap-1"
          >
            {NAV.map((entry) => {
              const active =
                entry.to === "/"
                  ? pathname === "/"
                  : pathname.startsWith(entry.to);
              return (
                <Link
                  key={entry.to}
                  to={entry.to}
                  data-ocid={`nav.${entry.to === "/" ? "catat" : entry.to.slice(1)}.link`}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-sm font-medium transition-smooth outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {entry.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                data-ocid="auth.logout_button"
                onClick={() => clear()}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Keluar
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                data-ocid="auth.login_button"
                disabled={isLoggingIn}
                onClick={() => login()}
              >
                <LogIn className="size-4" aria-hidden="true" />
                {isLoggingIn ? "Menghubungkan…" : "Masuk"}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 bg-background">{children}</main>

      <footer className="border-t border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p className="font-mono-num text-xs uppercase tracking-widest">
            Buku besar dapur — kelebihan &amp; kekurangan porsi
          </p>
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="transition-smooth hover:text-foreground"
          >
            © {new Date().getFullYear()}. Built with love using caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
