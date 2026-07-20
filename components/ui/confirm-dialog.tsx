"use client"

import { AlertDialog } from "@base-ui/react/alert-dialog"
import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  /** `danger` for destructive actions (delete, write-off, cancel order). */
  tone?: "danger" | "brand"
  onConfirm: () => void
}

/** Blocking confirmation used before any destructive or irreversible action. */
export function ConfirmDialog({
  open, onOpenChange, title, message,
  confirmLabel = "Confirm", cancelLabel = "Cancel",
  tone = "danger", onConfirm,
}: ConfirmDialogProps) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Backdrop
          className={cn(
            "fixed inset-0 z-[90] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200",
            "data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
          )}
        />
        <AlertDialog.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-[95] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2",
            "rounded-2xl border border-border bg-card p-5 shadow-2xl outline-none",
            "transition-all duration-200",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
          )}
        >
          <div className="flex gap-3.5">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                tone === "danger" ? "bg-danger/10 text-danger" : "bg-brand/10 text-brand",
              )}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <AlertDialog.Title className="text-base font-bold text-foreground">
                {title}
              </AlertDialog.Title>
              <AlertDialog.Description className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {message}
              </AlertDialog.Description>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-end gap-2">
            <AlertDialog.Close className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              {cancelLabel}
            </AlertDialog.Close>
            <button
              onClick={() => { onConfirm(); onOpenChange(false) }}
              className={cn(
                "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors",
                tone === "danger" ? "bg-danger hover:bg-danger/90" : "bg-brand hover:bg-brand/90",
              )}
            >
              {confirmLabel}
            </button>
          </div>
        </AlertDialog.Popup>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )
}
