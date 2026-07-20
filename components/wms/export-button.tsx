"use client"

import { useState, useRef, useEffect } from "react"
import { Download, FileText, Braces, Check } from "lucide-react"
import { exportCSV, exportJSON, fileTimestamp } from "@/lib/export"
import { cn } from "@/lib/utils"

type Row = Record<string, unknown>

interface ExportButtonProps {
  data: Row[]
  filename?: string
  label?: string
  className?: string
  disabled?: boolean
}

export function ExportButton({
  data,
  filename = "wms-export",
  label = "Export",
  className,
  disabled = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false)
  const [exported, setExported] = useState<"csv" | "json" | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const handleExport = (type: "csv" | "json") => {
    const ts = fileTimestamp()
    const name = `${filename}_${ts}`
    if (type === "csv") exportCSV(data, name)
    else exportJSON(data, name)
    setExported(type)
    setOpen(false)
    setTimeout(() => setExported(null), 2000)
  }

  return (
    <div ref={ref} className="relative">
      <button
        disabled={disabled || data.length === 0}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
          exported && "border-success/60 text-success",
          className
        )}
      >
        {exported ? (
          <Check className="w-4 h-4 text-success" />
        ) : (
          <Download className="w-4 h-4" />
        )}
        {exported ? "Exported!" : label}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 z-50 w-44 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Export as
            </p>
          </div>
          <button
            onClick={() => handleExport("csv")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <FileText className="w-4 h-4 text-success shrink-0" />
            <div className="text-left">
              <p className="font-medium leading-none">CSV</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Spreadsheet compatible</p>
            </div>
          </button>
          <button
            onClick={() => handleExport("json")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
          >
            <Braces className="w-4 h-4 text-brand shrink-0" />
            <div className="text-left">
              <p className="font-medium leading-none">JSON</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">For API / integrations</p>
            </div>
          </button>
          <div className="px-3 py-1.5 border-t border-border bg-muted/30">
            <p className="text-[10px] text-muted-foreground">{data.length} row{data.length !== 1 ? "s" : ""} will be exported</p>
          </div>
        </div>
      )}
    </div>
  )
}
