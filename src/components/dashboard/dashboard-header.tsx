"use client";

import Link from "next/link";
import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  userName?: string | null;
  unreviewedCount: number;
  projectsCount: number;
  timeframe?: "7d" | "30d" | "90d";
  onNewProject: () => void;
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function DashboardHeader({
  userName,
  unreviewedCount,
  projectsCount,
  timeframe,
  onNewProject,
}: DashboardHeaderProps) {
  const firstName = userName?.split(" ")[0] ?? "there";

  const tfLabel = timeframe
    ? `in the last ${timeframe === "7d" ? "7 days" : timeframe === "90d" ? "90 days" : "30 days"}`
    : "";

  const summaryLine =
    unreviewedCount === 0
      ? `Everything is up to date${tfLabel ? ` ${tfLabel}` : ""}.`
      : `You have ${unreviewedCount} unreviewed feedback item${
          unreviewedCount !== 1 ? "s" : ""
        } across ${projectsCount} project${projectsCount !== 1 ? "s" : ""}${
          tfLabel ? ` ${tfLabel}` : ""
        }.`;

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-[-0.03em] mb-1">
          {getGreeting()}, {firstName}
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
        <Button onClick={onNewProject} className="gap-1.5">
          <Plus size={14} />
          New Project
        </Button>
      </div>
    </div>
  );
}
