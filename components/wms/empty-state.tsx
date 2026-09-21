"use client"

import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description?: string
  action?: { label: string; onClick: () => void; icon?: LucideIcon }
  className?: string
}

/** Centred icon + message + optional CTA — the standard "nothing here" pattern for builders and tables. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const ActionIcon = action?.icon
  return (
    <div className={cn("flex flex-col items-center justify-center text-center py-14 px-6", className)}>
      <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description && <p className="text-xs text-muted-foreground mt-1 max-w-sm">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors"
        >
          {ActionIcon && <ActionIcon className="w-3.5 h-3.5" />}
          {action.label}
        </button>
      )}
    </div>
  )
}
