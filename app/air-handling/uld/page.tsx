"use client"

import { useState } from "react"
import { Plus, X, CheckCircle2, FileText, Download, Send, Wind } from "lucide-react"
import { cn } from "@/lib/utils"

const uldTypes = ["PMC – 88×125 in (max 1,588 kg)", "AKE – 60.4×61.5 in (max 1,497 kg)", "PAG – 88×125 in (max 4,626 kg)", "LD3 – 79.1×60.4 in (max 1,588 kg)"]
const airlines = ["IndiGo – 6E", "Air India – AI", "SpiceJet – SG", "Emirates – EK", "Qatar Airways – QR"]

interface ExportPkg { id: string; ref: string; consignee: string; weight: number; dest: string; initials: string; color: string }

const pool: ExportPkg[] = [
  { id: "p1", ref: "AIR-EXP-001", consignee: "TechParts GmbH", weight: 18.4, dest: "FRA", initials: "TG", color: "bg-blue-500" },
  { id: "p2", ref: "AIR-EXP-002", consignee: "MedDevice UK", weight: 5.2, dest: "LHR", initials: "MD", color: "bg-rose-500" },
  { id: "p3", ref: "AIR-EXP-003", consignee: "Spice Lane Dubai", weight: 32.0, dest: "DXB", initials: "SL", color: "bg-amber-500" },
  { id: "p4", ref: "AIR-EXP-004", consignee: "EuroFashion BV", weight: 12.6, dest: "AMS", initials: "EF", color: "bg-emerald-500" },
  { id: "p5", ref: "AIR-EXP-005", consignee: "SingTech Pte", weight: 8.9, dest: "SIN", initials: "ST", color: "bg-violet-500" },
  { id: "p6", ref: "AIR-EXP-006", consignee: "AusPharma Pty", weight: 22.1, dest: "SYD", initials: "AP", color: "bg-orange-500" },
]

const ULD_MAX = 1497

const hawbLines = [
  { hawb: "VF-HAWB-2024-0051", shipper: "Apex Pharma Ltd", pieces: 12, weight: 5.2, dest: "LHR" },
  { hawb: "VF-HAWB-2024-0052", shipper: "GlobalTex Fabrics", pieces: 4, weight: 18.4, dest: "FRA" },
]

export default function ULDBuildPage() {
  const [selectedUld, setSelectedUld] = useState(uldTypes[0])
  const [selectedAirline, setSelectedAirline] = useState(airlines[0])
  const [flight, setFlight] = useState("")
  const [seal, setSeal] = useState("")
  const [uldId, setUldId] = useState("")
  const [loaded, setLoaded] = useState<ExportPkg[]>([])
  const [confirmed, setConfirmed] = useState(false)

  const totalLoaded = loaded.reduce((s, p) => s + p.weight, 0)
  const fillPct = Math.min((totalLoaded / ULD_MAX) * 100, 100)
  const remaining = pool.filter(p => !loaded.find(l => l.id === p.id))

  const addToUld = (pkg: ExportPkg) => setLoaded(prev => [...prev, pkg])
  const removeFromUld = (id: string) => setLoaded(prev => prev.filter(p => p.id !== id))

  return (
    <div className="p-6 w-full">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">ULD Build & MAWB</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Consolidate export packages into ULD and generate master air waybill</p>
      </div>

      {/* ULD header config */}
      <div className="p-5 rounded-xl border border-border bg-card mb-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">ULD Type</label>
            <select value={selectedUld} onChange={e => setSelectedUld(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-brand">
              {uldTypes.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Airline</label>
            <select value={selectedAirline} onChange={e => setSelectedAirline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs outline-none focus:border-brand">
              {airlines.map(a => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Flight No.</label>
            <input value={flight} onChange={e => setFlight(e.target.value)} placeholder="e.g. 6E 1234"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
          </div>
          <div>
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">ULD ID</label>
            <input value={uldId} onChange={e => setUldId(e.target.value)} placeholder="e.g. PMC12345AI"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left: package pool */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Export Package Pool</h2>
            <span className="text-xs text-muted-foreground">{remaining.length} available</span>
          </div>
          <div className="p-4 space-y-2">
            {remaining.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                <Wind className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">All packages loaded into ULD</p>
              </div>
            ) : (
              remaining.map(pkg => (
                <div key={pkg.id} className="flex items-center justify-between p-3.5 rounded-lg border border-border/60 bg-background/40 hover:border-brand/40 transition-all group">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", pkg.color)}>{pkg.initials}</div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{pkg.consignee}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{pkg.ref} · {pkg.dest}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-foreground">{pkg.weight} kg</span>
                    <button onClick={() => addToUld(pkg)}
                      className="w-7 h-7 rounded-lg bg-brand text-white flex items-center justify-center hover:bg-brand/90 transition-colors opacity-0 group-hover:opacity-100">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: ULD being built */}
        <div className="space-y-4">
          {/* Fill gauge */}
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-foreground">ULD Weight Fill</h2>
              <span className={cn("text-xs font-bold px-2.5 py-1 rounded-full",
                fillPct > 90 ? "bg-danger/15 text-danger" : fillPct > 70 ? "bg-warning/15 text-warning" : "bg-brand/15 text-brand")}>
                {totalLoaded.toFixed(1)} / {ULD_MAX} kg
              </span>
            </div>
            <div className="w-full h-5 rounded-full bg-muted overflow-hidden mb-2">
              <div className={cn("h-full rounded-full transition-all duration-500",
                fillPct > 90 ? "bg-danger" : fillPct > 70 ? "bg-warning" : "bg-brand")}
                style={{ width: `${fillPct}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>{fillPct.toFixed(1)}% used</span>
              <span>{(ULD_MAX - totalLoaded).toFixed(1)} kg remaining</span>
            </div>
          </div>

          {/* Loaded packages */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Loaded into ULD</h2>
              <span className="text-xs text-muted-foreground">{loaded.length} packages</span>
            </div>
            <div className="p-4 space-y-2 min-h-[100px]">
              {loaded.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">Add packages from the pool on the left</p>
              ) : loaded.map(pkg => (
                <div key={pkg.id} className="flex items-center justify-between p-3 rounded-lg border border-success/20 bg-success/5">
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", pkg.color)}>{pkg.initials}</div>
                    <div>
                      <p className="text-xs font-semibold text-foreground">{pkg.consignee}</p>
                      <p className="text-[10px] text-muted-foreground font-mono">{pkg.ref}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-foreground">{pkg.weight} kg</span>
                    <button onClick={() => removeFromUld(pkg.id)} className="text-muted-foreground hover:text-danger transition-colors"><X className="w-3.5 h-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MAWB preview */}
          {loaded.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">MAWB / Manifest Preview</h3>
              <div className="space-y-2 mb-3">
                {hawbLines.map(h => (
                  <div key={h.hawb} className="flex items-center justify-between text-xs">
                    <span className="font-mono text-muted-foreground">{h.hawb}</span>
                    <span className="text-foreground">{h.shipper}</span>
                    <span className="text-brand font-semibold">{h.weight} kg</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Preview
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            </div>
          )}

          {/* Seal + confirm */}
          <div className="p-4 rounded-xl border border-border bg-card">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Seal Number</label>
            <input value={seal} onChange={e => setSeal(e.target.value)} placeholder="e.g. SL-2024-08842"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand mb-3" />
            {!confirmed ? (
              <button onClick={() => setConfirmed(true)} disabled={loaded.length === 0 || !seal || !flight}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F7941D]/20">
                <Send className="w-4 h-4" /> Confirm Build & Handoff to Airline
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-bold">
                <CheckCircle2 className="w-4 h-4" /> ULD Handed Off · Status: Exported/In-Transit
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
