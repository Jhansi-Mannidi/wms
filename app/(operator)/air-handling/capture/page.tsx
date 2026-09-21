"use client"

import { useState } from "react"
import { Plus, Trash2, Camera, Upload, Calculator, Weight, Package, Eye, X as XIcon, ImageIcon, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { DEMO_AIR_RECEIVED } from "@/lib/fixtures/demo"
import { nextRecordId } from "@/lib/next-id"

const initialClients = ["Apex Pharma Ltd", "Sunrise Electronics", "GlobalTex Fabrics", "MediSupply Corp", "AutoParts India", "Nova Textiles Pvt", "Orient Spices Co", "Vertex Tools Ltd", "BlueLeaf Cosmetics", "Deccan Ceramics Ltd"]
const serviceLevels = ["Standard", "Express", "Priority Overnight", "Economy"]

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type PieceLine = {
  id: number
  pieces: string
  weight: string
  length: string
  width: string
  height: string
  awb: string
}

type Attachment = { id: string; name: string; kind: "photo" | "document"; at: string }

type ReceivedPackage = {
  id: string; shipper: string; consignee: string; service: string
  route: string; pieces: number; actual: number; volumetric: number
  chargeable: number; hold: string; receivedAt: string; attachments: Attachment[]
}

/** Where the photo/document modal should attach its result. */
type AttachTarget = { scope: "draft" } | { scope: "row"; id: string }

function volWeight(l: string, w: string, h: string, pcs: string) {
  const vol = (parseFloat(l) || 0) * (parseFloat(w) || 0) * (parseFloat(h) || 0) / 5000
  return vol * (parseFloat(pcs) || 1)
}

export default function AirCapturePage() {
  const [clients, setClients] = useState<string[]>(initialClients)
  const [shipper, setShipper] = useState("")
  const [consignee, setConsignee] = useState("")
  const [shipperSearch, setShipperSearch] = useState("")
  const [showShipperDrop, setShowShipperDrop] = useState(false)
  const [service, setService] = useState("Express")
  const [preRoute, setPreRoute] = useState<"" | "local" | "export">("")
  const [lines, setLines] = useState<PieceLine[]>([
    { id: 1, pieces: "", weight: "", length: "", width: "", height: "", awb: "" }
  ])
  const [draftAttachments, setDraftAttachments] = useState<Attachment[]>([])
  const [received, setReceived] = useState<ReceivedPackage[]>(DEMO_AIR_RECEIVED)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const [newShipperOpen, setNewShipperOpen] = useState(false)
  const [newShipperName, setNewShipperName] = useState("")
  const [newShipperError, setNewShipperError] = useState("")

  const [photoTarget, setPhotoTarget] = useState<AttachTarget | null>(null)
  const [photoLabel, setPhotoLabel] = useState("")
  const [photoCaptured, setPhotoCaptured] = useState(false)
  const [photoError, setPhotoError] = useState("")

  const [docTarget, setDocTarget] = useState<AttachTarget | null>(null)
  const [docName, setDocName] = useState("")
  const [docType, setDocType] = useState("")
  const [docErrors, setDocErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<ReceivedPackage | null>(null)
  const [voidTarget, setVoidTarget] = useState<ReceivedPackage | null>(null)

  const totalActual = lines.reduce((s, l) => s + (parseFloat(l.weight) || 0) * (parseFloat(l.pieces) || 1), 0)
  const totalVol = lines.reduce((s, l) => s + volWeight(l.length, l.width, l.height, l.pieces), 0)
  const chargeable = Math.max(totalActual, totalVol)
  const totalPieces = lines.reduce((s, l) => s + (parseFloat(l.pieces) || 0), 0)

  const addLine = () => setLines(p => [...p, { id: Date.now(), pieces: "", weight: "", length: "", width: "", height: "", awb: "" }])
  const removeLine = (id: number) => setLines(p => p.filter(l => l.id !== id))
  const update = (id: number, f: keyof PieceLine, v: string) => setLines(p => p.map(l => l.id === id ? { ...l, [f]: v } : l))

  function attach(target: AttachTarget, att: Attachment) {
    if (target.scope === "draft") {
      setDraftAttachments(prev => [...prev, att])
    } else {
      setReceived(prev => prev.map(r => r.id === target.id ? { ...r, attachments: [...r.attachments, att] } : r))
    }
  }

  function addShipper() {
    const name = newShipperName.trim()
    if (!name) { setNewShipperError("Shipper name is required"); return }
    if (clients.some(c => c.toLowerCase() === name.toLowerCase())) { setNewShipperError("This shipper already exists"); return }
    setClients(prev => [name, ...prev])
    setShipper(name)
    setShipperSearch(name)
    setShowShipperDrop(false)
    setNewShipperOpen(false)
    setNewShipperName("")
    setNewShipperError("")
    notify.success("Shipper created", `${name} is now selectable as an owner party.`)
  }

  function openPhoto(target: AttachTarget) {
    setPhotoTarget(target)
    setPhotoLabel("")
    setPhotoCaptured(false)
    setPhotoError("")
  }

  function savePhoto() {
    if (!photoTarget) return
    if (!photoCaptured) { setPhotoError("Capture an image before attaching"); return }
    const label = photoLabel.trim() || "Package photo"
    const now = new Date()
    const att: Attachment = {
      id: `IMG-${now.getTime()}`,
      name: `${label}.jpg`,
      kind: "photo",
      at: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
    }
    attach(photoTarget, att)
    notify.success("Photo attached", photoTarget.scope === "draft"
      ? `${att.name} added to the package being captured.`
      : `${att.name} recorded against ${photoTarget.id}.`)
    setPhotoTarget(null)
  }

  function openDoc(target: AttachTarget) {
    setDocTarget(target)
    setDocName("")
    setDocType("")
    setDocErrors({})
  }

  function saveDoc() {
    if (!docTarget) return
    const e: Record<string, string> = {}
    if (!docName.trim()) e.name = "File name is required"
    if (!docType) e.type = "Select a document type"
    setDocErrors(e)
    if (Object.keys(e).length > 0) return
    const now = new Date()
    const att: Attachment = {
      id: `DOC-${now.getTime()}`,
      name: `${docName.trim()} (${docType})`,
      kind: "document",
      at: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
    }
    attach(docTarget, att)
    notify.success("Document uploaded", `${att.name} attached.`)
    setDocTarget(null)
  }

  function removeDraftAttachment(id: string) {
    setDraftAttachments(prev => prev.filter(a => a.id !== id))
  }

  function validateReceive() {
    const e: Record<string, string> = {}
    if (!shipper) e.shipper = "Select or create a shipper"
    if (!consignee.trim()) e.consignee = "Consignee is required"
    if (totalPieces < 1) e.lines = "Enter the piece count on at least one package line"
    else if (chargeable <= 0) e.lines = "Enter weight or dimensions so a chargeable weight can be computed"
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  function receivePackage() {
    if (!validateReceive()) {
      notify.error("Cannot receive package", "Fix the highlighted fields before receiving.")
      return
    }
    const now = new Date()
    const next: ReceivedPackage = {
      id: nextRecordId(received.map(r => r.id), /^PKG-(\d+)$/, "PKG-", 4),
      shipper,
      consignee: consignee.trim(),
      service,
      route: preRoute === "local" ? "Local" : preRoute === "export" ? "Export" : "Unrouted",
      pieces: totalPieces,
      actual: Number(totalActual.toFixed(2)),
      volumetric: Number(totalVol.toFixed(2)),
      chargeable: Number(chargeable.toFixed(2)),
      hold: `HOLD-${String(received.length + 1).padStart(2, "0")}`,
      receivedAt: `${now.toISOString().slice(0, 10)} ${now.toTimeString().slice(0, 5)}`,
      attachments: draftAttachments,
    }
    setReceived(prev => [next, ...prev])
    // Reset the capture form for the next package.
    setShipper("")
    setShipperSearch("")
    setConsignee("")
    setService("Express")
    setPreRoute("")
    setLines([{ id: Date.now(), pieces: "", weight: "", length: "", width: "", height: "", awb: "" }])
    setDraftAttachments([])
    setFormErrors({})
    notify.success("Package received", `${next.id} — ${next.chargeable} kg chargeable, held at ${next.hold}.`)
  }

  function voidPackage(p: ReceivedPackage) {
    setReceived(prev => prev.filter(x => x.id !== p.id))
    notify.warning("Receipt voided", `${p.id} has been removed from today's receipts.`)
  }

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
                  className={cn("w-full px-3 py-2.5 rounded-lg border bg-background text-sm outline-none focus:border-brand",
                    formErrors.shipper ? "border-danger" : "border-border")} />
                {formErrors.shipper && <p className="mt-1 text-xs text-danger">{formErrors.shipper}</p>}
                {showShipperDrop && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
                    {clients.filter(c => c.toLowerCase().includes(shipperSearch.toLowerCase())).map(c => (
                      <button key={c} onClick={() => { setShipper(c); setShipperSearch(c); setShowShipperDrop(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted/50 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-brand/20 text-brand text-[10px] font-bold flex items-center justify-center">{c.slice(0,2).toUpperCase()}</div>
                        {c}
                      </button>
                    ))}
                    <button onClick={() => { setShowShipperDrop(false); setNewShipperName(shipperSearch); setNewShipperError(""); setNewShipperOpen(true) }}
                      className="w-full text-left px-4 py-2.5 text-sm text-brand hover:bg-brand/10 border-t border-border flex items-center gap-2">
                      <Plus className="w-3.5 h-3.5" /> New Shipper
                    </button>
                  </div>
                )}
              </div>
              <div>
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Consignee</label>
                <input value={consignee} onChange={e => setConsignee(e.target.value)}
                  placeholder="Consignee name..."
                  className={cn("w-full px-3 py-2.5 rounded-lg border bg-background text-sm outline-none focus:border-brand",
                    formErrors.consignee ? "border-danger" : "border-border")} />
                {formErrors.consignee && <p className="mt-1 text-xs text-danger">{formErrors.consignee}</p>}
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
                      {lines.length > 1 && <button onClick={() => removeLine(l.id)} title="Remove package line" className="text-danger hover:text-danger/80"><Trash2 className="w-3.5 h-3.5" /></button>}
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
              {formErrors.lines && <p className="text-xs text-danger">{formErrors.lines}</p>}
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
              <button onClick={() => openPhoto({ scope: "draft" })} title="Capture a package photo"
                className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground text-sm hover:border-brand/40 hover:text-foreground transition-colors">
                <Camera className="w-4 h-4" /> Photo Capture
              </button>
              <button onClick={() => openDoc({ scope: "draft" })} title="Upload a supporting document"
                className="flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-border/60 text-muted-foreground text-sm hover:border-brand/40 hover:text-foreground transition-colors">
                <Upload className="w-4 h-4" /> Upload Documents
              </button>
            </div>
            {draftAttachments.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {draftAttachments.map(a => (
                  <span key={a.id} className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-muted/50 text-muted-foreground">
                    {a.kind === "photo" ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                    {a.name}
                    <button onClick={() => removeDraftAttachment(a.id)} title={`Remove ${a.name}`} className="text-muted-foreground hover:text-danger">
                      <XIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              <div className="p-2.5 rounded-xl border-2 border-brand bg-brand/10">
                <p className="text-[10px] text-brand font-semibold uppercase tracking-wider mb-1">Chargeable Weight</p>
                <p className="text-2xl font-bold text-brand">{chargeable > 0 ? `${chargeable.toFixed(2)} kg` : "—"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">max(actual, volumetric)</p>
              </div>
            </div>
            <button onClick={receivePackage} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 transition-colors shadow-lg shadow-[#F7941D]/20">
              <Package className="w-4 h-4" /> Receive Package
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Assigns hold location + logs handling-in event</p>
          </div>
        </div>
      </div>

      {/* Received packages */}
      <div className="mt-8">
        <h2 className="text-sm font-bold text-foreground mb-3">Received Today</h2>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                {["Package", "Shipper", "Consignee", "Pcs", "Chargeable", "Route", "Hold", "Attachments", "Actions"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {received.map(p => (
                <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono font-semibold text-brand">{p.id}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{p.shipper}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.consignee}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{p.pieces}</td>
                  <td className="px-4 py-3 text-xs font-semibold text-foreground">{p.chargeable} kg</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      p.route === "Local" ? "bg-blue-500/15 text-blue-400" : p.route === "Export" ? "bg-amber-500/15 text-amber-400" : "bg-muted text-muted-foreground")}>
                      {p.route}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{p.hold}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{p.attachments.length}</td>
                  <td className="px-4 py-3">
                    <RowActions
                      items={[
                        { label: "View receipt details", icon: <Eye />, onSelect: () => setDetail(p) },
                        { label: "Capture photo for this package", icon: <Camera />, onSelect: () => openPhoto({ scope: "row", id: p.id }) },
                        { label: "Upload document for this package", icon: <Upload />, onSelect: () => openDoc({ scope: "row", id: p.id }) },
                        { label: "Void this receipt", icon: <Trash2 />, onSelect: () => setVoidTarget(p), tone: "danger" as const },
                      ]}
                    />
                  </td>
                </tr>
              ))}
              {received.length === 0 && (
                <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No packages received yet — complete the form above and hit Receive Package.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New shipper */}
      <Modal
        open={newShipperOpen}
        onOpenChange={(o) => { setNewShipperOpen(o); if (!o) { setNewShipperName(""); setNewShipperError("") } }}
        title="New Shipper"
        description="Create an owner party for this package"
        size="sm"
        footer={<ModalActions onCancel={() => setNewShipperOpen(false)} onSubmit={addShipper} submitLabel="Create Shipper" />}
      >
        <Field label="Shipper Name" required error={newShipperError}>
          <TextInput value={newShipperName} invalid={!!newShipperError} onChange={e => setNewShipperName(e.target.value)} placeholder="e.g. Nova Logistics Pvt Ltd" />
        </Field>
      </Modal>

      {/* Photo capture */}
      <Modal
        open={!!photoTarget}
        onOpenChange={(o) => { if (!o) { setPhotoTarget(null); setPhotoError("") } }}
        title="Photo Capture"
        description={photoTarget?.scope === "row" ? `Attach an image to ${photoTarget.id}` : "Attach an image to the package being captured"}
        size="sm"
        footer={<ModalActions onCancel={() => setPhotoTarget(null)} onSubmit={savePhoto} submitLabel="Attach Photo" disabled={!photoCaptured} />}
      >
        <div className="space-y-4">
          {/* Simulated camera viewfinder / preview */}
          <div className={cn(
            "flex h-44 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-colors",
            photoCaptured ? "border-success/50 bg-success/5" : "border-border bg-muted/30",
          )}>
            {photoCaptured ? (
              <>
                <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-brand/30 to-brand/10 text-brand">
                  <ImageIcon className="h-7 w-7" />
                </div>
                <p className="text-xs font-semibold text-success">Image captured · 1280×960</p>
                <button onClick={() => setPhotoCaptured(false)} className="text-[11px] text-muted-foreground underline hover:text-foreground">
                  Retake
                </button>
              </>
            ) : (
              <>
                <Camera className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-xs text-muted-foreground">Camera preview</p>
              </>
            )}
          </div>
          {!photoCaptured && (
            <button
              onClick={() => { setPhotoCaptured(true); setPhotoError("") }}
              className="w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand/90"
            >
              Capture Image
            </button>
          )}
          <Field label="Label" error={photoError} hint="Optional — defaults to “Package photo”">
            <TextInput value={photoLabel} invalid={!!photoError} onChange={e => setPhotoLabel(e.target.value)} placeholder="e.g. Damaged corner" />
          </Field>
        </div>
      </Modal>

      {/* Upload document */}
      <Modal
        open={!!docTarget}
        onOpenChange={(o) => { if (!o) { setDocTarget(null); setDocErrors({}) } }}
        title="Upload Documents"
        description={docTarget?.scope === "row" ? `Attach a document to ${docTarget.id}` : "Attach a document to the package being captured"}
        size="sm"
        footer={<ModalActions onCancel={() => setDocTarget(null)} onSubmit={saveDoc} submitLabel="Attach Document" />}
      >
        <div className="space-y-4">
          <Field label="File Name" required error={docErrors.name}>
            <TextInput value={docName} invalid={!!docErrors.name} onChange={e => setDocName(e.target.value)} placeholder="e.g. commercial-invoice.pdf" />
          </Field>
          <Field label="Document Type" required error={docErrors.type}>
            <Select value={docType} invalid={!!docErrors.type} onChange={e => setDocType(e.target.value)}
              options={["Commercial Invoice", "Packing List", "MSDS / DG Declaration", "Shipper Letter of Instruction", "Other"]}
              placeholder="Select Type" />
          </Field>
        </div>
      </Modal>

      {/* Receipt detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Package receipt detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Package" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Shipper" value={detail.shipper} />
            <DetailRow label="Consignee" value={detail.consignee} />
            <DetailRow label="Service Level" value={detail.service} />
            <DetailRow label="Pre-set Route" value={detail.route} />
            <DetailRow label="Pieces" value={detail.pieces} />
            <DetailRow label="Actual Weight" value={`${detail.actual} kg`} />
            <DetailRow label="Volumetric Weight" value={`${detail.volumetric} kg`} />
            <DetailRow label="Chargeable Weight" value={`${detail.chargeable} kg`} />
            <DetailRow label="Hold Location" value={<span className="font-mono">{detail.hold}</span>} />
            <DetailRow label="Received At" value={detail.receivedAt} />
            <DetailRow
              label="Attachments"
              value={detail.attachments.length === 0
                ? "None"
                : <span className="flex flex-col items-end gap-1">
                    {detail.attachments.map(a => (
                      <span key={a.id} className="text-xs text-muted-foreground">{a.name} · {a.at}</span>
                    ))}
                  </span>}
            />
          </div>
        )}
      </Drawer>

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!voidTarget}
        onOpenChange={(o) => !o && setVoidTarget(null)}
        title="Void this receipt?"
        message={`${voidTarget?.id} for ${voidTarget?.consignee} will be removed from today's receipts along with its attachments.`}
        confirmLabel="Void Receipt"
        cancelLabel="Keep It"
        onConfirm={() => voidTarget && voidPackage(voidTarget)}
      />
    </div>
  )
}
