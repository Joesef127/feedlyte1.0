import { MessageSquare, Bell, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Feedback } from "@/types";

interface ProjectStatsProps {
  feedback: Feedback[];
  isLoading: boolean;
}

export function ProjectStats({ feedback, isLoading }: ProjectStatsProps) {
  const stats = [
    {
      label: "Total Feedback",
      value: feedback.length,
      Icon:  MessageSquare,
    },
    {
      label: "Unreviewed",
      value: feedback.filter((f) => f.status === "new").length,
      Icon:  Bell,
    },
    {
      label: "Resolved",
      value: feedback.filter((f) => f.status === "resolved").length,
      Icon:  Check,
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map(({ label, value, Icon }) => (
        <Card key={label}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-base text-muted-foreground font-medium">
              {label}
            </span>
            <Icon size={14} className="text-[#d3d0d0]" />
          </div>
          <span className="text-[26px] font-bold text-foreground tracking-[-0.04em]">
            {isLoading ? "—" : value}
          </span>
        </Card>
      ))}
    </div>
  );
}