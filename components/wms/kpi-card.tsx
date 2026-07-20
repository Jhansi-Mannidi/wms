"use client"

import { cn } from "@/lib/utils"
import { TrendingUp, TrendingDown } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface KpiCardProps {
  label: string
  value: string | number
  sub?: string
  icon?: LucideIcon
  iconColor?: string
  trend?: { value: string; up: boolean }
  variant?: "default" | "warning" | "danger" | "success" | "violet"
  onClick?: () => void
  active?: boolean
  className?: string
}

const variantStyles: Record<string, string> = {
  default:  "border-border hover:border-brand/40",
  warning:  "border-warning/30 hover:border-warning/60",
  danger:   "border-danger/30 hover:border-danger/60",
  success:  "border-success/30 hover:border-success/60",
  violet:   "border-violet/30 hover:border-violet/60",
}

const iconBg: Record<string, string> = {
  default:  "bg-brand/10 text-brand",
  warning:  "bg-warning/10 text-warning",
  danger:   "bg-danger/10 text-danger",
  success:  "bg-success/10 text-success",
  violet:   "bg-violet/10 text-violet",
}

export function KpiCard({ label, value, sub, icon: Icon, trend, variant = "default", onClick, active, className }: KpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative bg-card rounded-lg border px-4 py-3.5 flex flex-col gap-1.5 transition-all duration-150",
        variantStyles[variant],
        onClick && "cursor-pointer",
        active && "ring-1 ring-brand border-brand/50 bg-brand/5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider leading-tight">{label}</p>
        {Icon && (
          <div className={cn("w-7 h-7 rounded-md flex items-center justify-center shrink-0", iconBg[variant])}>
            <Icon className="w-3.5 h-3.5" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground leading-none tracking-tight">{value}</p>
      {(sub || trend) && (
        <div className="flex items-center gap-2">
          {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
          {trend && (
            <span className={cn("flex items-center gap-0.5 text-[11px] font-medium", trend.up ? "text-success" : "text-danger")}>
              {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
