"use client"

import { useState } from "react"
import { Plus, X, CheckCircle2, FileText, Download, Send, Wind, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

const uldTypes = ["PMC – 88×125 in (max 1,588 kg)", "AKE – 60.4×61.5 in (max 1,497 kg)", "PAG – 88×125 in (max 4,626 kg)", "LD3 – 79.1×60.4 in (max 1,588 kg)"]
const airlines = ["IndiGo – 6E", "Air India – AI", "SpiceJet – SG", "Emirates – EK", "Qatar Airways – QR"]

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ExportPkg = { id: string; ref: string; consignee: string; weight: number; dest: string; initials: string; color: string }

const initialPool: ExportPkg[] = [
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

const COLORS = ["bg-blue-500", "bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-violet-500", "bg-orange-500"]

const emptyForm = { ref: "", consignee: "", weight: "", dest: "" }

export default function ULDBuildPage() {
  const [selectedUld, setSelectedUld] = useState(uldTypes[0])
  const [selectedAirline, setSelectedAirline] = useState(airlines[0])
  const [flight, setFlight] = useState("")
  const [seal, setSeal] = useState("")
  const [uldId, setUldId] = useState("")
  const [pool, setPool] = useState<ExportPkg[]>(initialPool)
  const [loaded, setLoaded] = useState<ExportPkg[]>([])
  const [confirmed, setConfirmed] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [previewOpen, setPreviewOpen] = useState(false)
  const [resetTarget, setResetTarget] = useState(false)

  const totalLoaded = loaded.reduce((s, p) => s + p.weight, 0)
  const fillPct = Math.min((totalLoaded / ULD_MAX) * 100, 100)
  const remaining = pool.filter(p => !loaded.find(l => l.id === p.id))

  const addToUld = (pkg: ExportPkg) => {
    if (totalLoaded + pkg.weight > ULD_MAX) {
      notify.error("ULD capacity exceeded", `Adding ${pkg.ref} would exceed the ${ULD_MAX} kg limit.`)
      return
    }
    setLoaded(prev => [...prev, pkg])
    notify.success("Loaded into ULD", `${pkg.ref} — ${pkg.weight} kg added (${(totalLoaded + pkg.weight).toFixed(1)} kg total).`)
  }

  const removeFromUld = (id: string) => {
    const pkg = loaded.find(p => p.id === id)
    setLoaded(prev => prev.filter(p => p.id !== id))
    if (pkg) notify.info("Removed from ULD", `${pkg.ref} returned to the export pool.`)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.ref.trim()) e.ref = "Shipment reference is required"
    else if (pool.some(p => p.ref.toLowerCase() === form.ref.trim().toLowerCase())) e.ref = "This reference is already in the pool"
    if (!form.consignee.trim()) e.consignee = "Consignee is required"
    if (!form.weight.trim()) e.weight = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(form.weight) || Number(form.weight) <= 0) e.weight = "Enter a positive number of kg"
    if (!form.dest.trim()) e.dest = "Destination is required"
    else if (!/^[A-Za-z]{3}$/.test(form.dest.trim())) e.dest = "Use a 3-letter airport code"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createPackage() {
    if (!validate()) return
    const words = form.consignee.trim().split(/\s+/)
    const initials = ((words[0]?.[0] ?? "") + (words[1]?.[0] ?? words[0]?.[1] ?? "")).toUpperCase()
    const next: ExportPkg = {
      id: `p${Date.now()}`,
      ref: form.ref.trim().toUpperCase(),
      consignee: form.consignee.trim(),
      weight: Number(form.weight),
      dest: form.dest.trim().toUpperCase(),
      initials,
      color: COLORS[pool.length % COLORS.length],
    }
    setPool(prev => [...prev, next])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Package added to pool", `${next.ref} — ${next.weight} kg to ${next.dest}.`)
  }

  function confirmBuild() {
    setConfirmed(true)
    notify.success("ULD handed off", `${uldId || "ULD"} on ${flight} sealed with ${seal} — ${loaded.length} package(s), ${totalLoaded.toFixed(1)} kg.`)
  }

  function resetBuild() {
    setLoaded([])
    setConfirmed(false)
    setSeal("")
    setFlight("")
    setUldId("")
    notify.info("Build reset", "The ULD has been emptied and is ready for a new build.")
  }

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
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">{remaining.length} available</span>
              <button onClick={() => setCreateOpen(true)} title="Add an export package to the pool"
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand text-white text-xs font-semibold hover:bg-brand/90 transition-colors">
                <Plus className="w-3 h-3" /> New Package
              </button>
            </div>
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
                    <button onClick={() => addToUld(pkg)} title={`Load ${pkg.ref} into the ULD`}
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
                    <button onClick={() => removeFromUld(pkg.id)} title={`Remove ${pkg.ref} from the ULD`} className="text-muted-foreground hover:text-danger transition-colors"><X className="w-3.5 h-3.5" /></button>
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
                <button onClick={() => setPreviewOpen(true)} title="Preview the full manifest" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <FileText className="w-3.5 h-3.5" /> Preview
                </button>
                <button
                  onClick={() => notify.info("Manifest downloaded", `MAWB manifest for ${uldId || "the current ULD"} (${loaded.length} package(s), ${totalLoaded.toFixed(1)} kg) generated as PDF.`)}
                  title="Download the manifest"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground transition-colors">
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
              <button onClick={confirmBuild} disabled={loaded.length === 0 || !seal || !flight}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-[#F7941D]/20">
                <Send className="w-4 h-4" /> Confirm Build & Handoff to Airline
              </button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-bold">
                  <CheckCircle2 className="w-4 h-4" /> ULD Handed Off · Status: Exported/In-Transit
                </div>
                <button onClick={() => setResetTarget(true)} title="Start a new ULD build"
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <RotateCcw className="w-4 h-4" /> Start New Build
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* New export package */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Export Package"
        description="Add a package to the export pool available for ULD build"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createPackage} submitLabel="Add to Pool" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Shipment Reference" required error={errors.ref}>
            <TextInput value={form.ref} invalid={!!errors.ref} onChange={e => setForm({ ...form, ref: e.target.value })} placeholder="e.g. AIR-EXP-007" />
          </Field>
          <Field label="Consignee" required error={errors.consignee}>
            <TextInput value={form.consignee} invalid={!!errors.consignee} onChange={e => setForm({ ...form, consignee: e.target.value })} placeholder="e.g. Nordic Retail AB" />
          </Field>
          <Field label="Weight (kg)" required error={errors.weight}>
            <TextInput value={form.weight} invalid={!!errors.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="e.g. 14.5" inputMode="decimal" />
          </Field>
          <Field label="Destination" required error={errors.dest} hint="3-letter IATA airport code">
            <TextInput value={form.dest} invalid={!!errors.dest} onChange={e => setForm({ ...form, dest: e.target.value })} placeholder="e.g. ARN" />
          </Field>
        </div>
      </Modal>

      {/* Manifest preview */}
      <Modal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="MAWB / Manifest Preview"
        description={`${selectedAirline} · ${flight || "flight TBC"} · ${uldId || "ULD TBC"}`}
        size="lg"
        footer={
          <>
            <button onClick={() => setPreviewOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            <button
              onClick={() => { setPreviewOpen(false); notify.info("Manifest downloaded", `MAWB manifest generated for ${loaded.length} package(s).`) }}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Download PDF
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: "ULD Type", value: selectedUld.split(" – ")[0] },
              { label: "Seal", value: seal || "—" },
              { label: "Packages", value: String(loaded.length) },
              { label: "Gross Weight", value: `${totalLoaded.toFixed(1)} kg` },
            ].map(r => (
              <div key={r.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{r.label}</p>
                <p className="text-sm font-semibold text-foreground">{r.value}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Reference", "Consignee", "Destination", "Weight"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loaded.map(p => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 font-mono text-xs text-brand">{p.ref}</td>
                    <td className="px-4 py-2.5 text-xs text-foreground">{p.consignee}</td>
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{p.dest}</td>
                    <td className="px-4 py-2.5 text-xs font-semibold text-foreground">{p.weight} kg</td>
                  </tr>
                ))}
                {loaded.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-muted-foreground">No packages loaded into this ULD yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>

      {/* Reset confirmation */}
      <ConfirmDialog
        open={resetTarget}
        onOpenChange={setResetTarget}
        title="Start a new build?"
        message="The current ULD contents, flight number and seal will be cleared and every package returned to the export pool."
        confirmLabel="Start New Build"
        cancelLabel="Keep Current"
        onConfirm={resetBuild}
      />
    </div>
  )
}
