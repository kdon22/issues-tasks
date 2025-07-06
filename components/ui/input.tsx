import * as React from "react"

import { cn } from "@/lib/utils"

interface InputProps extends React.ComponentProps<"input"> {
  noBorder?: boolean;
  placeholderWeight?: 'light' | 'normal' | 'medium' | 'semibold';
}

function Input({ className, type, noBorder, placeholderWeight = 'normal', ...props }: InputProps) {
  const placeholderWeightClasses = {
    light: 'placeholder:text-muted-foreground/60',
    normal: 'placeholder:text-muted-foreground',
    medium: 'placeholder:text-muted-foreground/90 placeholder:font-medium',
    semibold: 'placeholder:text-foreground/70 placeholder:font-semibold'
  };

  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 flex h-9 w-full min-w-0 rounded-md bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        // Border styles - conditionally applied
        !noBorder && "border border-input focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        noBorder && "border-none shadow-none focus-visible:ring-0",
        // Placeholder weight
        placeholderWeightClasses[placeholderWeight],
        className
      )}
      {...props}
    />
  )
}

export { Input }
