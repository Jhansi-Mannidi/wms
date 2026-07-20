"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Truck, Package, AlertTriangle, Plus, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

const expectedLines = [
  { ref: "CFS-2024-0451", consignee: "Apex Pharma Ltd", initials: "AP", color: "bg-blue-500", expectedPcs: 48, expectedCbm: 8.2, expectedWt: 1240, status: "Pending" },
  { ref: "CFS-2024-0452", consignee: "GlobalTex Fabrics", initials: "GT", color: "bg-amber-500", expectedPcs: 120, expectedCbm: 22.4, expectedWt: 3800, status: "Pending" },
  { ref: "CFS-2024-0453", consignee: "MediSupply Corp", initials: "MS", color: "bg-rose-500", expectedPcs: 36, expectedCbm: 4.6, expectedWt: 720, status: "Pending" },
  { ref: "CFS-2024-0454", consignee: "Sunrise Electronics", initials: "SE", color: "bg-emerald-500", expectedPcs: 24, expectedCbm: 5.1, expectedWt: 960, status: "Pending" },
  { ref: "CFS-2024-0455", consignee: "FreshFarm Organics", initials: "FF", color: "bg-orange-500", expectedPcs: 60, expectedCbm: 11.8, expectedWt: 2100, status: "Pending" },
]

const modes = ["Local Delivery", "Courier", "Pickup"]

export default function DeconsolidationPage() {
  const [actuals, setActuals] = useState<Record<string, number>>(
    Object.fromEntries(expectedLines.map(l => [l.ref, l.expectedPcs]))
  )
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(expectedLines.map(l => [l.ref, "Pending"]))
  )
  const [modes2, setModes2] = useState<Record<string, string>>(
    Object.fromEntries(expectedLines.map(l => [l.ref, ""]))
  )

  const setActual = (ref: string, val: number) => setActuals(p => ({ ...p, [ref]: Math.max(0, val) }))
  const setStatus = (ref: string, val: string) => setStatuses(p => ({ ...p, [ref]: val }))

  const totalExpected = expectedLines.reduce((s, l) => s + l.expectedPcs, 0)
  const totalActual = Object.values(actuals).reduce((s, v) => s + v, 0)
  const discrepancies = expectedLines.filter(l => actuals[l.ref] !== l.expectedPcs).length

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-navy/20 text-foreground text-xs font-bold border border-navy/30">CONSOL-2024-087</span>
            <span className="px-2.5 py-1 rounded-full bg-warning/15 text-warning text-xs font-semibold">De-Stuffing in Progress</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">De-Consolidation Board</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            INMUN (Mundra) import · 20&apos; FCL · Arrived 19 Jul 2026
          </p>
        </div>
      </div>

      {/* Reconciliation summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Expected Pieces", value: totalExpected, color: "text-foreground" },
          { label: "De-Stuffed So Far", value: totalActual, color: "text-brand" },
          { label: "Discrepancies", value: discrepancies, color: discrepancies > 0 ? "text-danger" : "text-success" },
          { label: "HAWB Lines", value: expectedLines.length, color: "text-foreground" },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4 text-center">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Split panel */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Manifest reconciliation */}
        <div className="xl:col-span-3 rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Manifest Reconciliation</h2>
            <span className="text-xs text-muted-foreground">Expected vs De-Stuffed</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["HAWB / Consignee", "Expected", "De-Stuffed", "Delta", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expectedLines.map(line => {
                  const actual = actuals[line.ref]
                  const delta = actual - line.expectedPcs
                  const ok = delta === 0
                  return (
                    <tr key={line.ref} className="border-b border-border/40 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", line.color)}>{line.initials}</div>
                          <div>
                            <p className="text-xs font-semibold text-foreground">{line.consignee}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{line.ref}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">{line.expectedPcs} pcs</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <button onClick={() => setActual(line.ref, actual - 1)} className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted/80 text-muted-foreground">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-foreground">{actual}</span>
                          <button onClick={() => setActual(line.ref, actual + 1)} className="w-5 h-5 rounded bg-muted flex items-center justify-center hover:bg-muted/80 text-muted-foreground">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-bold", ok ? "text-success" : delta > 0 ? "text-brand" : "text-danger")}>
                          {ok ? "—" : delta > 0 ? `+${delta}` : delta}
                        </span>
                        {!ok && <AlertTriangle className={cn("inline w-3 h-3 ml-1", delta > 0 ? "text-brand" : "text-danger")} />}
                      </td>
                      <td className="px-4 py-3">
                        <select value={statuses[line.ref]} onChange={e => setStatus(line.ref, e.target.value)}
                          className="text-[11px] px-2 py-1 rounded-lg border border-border bg-background outline-none focus:border-brand">
                          <option>Pending</option>
                          <option>De-Stuffed</option>
                          <option>Short-Shipped</option>
                          <option>Damaged</option>
                        </select>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Per-shipment release */}
        <div className="xl:col-span-2 space-y-3">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Release Shipments</h3>
            <p className="text-xs text-muted-foreground mb-4">Select release mode per consignee and confirm dispatch</p>
            <div className="space-y-3">
              {expectedLines.map(line => (
                <div key={line.ref} className="p-3 rounded-lg border border-border/60 bg-background/40">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0", line.color)}>{line.initials}</div>
                    <p className="text-xs font-semibold text-foreground truncate">{line.consignee}</p>
                    <span className={cn("ml-auto text-[10px] px-1.5 py-0.5 rounded-full font-semibold",
                      statuses[line.ref] === "De-Stuffed" ? "bg-success/15 text-success" :
                      statuses[line.ref] === "Pending" ? "bg-muted text-muted-foreground" :
                      "bg-warning/15 text-warning")}>
                      {statuses[line.ref]}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    {modes.map(m => (
                      <button key={m} onClick={() => setModes2(p => ({ ...p, [line.ref]: m }))}
                        className={cn("text-[10px] px-2 py-1 rounded-lg border font-medium transition-colors",
                          modes2[line.ref] === m
                            ? "bg-brand border-brand text-white"
                            : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground"
                        )}>
                        {m}
                      </button>
                    ))}
                  </div>
                  {modes2[line.ref] && (
                    <button className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-[#F7941D] text-white text-[11px] font-bold hover:bg-[#F7941D]/90 transition-colors">
                      <Truck className="w-3 h-3" /> Confirm Release ({modes2[line.ref]})
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
