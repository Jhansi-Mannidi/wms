"use client"

import { Menu } from "@base-ui/react/menu"
import { MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"

export type RowAction = {
  label: string
  icon?: React.ReactNode
  onSelect: () => void
  /** `danger` for destructive entries — rendered red and pushed below a divider. */
  tone?: "default" | "danger" | "success"
  disabled?: boolean
}

/**
 * Collapses a row's action icons behind a single "…" trigger.
 * Keeps dense tables clean — the icons only appear once the menu is opened.
 */
export function RowActions({
  items,
  label = "Row actions",
  align = "end",
}: {
  items: RowAction[]
  label?: string
  align?: "start" | "end"
}) {
  const visible = items.filter(Boolean)
  if (visible.length === 0) return null

  const danger = visible.filter((i) => i.tone === "danger")
  const normal = visible.filter((i) => i.tone !== "danger")

  const renderItem = (item: RowAction, key: number) => (
    <Menu.Item
      key={key}
      disabled={item.disabled}
      onClick={item.onSelect}
      className={cn(
        "flex cursor-pointer select-none items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors",
        "data-[highlighted]:bg-muted data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        item.tone === "danger"
          ? "text-danger data-[highlighted]:bg-danger/10"
          : item.tone === "success"
          ? "text-success data-[highlighted]:bg-success/10"
          : "text-foreground",
      )}
    >
      {item.icon && <span className="shrink-0 [&_svg]:h-3.5 [&_svg]:w-3.5">{item.icon}</span>}
      <span className="truncate">{item.label}</span>
    </Menu.Item>
  )

  return (
    <Menu.Root>
      <Menu.Trigger
        type="button"
        aria-label={label}
        title={label}
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors",
          "hover:bg-muted hover:text-foreground data-[popup-open]:bg-muted data-[popup-open]:text-foreground",
        )}
      >
        <MoreHorizontal className="h-4 w-4" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align={align} sideOffset={6} className="z-[220]">
          <Menu.Popup
            className={cn(
              "min-w-[11rem] rounded-xl border border-border bg-popover p-1 shadow-xl outline-none",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-150",
              "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
              "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
            )}
          >
            {normal.map(renderItem)}
            {danger.length > 0 && normal.length > 0 && (
              <div className="my-1 h-px bg-border" />
            )}
            {danger.map((item, i) => renderItem(item, normal.length + i))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  )
}
