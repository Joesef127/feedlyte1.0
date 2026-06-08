import { ThemeToggle } from "@/components/ui/theme-toggle";

interface HeaderProps {
  pathname: string;
}

function getCrumb(pathname: string): string {
  if (pathname.match(/\/dashboard\/projects\/[^/]+/)) return "Projects / Project";
  if (pathname.match(/\/dashboard\/feedback\/[^/]+/)) return "Feedbacks / Feedback";
  if (pathname.startsWith("/dashboard/settings")) return "Settings";
  if (pathname.startsWith("/dashboard/profile")) return "Profile";
  if (pathname.startsWith("/dashboard/projects")) return "Projects";
  if (pathname.startsWith("/dashboard/feedback")) return "Feedbacks";
  if (pathname === "/dashboard") return "Dashboard";
  return "Dashboard";
}

export function Header({ pathname }: HeaderProps) {
  const crumb = getCrumb(pathname);

  return (
    <div className="hidden border-b border-sidebar-border h-18 px-9 py-6 md:flex items-center justify-between bg-sidebar shrink-0">
      <span className="text-xl text-foreground font-semibold">{crumb}</span>
      <div className="flex items-center gap-3">
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
