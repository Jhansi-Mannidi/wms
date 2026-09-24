"use client"
import { useState } from "react"
import { RotateCcw, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type LayoutRow = { row: number; cells: string[] }

const initialLayout: LayoutRow[] = [
  { row: 0, cells: ["DOCK","DOCK","DOCK","DOCK","DOCK","DOCK"] },
  { row: 1, cells: ["ENTRY","AISLE","ZONE-A","ZONE-A","AISLE","OFFICE"] },
  { row: 2, cells: ["GRN","AISLE","ZONE-A","ZONE-A","AISLE","ZONE-B"] },
  { row: 3, cells: ["PUTAWAY","AISLE","ZONE-A","ZONE-A","AISLE","ZONE-B"] },
  { row: 4, cells: ["AISLE","AISLE","AISLE","AISLE","AISLE","AISLE"] },
  { row: 5, cells: ["ZONE-C","ZONE-C","COLD-A","COLD-B","FREEZER","HAZMAT"] },
  { row: 6, cells: ["ZONE-C","ZONE-C","AISLE","AISLE","AISLE","DISPATCH"] },
  { row: 7, cells: ["ZONE-B","ZONE-B","AISLE","GRN","PUTAWAY","DISPATCH"] },
  { row: 8, cells: ["AISLE","AISLE","AISLE","AISLE","AISLE","AISLE"] },
  { row: 9, cells: ["ZONE-A","ZONE-A","ZONE-B","ZONE-B","ZONE-C","ZONE-C"] },
  { row: 10, cells: ["ZONE-A","AISLE","ZONE-B","AISLE","ZONE-C","OFFICE"] },
  { row: 11, cells: ["COLD-A","COLD-B","FREEZER","AISLE","HAZMAT","HAZMAT"] },
  { row: 12, cells: ["AISLE","AISLE","AISLE","AISLE","AISLE","AISLE"] },
  { row: 13, cells: ["DOCK","DOCK","DISPATCH","DISPATCH","ENTRY","OFFICE"] },
]
const cellStyle: Record<string, string> = {
  "DOCK":"bg-muted text-muted-foreground","AISLE":"bg-background text-muted-foreground border-dashed",
  "ZONE-A":"bg-brand/15 text-brand","ZONE-B":"bg-success/15 text-success",
  "ZONE-C":"bg-amber-50 text-amber-700","COLD-A":"bg-blue-100 text-blue-700",
  "COLD-B":"bg-blue-100 text-blue-700","FREEZER":"bg-sky-100 text-sky-700",
  "HAZMAT":"bg-danger/10 text-danger","ENTRY":"bg-muted text-muted-foreground",
  "GRN":"bg-brand/10 text-brand","PUTAWAY":"bg-brand/10 text-brand",
  "OFFICE":"bg-muted text-muted-foreground","DISPATCH":"bg-success/20 text-success",
}

const CELL_TYPES = Object.keys(cellStyle)

// Which cell types each legend chip highlights.
const LEGEND: { label: string; className: string; matches: string[] }[] = [
  { label: "ZONE-A", className: "bg-brand/15 text-brand", matches: ["ZONE-A"] },
  { label: "ZONE-B", className: "bg-success/15 text-success", matches: ["ZONE-B"] },
  { label: "ZONE-C", className: "bg-amber-50 text-amber-700", matches: ["ZONE-C"] },
  { label: "Cold", className: "bg-blue-100 text-blue-700", matches: ["COLD-A", "COLD-B"] },
  { label: "Freezer", className: "bg-sky-100 text-sky-700", matches: ["FREEZER"] },
  { label: "Hazmat", className: "bg-danger/10 text-danger", matches: ["HAZMAT"] },
  { label: "Operations", className: "bg-brand/10 text-brand", matches: ["GRN", "PUTAWAY", "DOCK", "ENTRY", "OFFICE", "DISPATCH"] },
]

type CellRef = { row: number; col: number; type: string }

export default function WarehouseMapPage() {
  const [layout, setLayout] = useState<LayoutRow[]>(initialLayout)
  const [highlight, setHighlight] = useState<string | null>(null)
  const [selected, setSelected] = useState<CellRef | null>(null)
  const [draftType, setDraftType] = useState("")
  const [resetOpen, setResetOpen] = useState(false)

  const highlightMatches = highlight ? (LEGEND.find((l) => l.label === highlight)?.matches ?? []) : []

  const counts = layout.flatMap((r) => r.cells).reduce<Record<string, number>>((acc, c) => {
    acc[c] = (acc[c] ?? 0) + 1
    return acc
  }, {})

  function openCell(row: number, col: number, type: string) {
    setSelected({ row, col, type })
    setDraftType(type)
  }

  function saveCell() {
    if (!selected) return
    if (draftType === selected.type) { setSelected(null); return }
    setLayout((prev) => prev.map((r) => r.row === selected.row
      ? { ...r, cells: r.cells.map((c, i) => (i === selected.col ? draftType : c)) }
      : r))
    notify.success("Layout updated", `Cell R${selected.row + 1}C${selected.col + 1} changed from ${selected.type.replace(/-/g, " ")} to ${draftType.replace(/-/g, " ")}.`)
    setSelected(null)
  }

  function resetLayout() {
    setLayout(initialLayout)
    setHighlight(null)
    notify.info("Layout reset", "The schematic has been restored to the saved floor plan.")
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Warehouse Map</h1><p className="text-sm text-muted-foreground mt-1">Schematic layout of all zones, aisles and functional areas</p></div>
        <div className="flex items-center gap-2">
          {highlight && (
            <button onClick={() => setHighlight(null)} title="Clear the legend highlight" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-brand bg-card text-sm text-brand transition-colors">
              <Filter className="w-4 h-4" /> Clear Highlight
            </button>
          )}
          <button onClick={() => setResetOpen(true)} title="Reset the layout to the saved floor plan" className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            <RotateCcw className="w-4 h-4" /> Reset Layout
          </button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl p-6 overflow-auto">
        <div className="grid gap-1.5" style={{gridTemplateColumns:`repeat(6, minmax(100px, 1fr))`}}>
          {layout.flatMap(row =>
            row.cells.map((cell, ci) => {
              const dimmed = highlight !== null && !highlightMatches.includes(cell)
              return (
                <button
                  key={`${row.row}-${ci}`}
                  onClick={() => openCell(row.row, ci, cell)}
                  title={`${cell.replace(/-/g, " ")} — R${row.row + 1}C${ci + 1}. Click to reassign.`}
                  className={cn(
                    "h-16 rounded-lg border text-xs font-semibold flex items-center justify-center text-center p-1 transition-all hover:ring-2 hover:ring-brand/40",
                    cellStyle[cell] ?? "bg-muted text-muted-foreground",
                    dimmed && "opacity-25",
                  )}
                >
                  {cell.replace(/-/g," ")}
                </button>
              )
            })
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-5 text-xs">
          {LEGEND.map((l)=>(
            <button
              key={l.label}
              onClick={() => setHighlight(highlight === l.label ? null : l.label)}
              title={`Highlight ${l.label} areas`}
              className={cn(
                "px-2 py-1 rounded font-medium transition-all",
                l.className,
                highlight === l.label ? "ring-2 ring-brand" : "hover:ring-1 hover:ring-brand/40",
              )}
            >
              {l.label}
              <span className="ml-1.5 opacity-70">
                {l.matches.reduce((s, m) => s + (counts[m] ?? 0), 0)}
              </span>
            </button>
          ))}
        </div>
        {highlight && (
          <p className="mt-3 text-xs text-muted-foreground">
            Highlighting {highlightMatches.reduce((s, m) => s + (counts[m] ?? 0), 0)} {highlight} cell(s) of {layout.flatMap((r) => r.cells).length} total.
          </p>
        )}
      </div>

      {/* Cell reassignment */}
      <Modal
        open={!!selected}
        onOpenChange={(o) => !o && setSelected(null)}
        title={selected ? `Cell R${selected.row + 1}C${selected.col + 1}` : ""}
        description="Inspect or reassign this floor plan cell"
        size="sm"
        footer={<ModalActions onCancel={() => setSelected(null)} onSubmit={saveCell} submitLabel="Apply Change" />}
      >
        {selected && (
          <div className="space-y-4">
            <div className="space-y-1">
              <DetailRow label="Grid Position" value={`Row ${selected.row + 1}, Column ${selected.col + 1}`} />
              <DetailRow label="Current Area" value={selected.type.replace(/-/g, " ")} />
              <DetailRow label="Cells of This Type" value={counts[selected.type] ?? 0} />
            </div>
            <Field label="Reassign To" required hint="Changing an area updates the schematic and the legend counts.">
              <Select value={draftType} onChange={(e) => setDraftType(e.target.value)} options={CELL_TYPES} />
            </Field>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset the warehouse layout?"
        message="All cell reassignments made in this session will be discarded and the original floor plan restored."
        confirmLabel="Reset Layout"
        cancelLabel="Keep Changes"
        onConfirm={resetLayout}
      />
    </div>
  )
}
