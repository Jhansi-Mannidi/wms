"use client"

import { useState } from "react"
import { Plus, Container, ChevronDown, CheckCircle2, FileText, Printer, Send, ChevronRight, Eye, Trash2, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { LCL_LOAD_PLAN_CONTAINERS, LCL_LOAD_PLAN_TEMPLATES } from "@/lib/fixtures/lcl"

const CBM_MAX = 28.3
const KG_MAX = 21700

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type ShipperLine = { id: string; shipper: string; cbm: number; kg: number; pieces: number }

type ContainerPlan = {
  id: string
  route: string
  vessel: string
  voyage: string
  etd: string
  eta: string
  cbm: number
  kg: number
  shippers: ShipperLine[]
  status: string
}

const initialContainers: ContainerPlan[] = LCL_LOAD_PLAN_CONTAINERS

type Template = { name: string; route: string; vessel: string; voyage: string; description: string }

const templates: Template[] = LCL_LOAD_PLAN_TEMPLATES

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  confirmed: { bg: "bg-success/15", text: "text-success", label: "Confirmed" },
  building:  { bg: "bg-warning/15", text: "text-warning",  label: "Building" },
  planned:   { bg: "bg-brand/15",   text: "text-brand",    label: "Planned" },
  completed: { bg: "bg-success/15", text: "text-success", label: "Completed" },
  cancelled: { bg: "bg-danger/15",  text: "text-danger",  label: "Cancelled" },
}

const ROUTES = ["INBOM → CNSHA", "INBOM → SGSIN", "INMAA → AEDXB", "INBOM → USNYC", "INNSA → NLRTM"] as const
const VESSELS = ["EVER GIVEN", "MSC DIANA", "MAERSK KOTKA", "CMA CGM MARCO POLO", "OOCL SPAIN"] as const

const TABS = ["Active Containers", "Completed", "Cancelled", "Templates"] as const

const emptyContainerForm = { route: "", vessel: "", voyage: "", etd: "", eta: "" }
const emptyLineForm = { id: "", shipper: "", cbm: "", kg: "", pieces: "" }

function withTotals(con: ContainerPlan): ContainerPlan {
  return {
    ...con,
    cbm: Number(con.shippers.reduce((s, x) => s + x.cbm, 0).toFixed(2)),
    kg: con.shippers.reduce((s, x) => s + x.kg, 0),
  }
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
  const [containers, setContainers] = useState<ContainerPlan[]>(initialContainers)
  const [expanded, setExpanded] = useState<string[]>(["LCL-CON-0041"])
  const [tab, setTab] = useState<string>(TABS[0])

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyContainerForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [lineTarget, setLineTarget] = useState<ContainerPlan | null>(null)
  const [lineForm, setLineForm] = useState(emptyLineForm)
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<ContainerPlan | null>(null)
  const [lineDetail, setLineDetail] = useState<{ con: ContainerPlan; line: ShipperLine } | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ContainerPlan | null>(null)
  const [removeLine, setRemoveLine] = useState<{ con: ContainerPlan; line: ShipperLine } | null>(null)

  const toggle = (id: string) => setExpanded(e => e.includes(id) ? e.filter(x => x !== id) : [...e, id])

  const visible = containers.filter(c =>
    tab === "Active Containers" ? c.status === "building" || c.status === "confirmed" || c.status === "planned"
    : tab === "Completed" ? c.status === "completed"
    : tab === "Cancelled" ? c.status === "cancelled"
    : false
  )

  function nextContainerId() {
    const nums = containers.map(c => Number(c.id.replace("LCL-CON-", ""))).filter(n => !Number.isNaN(n))
    const next = (nums.length ? Math.max(...nums) : 40) + 1
    return `LCL-CON-${String(next).padStart(4, "0")}`
  }

  function validateContainer() {
    const e: Record<string, string> = {}
    if (!form.route) e.route = "Select a route"
    if (!form.vessel) e.vessel = "Select a vessel"
    if (!form.voyage.trim()) e.voyage = "Voyage reference is required"
    if (!form.etd.trim()) e.etd = "ETD is required"
    if (!form.eta.trim()) e.eta = "ETA is required"
    else if (form.etd.trim() && form.eta < form.etd) e.eta = "ETA must be on or after ETD"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function fmtDate(iso: string) {
    const d = new Date(`${iso}T00:00:00`)
    if (Number.isNaN(d.getTime())) return iso
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  function createContainer() {
    if (!validateContainer()) return
    const next: ContainerPlan = {
      id: nextContainerId(),
      route: form.route,
      vessel: form.vessel,
      voyage: form.voyage.trim().toUpperCase(),
      etd: fmtDate(form.etd),
      eta: fmtDate(form.eta),
      cbm: 0,
      kg: 0,
      shippers: [],
      status: "building",
    }
    setContainers(prev => [next, ...prev])
    setExpanded(e => [...e, next.id])
    setTab("Active Containers")
    setCreateOpen(false)
    setForm(emptyContainerForm)
    setErrors({})
    notify.success("Container created", `${next.id} — ${next.route} on ${next.vessel} ${next.voyage}.`)
  }

  function useTemplate(t: Template) {
    const next: ContainerPlan = {
      id: nextContainerId(),
      route: t.route,
      vessel: t.vessel,
      voyage: t.voyage,
      etd: "TBA",
      eta: "TBA",
      cbm: 0,
      kg: 0,
      shippers: [],
      status: "building",
    }
    setContainers(prev => [next, ...prev])
    setExpanded(e => [...e, next.id])
    setTab("Active Containers")
    notify.success("Container created from template", `${next.id} — ${t.name}.`)
  }

  function validateLine() {
    const e: Record<string, string> = {}
    if (!lineForm.id.trim()) e.id = "Receipt reference is required"
    else if (lineTarget?.shippers.some(s => s.id.toLowerCase() === lineForm.id.trim().toLowerCase())) e.id = "That receipt is already on this container"
    if (!lineForm.shipper.trim()) e.shipper = "Shipper name is required"
    if (!lineForm.cbm.trim()) e.cbm = "CBM is required"
    else if (!/^\d+(\.\d+)?$/.test(lineForm.cbm) || Number(lineForm.cbm) <= 0) e.cbm = "Enter a positive number"
    if (!lineForm.kg.trim()) e.kg = "Weight is required"
    else if (!/^\d+(\.\d+)?$/.test(lineForm.kg) || Number(lineForm.kg) <= 0) e.kg = "Enter a positive number"
    if (!lineForm.pieces.trim()) e.pieces = "Pieces are required"
    else if (!/^\d+$/.test(lineForm.pieces) || Number(lineForm.pieces) < 1) e.pieces = "Enter a positive whole number"
    setLineErrors(e)
    return Object.keys(e).length === 0
  }

  function addLine() {
    if (!lineTarget || !validateLine()) return
    const line: ShipperLine = {
      id: lineForm.id.trim().toUpperCase(),
      shipper: lineForm.shipper.trim(),
      cbm: Number(lineForm.cbm),
      kg: Number(lineForm.kg),
      pieces: Number(lineForm.pieces),
    }
    const targetId = lineTarget.id
    setContainers(prev => prev.map(c => c.id === targetId ? withTotals({ ...c, shippers: [...c.shippers, line] }) : c))
    setLineTarget(null)
    setLineForm(emptyLineForm)
    setLineErrors({})
    notify.success("Receipt added", `${line.id} (${line.cbm} CBM) loaded onto ${targetId}.`)
  }

  function dropLine(conId: string, line: ShipperLine) {
    setContainers(prev => prev.map(c => c.id === conId ? withTotals({ ...c, shippers: c.shippers.filter(s => s.id !== line.id) }) : c))
    notify.warning("Receipt removed", `${line.id} was taken off ${conId}.`)
  }

  function setStatus(con: ContainerPlan, status: string, title: string, message: string) {
    setContainers(prev => prev.map(c => c.id === con.id ? { ...c, status } : c))
    notify.success(title, message)
  }

  function cancelContainer(con: ContainerPlan) {
    setContainers(prev => prev.map(c => c.id === con.id ? { ...c, status: "cancelled" } : c))
    notify.warning("Container cancelled", `${con.id} has been cancelled and removed from the active plan.`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {TABS.map(t => (
          <button key={t} type="button" onClick={() => setTab(t)} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            tab === t ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Container className="w-4 h-4 text-brand" />
            <span className="text-sm font-bold text-foreground">
              {tab === "Templates"
                ? `Load Plan Templates — ${templates.length} saved`
                : `Load Plans — ${visible.length} ${tab === "Active Containers" ? "active" : tab.toLowerCase()} containers`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => { setForm(emptyContainerForm); setErrors({}); setCreateOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> New Container
          </button>
        </div>

        {tab === "Templates" && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templates.map(t => (
              <div key={t.name} className="bg-card border border-border rounded-xl p-5 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-brand/10 flex items-center justify-center text-brand shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-foreground">{t.name}</p>
                    <p className="text-[11px] text-muted-foreground">{t.route} · {t.vessel}</p>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">{t.description}</p>
                <button
                  onClick={() => useTemplate(t)}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Create Container from Template
                </button>
              </div>
            ))}
          </div>
        )}

        {tab !== "Templates" && visible.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 rounded-xl border border-dashed border-border text-muted-foreground">
            <Container className="w-10 h-10 mb-2 opacity-30" />
            <p className="text-sm font-medium">No {tab.toLowerCase().replace(" containers", "")} containers</p>
            <p className="text-xs mt-1">Create a container to start building a load plan.</p>
          </div>
        )}

        {tab !== "Templates" && visible.map(con => {
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
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setDetail(con) }}
                      title="View container details"
                      className="font-bold text-foreground text-[13px] hover:text-brand hover:underline"
                    >
                      {con.id}
                    </button>
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
                {/* stop the row's expand/collapse handler from firing when using the menu */}
                <span onClick={(e) => e.stopPropagation()} className="shrink-0 mt-1.5">
                  <RowActions
                    items={[
                      { label: "View container details", icon: <Eye />, onSelect: () => setDetail(con) },
                      ...(con.status === "building" || con.status === "confirmed"
                        ? [{ label: "Cancel container", icon: <XCircle />, onSelect: () => setCancelTarget(con), tone: "danger" as const }]
                        : []),
                    ]}
                  />
                </span>
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
                        <tr key={sh.id} onClick={() => setLineDetail({ con, line: sh })} className={cn("border-b border-border/30 hover:bg-muted/10 transition-colors cursor-pointer", i % 2 !== 0 && "bg-muted/5")}>
                          <td className="px-4 py-2.5 font-mono text-[11px] text-brand">{sh.id}</td>
                          <td className="px-4 py-2.5 font-medium text-foreground">{sh.shipper}</td>
                          <td className="px-4 py-2.5">{sh.cbm.toFixed(1)}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{sh.kg.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-muted-foreground">{sh.pieces}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2">
                              <button onClick={(e) => { e.stopPropagation(); setLineDetail({ con, line: sh }) }} title="View HBL detail" className="text-[11px] text-brand hover:underline flex items-center gap-0.5">HBL <ChevronRight className="w-3 h-3" /></button>
                              {con.status === "building" && (
                                <button onClick={(e) => { e.stopPropagation(); setRemoveLine({ con, line: sh }) }} title="Remove receipt from container" className="p-1 rounded text-danger hover:bg-danger/10 transition-colors">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                      {con.shippers.length === 0 && (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-[12px] text-muted-foreground">No receipts loaded yet — add one to start filling this container.</td></tr>
                      )}
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
                  <div className="flex items-center gap-2 px-4 py-3 border-t border-border bg-muted/10 flex-wrap">
                    {con.status === "building" && (
                      <button
                        onClick={() => { setLineTarget(con); setLineForm(emptyLineForm); setLineErrors({}) }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand/40 bg-brand/5 text-[12px] text-brand font-semibold hover:bg-brand/10 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add Receipt
                      </button>
                    )}
                    <button
                      onClick={() => notify.info("MBL draft generated", `Draft master bill for ${con.id} (${con.shippers.length} house lines) is ready for review.`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> Generate MBL Draft
                    </button>
                    <button
                      onClick={() => notify.info("Packing list sent to printer", `${con.id} — ${con.shippers.reduce((s, x) => s + x.pieces, 0)} pieces across ${con.shippers.length} shippers.`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-[12px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Printer className="w-3.5 h-3.5" /> Print Packing List
                    </button>
                    {con.status === "building" && (
                      <button
                        onClick={() => {
                          if (con.shippers.length === 0) {
                            notify.error("Cannot confirm empty container", `Add at least one cargo receipt to ${con.id} first.`)
                            return
                          }
                          setStatus(con, "confirmed", "Load plan confirmed", `${con.id} is confirmed at ${con.cbm.toFixed(1)} CBM / ${con.kg.toLocaleString()} kg.`)
                        }}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors ml-auto"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Confirm Load Plan
                      </button>
                    )}
                    {con.status === "confirmed" && (
                      <button
                        onClick={() => setStatus(con, "completed", "Filed with shipping line", `${con.id} was filed on ${con.vessel} voyage ${con.voyage}.`)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-success/20 text-success text-[12px] font-semibold border border-success/30 hover:bg-success/30 transition-colors ml-auto"
                      >
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

      {/* New container */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyContainerForm); setErrors({}) } }}
        title="New Container"
        description="Open a new container and start building its load plan"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createContainer} submitLabel="Create Container" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Route" required error={errors.route}>
            <Select value={form.route} invalid={!!errors.route} onChange={e => setForm({ ...form, route: e.target.value })} options={ROUTES} placeholder="Select Route" />
          </Field>
          <Field label="Vessel" required error={errors.vessel}>
            <Select value={form.vessel} invalid={!!errors.vessel} onChange={e => setForm({ ...form, vessel: e.target.value })} options={VESSELS} placeholder="Select Vessel" />
          </Field>
          <Field label="Voyage" required error={errors.voyage}>
            <TextInput value={form.voyage} invalid={!!errors.voyage} onChange={e => setForm({ ...form, voyage: e.target.value })} placeholder="e.g. 2025W33" />
          </Field>
          <div className="hidden sm:block" />
          <Field label="ETD" required error={errors.etd}>
            <TextInput type="date" value={form.etd} invalid={!!errors.etd} onChange={e => setForm({ ...form, etd: e.target.value })} />
          </Field>
          <Field label="ETA" required error={errors.eta}>
            <TextInput type="date" value={form.eta} invalid={!!errors.eta} onChange={e => setForm({ ...form, eta: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Add receipt line */}
      <Modal
        open={!!lineTarget}
        onOpenChange={(o) => { if (!o) { setLineTarget(null); setLineForm(emptyLineForm); setLineErrors({}) } }}
        title={`Add Receipt to ${lineTarget?.id ?? ""}`}
        description="Allocate a cargo receipt to this container"
        footer={<ModalActions onCancel={() => setLineTarget(null)} onSubmit={addLine} submitLabel="Add Receipt" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Receipt Ref" required error={lineErrors.id}>
            <TextInput value={lineForm.id} invalid={!!lineErrors.id} onChange={e => setLineForm({ ...lineForm, id: e.target.value })} placeholder="e.g. CR-0901" />
          </Field>
          <Field label="Shipper" required error={lineErrors.shipper}>
            <TextInput value={lineForm.shipper} invalid={!!lineErrors.shipper} onChange={e => setLineForm({ ...lineForm, shipper: e.target.value })} placeholder="e.g. Apex Pharma" />
          </Field>
          <Field label="CBM" required error={lineErrors.cbm}>
            <TextInput value={lineForm.cbm} invalid={!!lineErrors.cbm} onChange={e => setLineForm({ ...lineForm, cbm: e.target.value })} placeholder="e.g. 3.2" inputMode="decimal" />
          </Field>
          <Field label="Weight (kg)" required error={lineErrors.kg}>
            <TextInput value={lineForm.kg} invalid={!!lineErrors.kg} onChange={e => setLineForm({ ...lineForm, kg: e.target.value })} placeholder="e.g. 1600" inputMode="decimal" />
          </Field>
          <Field label="Pieces" required error={lineErrors.pieces}>
            <TextInput value={lineForm.pieces} invalid={!!lineErrors.pieces} onChange={e => setLineForm({ ...lineForm, pieces: e.target.value })} placeholder="e.g. 24" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Container detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Container load plan detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Container" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Route" value={detail.route} />
            <DetailRow label="Vessel" value={detail.vessel} />
            <DetailRow label="Voyage" value={detail.voyage} />
            <DetailRow label="ETD" value={detail.etd} />
            <DetailRow label="ETA" value={detail.eta} />
            <DetailRow label="Shippers" value={`${detail.shippers.length}`} />
            <DetailRow label="Total Pieces" value={`${detail.shippers.reduce((s, x) => s + x.pieces, 0)}`} />
            <DetailRow label="Volume Used" value={`${detail.cbm.toFixed(1)} / ${CBM_MAX} CBM (${((detail.cbm / CBM_MAX) * 100).toFixed(0)}%)`} />
            <DetailRow label="Weight Used" value={`${detail.kg.toLocaleString()} / ${KG_MAX.toLocaleString()} kg (${((detail.kg / KG_MAX) * 100).toFixed(0)}%)`} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[detail.status].bg, statusConfig[detail.status].text)}>{statusConfig[detail.status].label}</span>} />
          </div>
        )}
      </Drawer>

      {/* HBL / receipt line detail drawer */}
      <Drawer
        open={!!lineDetail}
        onOpenChange={(o) => !o && setLineDetail(null)}
        title={lineDetail?.line.id ?? ""}
        description="House bill / cargo receipt detail"
        footer={
          <button onClick={() => setLineDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {lineDetail && (
          <div className="space-y-1">
            <DetailRow label="Receipt Ref" value={<span className="font-mono text-brand">{lineDetail.line.id}</span>} />
            <DetailRow label="Shipper" value={lineDetail.line.shipper} />
            <DetailRow label="Volume" value={`${lineDetail.line.cbm.toFixed(1)} CBM`} />
            <DetailRow label="Weight" value={`${lineDetail.line.kg.toLocaleString()} kg`} />
            <DetailRow label="Pieces" value={`${lineDetail.line.pieces}`} />
            <DetailRow label="Container" value={<span className="font-mono">{lineDetail.con.id}</span>} />
            <DetailRow label="Route" value={lineDetail.con.route} />
            <DetailRow label="Vessel / Voyage" value={`${lineDetail.con.vessel} · ${lineDetail.con.voyage}`} />
            <DetailRow label="ETD / ETA" value={`${lineDetail.con.etd} → ${lineDetail.con.eta}`} />
            <DetailRow label="Share of Container" value={`${((lineDetail.line.cbm / Math.max(lineDetail.con.cbm, 0.01)) * 100).toFixed(0)}% of loaded CBM`} />
          </div>
        )}
      </Drawer>

      {/* Cancel container confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Cancel this container?"
        message={`${cancelTarget?.id} carrying ${cancelTarget?.shippers.length ?? 0} receipts will be cancelled and removed from the active plan.`}
        confirmLabel="Cancel Container"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelContainer(cancelTarget)}
      />

      {/* Remove receipt confirmation */}
      <ConfirmDialog
        open={!!removeLine}
        onOpenChange={(o) => !o && setRemoveLine(null)}
        title="Remove this receipt?"
        message={`${removeLine?.line.id} (${removeLine?.line.cbm} CBM) will be taken off ${removeLine?.con.id} and returned to the pool.`}
        confirmLabel="Remove Receipt"
        cancelLabel="Keep It"
        onConfirm={() => removeLine && dropLine(removeLine.con.id, removeLine.line)}
      />
    </div>
  )
}
