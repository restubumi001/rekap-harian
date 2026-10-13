import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  ocid?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  ocid = "empty_state",
}: EmptyStateProps) {
  return (
    <div
      data-ocid={ocid}
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-card px-6 py-14 text-center"
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <h2 className="font-display text-lg font-semibold text-foreground">
        {title}
      </h2>
      <p className="max-w-md text-sm text-muted-foreground">{description}</p>
      {action ? <div className="mt-1">{action}</div> : null}
    </div>
  );
}
