"use client"

import { useState } from "react"
import { Download, Eye, Send, FileText, Package, CheckCircle2, Truck, ArrowRight, Printer } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { cn } from "@/lib/utils"

const manifestLines = [
  { ref: "CFS-2024-0451", shipper: "Apex Pharma Ltd", initials: "AP", color: "bg-blue-500", pieces: 48, weight: 1240, cbm: 8.2, marks: "AP/HYD/001", pod: "INMUN", hsCode: "3004.90" },
  { ref: "CFS-2024-0452", shipper: "GlobalTex Fabrics", initials: "GT", color: "bg-amber-500", pieces: 120, weight: 3800, cbm: 22.4, marks: "GT/BLR/002", pod: "INMUN", hsCode: "5208.11" },
  { ref: "CFS-2024-0453", shipper: "MediSupply Corp", initials: "MS", color: "bg-rose-500", pieces: 36, weight: 720, cbm: 4.6, marks: "MS/CHN/003", pod: "INMUN", hsCode: "3002.20" },
  { ref: "CFS-2024-0454", shipper: "Sunrise Electronics", initials: "SE", color: "bg-emerald-500", pieces: 24, weight: 960, cbm: 5.1, marks: "SE/HYD/004", pod: "INMUN", hsCode: "8471.30" },
  { ref: "CFS-2024-0455", shipper: "FreshFarm Organics", initials: "FF", color: "bg-orange-500", pieces: 60, weight: 2100, cbm: 11.8, marks: "FF/MUM/005", pod: "INMUN", hsCode: "0901.11" },
]

const docs = [
  { name: "House Manifest", type: "PDF", status: "Ready", icon: <FileText className="w-4 h-4" /> },
  { name: "B/L Instructions", type: "PDF", status: "Ready", icon: <FileText className="w-4 h-4" /> },
  { name: "E-Way Bill", type: "PDF", status: "Pending", icon: <FileText className="w-4 h-4" /> },
  { name: "Shipping Bill Ref", type: "REF", status: "Ready", icon: <Package className="w-4 h-4" /> },
  { name: "Packing List", type: "PDF", status: "Ready", icon: <FileText className="w-4 h-4" /> },
]

export default function ManifestPage() {
  const [dispatched, setDispatched] = useState(false)
  const [selected, setSelected] = useState<string[]>([])

  const totals = manifestLines.reduce((acc, l) => ({
    pieces: acc.pieces + l.pieces,
    weight: acc.weight + l.weight,
    cbm: acc.cbm + l.cbm,
  }), { pieces: 0, weight: 0, cbm: 0 })

  const toggleAll = () => setSelected(selected.length === manifestLines.length ? [] : manifestLines.map(l => l.ref))

  return (
    <div className="p-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2.5 py-1 rounded-full bg-brand/15 text-brand text-xs font-bold">CONSOL-2024-087</span>
            <span className="px-2.5 py-1 rounded-full bg-success/15 text-success text-xs font-semibold">Ready to Dispatch</span>
          </div>
          <h1 className="text-xl font-bold text-foreground">Manifest & Export Documents</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            INNSA (Nhava Sheva) <ArrowRight className="inline w-3 h-3 mx-1" /> INMUN (Mundra) · 20&apos; FCL · 5 HAWB lines
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Printer className="w-4 h-4" /> Print
          </button>
          <ExportButton data={manifestLines.map(l => ({ ref: l.ref, shipper: l.shipper, pieces: l.pieces, weight: l.weight, cbm: l.cbm, marks: l.marks, pod: l.pod, hsCode: l.hsCode }))} filename="lcl-manifest" label="Export All" />
          {!dispatched ? (
            <button onClick={() => setDispatched(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 transition-colors shadow-lg shadow-[#F7941D]/20">
              <Send className="w-4 h-4" /> Dispatch to Port
            </button>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-success/15 border border-success/30 text-success text-sm font-semibold">
              <CheckCircle2 className="w-4 h-4" /> Dispatched · In-Transit
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Manifest table */}
        <div className="xl:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">House Manifest — HAWB Lines</h2>
              <span className="text-xs text-muted-foreground">{manifestLines.length} lines</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" onChange={toggleAll} checked={selected.length === manifestLines.length}
                        className="w-3.5 h-3.5 rounded accent-[#F7941D]" />
                    </th>
                    {["HAWB Ref", "Shipper", "Pieces", "Weight (kg)", "CBM (m³)", "Marks & Nos.", "HS Code"].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {manifestLines.map((line) => (
                    <tr key={line.ref} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", selected.includes(line.ref) && "bg-brand/5")}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.includes(line.ref)}
                          onChange={() => setSelected(s => s.includes(line.ref) ? s.filter(x => x !== line.ref) : [...s, line.ref])}
                          className="w-3.5 h-3.5 rounded accent-[#F7941D]" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand font-semibold">{line.ref}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0", line.color)}>{line.initials}</div>
                          <span className="text-xs font-medium text-foreground">{line.shipper}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">{line.pieces}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{line.weight.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-brand">{line.cbm.toFixed(1)}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground font-mono">{line.marks}</td>
                      <td className="px-4 py-3 text-[10px] text-muted-foreground font-mono">{line.hsCode}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-border bg-muted/30">
                    <td colSpan={3} className="px-4 py-3 text-xs font-bold text-foreground">TOTALS</td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">{totals.pieces}</td>
                    <td className="px-4 py-3 text-xs font-bold text-foreground">{totals.weight.toLocaleString()}</td>
                    <td className="px-4 py-3 text-xs font-bold text-brand">{totals.cbm.toFixed(1)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Total HAWB Lines", value: manifestLines.length, unit: "lines", color: "text-brand" },
              { label: "Total Weight", value: `${totals.weight.toLocaleString()}`, unit: "kg", color: "text-foreground" },
              { label: "Total CBM", value: totals.cbm.toFixed(1), unit: "m³", color: "text-brand" },
            ].map(c => (
              <div key={c.label} className="p-4 rounded-xl border border-border bg-card text-center">
                <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                <p className={cn("text-2xl font-bold", c.color)}>{c.value}</p>
                <p className="text-[10px] text-muted-foreground">{c.unit}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Document set */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <h3 className="text-sm font-bold text-foreground mb-4">Document Set</h3>
            <div className="space-y-2">
              {docs.map(doc => (
                <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-background/40 hover:border-brand/40 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <span className="text-brand">{doc.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{doc.name}</p>
                      <p className="text-[10px] text-muted-foreground">{doc.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold",
                      doc.status === "Ready" ? "bg-success/15 text-success" : "bg-warning/15 text-warning")}>
                      {doc.status}
                    </span>
                    {doc.status === "Ready" && (
                      <div className="flex items-center gap-1">
                        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3 h-3" /></button>
                        <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"><Download className="w-3 h-3" /></button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {dispatched && (
            <div className="rounded-xl border border-success/30 bg-success/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-success" />
                <span className="text-sm font-bold text-success">Gate-Out Confirmed</span>
              </div>
              <div className="space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between"><span>Status</span><span className="text-success font-semibold">In-Transit</span></div>
                <div className="flex justify-between"><span>Gate-Out Time</span><span className="text-foreground">Just now</span></div>
                <div className="flex justify-between"><span>Vessel</span><span className="text-foreground">MV Evergreen Joy</span></div>
                <div className="flex justify-between"><span>ETD</span><span className="text-foreground">24 Jul 2026</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
