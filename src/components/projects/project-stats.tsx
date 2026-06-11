import { MessageSquare, Bell, Check, Eye, LayoutGrid } from "lucide-react";
import type { Feedback } from "@/types";
import StatCard from "@/components/ui/StatCard";
import { usePathname } from "next/navigation";

interface ProjectStatsProps {
  feedback: Feedback[];
  isLoading: boolean;
  projects?: string[];
}

export function ProjectStats({
  feedback,
  isLoading,
  projects,
}: ProjectStatsProps) {
  const location = usePathname();

  const isAllFeedbackPage = location === "/dashboard/feedback";

  const stats = [
    {
      label: "Total Feedback",
      value: feedback.length,
      Icon: MessageSquare,
    },
    ...(isAllFeedbackPage
      ? [
          {
            label: "Projects",
            value:
              projects?.length ??
              new Set(feedback.map((f) => f.projectId)).size,
            Icon: LayoutGrid,
          },
        ]
      : []),
    {
      label: "Unreviewed",
      value: feedback.filter((f) => f.status === "unreviewed").length,
      Icon: Bell,
    },
    {
      label: "Reviewed",
      value: feedback.filter((f) => f.status === "reviewed").length,
      Icon: Eye,
    },
    {
      label: "Resolved",
      value: feedback.filter((f) => f.status === "resolved").length,
      Icon: Check,
    },
  ];

  return (
    <div
      className={`grid grid-cols-2 gap-3 mb-6 ${isAllFeedbackPage ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}
    >
      {stats.map(({ label, value, Icon }) => (
        <StatCard
          key={label}
          label={label}
          value={value}
          icon={Icon}
          isLoading={isLoading}
        />
      ))}
    </div>
  );}
