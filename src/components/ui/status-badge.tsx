import type { Status } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  unreviewed: {
    bg:    "bg-amber-50 dark:bg-amber-950/30",
    text:  "text-amber-800 dark:text-amber-400",
    dot:   "bg-amber-500",
    label: "Unreviewed",
  },
  reviewed: {
    bg:    "bg-blue-50 dark:bg-blue-950/30",
    text:  "text-blue-800 dark:text-blue-400",
    dot:   "bg-blue-500",
    label: "Reviewed",
  },
  resolved: {
    bg:    "bg-green-50 dark:bg-green-950/30",
    text:  "text-green-800 dark:text-green-400",
    dot:   "bg-green-500",
    label: "Resolved",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status] ?? statusConfig.unreviewed;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "text-[11px] font-semibold uppercase tracking-[0.04em]",
        config.bg,
        config.text
      )}
    >
      <span className={cn("size-1.5 rounded-full inline-block shrink-0", config.dot)} />
      {config.label}
    </span>
  );
}

export { StatusBadge };