"use client";

import Link from "next/link";
import { Globe, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Status } from "@/types";
import { timeAgo } from "./feedback-detail-utils";

interface FeedbackSimilarAndProjectProps {
  similar?: {
    id: string;
    message: string;
    status: Status;
    createdAt: string;
  }[] | null;
  project: {
    id: string;
    name: string;
    color: string;
  };
}

export function FeedbackSimilarAndProject({
  similar,
  project,
}: FeedbackSimilarAndProjectProps) {
  return (
    <>
      {/* Similar feedback */}
      {similar && similar.length > 0 && (
        <Card>
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Other Feedback from This Page
          </h3>
          <div className="flex flex-col gap-2">
            {similar.map((s) => (
              <Link
                key={s.id}
                href={`/dashboard/feedback/${s.id}`}
                className="flex items-center justify-between gap-3 p-3 bg-background border border-border rounded-lg hover:border-border/80 transition-colors group"
              >
                <p className="text-sm text-foreground truncate flex-1 group-hover:text-primary transition-colors">
                  {s.message}
                </p>
                <div className="flex items-center gap-2.5 shrink-0">
                  <StatusBadge status={s.status} />
                  <span className="text-sm text-muted-foreground/50">
                    {timeAgo(s.createdAt)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {/* Project context */}
      <Card>
        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
          Project
        </h3>
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-border/80 transition-colors group"
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: project.color,
              opacity: 0.125,
            }}
          >
            <Globe size={15} style={{ color: project.color }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
              {project.name}
            </p>
            <p className="text-sm text-muted-foreground font-mono truncate">
              {project.id}
            </p>
          </div>
          <ExternalLink
            size={14}
            className="text-muted-foreground group-hover:text-foreground transition-colors shrink-0"
          />
        </Link>
      </Card>
    </>
  );
}
