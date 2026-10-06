"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutGrid,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { Page } from "@/types";
import { ThemeToggle } from "../ui/theme-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: Page; label: string; Icon: React.FC<{ size?: number }>; }[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "feedback", label: "All Feedback", Icon: MessageSquare },
  { id: "metrics", label: "Metrics", Icon: BarChart3 },
  { id: "projects", label: "Projects", Icon: LayoutGrid },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "profile", label: "Profile", Icon: User },
];

const PAGE_ROUTES: Record<Page, string> = {
  dashboard: "/dashboard",
  projects: "/dashboard/projects",
  feedback: "/dashboard/feedback",
  metrics: "/dashboard/metrics",
  settings: "/dashboard/settings",
  profile: "/dashboard/profile",
};

export function Sidebar({
  page,
  onLogout,
}: SidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prevBreakpointRef = useRef<"mobile" | "tablet" | "desktop" | null>(null);

  useEffect(() => {
    const getBreakpoint = (width: number) => {
      if (width < 768) return "mobile";
      if (width < 1280) return "tablet";
      return "desktop";
    };

    const handleResize = () => {
      const width = window.innerWidth;
      const currentBreakpoint = getBreakpoint(width);
      setIsMobile(width < 768);

      if (currentBreakpoint !== prevBreakpointRef.current) {
        prevBreakpointRef.current = currentBreakpoint;
        if (currentBreakpoint === "tablet") {
          setIsDesktopCollapsed(true);
        } else if (currentBreakpoint === "desktop") {
          setIsDesktopCollapsed(false);
        } else if (currentBreakpoint === "mobile") {
          setIsDesktopCollapsed(false);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Icon-only collapsed mode strictly applies to tablet/desktop (md:) and never on mobile (< md)
  const isCollapsed = !isMobile && isDesktopCollapsed;

  const name =
    session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Account";

  const email = session?.user?.email ?? "";

  const navigate = (route: string) => {
    router.push(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <TooltipProvider delayDuration={50}>
      {/* Mobile Header */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-30 h-18 bg-background border-b border-sidebar-border flex items-center px-4"
      >
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
          aria-label="Toggle navigation"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="flex items-center justify-between w-full">
          <div onClick={() => navigate("/dashboard")} className="flex items-center gap-2 ml-3 cursor-pointer">
            <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center">
              <MessageSquare
                size={14}
                className="text-primary-foreground"
                strokeWidth={2}
              />
            </div>

            <span className="text-lg font-bold tracking-[-0.02em]">
              Feedlyte
            </span>
          </div>

          <ThemeToggle />
        </div>
      </div>

      {/* Backdrop */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 select-none",

          // Mobile drawer
          "fixed top-0 left-0 z-50 h-screen w-70",
          "transition-[transform,width] duration-300 ease-in-out",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",

          // Desktop override
          "md:translate-x-0 md:static md:flex md:h-screen md:relative md:z-30",
          isCollapsed ? "md:w-20" : "md:w-55"
        )}
      >
        {/* Logo & Header */}
        <div
          className={cn(
            "h-18 border-b border-sidebar-border shrink-0 flex items-center",
            isCollapsed ? "justify-between px-3" : "justify-between px-4"
          )}
        >
          <div
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 cursor-pointer select-none group min-w-0"
            title="Feedlyte"
          >
            <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center shrink-0 shadow-sm group-hover:opacity-90 transition-opacity">
              <MessageSquare
                size={14}
                className="text-primary-foreground"
                strokeWidth={2}
              />
            </div>

            {!isCollapsed && (
              <span className="text-xl font-bold text-foreground tracking-[-0.02em] truncate">
                Feedlyte
              </span>
            )}
          </div>

          {/* Desktop collapse toggle button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsDesktopCollapsed((prev) => !prev)}
                className="hidden md:flex items-center justify-center w-7 h-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer shrink-0"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={10}>
              {isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 flex flex-col gap-1">
          {!isCollapsed ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-1 mb-1 text-muted-foreground/50">
              Navigation
            </p>
          ) : (
            <div className="w-6 h-px bg-sidebar-border mx-auto my-1.5" />
          )}

          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const isActive = page === id;

            const buttonElement = (
              <button
                key={id}
                onClick={() => navigate(PAGE_ROUTES[id])}
                className={cn(
                  "relative flex items-center rounded-lg border-none cursor-pointer transition-all duration-150 text-left",
                  isCollapsed
                    ? cn(
                        "w-10 h-10 mx-auto justify-center",
                        isActive
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/60"
                      )
                    : cn(
                        "w-full gap-2.5 px-2.5 py-2.5 text-sm font-medium",
                        isActive
                          ? "bg-secondary text-foreground font-semibold"
                          : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-accent/40"
                      )
                )}
                aria-label={label}
              >
                <Icon size={isCollapsed ? 17 : 15} />
                {!isCollapsed && <span className="truncate">{label}</span>}
              </button>
            );

            if (!isCollapsed) {
              return buttonElement;
            }

            return (
              <Tooltip key={id}>
                <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="flex items-center gap-2 bg-popover text-popover-foreground border border-border shadow-xl px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap z-50"
                >
                  <span>{label}</span>
                  {isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  )}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-sidebar-border flex flex-col gap-1.5">
          {!isCollapsed ? (
            <>
              <button
                onClick={() => navigate("/dashboard/profile")}
                className="w-full px-2.5 py-2 text-left hover:bg-accent rounded-lg transition-colors cursor-pointer"
              >
                <p className="text-sm font-semibold text-foreground truncate">
                  {name}
                </p>

                <p className="text-sm text-muted-foreground mt-0.5 truncate">
                  {email}
                </p>
              </button>

              <button
                onClick={onLogout}
                className="w-full flex items-center gap-2.5 px-2.5 py-2.5 mb-1 rounded-lg border-none bg-transparent text-muted-foreground text-sm font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </>
          ) : (
            <>
              {/* Collapsed profile avatar */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => navigate("/dashboard/profile")}
                    className="w-10 h-10 mx-auto flex items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                    aria-label="Profile"
                  >
                    {name[0]}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="flex flex-col gap-0.5 bg-popover text-popover-foreground border border-border shadow-xl px-3 py-2 rounded-lg text-xs font-medium z-50"
                >
                  <span className="font-semibold text-foreground">{name}</span>
                  {email && (
                    <span className="text-[11px] text-muted-foreground">
                      {email}
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>

              {/* Collapsed sign out icon */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={onLogout}
                    className="w-10 h-10 mx-auto flex items-center justify-center rounded-lg border-none bg-transparent text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
                    aria-label="Sign Out"
                  >
                    <LogOut size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  sideOffset={12}
                  className="bg-popover text-destructive border border-border shadow-xl px-3 py-1.5 rounded-lg text-xs font-semibold z-50"
                >
                  Sign Out
                </TooltipContent>
              </Tooltip>
            </>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}