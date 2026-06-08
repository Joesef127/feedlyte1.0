import { Card } from "@/components/ui/card";
import React from "react";

export default function StatCard({
  label,
  value,
  icon: Icon,
  isLoading,
}: {
  label: string;
  value: string | number;
  icon: React.FC<{ size?: number; className?: string }>;
  isLoading?: boolean;
}) {
  return (
    <Card className="w-full justify-between">
      <div className="flex items-center justify-between gap-2.5">
        <span className="text-xs sm:text-sm text-muted-foreground uppercase tracking-widest font-semibold">
          {label}
        </span>
        <Icon className=" size-4 sm:size-5 text-foreground/80" />
      </div>
      <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
        {isLoading ? "0" : value}
      </span>
    </Card>
  );
}
