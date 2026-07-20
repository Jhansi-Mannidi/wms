"use client"

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

/** Label/value row used inside detail drawers. */
export function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border py-2.5 last:border-0">
      <span className="text-xs text-muted-foreground shrink-0">{label}</span>
      <span className="text-sm text-foreground text-right min-w-0 break-words">{value}</span>
    </div>
  )
}
