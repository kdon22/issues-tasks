"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"
import { X } from "lucide-react"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "full"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
  size?: ModalSize
  className?: string
  showCloseButton?: boolean
  closeOnOverlayClick?: boolean
  preventScroll?: boolean
  onReset?: () => void
  // Add option to disable auto title for accessibility
  hideAutoTitle?: boolean
}

interface ModalHeaderProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  showCloseButton?: boolean
  onClose?: () => void
}

interface ModalBodyProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  scrollable?: boolean
}

interface ModalFooterProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
  justify?: "start" | "center" | "end" | "between"
}

const sizeClasses: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md", 
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  full: "max-w-[95vw] w-[95vw]"
}

function Modal({
  open,
  onOpenChange,
  children,
  size = "md",
  className,
  showCloseButton = false,
  closeOnOverlayClick = true,
  preventScroll = true,
  onReset,
  hideAutoTitle = false,
  ...props
}: ModalProps) {
  React.useEffect(() => {
    if (preventScroll && open) {
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = "unset"
      }
    }
  }, [open, preventScroll])

  // Call onReset when modal closes
  const prevOpenRef = React.useRef(false)
  const onResetRef = React.useRef(onReset)
  
  React.useEffect(() => {
    onResetRef.current = onReset
  }, [onReset])
  
  React.useEffect(() => {
    if (prevOpenRef.current && !open && onResetRef.current) {
      onResetRef.current()
    }
    prevOpenRef.current = open
  }, [open])

  return (
    <DialogPrimitive.Root 
      open={open} 
      onOpenChange={closeOnOverlayClick ? onOpenChange : undefined}
      {...props}
    >
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-0 border bg-background p-0 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 rounded-lg overflow-hidden",
            // Apply size classes directly
            sizeClasses[size],
            // Height control
            size === "full" ? "h-[95vh]" : "max-h-[90vh]",
            // Flex layout
            "flex flex-col",
            className
          )}
        >
          {/* Automatically include a hidden title for accessibility */}
          {!hideAutoTitle && (
            <VisuallyHidden.Root asChild>
              <DialogPrimitive.Title>Dialog</DialogPrimitive.Title>
            </VisuallyHidden.Root>
          )}
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

function ModalHeader({
  children,
  className,
  noPadding = false,
  showCloseButton = true,
  onClose,
  ...props
}: ModalHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-row items-center justify-between border-b border-border flex-shrink-0",
        noPadding ? "p-0" : "px-6 py-4",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-3 flex-1">
        {children}
      </div>
      {showCloseButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      )}
    </div>
  )
}

function ModalBody({
  children,
  className,
  noPadding = false,
  scrollable = true,
  ...props
}: ModalBodyProps) {
  return (
    <div
      className={cn(
        "flex-1 min-h-0", // min-h-0 is important for flex children to shrink
        scrollable && "overflow-y-auto",
        noPadding ? "p-0" : "p-6 pb-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ModalFooter({
  children,
  className,
  noPadding = false,
  justify = "end",
  ...props
}: ModalFooterProps) {
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center", 
    end: "justify-end",
    between: "justify-between"
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border flex-shrink-0",
        justifyClasses[justify],
        noPadding ? "p-0" : "px-6 py-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function ModalTitle({
  children,
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      className={cn("text-lg font-semibold", className)}
      {...props}
    >
      {children}
    </DialogPrimitive.Title>
  )
}

// Convenience compound component pattern
Modal.Header = ModalHeader
Modal.Body = ModalBody
Modal.Footer = ModalFooter
Modal.Title = ModalTitle

export { Modal, ModalHeader, ModalBody, ModalFooter, ModalTitle } 