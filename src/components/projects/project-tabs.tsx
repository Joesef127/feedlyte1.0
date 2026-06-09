import type { ProjectDetailTab } from "@/types";

const TABS: { id: ProjectDetailTab; label: string }[] = [
  { id: "feedback",  label: "Feedback"       },
  { id: "analytics", label: "Analytics"      },
  { id: "embed",     label: "Embed Code"     },
  { id: "settings",  label: "Widget Settings" },
];

interface ProjectTabsProps {
  active:   ProjectDetailTab;
  onChange: (tab: ProjectDetailTab) => void;
}

export function ProjectTabs({ active, onChange }: ProjectTabsProps) {
  return (
    <div className="flex gap-4 sm:gap-6 mb-5 border-b border-sidebar-border overflow-x-scroll overflow-y-hidden no-scrollbar">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            "py-2.5 border-none bg-transparent text-sm sm:text-base font-semibold cursor-pointer transition-all",
            "border-b-2 -mb-px text-nowrap",
            active === id
              ? "text-primary border-primary"
              : "text-muted-foreground border-transparent",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}