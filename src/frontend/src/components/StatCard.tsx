import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint: string;
  icon: LucideIcon;
  tone?: "surplus" | "shortfall" | "neutral";
  ocid: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "neutral",
  ocid,
}: StatCardProps) {
  const toneClass =
    tone === "surplus"
      ? "text-surplus"
      : tone === "shortfall"
        ? "text-shortfall"
        : "text-foreground";

  const iconClass =
    tone === "surplus"
      ? "bg-surplus-soft text-surplus"
      : tone === "shortfall"
        ? "bg-shortfall-soft text-shortfall"
        : "bg-muted text-muted-foreground";

  return (
    <Card
      data-ocid={ocid}
      className="rounded-xl border-border shadow-elevated transition-smooth hover:-translate-y-0.5"
    >
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              "flex size-9 items-center justify-center rounded-lg",
              iconClass,
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
        </div>
        <span
          className={cn(
            "font-display font-mono-num text-3xl font-bold tracking-tight",
            toneClass,
          )}
        >
          {value}
        </span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  );
}
