import {MessageSquare, Bell, Check, Eye} from "lucide-react";
import type {Feedback} from "@/types";
import StatCard from "@/components/ui/StatCard";

interface ProjectStatsProps {
    feedback: Feedback[];
    isLoading: boolean;
}

export function ProjectStats({feedback, isLoading}: ProjectStatsProps) {
    const stats = [
        {
            label: "Total Feedback",
            value: feedback.length,
            Icon: MessageSquare,
        },
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
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
            {stats.map(({label, value, Icon}) => (
                <StatCard
                    key={label}
                    label={label}
                    value={value}
                    icon={Icon}
                    isLoading={isLoading}
                />
            ))}
        </div>
    );
}