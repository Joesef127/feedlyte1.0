"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  LayoutGrid, MessageSquare, CheckCircle,
  Eye, Plus, ArrowRight, TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import type { Status } from "@/types";
import { useDashboard } from "@/hooks/use-dashboard";
import StatCard from "../ui/StatCard";

// ── Helpers ───────────────────────────────────────────────────────────────────

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function timeAgo(iso: string): string {
  const diff  = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (days  > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (mins  > 0) return `${mins}m ago`;
  return "Just now";
}

function SectionHeader({ title, href, linkLabel = "View all" }: {
  title:      string;
  href:       string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
        {title}
      </h2>
      <Link
        href={href}
        className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {linkLabel}
        <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: session } = useSession();
  const { data, isLoading } = useDashboard();

  const firstName = session?.user?.name?.split(" ")[0] ?? "there";
  const unreviewed = data?.stats.unreviewed ?? 0;
  const projects   = data?.stats.totalProjects ?? 0;

  const summaryLine =
    unreviewed === 0
      ? "Everything is up to date."
      : `You have ${unreviewed} unreviewed feedback item${unreviewed !== 1 ? "s" : ""} across ${projects} project${projects !== 1 ? "s" : ""}.`;

  return (
    <div className="flex-1 px-9 py-8 overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-[-0.03em] mb-1">
            {greeting()}, {firstName}
          </h1>
          <p className="text-sm text-muted-foreground">{summaryLine}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/feedback">
            <Button variant="secondary" className="gap-1.5">
              <MessageSquare size={14} />
              All Feedback
            </Button>
          </Link>
          <Link href="/dashboard/projects">
            <Button className="gap-1.5">
              <Plus size={14} />
              New Project
            </Button>
          </Link>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Loading dashboard...
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
            <StatCard
              label="Projects"
              value={data?.stats.totalProjects ?? 0}
              icon={LayoutGrid}
            />
            <StatCard
              label="Total Feedback"
              value={data?.stats.totalFeedback ?? 0}
              icon={MessageSquare}
            />
            <StatCard
              label="Unreviewed"
              value={data?.stats.unreviewed ?? 0}
              icon={Eye}
              accent="text-amber-500"
            />
            <StatCard
              label="Reviewed"
              value={data?.stats.reviewed ?? 0}
              icon={Eye}
              accent="text-blue-500"
            />
            <StatCard
              label="Resolved"
              value={data?.stats.resolved ?? 0}
              icon={CheckCircle}
              accent="text-green-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 xl:gap-8">
            {/* Left column */}
            <div className="flex flex-col gap-6 xl:col-span-2">
              {/* Recent feedback */}
              <div className="flex flex-col gap-4">
                <SectionHeader title="Recent Feedback" href="/dashboard/feedback" />
                {!data?.recentFeedback.length ? (
                  <Card>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No feedback yet.
                    </p>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-3">
                    {data.recentFeedback.slice(0, 6).map((fb) => (
                      <Link
                        key={fb.id}
                        href={`/dashboard/feedback/${fb.id}`}
                        className="flex items-start gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-border/70 transition-colors group"
                      >
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ background: fb.project.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                            {fb.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground/50">
                              {fb.project.name}
                            </span>
                            <span className="text-xs text-muted-foreground/30">·</span>
                            <span className="text-xs text-muted-foreground/40">
                              {timeAgo(fb.createdAt)}
                            </span>
                          </div>
                        </div>
                        <StatusBadge status={fb.status as Status} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right column — recent projects */}
            <div className="flex flex-col gap-4">
              <SectionHeader
                title="Recent Projects"
                href="/dashboard/projects"
                linkLabel="All projects"
              />
              {!data?.recentProjects.length ? (
                <Card>
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No projects yet.
                  </p>
                  <div className="flex justify-center mt-3">
                    <Link href="/dashboard/projects">
                      <Button className="gap-1.5">
                        <Plus size={14} />
                        Create project
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <div className="flex flex-col gap-2">
                  {data.recentProjects.map((p) => (
                    <Link
                      key={p.id}
                      href={`/dashboard/projects/${p.id}`}
                      className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-border/70 transition-colors group"
                    >
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: p.color + "20" }}
                      >
                        <LayoutGrid size={14} style={{ color: p.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-muted-foreground/50">
                          {p.feedbackCount} feedback
                          {p.unreviewedCount > 0 && (
                            <span className="text-amber-500 ml-1.5 font-medium">
                              · {p.unreviewedCount} unreviewed
                            </span>
                          )}
                        </p>
                      </div>
                      <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                    </Link>
                  ))}
                </div>
              )}

              {/* Top projects */}
              <div>
                <SectionHeader
                  title="Top Projects (30 days)"
                  href="/dashboard/projects"
                  linkLabel="All projects"
                />
                {!data?.topProjects.length ? (
                  <Card>
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No projects yet.
                    </p>
                  </Card>
                ) : (
                  <div className="flex flex-col gap-2">
                    {data.topProjects.map((p, i) => (
                      <Link
                        key={p.id}
                        href={`/dashboard/projects/${p.id}`}
                        className="flex items-center gap-3 p-3.5 bg-card border border-border rounded-xl hover:border-border/70 transition-colors group"
                      >
                        <span className="text-xs font-bold text-muted-foreground/30 w-4 shrink-0">
                          {i + 1}
                        </span>
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: p.color + "20" }}
                        >
                          <TrendingUp size={14} style={{ color: p.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                            {p.name}
                          </p>
                          <p className="text-xs text-muted-foreground/50">
                            {p.totalFeedback} total · {p.last30Days} this month
                          </p>
                        </div>
                        <ArrowRight size={14} className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0" />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}