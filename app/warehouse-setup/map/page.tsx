"use client"
import { cn } from "@/lib/utils"

const layout = [
  { row: 0, cells: ["DOCK","DOCK","DOCK","DOCK","DOCK","DOCK"] },
  { row: 1, cells: ["ENTRY","AISLE","ZONE-A","ZONE-A","AISLE","OFFICE"] },
  { row: 2, cells: ["GRN","AISLE","ZONE-A","ZONE-A","AISLE","ZONE-B"] },
  { row: 3, cells: ["PUTAWAY","AISLE","ZONE-A","ZONE-A","AISLE","ZONE-B"] },
  { row: 4, cells: ["AISLE","AISLE","AISLE","AISLE","AISLE","AISLE"] },
  { row: 5, cells: ["ZONE-C","ZONE-C","COLD-A","COLD-B","FREEZER","HAZMAT"] },
  { row: 6, cells: ["ZONE-C","ZONE-C","AISLE","AISLE","AISLE","DISPATCH"] },
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

export default function WarehouseMapPage() {
  return (
    <div className="p-6 space-y-5">
      <div><h1 className="text-2xl font-bold text-foreground">Warehouse Map</h1><p className="text-sm text-muted-foreground mt-1">Schematic layout of all zones, aisles and functional areas</p></div>
      <div className="bg-card border border-border rounded-xl p-6 overflow-auto">
        <div className="grid gap-1.5" style={{gridTemplateColumns:`repeat(6, minmax(100px, 1fr))`}}>
          {layout.flatMap(row =>
            row.cells.map((cell, ci) => (
              <div key={`${row.row}-${ci}`} className={cn("h-16 rounded-lg border text-xs font-semibold flex items-center justify-center text-center p-1", cellStyle[cell] ?? "bg-muted text-muted-foreground")}>
                {cell.replace(/-/g," ")}
              </div>
            ))
          )}
        </div>
        <div className="flex flex-wrap gap-3 mt-5 text-xs">
          {[["ZONE-A","bg-brand/15 text-brand"],["ZONE-B","bg-success/15 text-success"],["ZONE-C","bg-amber-50 text-amber-700"],["Cold","bg-blue-100 text-blue-700"],["Freezer","bg-sky-100 text-sky-700"],["Hazmat","bg-danger/10 text-danger"],["Operations","bg-brand/10 text-brand"]].map(([l,c])=>(
            <span key={l} className={cn("px-2 py-1 rounded font-medium",c)}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
