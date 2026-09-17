"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
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

interface BreadcrumbItem {
  label: string;
  href?: string;
}

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
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTab(tabFromUrl || "feedback");
  }, [searchParams]);

  const breadcrumbs: BreadcrumbItem[] = [];

  if (projectMatch) {
    const projName = project?.name || projectId;
    const tabLabel = TAB_LABELS[currentTab] || "Feedback";
    breadcrumbs.push(
      { label: "Projects", href: "/dashboard/projects" },
      { label: projName, href: `/dashboard/projects/${projectId}` },
      { label: tabLabel },
    );
  } else if (feedbackMatch) {
    breadcrumbs.push(
      { label: "Feedbacks", href: "/dashboard/feedback" },
      { label: feedbackId },
    );
  } else if (pathname.startsWith("/dashboard/settings")) {
    breadcrumbs.push(
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings" },
    );
  } else if (pathname.startsWith("/dashboard/profile")) {
    breadcrumbs.push(
      { label: "Dashboard", href: "/dashboard" },
      { label: "Profile" },
    );
  } else if (pathname.startsWith("/dashboard/projects")) {
    breadcrumbs.push(
      { label: "Dashboard", href: "/dashboard" },
      { label: "Projects" },
    );
  } else if (pathname.startsWith("/dashboard/feedback")) {
    breadcrumbs.push(
      { label: "Dashboard", href: "/dashboard" },
      { label: "Feedbacks" },
    );
  } else if (pathname.startsWith("/dashboard/metrics")) {
    breadcrumbs.push(
      { label: "Dashboard", href: "/dashboard" },
      { label: "Metrics" },
    );
  } else {
    breadcrumbs.push({ label: "Dashboard" });
  }

  return (
    <div className="hidden border-b border-sidebar-border h-18 px-9 py-6 md:flex items-center justify-between bg-sidebar shrink-0">
      <nav
        aria-label="Breadcrumbs"
        className="flex items-center gap-2 text-xl font-semibold truncate max-w-[70%]"
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <div key={index} className="flex items-center gap-2 truncate">
              {index > 0 && (
                <span className="text-muted-foreground/40 font-normal select-none">
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground transition-colors font-medium hover:underline underline-offset-4 truncate"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="text-foreground font-semibold truncate">
                  {item.label}
                </span>
              )}
            </div>
          );
        })}
      </nav>
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
