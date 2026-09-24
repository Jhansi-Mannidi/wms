"use client"

import { useState } from "react"
import { FileCheck, Send, ChevronDown, ChevronRight, CheckCircle2, Package, Truck, Wrench, DollarSign, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { PageHeader } from "@/components/wms/page-header"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Invoice = {
  id: string; client: string; clientInit: string; clientColor: string
  total: number; gst: number; grandTotal: number; status: string; period: string; sent: boolean
}

const initialInvoices: Invoice[] = [
  { id: "INV-2025-089", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", total: 24680, gst: 4442, grandTotal: 29122, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-090", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", total: 18450, gst: 3321, grandTotal: 21771, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-091", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", total: 11200, gst: 2016, grandTotal: 13216, status: "Under Review", period: "Jul 2025", sent: false },
  { id: "INV-2025-092", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", total: 32000, gst: 5760, grandTotal: 37760, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-093", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", total: 15400, gst: 2772, grandTotal: 18172, status: "Issued", period: "Jul 2025", sent: true },
  { id: "INV-2025-094", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", total: 8750, gst: 1575, grandTotal: 10325, status: "Issued", period: "Jul 2025", sent: true },
  { id: "INV-2025-095", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", total: 41200, gst: 7416, grandTotal: 48616, status: "Under Review", period: "Jul 2025", sent: false },
  { id: "INV-2025-096", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", total: 26900, gst: 4842, grandTotal: 31742, status: "Issued", period: "Jun 2025", sent: true },
  { id: "INV-2025-097", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", total: 19350, gst: 3483, grandTotal: 22833, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-098", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", total: 55600, gst: 10008, grandTotal: 65608, status: "Issued", period: "Jun 2025", sent: true },
  { id: "INV-2025-099", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", total: 12480, gst: 2246, grandTotal: 14726, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-100", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", total: 6300, gst: 1134, grandTotal: 7434, status: "Under Review", period: "Jul 2025", sent: false },
  { id: "INV-2025-101", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", total: 33750, gst: 6075, grandTotal: 39825, status: "Issued", period: "Jun 2025", sent: true },
  { id: "INV-2025-102", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", total: 47800, gst: 8604, grandTotal: 56404, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-103", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", total: 9120, gst: 1642, grandTotal: 10762, status: "Issued", period: "Jun 2025", sent: true },
  { id: "INV-2025-104", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", total: 28400, gst: 5112, grandTotal: 33512, status: "Under Review", period: "Jul 2025", sent: false },
  { id: "INV-2025-105", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", total: 21600, gst: 3888, grandTotal: 25488, status: "Issued", period: "Jun 2025", sent: true },
  { id: "INV-2025-106", client: "FreshFarm Organics", clientInit: "FF", clientColor: "bg-orange-500", total: 14250, gst: 2565, grandTotal: 16815, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-107", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", total: 62300, gst: 11214, grandTotal: 73514, status: "Issued", period: "May 2025", sent: true },
  { id: "INV-2025-108", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", total: 17900, gst: 3222, grandTotal: 21122, status: "Under Review", period: "Jul 2025", sent: false },
  { id: "INV-2025-109", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", total: 38400, gst: 6912, grandTotal: 45312, status: "Issued", period: "May 2025", sent: true },
  { id: "INV-2025-110", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", total: 10750, gst: 1935, grandTotal: 12685, status: "Draft", period: "Jul 2025", sent: false },
  { id: "INV-2025-111", client: "Sunrise Electronics", clientInit: "SE", clientColor: "bg-emerald-500", total: 45200, gst: 8136, grandTotal: 53336, status: "Issued", period: "May 2025", sent: true },
  { id: "INV-2025-112", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", total: 7600, gst: 1368, grandTotal: 8968, status: "Under Review", period: "Jun 2025", sent: false },
]

const lineItems = {
  Storage: [
    { desc: "Pallet storage (24 pallet-days @ ₹45)", qty: 24, rate: 45, amount: 1080 },
    { desc: "Rack storage (180 pallet-days @ ₹38)", qty: 180, rate: 38, amount: 6840 },
    { desc: "Cold storage (10 days @ ₹120)", qty: 10, rate: 120, amount: 1200 },
    { desc: "Bulk floor storage (420 sqft-month @ ₹28)", qty: 420, rate: 28, amount: 11760 },
    { desc: "Bonded warehouse storage (55 pallet-days @ ₹74)", qty: 55, rate: 74, amount: 4070 },
    { desc: "Mezzanine bin storage (160 sqft-month @ ₹42)", qty: 160, rate: 42, amount: 6720 },
  ],
  Handling: [
    { desc: "Inbound receipt (480 pcs @ ₹2.5)", qty: 480, rate: 2.5, amount: 1200 },
    { desc: "Outbound dispatch (320 pcs @ ₹3)", qty: 320, rate: 3, amount: 960 },
    { desc: "Pallet in / pallet out (34 pallet-days @ ₹65)", qty: 34, rate: 65, amount: 2210 },
    { desc: "Cross-dock transfer (476 pcs @ ₹1.8)", qty: 476, rate: 1.8, amount: 856.8 },
    { desc: "Returns inspection (88 pcs @ ₹6.5)", qty: 88, rate: 6.5, amount: 572 },
    { desc: "Container destuffing (2 units @ ₹4,200)", qty: 2, rate: 4200, amount: 8400 },
  ],
  VAS: [
    { desc: "Kitting service (50 units @ ₹35)", qty: 50, rate: 35, amount: 1750 },
    { desc: "Labelling (200 units @ ₹8)", qty: 200, rate: 8, amount: 1600 },
    { desc: "Shrink wrapping (45 units @ ₹18)", qty: 45, rate: 18, amount: 810 },
    { desc: "Batch coding & MRP sticker (400 units @ ₹2.75)", qty: 400, rate: 2.75, amount: 1100 },
    { desc: "Re-palletisation (18 pallet-days @ ₹130)", qty: 18, rate: 130, amount: 2340 },
    { desc: "Serial number capture (310 pcs @ ₹5.5)", qty: 310, rate: 5.5, amount: 1705 },
  ],
  Ancillary: [
    { desc: "Temperature monitoring surcharge", qty: 1, rate: 5000, amount: 5000 },
    { desc: "Insurance surcharge (Jul 2025)", qty: 1, rate: 3200, amount: 3200 },
    { desc: "Cycle count audit (Jul 2025)", qty: 1, rate: 8500, amount: 8500 },
    { desc: "Security & CCTV access (Jul 2025)", qty: 1, rate: 2400, amount: 2400 },
    { desc: "Fumigation treatment (12 pallet-days @ ₹210)", qty: 12, rate: 210, amount: 2520 },
  ],
}

const sectionIcons: Record<string, React.ReactNode> = {
  Storage: <Package className="w-4 h-4 text-blue-400" />,
  Handling: <Truck className="w-4 h-4 text-amber-400" />,
  VAS: <Wrench className="w-4 h-4 text-violet-400" />,
  Ancillary: <DollarSign className="w-4 h-4 text-rose-400" />,
}

const statusColors: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Under Review": "bg-warning/15 text-warning",
  Issued: "bg-success/15 text-success",
}

const CLIENTS = ["Apex Pharma Ltd", "GlobalTex Fabrics", "AutoParts India", "MediSupply Corp", "Sunrise Electronics", "FreshFarm Organics"] as const
const CLIENT_META: Record<string, { init: string; color: string }> = {
  "Apex Pharma Ltd": { init: "AP", color: "bg-blue-500" },
  "GlobalTex Fabrics": { init: "GT", color: "bg-amber-500" },
  "AutoParts India": { init: "AI", color: "bg-cyan-500" },
  "MediSupply Corp": { init: "MS", color: "bg-rose-500" },
  "Sunrise Electronics": { init: "SE", color: "bg-emerald-500" },
  "FreshFarm Organics": { init: "FF", color: "bg-orange-500" },
}
const STATUSES = ["Draft", "Under Review"] as const

const emptyForm = { client: "", period: "Jul 2025", total: "", status: "" }

export default function InvoiceRunPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [selectedId, setSelectedId] = useState(initialInvoices[0].id)
  const [expanded, setExpanded] = useState<string[]>(["Storage", "Handling"])
  const [discount, setDiscount] = useState(0)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [issueOpen, setIssueOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null)

  const selectedInv = invoices.find(i => i.id === selectedId) ?? invoices[0]

  const subtotal = Object.values(lineItems).flat().reduce((s, l) => s + l.amount, 0)
  const gst = Math.round((subtotal - discount) * 0.18)
  const grandTotal = subtotal - discount + gst

  const toggleSection = (s: string) =>
    setExpanded(e => e.includes(s) ? e.filter(x => x !== s) : [...e, s])

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client) e.client = "Select a client"
    else if (invoices.some(i => i.client === form.client && i.period === form.period.trim())) e.client = "A draft already exists for this client and period"
    if (!form.period.trim()) e.period = "Billing period is required"
    if (!form.total.trim()) e.total = "Invoice subtotal is required"
    else if (!/^\d+(\.\d+)?$/.test(form.total) || Number(form.total) <= 0) e.total = "Enter a positive amount"
    if (!form.status) e.status = "Select a status"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createInvoice() {
    if (!validate()) return
    const meta = CLIENT_META[form.client]
    const total = Number(form.total)
    const invGst = Math.round(total * 0.18)
    const nextSeq = Math.max(0, ...invoices.map(i => Number(i.id.slice(-3)) || 0)) + 1
    const next: Invoice = {
      id: `INV-2025-${String(nextSeq).padStart(3, "0")}`,
      client: form.client,
      clientInit: meta.init,
      clientColor: meta.color,
      total,
      gst: invGst,
      grandTotal: total + invGst,
      status: form.status,
      period: form.period.trim(),
      sent: false,
    }
    setInvoices(prev => [next, ...prev])
    setSelectedId(next.id)
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Draft invoice created", `${next.id} — ₹${next.grandTotal.toLocaleString()} for ${next.client}`)
  }

  function issueInvoice() {
    setInvoices(prev => prev.map(i => i.id === selectedInv.id
      ? { ...i, status: "Issued", total: subtotal - discount, gst, grandTotal }
      : i))
    notify.success("Invoice issued", `${selectedInv.id} approved and issued for ₹${grandTotal.toLocaleString()}.`)
  }

  function sendToPortal() {
    if (selectedInv.status !== "Issued") {
      notify.warning("Not issued yet", `Approve & issue ${selectedInv.id} before sending it to the client portal.`)
      return
    }
    setInvoices(prev => prev.map(i => i.id === selectedInv.id ? { ...i, sent: true } : i))
    notify.success("Sent to client portal", `${selectedInv.client} can now view ${selectedInv.id}.`)
  }

  function deleteInvoice(inv: Invoice) {
    const remaining = invoices.filter(i => i.id !== inv.id)
    setInvoices(remaining)
    if (selectedId === inv.id && remaining.length) setSelectedId(remaining[0].id)
    notify.warning("Draft deleted", `${inv.id} removed from the invoice run.`)
  }

  if (!invoices.length) {
    return (
      <div className="p-6 h-full overflow-y-auto">
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <p className="text-sm text-muted-foreground">No draft invoices in this run.</p>
          <button onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> New Draft Invoice
          </button>
        </div>
        <Modal
          open={createOpen}
          onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
          title="New Draft Invoice"
          description="Start a client invoice for the current billing period"
          footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createInvoice} submitLabel="Create Draft" />}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Client" required error={errors.client}>
              <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
            </Field>
            <Field label="Billing Period" required error={errors.period}>
              <TextInput value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Jul 2025" />
            </Field>
            <Field label="Subtotal (₹)" required error={errors.total}>
              <TextInput value={form.total} invalid={!!errors.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder="e.g. 24680" inputMode="decimal" />
            </Field>
            <Field label="Status" required error={errors.status}>
              <Select value={form.status} invalid={!!errors.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
            </Field>
          </div>
        </Modal>
      </div>
    )
  }

  return (
    <div className="p-6 h-full flex flex-col">
      <PageHeader title="Invoice Run" description="Turn captured billable events into client invoices" className="mb-5 shrink-0" />
      <div className="flex gap-5 flex-1 min-h-0">
        {/* Left — draft invoice list */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-foreground">Draft Invoices</p>
            <button onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
              title="New draft invoice"
              className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          {invoices.map(inv => (
            <div key={inv.id} className={cn("rounded-xl border transition-all", selectedInv.id === inv.id ? "border-brand bg-brand/10" : "border-border bg-card hover:border-brand/40")}>
              <button onClick={() => setSelectedId(inv.id)} className="w-full text-left p-4 pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", inv.clientColor)}>{inv.clientInit}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{inv.client}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{inv.id}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-foreground">₹{inv.grandTotal.toLocaleString()}</span>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", statusColors[inv.status])}>{inv.status}</span>
                </div>
              </button>
              <div className="flex items-center justify-between px-4 pb-2.5">
                <span className="text-[10px] text-muted-foreground">{inv.sent ? "Sent to portal" : inv.period}</span>
                <button onClick={() => setDeleteTarget(inv)} title={`Delete ${inv.id}`}
                  className="p-1 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right — invoice builder */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Invoice header */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-5 h-5 text-brand" />
                  <span className="font-bold text-foreground">{selectedInv.id}</span>
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusColors[selectedInv.status])}>{selectedInv.status}</span>
                  {selectedInv.sent && <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand/15 text-brand">Sent</span>}
                </div>
                <p className="text-xs text-muted-foreground">Period: {selectedInv.period} · GSTIN: 29AAPCA1234A1Z5 · Place of Supply: Maharashtra</p>
              </div>
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold", selectedInv.clientColor)}>{selectedInv.clientInit}</div>
            </div>
            <p className="text-sm font-semibold text-foreground">{selectedInv.client}</p>
          </div>

          {/* Line item sections */}
          <div className="flex-1 space-y-3">
            {(Object.keys(lineItems) as Array<keyof typeof lineItems>).map(section => (
              <div key={section} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => toggleSection(section)} title={`${expanded.includes(section) ? "Collapse" : "Expand"} ${section}`} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    {sectionIcons[section]}
                    <span className="text-sm font-semibold text-foreground">{section}</span>
                    <span className="text-xs text-muted-foreground">({lineItems[section].length} items)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">₹{lineItems[section].reduce((s, l) => s + l.amount, 0).toLocaleString()}</span>
                    {expanded.includes(section) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {expanded.includes(section) && (
                  <div className="border-t border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/20">
                          {["Description", "Qty", "Rate (₹)", "Amount (₹)"].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems[section].map((l, i) => (
                          <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/10">
                            <td className="px-4 py-2 text-foreground">{l.desc}</td>
                            <td className="px-4 py-2 text-muted-foreground">{l.qty}</td>
                            <td className="px-4 py-2 text-muted-foreground">₹{l.rate}</td>
                            <td className="px-4 py-2 font-semibold text-foreground">₹{l.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary panel */}
          <div className="p-5 rounded-xl border border-brand/30 bg-brand/5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount / Adjustment</span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">₹</span>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-24 text-right bg-background border border-border rounded-md px-2 py-1 text-sm outline-none focus:border-brand" />
                </div>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST @ 18% (HSN 9965)</span><span className="font-semibold text-foreground">₹{gst.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold text-foreground">Grand Total</span>
                <span className="text-xl font-bold text-brand">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => selectedInv.status === "Issued"
                ? notify.info("Already issued", `${selectedInv.id} was already approved and issued.`)
                : setIssueOpen(true)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Approve & Issue
            </button>
            <button onClick={sendToPortal} className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Send className="w-4 h-4" /> Send to Client Portal
            </button>
            <button
              onClick={() => notify.info("Posted to accounting", `${selectedInv.id} queued for the Tally / ERP ledger sync (₹${grandTotal.toLocaleString()}).`)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Plus className="w-4 h-4" /> Post to Accounting
            </button>
          </div>
        </div>
      </div>

      {/* Create draft invoice */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Draft Invoice"
        description="Start a client invoice for the current billing period"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createInvoice} submitLabel="Create Draft" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <Select value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Billing Period" required error={errors.period}>
            <TextInput value={form.period} invalid={!!errors.period} onChange={e => setForm({ ...form, period: e.target.value })} placeholder="e.g. Jul 2025" />
          </Field>
          <Field label="Subtotal (₹)" required error={errors.total} hint={/^\d+(\.\d+)?$/.test(form.total) && Number(form.total) > 0 ? `Grand total with 18% GST: ₹${(Number(form.total) + Math.round(Number(form.total) * 0.18)).toLocaleString()}` : undefined}>
            <TextInput value={form.total} invalid={!!errors.total} onChange={e => setForm({ ...form, total: e.target.value })} placeholder="e.g. 24680" inputMode="decimal" />
          </Field>
          <Field label="Status" required error={errors.status}>
            <Select value={form.status} invalid={!!errors.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Approve & issue confirmation */}
      <ConfirmDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        title="Approve and issue this invoice?"
        message={`${selectedInv.id} for ${selectedInv.client} will be issued at ₹${grandTotal.toLocaleString()} and locked from edits.`}
        confirmLabel="Approve & Issue"
        cancelLabel="Keep as Draft"
        tone="brand"
        onConfirm={issueInvoice}
      />

      {/* Delete draft confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this draft invoice?"
        message={`${deleteTarget?.id} for ${deleteTarget?.client} will be removed from this invoice run. This cannot be undone.`}
        confirmLabel="Delete Draft"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteInvoice(deleteTarget)}
      />
    </div>
  )
}
