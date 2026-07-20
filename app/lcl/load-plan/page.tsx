"use client"

import { useState } from "react"
import { Plus, Container, ChevronDown, CheckCircle2, AlertTriangle, FileText, Printer, Send, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CBM_MAX = 28.3
const KG_MAX = 21700

const containers = [
  {
    id: "LCL-CON-0041",
    route: "INBOM → CNSHA",
    vessel: "EVER GIVEN",
    voyage: "2025W31",
    etd: "Jul 28, 2025",
    eta: "Aug 14, 2025",
    cbm: 22.4,
    kg: 14800,
    shippers: [
      { id: "CR-0891", shipper: "Apex Pharma", cbm: 2.4, kg: 960, pieces: 18 },
      { id: "CR-0892", shipper: "GlobalTex", cbm: 5.6, kg: 2800, pieces: 40 },
      { id: "CR-0896", shipper: "FreshFarm", cbm: 3.2, kg: 1600, pieces: 24 },
      { id: "CR-0897", shipper: "Sunrise Elec.", cbm: 4.1, kg: 2050, pieces: 30 },
      { id: "CR-0899", shipper: "AutoParts India", cbm: 7.1, kg: 7390, pieces: 52 },
    ],
    status: "confirmed",
  },
  {
    id: "LCL-CON-0042",
    route: "INBOM → SGSIN",
    vessel: "MSC DIANA",
    voyage: "2025W32",
    etd: "Aug 4, 2025",
    eta: "Aug 11, 2025",
    cbm: 8.3,
    kg: 4150,
    shippers: [
      { id: "CR-0894", shipper: "AutoParts India", cbm: 8.3, kg: 4150, pieces: 62 },
    ],
    status: "building",
  },
]

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-success/15", text: "text-success", label: "Confirmed" },
  building:  { bg: "bg-warning/15", text: "text-warning",  label: "Building" },
  planned:   { bg: "bg-brand/15",   text: "text-brand",    label: "Planned" },
}

function FillGauge({ used, max, unit }: { used: number; max: number; unit: string }) {
  const pct = Math.min((used / max) * 100, 100)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{unit}</span>
        <span className={cn("font-bold", pct > 90 ? "text-danger" : pct > 75 ? "text-warning" : "text-success")}>{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", pct > 90 ? "bg-danger" : pct > 75 ? "bg-warning" : "bg-success")}
          style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{unit === "CBM" ? used.toFixed(1) : used.toLocaleString()} {unit}</span>
        <span>/ {unit === "CBM" ? max : max.toLocaleString()} {unit}</span>
      </div>
    </div>
  )
}

export default function LCLLoadPlanPage() {
  const [expanded, setExpanded] = useState<string[]>(["LCL-CON-0041"])

  const toggle = (id: string) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {["Active Containers", "Completed", "Cancelled", "Templates"].map((t, i) => (
          <button key={t} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            i === 0 ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold text-foreground">Load Plans — {containers.length} active containers</span>
          </div>
          <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors">
            <Plus className="w-3.5 h-3.5" /> New Container
          </button>
        </div>

        {containers.map(con => {
          const s = statusConfig[con.status]
          const isExpanded = expanded.includes(con.id)
          return (
            <div key={con.id} className="bg-card border border-border rounded-xl overflow-hidden">
              {/* Container header */}
              <div className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-muted/10 transition-colors" onClick={() => toggle(con.id)}>
                <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                  <Container className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-foreground text-[13px]">{con.id}</span>
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", s.bg, s.text)}>{s.label}</span>
                  </div>
                  <p className="text-[12px] text-muted-foreground">{con.route} · {con.vessel} · Voyage {con.voyage}</p>
                  <p className="text-[11px] text-muted-foreground">ETD: {con.etd} · ETA: {con.eta} · {con.shippers.length} shippers</p>
                </div>
                <div className="flex items-center gap-6 mr-2 shrink-0">
                  <div className="w-28">
                    <FillGauge used={con.cbm} max={CBM_MAX} unit="CBM" />
                  </div>
                  <div className="w-28">
                    <FillGauge used={con.kg} max={KG_MAX} unit="kg" />
                  </div>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-muted-foreground shrink-0 transition-transform mt-3", isExpanded && "rotate-180")} />
              </div>

              {/* Expanded shipper table */}
              {isExpanded && (
                <div className="border-t border-border">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-muted/20 border-b border-border/50">
                        {["Receipt Ref", "Shipper", "CBM", "Weight (kg)", "Pieces", ""].map(h => (
                          <th key={h} className="px-4 py-2 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {con.shippers.map((sh, i) => (
                        <tr key={sh.id} className={cn("border-b border-border/30 hover:bg-muted/10 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-brand">{sh.id}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{sh.shipper}</td>
                          <td className="px-4 py-2.5">{sh.cbm.toFixed(1)}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{sh.kg.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{sh.pieces}</td>
                          <td className="px-4 py-2.5">
                            <button className="text-[11px] text-brand hover:underline flex items-center gap-0.5">HBL <ChevronRight className="w-3 h-3" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/20 border-t border-border">
                        <td colSpan={2} className="px-4 py-2 text-[11px] font-bold text-foreground">TOTALS</td>
                        <td className="px-4 py-2 font-bold text-foreground">{con.cbm.toFixed(1)}</td>
                        <td className="px-4 py-2 font-bold text-foreground">{con.kg.toLocaleString()}</td>
                        <td className="px-4 py-2 font-bold text-foreground">{con.shippers.reduce((s, x) => s + x.pieces, 0)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                  <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/10">
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                      <FileText className="w-3.5 h-3.5" /> Generate MBL Draft
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[12px] text-muted-foreground hover:text-foreground transition-colors">
                      <Printer className="w-3.5 h-3.5" /> Print Packing List
                    </button>
                    {con.status === "building" && (
                      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors ml-auto">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Load Plan
                      </button>
                    )}
                    {con.status === "confirmed" && (
                      <button className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-success/20 text-success text-[12px] font-semibold border border-success/30 ml-auto">
                        <Send className="w-3.5 h-3.5" /> File with Shipping Line
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
