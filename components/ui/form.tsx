"use client"

import { isValidElement } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

const inputBase =
  "w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground " +
  "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow"

export function Field({
  label, required, error, hint, children,
}: {
  label: string
  required?: boolean
  error?: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="min-w-0">
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-danger">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-danger">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function TextInput({
  className, invalid, ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      {...props}
      className={cn(inputBase, invalid && "border-danger focus:ring-danger/30", className)}
    />
  )
}

export function TextArea({
  className, invalid, ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) {
  return (
    <textarea
      {...props}
      className={cn(inputBase, "resize-y min-h-[72px]", invalid && "border-danger focus:ring-danger/30", className)}
    />
  )
}

export function Select({
  options, placeholder, className, invalid, ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: readonly string[]
  placeholder?: string
  invalid?: boolean
}) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(inputBase, "appearance-none pr-9", invalid && "border-danger focus:ring-danger/30", className)}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
}

/** Cancel / submit pair used in every modal footer. */
export function ModalActions({
  onCancel, onSubmit, submitLabel = "Save", cancelLabel = "Cancel", tone = "brand", disabled,
}: {
  onCancel: () => void
  onSubmit: () => void
  submitLabel?: string
  cancelLabel?: string
  tone?: "brand" | "danger"
  disabled?: boolean
}) {
  return (
    <>
      <button
        onClick={onCancel}
        className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        {cancelLabel}
      </button>
      <button
        onClick={onSubmit}
        disabled={disabled}
        className={cn(
          "rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:pointer-events-none",
          tone === "danger" ? "bg-danger hover:bg-danger/90" : "bg-brand hover:bg-brand/90",
        )}
      >
        {submitLabel}
      </button>
    </>
  )
}

/** Values the seed data uses to mean "nothing recorded yet". */
const EMPTY_TOKENS = new Set(["", "-", "—", "–", "N/A", "n/a", "null", "undefined"])

function isEmptyValue(v: React.ReactNode): boolean {
  if (v === null || v === undefined || v === false) return true
  if (typeof v === "string") return EMPTY_TOKENS.has(v.trim())
  if (typeof v === "number") return false
  // Pages often wrap a placeholder dash in markup (e.g. <span className="...">—</span>),
  // so unwrap single-child elements to catch those too.
  if (isValidElement(v)) {
    const child = (v.props as { children?: React.ReactNode })?.children
    if (child !== undefined) return isEmptyValue(child as React.ReactNode)
  }
  return false
}

/**
 * Label/value row used inside detail drawers.
 * Renders a placeholder for empty values so records don't read as broken.
 */
export function DetailRow({
  label, value, mono, icon,
}: {
  label: string
  value: React.ReactNode
  /** Render the value in a tabular monospace face — good for IDs, codes, refs. */
  mono?: boolean
  icon?: React.ReactNode
}) {
  const empty = isEmptyValue(value)
  return (
    <div className="group grid grid-cols-[minmax(6rem,0.8fr)_minmax(0,1.2fr)] items-baseline gap-4 border-b border-border/50 px-2.5 py-2.5 transition-colors last:border-0 hover:bg-muted/40">
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon && <span className="text-muted-foreground/70 shrink-0">{icon}</span>}
        <span className="truncate">{label}</span>
      </span>
      <span
        className={cn(
          "min-w-0 break-words text-right text-sm",
          empty
            ? "italic text-muted-foreground/60"
            : "font-semibold text-foreground",
          mono && !empty && "font-mono text-[13px] tracking-tight",
        )}
      >
        {empty ? "Not recorded" : value}
      </span>
    </div>
  )
}

/**
 * Groups DetailRows under a heading inside a drawer.
 * Optional — bare DetailRows still work unchanged.
 */
export function DetailSection({
  title, children, className,
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cn("min-w-0", className)}>
      {title && (
        <h3 className="mb-1 px-2.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-xl border border-border bg-background/40 px-1.5 py-1">
        {children}
      </div>
    </section>
  )
}

/** Prominent stat tiles for the top of a detail drawer. */
export function DetailStats({
  items,
}: {
  items: { label: string; value: React.ReactNode; tone?: "default" | "success" | "warning" | "danger" | "brand" }[]
}) {
  const tones = {
    default: "text-foreground",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
    brand: "text-brand",
  }
  return (
    <div className={cn("grid gap-2", items.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
      {items.map((s, i) => (
        <div key={i} className="rounded-xl border border-border bg-background/40 px-3 py-2.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">{s.label}</p>
          <p className={cn("mt-0.5 text-lg font-bold leading-tight", tones[s.tone ?? "default"])}>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
