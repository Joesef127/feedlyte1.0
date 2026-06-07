"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useSession } from "next-auth/react";
import type { Page } from "@/types";
import { ThemeToggle } from "../ui/theme-toggle";

interface SidebarProps {
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

const NAV_ITEMS: {
  id: Page;
  label: string;
  Icon: React.FC<{ size?: number }>;
}[] = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { id: "feedback", label: "All Feedback", Icon: MessageSquare },
  { id: "projects", label: "Projects", Icon: LayoutGrid },
  { id: "settings", label: "Settings", Icon: Settings },
  { id: "profile", label: "Profile", Icon: User },
];

const PAGE_ROUTES: Record<Page, string> = {
  dashboard: "/dashboard",
  projects: "/dashboard/projects",
  feedback: "/dashboard/feedback",
  settings: "/dashboard/settings",
  profile: "/dashboard/profile",
};

export function Sidebar({ page, onLogout }: SidebarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const name =
    session?.user?.name ?? session?.user?.email?.split("@")[0] ?? "Account";

  const email = session?.user?.email ?? "";

  const navigate = (route: string) => {
    router.push(route);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 h-18 bg-background border-b border-sidebar-border flex items-center px-4">
        <button
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          className="p-2 rounded-lg hover:bg-accent transition-colors"
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 ml-3">
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
      <div
        className={[
          "bg-sidebar border-r border-sidebar-border flex flex-col",

          // Mobile drawer
          "fixed top-0 left-0 z-50 h-screen w-70",
          "transition-transform duration-300",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",

          // Desktop override
          "md:translate-x-0 md:static md:flex md:w-55 md:h-screen md:shrink-0",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="px-4 py-5 h-18 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center shrink-0">
              <MessageSquare
                size={14}
                className="text-primary-foreground"
                strokeWidth={2}
              />
            </div>

            <span className="text-xl font-bold text-foreground tracking-[-0.02em]">
              Feedlyte
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] px-2 py-1 mb-1 text-muted-foreground/50">
            Navigation
          </p>

          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => {
                navigate(PAGE_ROUTES[id])
                console.log(PAGE_ROUTES[id])
              }}
              className={[
                "w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-lg border-none",
                "text-sm font-medium cursor-pointer transition-all duration-150 mb-0.5 text-left",
                page === id
                  ? "bg-secondary text-foreground"
                  : "bg-transparent text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-2 border-t border-sidebar-border">
          <button
            onClick={() => navigate("/dashboard/profile")}
            className="w-full px-2.5 py-2 mb-2 text-left hover:bg-accent rounded-lg transition-colors"
          >
            <p className="text-sm font-semibold text-foreground truncate">
              {name}
            </p>

            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {email}
            </p>
          </button>

          <button
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-2.5 py-2.5 mb-3 rounded-lg border-none bg-transparent text-muted-foreground text-sm font-medium cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>
    </>
  );
}
