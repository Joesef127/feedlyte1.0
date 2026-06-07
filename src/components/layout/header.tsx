import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  pathname: string;
}

function getCrumb(pathname: string): string {
  if (pathname.startsWith("/dashboard/feedback"))  return "All Feedback";
  if (pathname.startsWith("/dashboard/settings"))  return "Settings";
  if (pathname.startsWith("/dashboard/profile"))   return "Profile";
  if (pathname.match(/\/dashboard\/projects\/[^/]+/)) return "Projects / Project";
  return "Projects";
}

export function Header({ pathname }: HeaderProps) {
  const crumb = getCrumb(pathname);

  return (
    <div className="border-b border-sidebar-border h-13 px-9 py-5 flex items-center justify-between bg-sidebar shrink-0">
      <span className="text-xl text-muted-foreground font-medium">
        {crumb}
      </span>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-[12px] text-[#d3d0d0]">All systems operational</span>
        </div>
      </div>
    </div>
  );
}