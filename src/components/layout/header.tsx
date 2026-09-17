"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useProject } from "@/hooks/use-projects";

interface HeaderProps {
  pathname: string;
}

const TAB_LABELS: Record<string, string> = {
  feedback: "Feedback",
  analytics: "Analytics",
  integrations: "Integrations",
  embed: "Embed Code",
  settings: "Widget Settings",
};

export function Header({ pathname }: HeaderProps) {
  const searchParams = useSearchParams();
  const projectMatch = pathname.match(/\/dashboard\/projects\/([^/]+)/);
  const feedbackMatch = pathname.match(/\/dashboard\/feedback\/([^/]+)/);
  const projectId = projectMatch ? projectMatch[1] : "";
  const feedbackId = feedbackMatch ? feedbackMatch[1] : "";

  const { data: project } = useProject(projectId);
  const [currentTab, setCurrentTab] = useState<string>(
    () => searchParams.get("tab") || "feedback",
  );

  useEffect(() => {
    const onTabChange = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) setCurrentTab(customEvent.detail);
    };
    window.addEventListener("feedlyte:tabchange", onTabChange);
    return () => window.removeEventListener("feedlyte:tabchange", onTabChange);
  }, []);

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl) setCurrentTab(tabFromUrl);
  }, [searchParams]);

  let crumb = "Dashboard";
  if (projectMatch) {
    const projName = project?.name || projectId;
    const tabLabel = TAB_LABELS[currentTab] || "Feedback";
    crumb = `Projects / ${projName} / ${tabLabel}`;
  } else if (feedbackMatch) {
    crumb = `Feedbacks / ${feedbackId}`;
  } else if (pathname.startsWith("/dashboard/settings")) {
    crumb = "Settings";
  } else if (pathname.startsWith("/dashboard/profile")) {
    crumb = "Profile";
  } else if (pathname.startsWith("/dashboard/projects")) {
    crumb = "Projects";
  } else if (pathname.startsWith("/dashboard/feedback")) {
    crumb = "Feedbacks";
  } else if (pathname.startsWith("/dashboard/metrics")) {
    crumb = "Metrics";
  }

  return (
    <div className="hidden border-b border-sidebar-border h-18 px-9 py-6 md:flex items-center justify-between bg-sidebar shrink-0">
      <span className="text-xl text-foreground font-semibold truncate max-w-[70%]">
        {crumb}
      </span>
      <div className="flex items-center gap-3 shrink-0">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-sm text-foreground">
            All systems operational
          </span>
        </div>
      </div>
    </div>
  );
}
