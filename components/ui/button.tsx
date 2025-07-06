import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        primary:
          "shadow-xs [&:not([data-color])]:bg-black [&:not([data-color])]:text-white [&:not([data-color])]:hover:bg-gray-800 [&:not([data-color])]:disabled:bg-gray-400 [&:not([data-color])]:disabled:text-white [&:not([data-color])]:disabled:opacity-100 [&[data-color='blue']]:bg-blue-600 [&[data-color='blue']]:text-white [&[data-color='blue']]:hover:bg-blue-700 [&[data-color='blue']]:disabled:bg-blue-300 [&[data-color='green']]:bg-green-600 [&[data-color='green']]:text-white [&[data-color='green']]:hover:bg-green-700 [&[data-color='green']]:disabled:bg-green-300 [&[data-color='red']]:bg-red-600 [&[data-color='red']]:text-white [&[data-color='red']]:hover:bg-red-700 [&[data-color='red']]:disabled:bg-red-300 [&[data-invalid='true']:not([data-invalid-color])]:bg-gray-400 [&[data-invalid='true']:not([data-invalid-color])]:text-white [&[data-pending='true']:not([data-pending-color])]:bg-gray-400 [&[data-pending='true']:not([data-pending-color])]:text-white [&[data-invalid='true'][data-invalid-color='blue']]:bg-blue-300 [&[data-invalid='true'][data-invalid-color='blue']]:text-white [&[data-invalid='true'][data-invalid-color='green']]:bg-green-300 [&[data-invalid='true'][data-invalid-color='green']]:text-white [&[data-invalid='true'][data-invalid-color='red']]:bg-red-300 [&[data-invalid='true'][data-invalid-color='red']]:text-white [&[data-invalid='true'][data-invalid-color='black']]:bg-gray-600 [&[data-invalid='true'][data-invalid-color='black']]:text-white [&[data-pending='true'][data-pending-color='blue']]:bg-blue-300 [&[data-pending='true'][data-pending-color='blue']]:text-white [&[data-pending='true'][data-pending-color='green']]:bg-green-300 [&[data-pending='true'][data-pending-color='green']]:text-white [&[data-pending='true'][data-pending-color='red']]:bg-red-300 [&[data-pending='true'][data-pending-color='red']]:text-white [&[data-pending='true'][data-pending-color='black']]:bg-gray-600 [&[data-pending='true'][data-pending-color='black']]:text-white",
        destructive:
          "bg-destructive text-white shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        subtle: "bg-muted/50 text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        property: "border-dashed border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100",
        "property-filled": "border-gray-200 bg-white text-gray-900 hover:bg-gray-50",
        "property-active": "bg-orange-100 border-orange-200 text-orange-700 hover:bg-orange-200",
      },
      size: {
        xs: "h-6 px-2 py-1 text-xs gap-1 rounded-sm has-[>svg]:px-1.5",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-sm",
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        xl: "h-12 rounded-lg px-8 text-base has-[>svg]:px-6",
        compact: "h-7 px-2.5 py-1 text-xs gap-1.5 rounded-md has-[>svg]:px-2",
        icon: "size-9",
        "icon-sm": "size-7",
        "icon-xs": "size-6",
      },
      radius: {
        none: "rounded-none",
        sm: "rounded-sm", 
        md: "rounded-md",
        lg: "rounded-lg",
        xl: "rounded-xl",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      radius: "md",
    },
  }
)

function Button({
  className,
  variant,
  size,
  radius,
  asChild = false,
  color,
  isInvalid,
  isPending,
  isValid,
  invalidColor,
  pendingColor,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
    color?: 'blue' | 'green' | 'red' | 'black' | string
    isInvalid?: boolean
    isPending?: boolean
    isValid?: boolean
    invalidColor?: 'blue' | 'green' | 'red' | 'black' | string
    pendingColor?: 'blue' | 'green' | 'red' | 'black' | string
  }) {
  const Comp = asChild ? Slot : "button"

  // Smart state handling for primary buttons
  const dataAttrs = variant === 'primary' ? {
    'data-color': color,
    'data-invalid': isInvalid || (!isValid && isValid !== undefined) ? 'true' : undefined,
    'data-pending': isPending ? 'true' : undefined,
    'data-invalid-color': invalidColor,
    'data-pending-color': pendingColor,
  } : {}

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, radius, className }))}
      {...dataAttrs}
      {...props}
    />
  )
}

export { Button, buttonVariants }
