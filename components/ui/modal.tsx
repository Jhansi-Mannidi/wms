"use client"

import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const widths = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
} as const

export interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  /** Footer actions — usually Cancel + a primary button. */
  footer?: React.ReactNode
  size?: keyof typeof widths
  children: React.ReactNode
}

/**
 * Centered modal used for create/edit forms across the app.
 * Closes on backdrop click and Escape via the underlying Dialog primitive.
 */
export function Modal({
  open, onOpenChange, title, description, footer, size = "md", children,
}: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-[95] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
            "flex max-h-[calc(100vh-6rem)] flex-col rounded-2xl border border-border bg-card shadow-2xl",
            "transition-all duration-200 outline-none",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            widths[size],
          )}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-foreground">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

/** Right-hand slide-over used for read-only record detail views. */
export function Drawer({
  open, onOpenChange, title, description, footer, children,
}: Omit<ModalProps, "size">) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed right-0 top-0 z-[95] flex h-full w-[30rem] max-w-[calc(100vw-2rem)] flex-col",
            "border-l border-border bg-card shadow-2xl transition-transform duration-250 outline-none",
            "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 shrink-0">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold text-foreground">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="text-xs text-muted-foreground mt-0.5">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {footer && (
            <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3.5 shrink-0">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
