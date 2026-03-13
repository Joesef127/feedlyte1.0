import * as React from "react";
import type { Status } from "@/types";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  Status,
  { bg: string; text: string; dot: string }
> = {
  new: {
    bg: "bg-[#FEF3C7]",
    text: "text-[#92400E]",
    dot: "bg-[#F59E0B]",
  },
  reviewed: {
    bg: "bg-[#EFF6FF]",
    text: "text-[#1E40AF]",
    dot: "bg-[#3B82F6]",
  },
  resolved: {
    bg: "bg-[#F0FDF4]",
    text: "text-[#166534]",
    dot: "bg-[#22C55E]",
  },
};

function StatusBadge({ status }: { status: Status }) {
  const config = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
        "text-[11px] font-semibold uppercase tracking-[0.04em]",
        config.bg,
        config.text
      )}
    >
      <span
        className={cn("size-[5px] rounded-full inline-block shrink-0", config.dot)}
      />
      {status}
    </span>
  );
}

export { StatusBadge };
