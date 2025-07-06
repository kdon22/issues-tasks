"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  noBorder?: boolean;
  placeholderWeight?: 'light' | 'normal' | 'medium' | 'semibold';
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, noBorder, placeholderWeight = 'normal', ...props }, ref) => {
    const placeholderWeightClasses = {
      light: 'placeholder:text-muted-foreground/60',
      normal: 'placeholder:text-muted-foreground',
      medium: 'placeholder:text-muted-foreground/90 placeholder:font-medium',
      semibold: 'placeholder:text-foreground/70 placeholder:font-semibold'
    };

    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
          // Border styles - conditionally applied
          !noBorder && "border border-input focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          noBorder && "border-none ring-offset-0 focus-visible:ring-0",
          // Placeholder weight
          placeholderWeightClasses[placeholderWeight],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea }; 