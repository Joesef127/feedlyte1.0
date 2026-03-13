"use client";

import { LayoutGrid, MessageSquare, Settings, LogOut } from "lucide-react";
import type { Page } from "@/types";
import { MOCK_USER } from "@/data/mock";

interface SidebarProps {
  page: Page;
  setPage: (page: Page) => void;
  onLogout: () => void;
}

const NAV_ITEMS: { id: Page; label: string; Icon: React.FC<{ size?: number }> }[] = [
  { id: "projects", label: "Projects", Icon: LayoutGrid },
  { id: "feedback", label: "All Feedback", Icon: MessageSquare },
  { id: "settings", label: "Settings", Icon: Settings },
];

export function Sidebar({ page, setPage, onLogout }: SidebarProps) {
  return (
    <div className="w-[220px] bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-primary rounded-[7px] flex items-center justify-center shrink-0">
            <MessageSquare size={14} className="text-primary-foreground" strokeWidth={2} />
          </div>
          <span className="text-base font-bold text-foreground tracking-[-0.02em]">
            FeedStack
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2">
        <p className="text-[10px] font-semibold text-[#3d3d3d] uppercase tracking-[0.08em] px-2 py-1 mb-1">
          Navigation
        </p>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPage(id)}
            className={[
              "w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg border-none",
              "text-[13px] font-medium cursor-pointer transition-all duration-150 mb-0.5 text-left",
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

      {/* User + Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <div className="px-2.5 py-2.5 rounded-lg bg-card mb-2">
          <p className="text-[12px] font-semibold text-foreground m-0">
            {MOCK_USER.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5 m-0">
            {MOCK_USER.email}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2.5 px-2.5 py-[9px] rounded-lg border-none bg-transparent text-muted-foreground text-[13px] font-medium cursor-pointer hover:text-foreground transition-colors"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
