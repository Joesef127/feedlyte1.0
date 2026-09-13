import type { Status } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<Status, { bg: string; text: string; dot: string; label: string }> = {
  unreviewed: {
    bg:    "bg-amber-50 dark:bg-amber-950/30",
    text:  "text-amber-800 dark:text-amber-400",
    dot:   "bg-amber-500",
    label: "Unreviewed",
  },
  in_review: {
    bg:    "bg-blue-50 dark:bg-blue-950/30",
    text:  "text-blue-800 dark:text-blue-400",
    dot:   "bg-blue-500",
    label: "In Review",
  },
  reviewed: {
    bg:    "bg-blue-50 dark:bg-blue-950/30",
    text:  "text-blue-800 dark:text-blue-400",
    dot:   "bg-blue-500",
    label: "In Review",
  },
  accepted: {
    bg:    "bg-cyan-50 dark:bg-cyan-950/30",
    text:  "text-cyan-800 dark:text-cyan-400",
    dot:   "bg-cyan-500",
    label: "Accepted",
  },
  in_progress: {
    bg:    "bg-purple-50 dark:bg-purple-950/30",
    text:  "text-purple-800 dark:text-purple-400",
    dot:   "bg-purple-500",
    label: "In Progress",
  },
  resolved: {
    bg:    "bg-emerald-50 dark:bg-emerald-950/30",
    text:  "text-emerald-800 dark:text-emerald-400",
    dot:   "bg-emerald-500",
    label: "Resolved",
  },
  not_feasible: {
    bg:    "bg-slate-100 dark:bg-slate-800/50",
    text:  "text-slate-700 dark:text-slate-300",
    dot:   "bg-slate-400",
    label: "Not Feasible",
  },
  closed: {
    bg:    "bg-zinc-100 dark:bg-zinc-800/50",
    text:  "text-zinc-600 dark:text-zinc-400",
    dot:   "bg-zinc-400",
    label: "Closed",
  },
  spam: {
    bg:    "bg-rose-50 dark:bg-rose-950/30",
    text:  "text-rose-800 dark:text-rose-400",
    dot:   "bg-rose-500",
    label: "Spam",
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