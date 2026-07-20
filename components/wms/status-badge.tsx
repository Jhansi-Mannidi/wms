import { cn } from "@/lib/utils"

type StatusVariant =
  | "active" | "inactive" | "pending" | "warning" | "danger" | "success"
  | "draft" | "in-transit" | "completed" | "cancelled" | "overdue"
  | "new" | "allocated" | "picking" | "packed" | "dispatched"
  | "received" | "consolidated" | "loaded" | "delivered"
  | "open" | "closed" | "expired" | "renewal"

const variantMap: Record<string, string> = {
  active:       "bg-success/15 text-success border-success/20",
  inactive:     "bg-muted text-muted-foreground border-border",
  pending:      "bg-violet/15 text-violet border-violet/20",
  warning:      "bg-warning/15 text-warning border-warning/20",
  danger:       "bg-danger/15 text-danger border-danger/20",
  success:      "bg-success/15 text-success border-success/20",
  draft:        "bg-muted text-muted-foreground border-border",
  "in-transit": "bg-brand/15 text-brand border-brand/20",
  completed:    "bg-success/15 text-success border-success/20",
  cancelled:    "bg-danger/15 text-danger border-danger/20",
  overdue:      "bg-danger/15 text-danger border-danger/20",
  new:          "bg-brand/15 text-brand border-brand/20",
  allocated:    "bg-violet/15 text-violet border-violet/20",
  picking:      "bg-warning/15 text-warning border-warning/20",
  packed:       "bg-navy/20 text-foreground border-navy/30",
  dispatched:   "bg-success/15 text-success border-success/20",
  received:     "bg-success/15 text-success border-success/20",
  consolidated: "bg-brand/15 text-brand border-brand/20",
  loaded:       "bg-navy/20 text-foreground border-navy/30",
  delivered:    "bg-success/15 text-success border-success/20",
  open:         "bg-brand/15 text-brand border-brand/20",
  closed:       "bg-muted text-muted-foreground border-border",
  expired:      "bg-danger/15 text-danger border-danger/20",
  renewal:      "bg-warning/15 text-warning border-warning/20",
}

interface StatusBadgeProps {
  status: StatusVariant | string
  label?: string
  dot?: boolean
  className?: string
}

export function StatusBadge({ status, label, dot = false, className }: StatusBadgeProps) {
  const styles = variantMap[status] ?? variantMap["inactive"]
  const display = label ?? (status.charAt(0).toUpperCase() + status.slice(1).replace(/-/g, " "))
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border",
      styles, className
    )}>
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />}
      {display}
    </span>
  )
}
