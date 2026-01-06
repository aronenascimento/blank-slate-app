import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow",
        outline: "text-foreground border-border",
        // Priority variants
        urgent: "border bg-priority-urgent/20 text-priority-urgent border-priority-urgent/30",
        problematic: "border bg-priority-problematic/20 text-priority-problematic border-priority-problematic/30",
        important: "border bg-priority-important/20 text-priority-important border-priority-important/30",
        standard: "border bg-priority-default/20 text-priority-default border-priority-default/30",
        // Status variants
        backlog: "border-transparent bg-status-backlog/20 text-status-backlog",
        todo: "border-transparent bg-status-todo/20 text-status-todo",
        blocked: "border-transparent bg-status-blocked/20 text-status-blocked",
        doing: "border-transparent bg-status-doing/20 text-status-doing",
        review: "border-transparent bg-status-review/20 text-status-review",
        done: "border-transparent bg-status-done/20 text-status-done",
        // Project color variants
        projectBlue: "border-transparent bg-project-blue/20 text-project-blue",
        projectPurple: "border-transparent bg-project-purple/20 text-project-purple",
        projectGreen: "border-transparent bg-project-green/20 text-project-green",
        projectOrange: "border-transparent bg-project-orange/20 text-project-orange",
        projectPink: "border-transparent bg-project-pink/20 text-project-pink",
        projectCyan: "border-transparent bg-project-cyan/20 text-project-cyan",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
