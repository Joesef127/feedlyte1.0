"use client";

import { Trash2 } from "lucide-react";
import type { Feedback, Status } from "@/types";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

interface FeedbackDetailProps {
  fb: Feedback;
  onUpdateStatus: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}

const META_FIELDS: [string, keyof Feedback][] = [
  ["Page URL", "pageUrl"],
  ["User Agent", "userAgent"],
  ["Email", "email"],
  ["Submitted", "createdAt"],
];

export function FeedbackDetail({ fb, onUpdateStatus, onDelete }: FeedbackDetailProps) {
  return (
    <div className="flex flex-col gap-4">
      {/* Message */}
      <div className="bg-background rounded-lg px-4 py-[14px]">
        <p className="text-[14px] text-foreground leading-relaxed m-0">{fb.message}</p>
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2.5">
        {META_FIELDS.map(([label, key]) => (
          <div key={label} className="bg-background rounded-[7px] px-3 py-2.5">
            <p className="text-[10px] text-[#3d3d3d] font-semibold uppercase tracking-[0.06em] mb-[3px]">
              {label}
            </p>
            <p className="text-[12px] text-[#737373] font-mono break-all m-0">
              {(fb[key] as string) || "Not provided"}
            </p>
          </div>
        ))}
      </div>

      {/* Status picker */}
      <div>
        <p className="text-[12px] text-[#737373] font-medium uppercase tracking-[0.04em] mb-2">
          Update Status
        </p>
        <div className="flex gap-1.5 flex-wrap">
          {(["new", "reviewed", "resolved"] as Status[]).map((s) => (
            <button
              key={s}
              onClick={() => onUpdateStatus(fb.id, s)}
              className="flex items-center gap-1.5 px-3 py-[6px] rounded-[7px] border bg-transparent text-[12px] font-medium cursor-pointer capitalize transition-all"
              style={{
                borderColor: fb.status === s ? "#F59E0B" : "#2A2A2A",
                color: fb.status === s ? "#F59E0B" : "#525252",
                background: fb.status === s ? "#F59E0B10" : "transparent",
              }}
            >
              <StatusBadge status={s} />
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <div className="flex justify-end">
        <Button variant="danger" size="sm" onClick={() => onDelete(fb.id)} className="gap-1.5">
          <Trash2 size={14} />
          Delete
        </Button>
      </div>
    </div>
  );
}
