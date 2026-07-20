"use client"

import { useState } from "react"
import { Plus, Trash2, Camera, Upload, Package, Calculator, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const clients = ["Apex Pharma Ltd", "Sunrise Electronics", "GlobalTex Fabrics", "FreshFarm Organics", "MediSupply Corp"]
const ports = ["INNSA – Nhava Sheva", "INMUN – Mundra", "INCKP – Chennai", "INBLR – Bangalore ICD", "INHYD – Hyderabad ICD"]
const services = ["FCL", "LCL-Standard", "LCL-Express", "Break Bulk"]

interface CargoPiece {
  id: number
  pieces: string
  weight: string
  length: string
  width: string
  height: string
  marks: string
  hsCode: string
}

function calcCBM(l: string, w: string, h: string, pcs: string): number {
  const cbm = (parseFloat(l) || 0) * (parseFloat(w) || 0) * (parseFloat(h) || 0) / 1_000_000
  return cbm * (parseFloat(pcs) || 1)
}

export default function CargoReceiptPage() {
  const [shipper, setShipper] = useState("")
  const [shipperSearch, setShipperSearch] = useState("")
  const [showClientDrop, setShowClientDrop] = useState(false)
  const [pod, setPod] = useState("")
  const [service, setService] = useState("LCL-Standard")
  const [awb, setAwb] = useState("")
  const [pieces, setPieces] = useState<CargoPiece[]>([
    { id: 1, pieces: "", weight: "", length: "", width: "", height: "", marks: "", hsCode: "" }
  ])

  const totalPieces = pieces.reduce((s, p) => s + (parseFloat(p.pieces) || 0), 0)
  const totalCBM = pieces.reduce((s, p) => s + calcCBM(p.length, p.width, p.height, p.pieces), 0)
  const totalWeight = pieces.reduce((s, p) => s + (parseFloat(p.weight) || 0), 0)

  const addPiece = () => setPieces(prev => [...prev, { id: Date.now(), pieces: "", weight: "", length: "", width: "", height: "", marks: "", hsCode: "" }])
  const removePiece = (id: number) => setPieces(prev => prev.filter(p => p.id !== id))
  const updatePiece = (id: number, field: keyof CargoPiece, val: string) =>
    setPieces(prev => prev.map(p => p.id === id ? { ...p, [field]: val } : p))

  return (
    <div className="p-6 w-full">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-foreground">Cargo Receipt Capture</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Register incoming cargo at CFS and assign a hold location</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main form */}
        <div className="lg:col-span-2 space-y-5">

          {/* Shipper selector */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">1</span>
              Shipper / Owner Party
            </h2>
            <div className="relative">
              <input
                value={shipperSearch}
                onChange={e => { setShipperSearch(e.target.value); setShowClientDrop(true) }}
                onFocus={() => setShowClientDrop(true)}
                placeholder="Search client or + New Shipper..."
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand transition-colors placeholder:text-muted-foreground/60"
              />
              {showClientDrop && (
                <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
                  {clients.filter(c => c.toLowerCase().includes(shipperSearch.toLowerCase())).map(c => (
                    <button key={c} onClick={() => { setShipper(c); setShipperSearch(c); setShowClientDrop(false) }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-muted/50 transition-colors text-left">
                      <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[10px] font-bold">{c.slice(0,2).toUpperCase()}</div>
                      {c}
                    </button>
                  ))}
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-brand hover:bg-brand/10 border-t border-border">
                    <Plus className="w-4 h-4" /> New Shipper
                  </button>
                </div>
              )}
            </div>
            {shipper && (
              <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/10 border border-brand/20">
                <div className="w-7 h-7 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[10px] font-bold">{shipper.slice(0,2).toUpperCase()}</div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{shipper}</p>
                  <p className="text-[10px] text-muted-foreground">Owner Party · Auto-stamped (read-only)</p>
                </div>
              </div>
            )}
          </div>

          {/* Cargo lines */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">2</span>
              Cargo Description
            </h2>
            <div className="space-y-4">
              {pieces.map((p, i) => {
                const cbm = calcCBM(p.length, p.width, p.height, p.pieces)
                return (
                  <div key={p.id} className="p-4 rounded-lg border border-border/70 bg-background/40 space-y-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-muted-foreground">Lot / Line {i + 1}</span>
                      {pieces.length > 1 && (
                        <button onClick={() => removePiece(p.id)} className="text-danger hover:text-danger/80 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Pieces</label>
                        <input value={p.pieces} onChange={e => updatePiece(p.id, "pieces", e.target.value)} type="number" placeholder="0"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                      </div>
                      <div>
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Weight (kg)</label>
                        <input value={p.weight} onChange={e => updatePiece(p.id, "weight", e.target.value)} type="number" placeholder="0.00"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                      </div>
                      <div className="sm:col-span-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">HS Code</label>
                        <input value={p.hsCode} onChange={e => updatePiece(p.id, "hsCode", e.target.value)} placeholder="e.g. 3004"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Dimensions (L × W × H in cm)</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["length","width","height"] as const).map(dim => (
                          <input key={dim} value={p[dim]} onChange={e => updatePiece(p.id, dim, e.target.value)} type="number" placeholder={dim.charAt(0).toUpperCase()}
                            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                        ))}
                      </div>
                      {cbm > 0 && (
                        <div className="mt-2 flex items-center gap-1.5 text-xs text-brand">
                          <Calculator className="w-3 h-3" />
                          <span className="font-semibold">Live CBM: {cbm.toFixed(4)} m³</span>
                          <span className="text-muted-foreground">per lot</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1 block">Marks & Numbers</label>
                      <input value={p.marks} onChange={e => updatePiece(p.id, "marks", e.target.value)} placeholder="e.g. AP/HYD/2024/001"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                    </div>
                  </div>
                )
              })}
              <button onClick={addPiece} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-brand/40 text-brand text-sm hover:bg-brand/5 transition-colors">
                <Plus className="w-4 h-4" /> Add Package / Lot
              </button>
            </div>
          </div>

          {/* Route & Service */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">3</span>
              Route & Service
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Destination Port (POD)</label>
                <select value={pod} onChange={e => setPod(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand">
                  <option value="">Select POD...</option>
                  {ports.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Service</label>
                <select value={service} onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand">
                  {services.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Booking / AWB Ref</label>
                <input value={awb} onChange={e => setAwb(e.target.value)} placeholder="e.g. VF-LCL-2024-0451"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand text-[10px] text-white flex items-center justify-center font-bold">4</span>
              Documents & Photos
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {["Commercial Invoice", "Packing List", "Photo Capture"].map(doc => (
                <button key={doc} className={cn("flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed transition-all hover:border-brand/60 hover:bg-brand/5",
                  doc === "Photo Capture" ? "border-brand/30 text-brand" : "border-border/60 text-muted-foreground")}>
                  {doc === "Photo Capture" ? <Camera className="w-5 h-5" /> : <Upload className="w-5 h-5" />}
                  <span className="text-[11px] font-medium text-center leading-tight">{doc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right sidebar: running summary + CTA */}
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-5 sticky top-4">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-4 h-4 text-brand" /> Running Summary
            </h3>
            <div className="space-y-3">
              {[
                { label: "Total Pieces", value: totalPieces || "—", unit: "pcs" },
                { label: "Total Weight", value: totalWeight > 0 ? `${totalWeight.toFixed(2)}` : "—", unit: "kg" },
                { label: "Total CBM", value: totalCBM > 0 ? totalCBM.toFixed(4) : "—", unit: "m³", highlight: true },
                { label: "Chargeable", value: totalCBM > 0 ? `${Math.max(totalWeight, totalCBM * 250).toFixed(2)}` : "—", unit: "kg" },
              ].map(row => (
                <div key={row.label} className={cn("flex items-center justify-between p-3 rounded-lg", row.highlight ? "bg-brand/10 border border-brand/20" : "bg-muted/30")}>
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className={cn("text-sm font-bold", row.highlight ? "text-brand" : "text-foreground")}>
                    {row.value} <span className="text-[10px] font-normal text-muted-foreground">{row.unit}</span>
                  </span>
                </div>
              ))}
            </div>

            {pod && shipper && (
              <div className="mt-4 p-3 rounded-lg bg-navy/20 border border-navy/30">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">INNSA</span>
                  <ArrowRight className="w-3 h-3 text-brand" />
                  <span className="font-semibold text-foreground truncate">{pod.split("–")[0].trim()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{service}</p>
              </div>
            )}

            <button className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 transition-colors shadow-lg shadow-[#F7941D]/20">
              <Package className="w-4 h-4" /> Receive Cargo
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Assigns CFS hold location + prints receipt/QR</p>
          </div>
        </div>
      </div>
    </div>
  )
}
