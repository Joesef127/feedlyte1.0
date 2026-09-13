"use client";

import { use, useEffect, useState } from "react";
import { CheckCircle2, Clock, Eye, XCircle } from "lucide-react";

interface TrackingStatus {
  status: "unreviewed" | "reviewed" | "resolved";
  category: string | null;
  submittedAt: string;
  updatedAt: string;
}

const STATUS_META: Record<TrackingStatus["status"], { label: string; Icon: typeof Clock; color: string }> = {
  unreviewed: { label: "Submitted — awaiting review", Icon: Clock, color: "#F59E0B" },
  reviewed: { label: "Reviewed by the team", Icon: Eye, color: "#3B82F6" },
  resolved: { label: "Resolved", Icon: CheckCircle2, color: "#10B981" },
};

export default function TrackFeedbackPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const [data, setData] = useState<TrackingStatus | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/feedback/track/${encodeURIComponent(token)}`)
      .then(async (res) => {
        const body = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(body.error ?? "Unable to load this tracking link.");
          return;
        }
        setData(body);
      })
      .catch(() => {
        if (!cancelled) setError("Network error. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-xl p-6 text-center">
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : error ? (
          <>
            <XCircle size={28} className="mx-auto mb-3 text-destructive" />
            <p className="text-foreground text-sm font-semibold mb-1">{error}</p>
            <p className="text-muted-foreground text-sm">
              This link may have expired or already been used incorrectly.
            </p>
          </>
        ) : data ? (
          <>
            {(() => {
              const meta = STATUS_META[data.status] ?? STATUS_META.unreviewed;
              const Icon = meta.Icon;
              return (
                <>
                  <Icon size={28} className="mx-auto mb-3" style={{ color: meta.color }} />
                  <p className="text-foreground text-sm font-semibold mb-1">{meta.label}</p>
                </>
              );
            })()}
            {data.category && (
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-3">
                {data.category}
              </p>
            )}
            <p className="text-muted-foreground text-xs mt-3">
              Submitted {new Date(data.submittedAt).toLocaleDateString()}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
}
