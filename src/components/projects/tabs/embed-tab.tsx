import type { Project } from "@/types";
import { Card } from "@/components/ui/card";
import { EmbedCode } from "@/components/projects/embed-code";
import { WidgetPreview } from "@/components/widget/widget-preview";

interface EmbedTabProps {
  project: Project;
}

export function EmbedTab({ project }: EmbedTabProps) {
  return (
    <div className="xl:max-w-4/5 2xl:max-w-3/5 space-y-4">
      <EmbedCode project={project} />
      <Card>
        <h3 className="text-[14px] font-bold text-foreground mb-2">
          Widget Preview
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          This is how your widget appears on external websites.
        </p>
        <WidgetPreview project={project} />
      </Card>
    </div>
  );
}