import type { Page, Project } from "@/types";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  page: Page;
  project: Project | null;
}

export function Header({ page, project }: HeaderProps) {
  const crumb = project
    ? `Projects / ${project.name}`
    : page.charAt(0).toUpperCase() + page.slice(1);

  return (
    <div className="border-b border-sidebar-border h-13 px-9 flex items-center justify-between bg-sidebar shrink-0">
      <span className="text-base text-muted-foreground font-medium">
        {crumb}
      </span>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-1.75 h-1.75 rounded-full bg-success" />
          <span className="text-[12px] text-[#d3d0d0]">All systems operational</span>
        </div>
      </div>
    </div>
  );
}
