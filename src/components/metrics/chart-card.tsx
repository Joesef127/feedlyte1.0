"use client";

import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  action,
}: ChartCardProps) {
  return (
    <Card className="flex flex-col p-5 sm:p-6 w-full h-full bg-card border-border">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {action}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </Card>
  );
}
