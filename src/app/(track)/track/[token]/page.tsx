"use client";

import { use, useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  Eye,
  XCircle,
  PlayCircle,
  RotateCw,
  Star,
  MessageSquare,
  Sparkles,
  Layers,
} from "lucide-react";
import type { Status } from "@/types";

interface TrackingStatus {
  referenceId: string;
  message: string;
  status: Status;
  category: string | null;
  rating: number | null;
  projectName: string;
  projectColor: string;
  submittedAt: string;
  updatedAt: string;
}

const STATUS_META: Record<
  string,
  { label: string; desc: string; step: number; color: string; Icon: typeof Clock }
> = {
  unreviewed: {
    label: "Submitted",
    desc: "Your feedback has been received and is awaiting team review.",
    step: 1,
    color: "#F59E0B",
    Icon: Clock,
  },
  in_review: {
    label: "Under Review",
    desc: "The product team is actively reviewing your feedback.",
    step: 2,
    color: "#3B82F6",
    Icon: Eye,
  },
  reviewed: {
    label: "Under Review",
    desc: "The product team is reviewing your feedback.",
    step: 2,
    color: "#3B82F6",
    Icon: Eye,
  },
  accepted: {
    label: "Accepted",
    desc: "This feedback has been approved and scheduled on the product roadmap.",
    step: 3,
    color: "#06B6D4",
    Icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    desc: "The engineering team is actively working on implementation.",
    step: 3,
    color: "#8B5CF6",
    Icon: PlayCircle,
  },
  resolved: {
    label: "Resolved",
    desc: "Completed and released! Thank you for helping us improve.",
    step: 4,
    color: "#10B981",
    Icon: CheckCircle2,
  },
  not_feasible: {
    label: "Not Feasible",
    desc: "Investigated by the team, but cannot be implemented at this time.",
    step: 4,
    color: "#64748B",
    Icon: XCircle,
  },
  closed: {
    label: "Closed",
    desc: "This feedback item has been closed. Thank you for your input.",
    step: 4,
    color: "#64748B",
    Icon: XCircle,
  },
  spam: {
    label: "Closed",
    desc: "This feedback item has been closed.",
    step: 4,
    color: "#64748B",
    Icon: XCircle,
  },
};

const PIPELINE_STEPS = [
  { id: 1, label: "Submitted" },
  { id: 2, label: "Under Review" },
  { id: 3, label: "In Progress" },
  { id: 4, label: "Resolved" },
];

export default function TrackFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<TrackingStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(
    async (isManual = false) => {
      if (isManual) setRefreshing(true);
      try {
        const res = await fetch(`/api/feedback/track/${encodeURIComponent(token)}`);
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? "Unable to load this tracking link.");
          return;
        }
        setData(body);
        setError("");
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
        if (isManual) setRefreshing(false);
      }
    },
    [token],
  );

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
          {loading ? (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                Loading tracking details...
              </p>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
                <XCircle size={24} />
              </div>
              <h2 className="text-base font-bold text-foreground mb-1.5">
                Tracking Link Unavailable
              </h2>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto mb-6">
                {error} This link may have expired or already been removed.
              </p>
              <button
                onClick={() => fetchStatus(true)}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
              >
                <RotateCw size={14} />
                Try Again
              </button>
            </div>
          ) : data ? (
            <div>
              {/* Header: Project name & Ref ID */}
              <div className="px-6 py-4 border-b border-border/80 flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 ring-2 ring-background"
                    style={{ background: data.projectColor }}
                  />
                  <span className="font-bold text-sm text-foreground truncate">
                    {data.projectName}
                  </span>
                </div>
                <span className="font-mono text-xs text-muted-foreground bg-secondary/80 border border-border px-2.5 py-1 rounded-md shrink-0">
                  #{data.referenceId.slice(-6).toUpperCase()}
                </span>
              </div>

              {/* Status Banner */}
              {(() => {
                const meta = STATUS_META[data.status] ?? STATUS_META.unreviewed;
                const Icon = meta.Icon;
                const isNegative =
                  data.status === "closed" ||
                  data.status === "not_feasible" ||
                  data.status === "spam";

                return (
                  <div className="p-6 sm:p-7 border-b border-border/80">
                    <div className="flex items-start gap-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                        style={{
                          background: `${meta.color}15`,
                          color: meta.color,
                        }}
                      >
                        <Icon size={24} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h1 className="text-lg font-bold text-foreground">
                            {meta.label}
                          </h1>
                          <span
                            className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                            style={{
                              background: `${meta.color}20`,
                              color: meta.color,
                            }}
                          >
                            Status
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                          {meta.desc}
                        </p>
                      </div>
                    </div>

                    {/* Progress Pipeline */}
                    {!isNegative && (
                      <div className="mt-7 pt-6 border-t border-border/60">
                        <div className="grid grid-cols-4 gap-2 relative">
                          {PIPELINE_STEPS.map((s) => {
                            const isCompleted = meta.step >= s.id;
                            const isCurrent = meta.step === s.id;
                            return (
                              <div key={s.id} className="flex flex-col items-center text-center">
                                <div
                                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 transition-all ${
                                    isCompleted
                                      ? "bg-primary text-primary-foreground shadow-xs"
                                      : "bg-secondary text-muted-foreground"
                                  } ${isCurrent ? "ring-4 ring-primary/20 scale-105" : ""}`}
                                >
                                  {isCompleted ? (
                                    <CheckCircle2 size={13} className="stroke-[2.5]" />
                                  ) : (
                                    s.id
                                  )}
                                </div>
                                <span
                                  className={`text-[11px] leading-tight ${
                                    isCurrent
                                      ? "font-bold text-foreground"
                                      : isCompleted
                                        ? "font-medium text-foreground/80"
                                        : "text-muted-foreground"
                                  }`}
                                >
                                  {s.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Submitted Feedback Content */}
              <div className="p-6 sm:p-7 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare size={13} />
                    Your Feedback
                  </span>

                  <div className="flex items-center gap-2">
                    {data.category && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-secondary border border-border text-foreground uppercase tracking-wider">
                        {data.category}
                      </span>
                    )}

                    {data.rating !== null && data.rating > 0 && (
                      <div className="flex items-center gap-0.5 text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                        <Star size={12} className="fill-amber-500" />
                        <span className="text-xs font-bold">{data.rating}/5</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-secondary/40 border border-border rounded-xl p-4 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                  {data.message}
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-muted-foreground">
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground/60 tracking-wider">
                      Submitted
                    </span>
                    <span className="font-medium text-foreground/80">
                      {new Date(data.submittedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase font-semibold text-muted-foreground/60 tracking-wider">
                      Last Updated
                    </span>
                    <span className="font-medium text-foreground/80">
                      {new Date(data.updatedAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions Bar */}
              <div className="px-6 py-4 bg-muted/20 border-t border-border/80 flex items-center justify-between">
                <p className="text-[11px] text-muted-foreground">
                  Bookmark this link to check status anytime.
                </p>
                <button
                  type="button"
                  onClick={() => fetchStatus(true)}
                  disabled={refreshing}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
                  title="Check for status updates"
                >
                  <RotateCw
                    size={12}
                    className={refreshing ? "animate-spin text-primary" : ""}
                  />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer Brand */}
        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          Powered by <span className="font-semibold text-muted-foreground/80">Feedlyte</span>
        </p>
      </div>
    </div>
  );
}
