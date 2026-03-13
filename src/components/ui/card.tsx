import * as React from "react";
import { cn } from "@/lib/utils";

function Card({
  className,
  onClick,
  ...props
}: React.ComponentProps<"div"> & { onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card border border-border rounded-xl p-5",
        onClick && "cursor-pointer hover:border-border/80 transition-colors",
        className
      )}
      {...props}
    />
  );
}

export { Card };
