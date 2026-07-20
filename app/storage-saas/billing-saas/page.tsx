"use client"

import { useState } from "react"
import { Search, FileText, TrendingUp, Filter, Download, Plus, Eye, Trash2 } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type BillingRow = {
  id: string; customer: string; initials: string; color: string
  storage: number; handling: number; delivery: number; total: number; cost: number; margin: number
}

const initialBillingRows: BillingRow[] = [
  { id: "B001", customer: "Priya Fashion Store", initials: "PF", color: "bg-emerald-500", storage: 12600, handling: 2400, delivery: 1800, total: 16800, cost: 8000, margin: 8800 },
  { id: "B002", customer: "Spice & Grain Co.", initials: "SG", color: "bg-amber-500", storage: 8400, handling: 1500, delivery: 900, total: 10800, cost: 5400, margin: 5400 },
  { id: "B003", customer: "MedEquip Traders", initials: "ME", color: "bg-orange-500", storage: 6300, handling: 1200, delivery: 600, total: 8100, cost: 4200, margin: 3900 },
  { id: "B004", customer: "TechGadgets Ltd", initials: "TG", color: "bg-violet-500", storage: 2100, handling: 600, delivery: 300, total: 3000, cost: 1500, margin: 1500 },
  { id: "B005", customer: "Rajesh Kumar", initials: "RK", color: "bg-blue-500", storage: 1800, handling: 300, delivery: 0, total: 2100, cost: 900, margin: 1200 },
]

const AVATAR_COLORS = ["bg-emerald-500", "bg-amber-500", "bg-orange-500", "bg-violet-500", "bg-blue-500"]

const INVOICE_STATES = ["All", "Invoice Ready", "Not Generated"] as const

const emptyForm = { customer: "", storage: "", handling: "", delivery: "", cost: "" }
const emptyFilters = { invoiceState: "All", minTotal: "" }

function initialsFor(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

export default function StorageBillingPage() {
  const [rows, setRows] = useState<BillingRow[]>(initialBillingRows)
  const [search, setSearch] = useState("")
  const [period, setPeriod] = useState("Jul 2026")
  const [generatingFor, setGeneratingFor] = useState<string | null>(null)
  const [generated, setGenerated] = useState<string[]>([])

  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(emptyFilters)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)
  const [filterErrors, setFilterErrors] = useState<Record<string, string>>({})

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<BillingRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BillingRow | null>(null)

  const filtersActive = filters.invoiceState !== "All" || filters.minTotal.trim() !== ""

  const filtered = rows.filter(r => {
    if (!r.customer.toLowerCase().includes(search.toLowerCase())) return false
    if (filters.invoiceState === "Invoice Ready" && !generated.includes(r.id)) return false
    if (filters.invoiceState === "Not Generated" && generated.includes(r.id)) return false
    if (filters.minTotal.trim() !== "" && r.total < Number(filters.minTotal)) return false
    return true
  })

  const totalRevenue = filtered.reduce((s, r) => s + r.total, 0)
  const totalCost = filtered.reduce((s, r) => s + r.cost, 0)
  const netMargin = totalRevenue - totalCost

  const handleGenerate = (id: string) => {
    setGeneratingFor(id)
    setTimeout(() => {
      setGenerated(p => [...p, id])
      setGeneratingFor(null)
      const row = rows.find(r => r.id === id)
      notify.success("Invoice generated", `${row?.customer ?? id} — ₹${row?.total.toLocaleString() ?? ""} for ${period}`)
    }, 1000)
  }

  function validate() {
    const e: Record<string, string> = {}
    const num = (v: string) => /^\d+(\.\d+)?$/.test(v.trim())
    if (!form.customer.trim()) e.customer = "Customer name is required"
    else if (rows.some(r => r.customer.toLowerCase() === form.customer.trim().toLowerCase())) e.customer = "This customer already has a billing line"
    if (!form.storage.trim()) e.storage = "Storage rent is required"
    else if (!num(form.storage)) e.storage = "Enter a non-negative number"
    if (!form.handling.trim()) e.handling = "Handling charge is required"
    else if (!num(form.handling)) e.handling = "Enter a non-negative number"
    if (!form.delivery.trim()) e.delivery = "Delivery charge is required"
    else if (!num(form.delivery)) e.delivery = "Enter a non-negative number"
    if (!form.cost.trim()) e.cost = "Leased-in cost is required"
    else if (!num(form.cost)) e.cost = "Enter a non-negative number"
    else if (num(form.storage) && num(form.handling) && num(form.delivery) &&
      Number(form.cost) > Number(form.storage) + Number(form.handling) + Number(form.delivery)) {
      e.cost = "Cost cannot exceed the billed total"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createRow() {
    if (!validate()) return
    const storage = Number(form.storage)
    const handling = Number(form.handling)
    const delivery = Number(form.delivery)
    const cost = Number(form.cost)
    const total = storage + handling + delivery
    const next: BillingRow = {
      id: `B${String(rows.length + 1).padStart(3, "0")}`,
      customer: form.customer.trim(),
      initials: initialsFor(form.customer),
      color: AVATAR_COLORS[rows.length % AVATAR_COLORS.length],
      storage, handling, delivery, total, cost,
      margin: total - cost,
    }
    setRows(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Billing line added", `${next.customer} — ₹${next.total.toLocaleString()} total, ₹${next.margin.toLocaleString()} margin`)
  }

  function applyFilters() {
    const e: Record<string, string> = {}
    if (draftFilters.minTotal.trim() !== "" && !/^\d+(\.\d+)?$/.test(draftFilters.minTotal.trim())) {
      e.minTotal = "Enter a non-negative number"
    }
    setFilterErrors(e)
    if (Object.keys(e).length > 0) return
    setFilters(draftFilters)
    setFilterOpen(false)
    notify.info("Filters applied", `${draftFilters.invoiceState} · min total ₹${draftFilters.minTotal.trim() || "0"}`)
  }

  function clearFilters() {
    setFilters(emptyFilters)
    setDraftFilters(emptyFilters)
    setFilterErrors({})
    setFilterOpen(false)
    notify.info("Filters cleared", "Showing all billing lines.")
  }

  function deleteRow(r: BillingRow) {
    setRows(prev => prev.filter(x => x.id !== r.id))
    setGenerated(prev => prev.filter(id => id !== r.id))
    if (detail?.id === r.id) setDetail(null)
    notify.warning("Billing line voided", `${r.customer} has been removed from ${period}.`)
  }

  return (
    <div className="p-6">
      {/* Portfolio summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">₹{(totalRevenue / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-1">{period}</p>
        </div>
        <div className="p-5 rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Leased-In Cost</p>
            <TrendingUp className="w-4 h-4 text-danger rotate-180" />
          </div>
          <p className="text-2xl font-bold text-danger">₹{(totalCost / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-1">Allocated cost</p>
        </div>
        <div className="p-5 rounded-xl border border-success/30 bg-success/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Net Margin</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-success/20 text-success font-semibold">
              {((netMargin / (totalRevenue || 1)) * 100).toFixed(0)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-success">₹{(netMargin / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-1">Sell − Cost</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customer..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="px-3 py-2 rounded-lg border border-border bg-card text-sm outline-none focus:border-brand text-foreground">
          {["Jul 2026", "Jun 2026", "May 2026"].map(p => <option key={p}>{p}</option>)}
        </select>
        <button
          onClick={() => { setDraftFilters(filters); setFilterErrors({}); setFilterOpen(true) }}
          title="Filter billing lines"
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-sm transition-colors",
            filtersActive
              ? "border-[#F7941D] text-[#F7941D]"
              : "border-border text-muted-foreground hover:text-foreground"
          )}>
          <Filter className="w-4 h-4" /> Filter
          {filtersActive && <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />}
        </button>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-semibold hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Billing Line
        </button>
        <ExportButton data={filtered.map(r => ({ id: r.id, customer: r.customer, storage: r.storage, handling: r.handling, delivery: r.delivery, total: r.total, cost: r.cost, margin: r.margin }))} filename="storage-billing" label="Export All" className="ml-auto" />
      </div>

      {/* Billing table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/20">
                {["Customer", "Storage Rent (₹)", "Handling (₹)", "Delivery (₹)", "Total (₹)", "Margin (₹)", "Action"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <tr key={row.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", row.color)}>{row.initials}</div>
                      <span className="text-xs font-semibold text-foreground">{row.customer}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-foreground">₹{row.storage.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-foreground">₹{row.handling.toLocaleString()}</td>
                  <td className="px-4 py-3 text-xs text-foreground">{row.delivery > 0 ? `₹${row.delivery.toLocaleString()}` : "—"}</td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">₹{row.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold text-success">₹{row.margin.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {generated.includes(row.id) ? (
                        <>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">Invoice Ready</span>
                          <button
                            onClick={() => notify.success("Download started", `Invoice for ${row.customer} — ₹${row.total.toLocaleString()} (${period})`)}
                            title="Download invoice"
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleGenerate(row.id)}
                          disabled={generatingFor === row.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F7941D] text-white text-xs font-semibold hover:bg-[#F7941D]/90 transition-colors disabled:opacity-60">
                          <FileText className="w-3.5 h-3.5" />
                          {generatingFor === row.id ? "Generating..." : "Generate Invoice"}
                        </button>
                      )}
                      <button
                        onClick={() => setDetail(row)}
                        title="View billing detail"
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(row)}
                        title="Void billing line"
                        className="w-6 h-6 flex items-center justify-center rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No billing lines match your search or filters.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-border bg-muted/30">
                <td className="px-4 py-3 text-xs font-bold text-foreground">TOTALS</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{filtered.reduce((s, r) => s + r.storage, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{filtered.reduce((s, r) => s + r.handling, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-xs font-bold text-foreground">₹{filtered.reduce((s, r) => s + r.delivery, 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">₹{totalRevenue.toLocaleString()}</td>
                <td className="px-4 py-3 text-sm font-bold text-success">₹{netMargin.toLocaleString()}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Filter modal */}
      <Modal
        open={filterOpen}
        onOpenChange={(o) => { setFilterOpen(o); if (!o) setFilterErrors({}) }}
        title="Filter Billing Lines"
        description="Narrow the table by invoice state and billed value"
        size="sm"
        footer={
          <>
            <button
              onClick={clearFilters}
              className="mr-auto rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              Clear Filters
            </button>
            <ModalActions onCancel={() => setFilterOpen(false)} onSubmit={applyFilters} submitLabel="Apply Filters" />
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Invoice State">
            <Select value={draftFilters.invoiceState} onChange={e => setDraftFilters({ ...draftFilters, invoiceState: e.target.value })} options={INVOICE_STATES} />
          </Field>
          <Field label="Minimum Total ₹" error={filterErrors.minTotal} hint="Leave blank for no minimum">
            <TextInput value={draftFilters.minTotal} invalid={!!filterErrors.minTotal} onChange={e => setDraftFilters({ ...draftFilters, minTotal: e.target.value })} placeholder="e.g. 5000" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Create billing line */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Billing Line"
        description={`Add a customer billing line for ${period}`}
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createRow} submitLabel="Add Billing Line" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Field label="Customer" required error={errors.customer}>
              <TextInput value={form.customer} invalid={!!errors.customer} onChange={e => setForm({ ...form, customer: e.target.value })} placeholder="e.g. Priya Fashion Store" />
            </Field>
          </div>
          <Field label="Storage Rent ₹" required error={errors.storage}>
            <TextInput value={form.storage} invalid={!!errors.storage} onChange={e => setForm({ ...form, storage: e.target.value })} placeholder="e.g. 12600" inputMode="numeric" />
          </Field>
          <Field label="Handling ₹" required error={errors.handling}>
            <TextInput value={form.handling} invalid={!!errors.handling} onChange={e => setForm({ ...form, handling: e.target.value })} placeholder="e.g. 2400" inputMode="numeric" />
          </Field>
          <Field label="Delivery ₹" required error={errors.delivery}>
            <TextInput value={form.delivery} invalid={!!errors.delivery} onChange={e => setForm({ ...form, delivery: e.target.value })} placeholder="e.g. 1800" inputMode="numeric" />
          </Field>
          <Field label="Leased-In Cost ₹" required error={errors.cost} hint="Margin is computed as total − cost">
            <TextInput value={form.cost} invalid={!!errors.cost} onChange={e => setForm({ ...form, cost: e.target.value })} placeholder="e.g. 8000" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.customer ?? ""}
        description="Billing line detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Billing ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Customer" value={detail.customer} />
            <DetailRow label="Period" value={period} />
            <DetailRow label="Storage Rent" value={`₹${detail.storage.toLocaleString()}`} />
            <DetailRow label="Handling" value={`₹${detail.handling.toLocaleString()}`} />
            <DetailRow label="Delivery" value={detail.delivery > 0 ? `₹${detail.delivery.toLocaleString()}` : "—"} />
            <DetailRow label="Total Billed" value={<span className="font-bold">₹{detail.total.toLocaleString()}</span>} />
            <DetailRow label="Leased-In Cost" value={<span className="text-danger">₹{detail.cost.toLocaleString()}</span>} />
            <DetailRow label="Margin" value={<span className="font-bold text-success">₹{detail.margin.toLocaleString()} ({((detail.margin / (detail.total || 1)) * 100).toFixed(0)}%)</span>} />
            <DetailRow
              label="Invoice Status"
              value={
                generated.includes(detail.id)
                  ? <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">Invoice Ready</span>
                  : <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold">Not Generated</span>
              }
            />
          </div>
        )}
      </Drawer>

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Void this billing line?"
        message={`${deleteTarget?.customer} (₹${deleteTarget?.total.toLocaleString()}) will be removed from ${period}. This cannot be undone.`}
        confirmLabel="Void Line"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteRow(deleteTarget)}
      />
    </div>
  )
}
