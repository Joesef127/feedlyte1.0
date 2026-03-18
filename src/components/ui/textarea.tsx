import * as React from "react";
import { cn } from "@/lib/utils";

function Textarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex w-full rounded-lg border border-[#2a2a2a] bg-input px-3 py-2",
        "text-sm text-foreground placeholder:text-[#d3d0d0]",
        "outline-none transition-colors focus:border-primary",
        "disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
