"use client"

import { useState } from "react"
import { Plus, Trash2, Camera, Upload, Calculator, Weight, Package } from "lucide-react"
import { cn } from "@/lib/utils"

const clients = ["Apex Pharma Ltd", "Sunrise Electronics", "GlobalTex Fabrics", "MediSupply Corp"]
const serviceLevels = ["Standard", "Express", "Priority Overnight", "Economy"]

interface PieceLine {
  id: number
  pieces: string
  weight: string
  length: string
  width: string
  height: string
  awb: string
}

function volWeight(l: string, w: string, h: string, pcs: string) {
  const vol = (parseFloat(l) || 0) * (parseFloat(w) || 0) * (parseFloat(h) || 0) / 5000
  return vol * (parseFloat(pcs) || 1)
}

export default function AirCapturePage() {
  const [shipper, setShipper] = useState("")
  const [consignee, setConsignee] = useState("")
  const [shipperSearch, setShipperSearch] = useState("")
  const [showShipperDrop, setShowShipperDrop] = useState(false)
  const [service, setService] = useState("Express")
  const [preRoute, setPreRoute] = useState<"" | "local" | "export">("")
  const [lines, setLines] = useState<PieceLine[]>([
    { id: 1, pieces: "", weight: "", length: "", width: "", height: "", awb: "" }
  ])

  const totalActual = lines.reduce((s, l) => s + (parseFloat(l.weight) || 0) * (parseFloat(l.pieces) || 1), 0)
  const totalVol = lines.reduce((s, l) => s + volWeight(l.length, l.width, l.height, l.pieces), 0)
  const chargeable = Math.max(totalActual, totalVol)

  const addLine = () => setLines(p => [...p, { id: Date.now(), pieces: "", weight: "", length: "", width: "", height: "", awb: "" }])
  const removeLine = (id: number) => setLines(p => p.filter(l => l.id !== id))
  const update = (id: number, f: keyof PieceLine, v: string) => setLines(p => p.map(l => l.id === id ? { ...l, [f]: v } : l))

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Air Package Capture</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Register inbound packages and compute chargeable weight</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">

          {/* Parties */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">1</span>
              Parties
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Shipper</label>
                <input value={shipperSearch} onChange={e => { setShipperSearch(e.target.value); setShowShipperDrop(true) }}
                  onFocus={() => setShowShipperDrop(true)}
                  placeholder="Search or + New Shipper..."
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                {showShipperDrop && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
                    {clients.filter(c => c.toLowerCase().includes(shipperSearch.toLowerCase())).map(c => (
                      <button key={c} onClick={() => { setShipper(c); setShipperSearch(c); setShowShipperDrop(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 text-brand text-[10px] font-bold flex items-center justify-center">{c.slice(0,2).toUpperCase()}</div>
                        {c}
                      </button>
                    ))}
                    <button className="w-full text-left px-4 py-2.5 text-sm text-brand hover:bg-brand/10 border-t border-border flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> New Shipper
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Consignee</label>
                <input value={consignee} onChange={e => setConsignee(e.target.value)}
                  placeholder="Consignee name..."
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
              </div>
            </div>
            {shipper && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/40 border border-border/60">
                <div className="w-6 h-6 rounded-full bg-brand/20 text-brand text-[10px] font-bold flex items-center justify-center">{shipper.slice(0,2).toUpperCase()}</div>
                <p className="text-xs text-muted-foreground">Owner Party: <span className="font-semibold text-foreground">{shipper}</span> · Auto-stamped (read-only)</p>
              </div>
            )}
          </div>

          {/* Package lines */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">2</span>
              Packages
            </h2>
            <div className="space-y-4">
              {lines.map((l, i) => {
                const vw = volWeight(l.length, l.width, l.height, l.pieces)
                const aw = (parseFloat(l.weight) || 0) * (parseFloat(l.pieces) || 1)
                return (
                  <div key={l.id} className="p-4 rounded-lg border border-border/70 bg-background/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-muted-foreground">Package Line {i + 1}</span>
                      {lines.length > 1 && <button onClick={() => removeLine(l.id)} className="text-danger hover:text-danger/80"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Pieces</label>
                        <input value={l.pieces} onChange={e => update(l.id, "pieces", e.target.value)} type="number" placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Weight / pc (kg)</label>
                        <input value={l.weight} onChange={e => update(l.id, "weight", e.target.value)} type="number" placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">AWB / Ref</label>
                        <input value={l.awb} onChange={e => update(l.id, "awb", e.target.value)} placeholder="e.g. 176-12345678"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Dimensions / pc (L × W × H in cm)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["length","width","height"] as const).map(dim => (
                          <input key={dim} value={l[dim]} onChange={e => update(l.id, dim, e.target.value)} type="number" placeholder={dim.charAt(0).toUpperCase()}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                        ))}
                      </div>
                    </div>
                    {(vw > 0 || aw > 0) && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">
                          <Weight className="w-3 h-3" /> Actual: {aw.toFixed(2)} kg
                        </span>
                        <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">
                          <Calculator className="w-3 h-3" /> Volumetric: {vw.toFixed(2)} kg
                        </span>
                        <span className={cn("flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold",
                          vw > aw ? "bg-warning/15 text-warning" : "bg-brand/15 text-brand")}>
                          Chargeable: {Math.max(aw, vw).toFixed(2)} kg {vw > aw ? "(Vol)" : "(Act)"}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
              <button onClick={addLine} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-brand/40 text-brand text-sm hover:bg-brand/5 transition-colors">
                <Plus className="w-4 h-4" /> Add Package Line
              </button>
            </div>
          </div>

          {/* Service & Route */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">3</span>
              Service & Pre-set Route
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Service Level</label>
                <select value={service} onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand">
                  {serviceLevels.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Pre-set Route (optional)</label>
                <div className="flex gap-2">
                  {(["local","export"] as const).map(r => (
                    <button key={r} onClick={() => setPreRoute(preRoute === r ? "" : r)}
                      className={cn("flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors",
                        preRoute === r ? (r === "local" ? "border-success bg-success/15 text-success" : "border-brand bg-brand/15 text-brand")
                          : "border-border text-muted-foreground hover:border-brand/40")}>
                      {r === "local" ? "Local Delivery" : "Export"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {["Photo Capture", "Upload Documents"].map(doc => (
                <button key={doc} className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground text-sm hover:border-brand/40 hover:text-foreground transition-colors">
                  {doc === "Photo Capture" ? <Camera className="w-4 h-4" /> : <Upload className="w-4 h-4" />}
                  {doc}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="rounded-xl border border-border bg-card p-5 sticky top-4">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand" /> Weight Summary
            </h3>
            <div className="space-y-3 mb-5">
              {[
                { label: "Actual Weight", value: totalActual > 0 ? `${totalActual.toFixed(2)} kg` : "—", sub: "Sum of all pieces" },
                { label: "Volumetric Weight", value: totalVol > 0 ? `${totalVol.toFixed(2)} kg` : "—", sub: "L×W×H / 5000 × pcs" },
              ].map(r => (
                <div key={r.label} className="p-3 rounded-lg bg-muted/30 space-y-0.5">
                  <p className="text-[10px] text-muted-foreground">{r.label}</p>
                  <p className="text-sm font-bold text-foreground">{r.value}</p>
                  <p className="text-[9px] text-muted-foreground/70">{r.sub}</p>
                </div>
              ))}
              <div className="p-3 rounded-xl border-2 border-brand bg-brand/10">
                <p className="text-[10px] text-brand font-semibold uppercase tracking-wider mb-1">Chargeable Weight</p>
                <p className="text-2xl font-bold text-brand">{chargeable > 0 ? `${chargeable.toFixed(2)} kg` : "—"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">max(actual, volumetric)</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 transition-colors shadow-lg shadow-[#F7941D]/20">
              <Package className="w-4 h-4" /> Receive Package
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Assigns hold location + logs handling-in event</p>
          </div>
        </div>
      </div>
    </div>
  )
}
