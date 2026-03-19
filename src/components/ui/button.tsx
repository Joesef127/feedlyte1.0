"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg text-sm sm:text-base font-semibold transition-all duration-150 disabled:pointer-events-none disabled:opacity-50 cursor-pointer tracking-[0.02em] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary:
          "bg-transparent text-secondary-foreground border border-border hover:bg-secondary/50",
        ghost:
          "bg-transparent text-muted-foreground border-none hover:text-foreground",
        danger:
          "bg-transparent text-destructive border border-destructive/20 hover:bg-destructive/10",
      },
      size: {
        default: "h-9 px-[18px] py-[9px]",
        sm: "h-8 px-3 py-[6px] text-[12px]",
        icon: "size-9",
      },
      fullWidth: {
        true: "w-full justify-center",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

function Button({
  className,
  variant,
  size,
  fullWidth,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, fullWidth, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
