import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-blue-50 text-blue-700 border-blue-200 [a&]:hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
        secondary:
          "bg-gray-50 text-gray-700 border-gray-200 [a&]:hover:bg-gray-100 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
        destructive:
          "bg-red-50 text-red-700 border-red-200 [a&]:hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
        success:
          "bg-green-50 text-green-700 border-green-200 [a&]:hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
        warning:
          "bg-yellow-50 text-yellow-700 border-yellow-200 [a&]:hover:bg-yellow-100 dark:bg-yellow-950 dark:text-yellow-300 dark:border-yellow-800",
        info:
          "bg-cyan-50 text-cyan-700 border-cyan-200 [a&]:hover:bg-cyan-100 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800",
        outline:
          "text-foreground border-border [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span"

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
