import type { ProjectDetailTab } from "@/types";

const TABS: { id: ProjectDetailTab; label: string }[] = [
  { id: "feedback", label: "Feedback" },
  { id: "embed",    label: "Embed Code" },
  { id: "settings", label: "Widget Settings" },
];

interface ProjectTabsProps {
  active:   ProjectDetailTab;
  onChange: (tab: ProjectDetailTab) => void;
}

export function ProjectTabs({ active, onChange }: ProjectTabsProps) {
  return (
    <div className="flex gap-0.5 mb-5 border-b border-sidebar-border">
      {TABS.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onChange(id)}
          className={[
            "px-4 py-2.5 border-none bg-transparent text-base font-semibold cursor-pointer transition-all",
            "border-b-2 -mb-px",
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