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

/** Matches record identifiers like CC-2024-081, TO-2024-0501, ASN-2024-0188. */
function isRecordCode(title: string) {
  return /^[A-Z]{2,6}[-/][A-Z0-9]+([-/][A-Z0-9]+)*$/i.test(title.trim())
}

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
            "fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[closed]:hidden data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-[210] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2",
            "flex max-h-[calc(100vh-6rem)] flex-col rounded-2xl border border-border bg-card shadow-2xl",
            "transition-all duration-200 outline-none",
            "data-[closed]:hidden data-[open]:opacity-100 data-[open]:scale-100",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            widths[size],
          )}
        >
          {/* Header */}
          <div className="relative flex shrink-0 items-start justify-between gap-4 border-b border-border bg-gradient-to-br from-brand/[0.06] via-transparent to-transparent px-5 pb-4 pt-4">
            <span className="absolute inset-x-0 top-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-brand via-brand/40 to-transparent" />
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold tracking-tight text-foreground">{title}</Dialog.Title>
              {description && (
                <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3.5">
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
  open, onOpenChange, title, description, footer, children, eyebrow, badge, icon,
}: Omit<ModalProps, "size"> & {
  /** Small label above the title — e.g. the module or record class. */
  eyebrow?: string
  /** Status pill rendered in the header. */
  badge?: React.ReactNode
  icon?: React.ReactNode
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={cn(
            "fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[closed]:hidden data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          )}
        />
        <Dialog.Popup
          className={cn(
            "fixed right-0 top-0 z-[210] flex h-full w-[32rem] max-w-[calc(100vw-2rem)] flex-col",
            "border-l border-border bg-card shadow-2xl outline-none",
            "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
            "data-[closed]:hidden data-[open]:translate-x-0",
            "data-[starting-style]:translate-x-full data-[ending-style]:translate-x-full",
          )}
        >
          {/* Header — a defined surface so the record identity reads as a title, not a row */}
          <div className="shrink-0 border-b border-border bg-muted/40 px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-stretch gap-3">
                {icon ? (
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15 text-brand">
                    {icon}
                  </span>
                ) : (
                  <span aria-hidden className="w-1 shrink-0 rounded-full bg-brand" />
                )}
                <div className="min-w-0 py-0.5">
                  {eyebrow && (
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-brand">{eyebrow}</p>
                  )}
                  <Dialog.Title
                    className={cn(
                      "truncate text-lg font-bold leading-tight text-foreground",
                      // Record IDs (CC-2024-081, TO-2024-0501…) read better as code.
                      isRecordCode(title) ? "font-mono tracking-tight" : "tracking-tight",
                    )}
                  >
                    {title}
                  </Dialog.Title>
                  {description && (
                    <Dialog.Description className="mt-0.5 text-xs text-muted-foreground">
                      {description}
                    </Dialog.Description>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {badge}
                <Dialog.Close
                  aria-label="Close"
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted-foreground/15 hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Dialog.Close>
              </div>
            </div>
          </div>

          {/*
            Pages wrap their DetailRows in `<div className="space-y-1">`. Styling that
            child here gives every existing detail view the grouped-card treatment
            without touching 100+ call sites.
          */}
          <div
            className={cn(
              "flex-1 space-y-4 overflow-y-auto px-4 py-4",
              "[&>.space-y-1]:space-y-0 [&>.space-y-1]:overflow-hidden [&>.space-y-1]:rounded-xl",
              "[&>.space-y-1]:border [&>.space-y-1]:border-border [&>.space-y-1]:bg-background/40",
              "[&>.space-y-1]:px-1.5 [&>.space-y-1]:py-1",
            )}
          >
            {children}
          </div>

          {footer && (
            <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3.5 backdrop-blur-sm">
              {footer}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
