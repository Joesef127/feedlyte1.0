"use client";

import { Globe, MessageSquare } from "lucide-react";
import type { Project } from "@/types";
import { Card } from "@/components/ui/card";

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  return (
    <Card
      onClick={onClick}
      className="transition-[border-color] hover:border-border/60"
    >
      <div className="flex justify-between items-start mb-4">
        <div
          className="w-9 h-9 rounded-[9px] flex items-center justify-center"
          style={{ background: project.color + "20" }}
        >
          <Globe size={18} style={{ color: project.color }} />
        </div>
        {project.newCount > 0 && (
          <span className="bg-primary text-primary-foreground text-[11px] font-bold px-[7px] py-[2px] rounded-full">
            {project.newCount} new
          </span>
        )}
      </div>
      <h3 className="text-[15px] font-bold text-foreground tracking-[-0.02em] mb-1">
        {project.name}
      </h3>
      <p className="text-[12px] text-muted-foreground font-mono mb-4">
        {project.id}
      </p>
      <div className="flex justify-between items-center">
        <span className="text-[12px] text-muted-foreground">
          {project.feedbackCount} responses
        </span>
        <span className="text-[11px] text-[#3d3d3d]">
          Since {project.createdAt}
        </span>
      </div>
    </Card>
  );
}
