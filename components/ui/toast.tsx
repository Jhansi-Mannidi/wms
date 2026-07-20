"use client"

import { Toast } from "@base-ui/react/toast"
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * Global toast manager — importable from anywhere (including non-component code)
 * so any handler can fire feedback without threading a hook through props.
 */
export const toastManager = Toast.createToastManager()

type ToastKind = "success" | "error" | "warning" | "info"

/** Fire a toast from any click handler: `notify.success("Saved", "Item SKU-1 created")` */
export const notify = {
  success: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "success" }),
  error: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "error" }),
  warning: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "warning" }),
  info: (title: string, description?: string) =>
    toastManager.add({ title, description, type: "info" }),
}

const kindIcon: Record<ToastKind, React.ReactNode> = {
  success: <CheckCircle2 className="w-4 h-4 text-success" />,
  error: <XCircle className="w-4 h-4 text-danger" />,
  warning: <AlertTriangle className="w-4 h-4 text-warning" />,
  info: <Info className="w-4 h-4 text-brand" />,
}

const kindAccent: Record<ToastKind, string> = {
  success: "border-l-success",
  error: "border-l-danger",
  warning: "border-l-warning",
  info: "border-l-brand",
}

function ToastList() {
  const { toasts } = Toast.useToastManager()

  return toasts.map((t) => {
    const kind = (t.type as ToastKind) ?? "info"
    return (
      <Toast.Root
        key={t.id}
        toast={t}
        className={cn(
          "absolute right-0 bottom-0 left-auto z-50 w-[22rem] max-w-[calc(100vw-2rem)]",
          "flex items-start gap-3 rounded-xl border border-border border-l-4 bg-card p-3.5 shadow-lg",
          "transition-all duration-300 select-none",
          "data-[starting-style]:translate-x-full data-[starting-style]:opacity-0",
          "data-[ending-style]:translate-x-full data-[ending-style]:opacity-0",
          kindAccent[kind],
        )}
        style={{
          transform: "translateY(calc(var(--toast-index) * -0.6rem)) scale(calc(1 - (var(--toast-index) * 0.04)))",
          zIndex: "calc(100 - var(--toast-index))",
        }}
      >
        <span className="shrink-0 mt-0.5">{kindIcon[kind]}</span>
        <div className="min-w-0 flex-1">
          <Toast.Title className="text-sm font-semibold text-foreground leading-snug" />
          <Toast.Description className="text-xs text-muted-foreground leading-relaxed mt-0.5" />
        </div>
        <Toast.Close
          aria-label="Dismiss"
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </Toast.Close>
      </Toast.Root>
    )
  })
}

/** Mounted once in the root layout. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className="fixed right-4 bottom-14 z-[100] w-[22rem] max-w-[calc(100vw-2rem)]">
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  )
}
