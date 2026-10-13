import { RecapStatus } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { statusLabel } from "@/lib/format";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: RecapStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const tone =
    status === RecapStatus.surplus
      ? "bg-surplus-soft text-surplus border-surplus"
      : status === RecapStatus.shortfall
        ? "bg-shortfall-soft text-shortfall border-shortfall"
        : "bg-muted text-muted-foreground border-border";

  return (
    <Badge
      variant="outline"
      className={cn(
        "rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tone,
        className,
      )}
    >
      {statusLabel(status)}
    </Badge>
  );
}
