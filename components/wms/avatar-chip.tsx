import { cn } from "@/lib/utils"

interface AvatarChipProps {
  name: string
  sub?: string
  size?: "xs" | "sm" | "md"
  color?: string
  className?: string
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase()
}

const colors = [
  "bg-brand/20 text-brand",
  "bg-navy/30 text-foreground",
  "bg-success/20 text-success",
  "bg-violet/20 text-violet",
  "bg-warning/20 text-warning",
]

function colorFor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % colors.length
  return colors[h]
}

export function AvatarChip({ name, sub, size = "sm", className }: AvatarChipProps) {
  const szRing = size === "xs" ? "w-5 h-5 text-[9px]" : size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
  const szText = size === "xs" ? "text-[11px]" : size === "sm" ? "text-xs" : "text-sm"
  return (
    <div className={cn("flex items-center gap-1.5 min-w-0", className)}>
      <div className={cn("rounded-full flex items-center justify-center font-bold shrink-0", szRing, colorFor(name))}>
        {initials(name)}
      </div>
      <div className="min-w-0">
        <p className={cn("font-medium text-foreground truncate leading-tight", szText)}>{name}</p>
        {sub && <p className="text-[10px] text-muted-foreground truncate leading-tight">{sub}</p>}
      </div>
    </div>
  )
}
