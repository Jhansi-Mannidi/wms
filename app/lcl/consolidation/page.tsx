"use client"

import { useState } from "react"
import { Plus, AlertTriangle, CheckCircle2, Package, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

const receiptPool = [
  { id: "CR-0891", shipper: "Apex Pharma", shipperInit: "AP", shipperColor: "bg-blue-500", cbm: 2.4, pieces: 18, kg: 960, pod: "CNSHA", dwell: 4 },
  { id: "CR-0892", shipper: "GlobalTex", shipperInit: "GT", shipperColor: "bg-amber-500", cbm: 5.6, pieces: 40, kg: 2800, pod: "CNSHA", dwell: 2 },
  { id: "CR-0894", shipper: "AutoParts India", shipperInit: "AI", shipperColor: "bg-cyan-500", cbm: 8.3, pieces: 62, kg: 4150, pod: "SGSIN", dwell: 1 },
  { id: "CR-0895", shipper: "MediSupply", shipperInit: "MS", shipperColor: "bg-rose-500", cbm: 1.8, pieces: 12, kg: 540, pod: "AEDXB", dwell: 5, hazmat: true },
  { id: "CR-0896", shipper: "FreshFarm", shipperInit: "FF", shipperColor: "bg-orange-500", cbm: 3.2, pieces: 24, kg: 1600, pod: "CNSHA", dwell: 3 },
  { id: "CR-0897", shipper: "Sunrise Elec.", shipperInit: "SE", shipperColor: "bg-emerald-500", cbm: 4.1, pieces: 30, kg: 2050, pod: "CNSHA", dwell: 2 },
]

const CBM_MAX = 25
const KG_MAX = 18000

export default function ConsolidationPlannerPage() {
  const [poolItems, setPoolItems] = useState(receiptPool)
  const [consolidated, setConsolidated] = useState<typeof receiptPool>([])
  const [cutoff, setCutoff] = useState("2025-07-28")

  const addToConsolidation = (item: typeof receiptPool[0]) => {
    setPoolItems(p => p.filter(r => r.id !== item.id))
    setConsolidated(c => [...c, item])
  }

  const removeFromConsolidation = (item: typeof receiptPool[0]) => {
    setConsolidated(c => c.filter(r => r.id !== item.id))
    setPoolItems(p => [...p, item])
  }

  const totalCbm = consolidated.reduce((s, r) => s + r.cbm, 0)
  const totalKg = consolidated.reduce((s, r) => s + r.kg, 0)
  const cbmPct = Math.round((totalCbm / CBM_MAX) * 100)
  const kgPct = Math.round((totalKg / KG_MAX) * 100)

  const hasHazmat = consolidated.some(r => r.hazmat)

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex flex-col lg:flex-row gap-5 h-full">
        {/* Left — pool */}
        <div className="lg:w-80 shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-foreground">Cargo Receipt Pool</h2>
            <span className="text-xs text-muted-foreground">{poolItems.length} available</span>
          </div>
          <div className="space-y-2">
            {poolItems.map(r => (
              <div key={r.id} className="p-3 rounded-xl border border-border bg-card hover:border-brand/40 transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", r.shipperColor)}>{r.shipperInit}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{r.shipper}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{r.id}</p>
                  </div>
                  {r.hazmat && <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-danger/15 text-danger">DG</span>}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground mb-2">
                  <span>{r.cbm} CBM</span>
                  <span>·</span>
                  <span>{r.pieces} pcs</span>
                  <span>·</span>
                  <span>{r.pod}</span>
                  <span className="ml-auto flex items-center gap-0.5"><Clock className="w-3 h-3" />{r.dwell}d</span>
                </div>
                <button onClick={() => addToConsolidation(r)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-[#F7941D]/10 text-[#F7941D] text-xs font-semibold hover:bg-[#F7941D]/20 transition-colors border border-[#F7941D]/30">
                  <Plus className="w-3.5 h-3.5" /> Add to Consolidation
                </button>
              </div>
            ))}
            {poolItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl border border-dashed border-border text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mb-2 text-success opacity-60" />
                <span className="text-xs">All receipts allocated</span>
              </div>
            )}
          </div>
        </div>

        {/* Right — consolidation being built */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Consolidation header */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h2 className="text-sm font-bold text-foreground">CON-001 · INBOM → CNSHA</h2>
                <p className="text-xs text-muted-foreground">FCL 20&apos; · Cutoff:
                  <input type="date" value={cutoff} onChange={e => setCutoff(e.target.value)}
                    className="ml-2 bg-transparent border-b border-border text-xs outline-none text-foreground" />
                </p>
              </div>
            </div>

            {/* Fill gauges */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "CBM Fill", used: totalCbm, max: CBM_MAX, pct: cbmPct, unit: "CBM" },
                { label: "Weight Fill", used: totalKg, max: KG_MAX, pct: kgPct, unit: "kg" },
              ].map(g => (
                <div key={g.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{g.label}</span>
                    <span className={cn("font-bold", g.pct > 90 ? "text-danger" : g.pct > 75 ? "text-warning" : "text-success")}>{g.pct}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", g.pct > 90 ? "bg-danger" : g.pct > 75 ? "bg-warning" : "bg-success")}
                      style={{ width: `${Math.min(g.pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>{g.used.toFixed(1)} {g.unit} used</span>
                    <span>{g.max} {g.unit} max</span>
                  </div>
                </div>
              ))}
            </div>

            {hasHazmat && (
              <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-danger/10 border border-danger/30">
                <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
                <span className="text-xs text-danger font-medium">DG cargo in consolidation — verify compatibility before confirming</span>
              </div>
            )}
          </div>

          {/* Receipts in consolidation */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground">In This Consolidation</h3>
              <span className="text-xs text-muted-foreground">{consolidated.length} receipts · {totalCbm.toFixed(1)} CBM · {totalKg.toLocaleString()} kg</span>
            </div>

            {consolidated.length > 0 ? (
              <div className="rounded-xl border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Receipt", "Shipper", "CBM", "Pieces", "Weight (kg)", "POD", "Dwell", ""].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {consolidated.map((r, i) => (
                      <tr key={r.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                        <td className="px-4 py-2.5 text-xs font-mono text-brand font-semibold">{r.id}</td>
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold", r.shipperColor)}>{r.shipperInit}</div>
                            <span className="text-xs text-foreground">{r.shipper}</span>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{r.cbm}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.pieces}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.kg.toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-xs text-foreground">{r.pod}</td>
                        <td className="px-4 py-2.5 text-xs text-muted-foreground">{r.dwell}d</td>
                        <td className="px-4 py-2.5">
                          <button onClick={() => removeFromConsolidation(r)} className="text-xs text-danger hover:underline">Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
                <Package className="w-10 h-10 mb-2 opacity-30" />
                <p className="text-sm font-medium">Add cargo receipts from the pool</p>
                <p className="text-xs mt-1">Drag or click &quot;Add to Consolidation&quot; on any receipt</p>
              </div>
            )}
          </div>

          {consolidated.length > 0 && (
            <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F7941D] text-white font-semibold text-sm hover:bg-[#F7941D]/90 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Confirm Consolidation
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
