"use client";

import React from "react";

interface EmptyStateProps {
  icon:        React.ReactNode;
  title:       string;
  description: string;
  action?:     React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-6">
      <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-5 text-muted-foreground/40">
        {icon}
      </div>
      <h3 className="text-base font-bold text-foreground mb-2 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground max-w-[320px] leading-relaxed mb-6">
        {description}
      </p>
      {action && action}
    </div>
  );
}