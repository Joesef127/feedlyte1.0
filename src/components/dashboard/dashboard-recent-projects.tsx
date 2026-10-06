"use client";

import Link from "next/link";
import { ArrowRight, LayoutGrid, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";

interface RecentProjectItem {
  id: string;
  name: string;
  color: string;
  feedbackCount: number;
  unreviewedCount: number;
}

interface DashboardRecentProjectsProps {
  recentProjects: RecentProjectItem[];
  onNewProject: () => void;
}

export function DashboardRecentProjects({
  recentProjects,
  onNewProject,
}: DashboardRecentProjectsProps) {
  return (
    <div className="flex flex-col gap-6 xl:gap-8">
      {!recentProjects.length ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
              Recent Projects
            </h2>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              All projects
              <ArrowRight size={12} />
            </Link>
          </div>
          <Card className="p-2 sm:p-4">
            <EmptyState
              icon={<LayoutGrid size={22} />}
              title="No projects created yet"
              description="Create your first feedback project to generate a widget embed snippet."
              action={
                <Button onClick={onNewProject} className="gap-1.5" size="sm">
                  <Plus size={14} />
                  Create project
                </Button>
              }
            />
          </Card>
        </>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-widest">
              Recent Projects
            </h2>
            <Link
              href="/dashboard/projects"
              className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              All projects
              <ArrowRight size={12} />
            </Link>
          </div>
          {recentProjects.slice(0, 4).map((p) => (
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
                <p className="text-xs text-muted-foreground/60">
                  {p.feedbackCount} feedback
                  {p.unreviewedCount > 0 && (
                    <span className="text-amber-500 ml-1.5 font-medium">
                      · {p.unreviewedCount} unreviewed
                    </span>
                  )}
                </p>
              </div>
              <ArrowRight
                size={14}
                className="text-muted-foreground/30 group-hover:text-muted-foreground transition-colors shrink-0"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
