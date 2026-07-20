"use client"

import { useState } from "react"
import { Search, Plus, Filter, Eye, Edit, Trash2, Phone, Mail } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"
import { cn } from "@/lib/utils"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Customer = {
  id: string; name: string; phone: string; email: string
  pieces: number; days: number; charges: number
  initials: string; color: string; status: string
}

const initialCustomers: Customer[] = [
  { id: "CS001", name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@example.com", pieces: 24, days: 15, charges: 3600, initials: "RK", color: "bg-blue-500", status: "Active" },
  { id: "CS002", name: "Priya Fashion Store", phone: "+91 87654 32109", email: "priya@fashionstore.in", pieces: 88, days: 42, charges: 21120, initials: "PF", color: "bg-emerald-500", status: "Active" },
  { id: "CS003", name: "TechGadgets Ltd", phone: "+91 76543 21098", email: "info@techgadgets.co", pieces: 12, days: 7, charges: 1680, initials: "TG", color: "bg-violet-500", status: "Active" },
  { id: "CS004", name: "Spice & Grain Co.", phone: "+91 65432 10987", email: "spicegrain@gmail.com", pieces: 56, days: 28, charges: 10080, initials: "SG", color: "bg-amber-500", status: "Active" },
  { id: "CS005", name: "HomeDecor Palace", phone: "+91 54321 09876", email: "palace@homedecor.in", pieces: 0, days: 90, charges: 14400, initials: "HD", color: "bg-rose-500", status: "Inactive" },
  { id: "CS006", name: "MedEquip Traders", phone: "+91 43210 98765", email: "medequip@traders.com", pieces: 34, days: 21, charges: 7140, initials: "ME", color: "bg-orange-500", status: "Active" },
]

const PALETTE = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-orange-500"]
const STATUSES = ["Active", "Inactive"] as const

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const emptyForm = { name: "", phone: "", email: "", pieces: "", days: "", charges: "", status: "Active" }
const emptyFilters = { status: "All", minPieces: "" }

export default function StorageCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"table" | "card">("table")

  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState(emptyFilters)
  const [draftFilters, setDraftFilters] = useState(emptyFilters)

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Customer | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Customer | null>(null)
  const [stockTarget, setStockTarget] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const [releaseTarget, setReleaseTarget] = useState<Customer | null>(null)
  const [releaseQty, setReleaseQty] = useState("")
  const [releaseError, setReleaseError] = useState("")

  const filtersActive = filters.status !== "All" || filters.minPieces !== ""

  const filtered = customers.filter(c => {
    const q = search.toLowerCase()
    const matchesSearch = c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    const matchesStatus = filters.status === "All" || c.status === filters.status
    const matchesPieces = !filters.minPieces || c.pieces >= Number(filters.minPieces)
    return matchesSearch && matchesStatus && matchesPieces
  })

  const active = customers.filter(c => c.status === "Active").length
  const totalPieces = customers.reduce((s, c) => s + c.pieces, 0)
  const totalRevenue = customers.reduce((s, c) => s + c.charges, 0)
  const overdue = customers.filter(c => c.days > 60).length

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Customer name is required"
    if (!form.phone.trim()) e.phone = "Phone is required"
    else if (!/^[+\d][\d\s-]{6,}$/.test(form.phone.trim())) e.phone = "Enter a valid phone number"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address"
    if (form.pieces.trim() && !/^\d+$/.test(form.pieces)) e.pieces = "Enter a whole number"
    if (form.days.trim() && !/^\d+$/.test(form.days)) e.days = "Enter a whole number"
    if (form.charges.trim() && !/^\d+$/.test(form.charges)) e.charges = "Enter a whole number"
    if (!form.status) e.status = "Select a status"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createCustomer() {
    if (!validate()) return
    const seq = customers.length + 1
    const next: Customer = {
      id: `CS${String(seq).padStart(3, "0")}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      pieces: Number(form.pieces || 0),
      days: Number(form.days || 0),
      charges: Number(form.charges || 0),
      initials: initialsOf(form.name),
      color: PALETTE[customers.length % PALETTE.length],
      status: form.status,
    }
    setCustomers(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Customer created", `${next.name} (${next.id}) added to the storage portfolio.`)
  }

  function openEdit(c: Customer) {
    setEditTarget(c)
    setForm({
      name: c.name, phone: c.phone, email: c.email,
      pieces: String(c.pieces), days: String(c.days), charges: String(c.charges), status: c.status,
    })
    setErrors({})
  }

  function saveEdit() {
    if (!editTarget || !validate()) return
    const updated: Customer = {
      ...editTarget,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      pieces: Number(form.pieces || 0),
      days: Number(form.days || 0),
      charges: Number(form.charges || 0),
      initials: initialsOf(form.name),
      status: form.status,
    }
    setCustomers(prev => prev.map(c => c.id === updated.id ? updated : c))
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
    notify.success("Customer updated", `${updated.name} (${updated.id}) saved.`)
  }

  function deleteCustomer(c: Customer) {
    setCustomers(prev => prev.filter(x => x.id !== c.id))
    notify.warning("Customer removed", `${c.name} (${c.id}) was deleted from the portfolio.`)
  }

  function confirmRelease() {
    if (!releaseTarget) return
    if (!releaseQty.trim()) { setReleaseError("Quantity is required"); return }
    if (!/^\d+$/.test(releaseQty) || Number(releaseQty) < 1) { setReleaseError("Enter a positive whole number"); return }
    if (Number(releaseQty) > releaseTarget.pieces) { setReleaseError(`Only ${releaseTarget.pieces} pieces on hand`); return }
    const qty = Number(releaseQty)
    setCustomers(prev => prev.map(c => c.id === releaseTarget.id ? { ...c, pieces: c.pieces - qty } : c))
    notify.success("Release confirmed", `${qty} pieces released for ${releaseTarget.name}.`)
    setReleaseTarget(null)
    setReleaseQty("")
    setReleaseError("")
  }

  const formBody = (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Customer Name" required error={errors.name}>
        <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Priya Fashion Store" />
      </Field>
      <Field label="Phone" required error={errors.phone}>
        <TextInput value={form.phone} invalid={!!errors.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="e.g. +91 98765 43210" />
      </Field>
      <Field label="Email" required error={errors.email}>
        <TextInput value={form.email} invalid={!!errors.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="e.g. contact@example.com" />
      </Field>
      <Field label="Status" required error={errors.status}>
        <Select value={form.status} invalid={!!errors.status} onChange={e => setForm({ ...form, status: e.target.value })} options={STATUSES} placeholder="Select Status" />
      </Field>
      <Field label="Pieces On Hand" error={errors.pieces} hint="Optional — defaults to 0">
        <TextInput value={form.pieces} invalid={!!errors.pieces} onChange={e => setForm({ ...form, pieces: e.target.value })} placeholder="e.g. 24" inputMode="numeric" />
      </Field>
      <Field label="Days Stored" error={errors.days} hint="Optional — defaults to 0">
        <TextInput value={form.days} invalid={!!errors.days} onChange={e => setForm({ ...form, days: e.target.value })} placeholder="e.g. 15" inputMode="numeric" />
      </Field>
      <Field label="Accrued Charges (₹)" error={errors.charges} hint="Optional — defaults to 0">
        <TextInput value={form.charges} invalid={!!errors.charges} onChange={e => setForm({ ...form, charges: e.target.value })} placeholder="e.g. 3600" inputMode="numeric" />
      </Field>
    </div>
  )

  return (
    <div className="p-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Customers", value: active, sub: `${customers.length} total`, color: "text-brand" },
          { label: "Total Pieces On Hand", value: totalPieces, sub: "Across all customers", color: "text-foreground" },
          { label: "Revenue MTD", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, sub: "Accrued charges", color: "text-success" },
          { label: "Overdue Accounts", value: overdue, sub: "Requires attention", color: "text-danger" },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <button
          onClick={() => { setDraftFilters(filters); setFilterOpen(true) }}
          title="Filter customers"
          className={cn("flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-sm transition-colors",
            filtersActive ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}>
          <Filter className="w-4 h-4" /> Filter{filtersActive ? " · On" : ""}
        </button>
        <ExportButton data={filtered.map(c => ({ id: c.id, name: c.name, phone: c.phone, email: c.email, pieces: c.pieces, days: c.days, charges: c.charges, status: c.status }))} filename="storage-customers" />
        <div className="flex gap-1 ml-auto">
          {(["table","card"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-colors",
                view === v ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}>
              {v}
            </button>
          ))}
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
          <Plus className="w-4 h-4" /> New Customer
        </button>
      </div>

      {view === "table" ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Customer", "Contact", "Pieces On Hand", "Days Stored", "Charges (₹)", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", c.color)}>{c.initials}</div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone className="w-2.5 h-2.5" />{c.phone}</div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Mail className="w-2.5 h-2.5" />{c.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{c.pieces}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{c.days}d</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">₹{c.charges.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                        c.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <RowActions
                        items={[
                          { label: "View customer details", icon: <Eye />, onSelect: () => setDetail(c) },
                          { label: "Edit customer", icon: <Edit />, onSelect: () => openEdit(c) },
                          { label: "Delete customer", icon: <Trash2 />, onSelect: () => setDeleteTarget(c), tone: "danger" as const },
                        ]}
                      />
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No customers match your search or filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Showing 1–{filtered.length} of {filtered.length} customers</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="p-5 rounded-xl border border-border bg-card hover:border-brand/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", c.color)}>{c.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                  </div>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", c.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{c.status}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Pieces On Hand</span><span className="font-bold text-foreground">{c.pieces}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Days Stored</span><span className="text-foreground">{c.days}d</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Accrued Charges</span><span className="font-bold text-brand">₹{c.charges.toLocaleString()}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <button onClick={() => setStockTarget(c)} title="View stock on hand" className="flex-1 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors">View Stock</button>
                <button
                  onClick={() => { setReleaseTarget(c); setReleaseQty(""); setReleaseError("") }}
                  disabled={c.pieces === 0}
                  title={c.pieces === 0 ? "No pieces on hand to release" : "Release pieces"}
                  className="flex-1 py-1.5 rounded-lg bg-[#F7941D] text-white text-xs font-medium hover:bg-[#F7941D]/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                  Release
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 p-10 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">
              No customers match your search or filters.
            </div>
          )}
        </div>
      )}

      {/* Filter modal */}
      <Modal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Customers"
        description="Narrow the list by status and pieces on hand"
        size="sm"
        footer={
          <>
            <button
              onClick={() => { setFilters(emptyFilters); setDraftFilters(emptyFilters); setFilterOpen(false); notify.info("Filters cleared", "Showing all customers.") }}
              className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Clear
            </button>
            <ModalActions
              onCancel={() => setFilterOpen(false)}
              onSubmit={() => { setFilters(draftFilters); setFilterOpen(false); notify.info("Filters applied", "Customer list updated.") }}
              submitLabel="Apply Filters"
            />
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Status">
            <Select value={draftFilters.status} onChange={e => setDraftFilters({ ...draftFilters, status: e.target.value })} options={["All", "Active", "Inactive"]} />
          </Field>
          <Field label="Minimum Pieces On Hand" hint="Leave blank for no minimum">
            <TextInput value={draftFilters.minPieces} onChange={e => setDraftFilters({ ...draftFilters, minPieces: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 20" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Create customer */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Customer"
        description="Register a storage customer account"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createCustomer} submitLabel="Create Customer" />}
      >
        {formBody}
      </Modal>

      {/* Edit customer */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setForm(emptyForm); setErrors({}) } }}
        title={`Edit ${editTarget?.name ?? "Customer"}`}
        description="Update customer account details"
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        {formBody}
      </Modal>

      {/* Release pieces */}
      <Modal
        open={!!releaseTarget}
        onOpenChange={(o) => { if (!o) { setReleaseTarget(null); setReleaseQty(""); setReleaseError("") } }}
        title="Release Pieces"
        description={releaseTarget ? `${releaseTarget.name} · ${releaseTarget.pieces} pieces on hand` : ""}
        size="sm"
        footer={<ModalActions onCancel={() => setReleaseTarget(null)} onSubmit={confirmRelease} submitLabel="Confirm Release" />}
      >
        <Field label="Pieces To Release" required error={releaseError}>
          <TextInput value={releaseQty} invalid={!!releaseError} onChange={e => { setReleaseQty(e.target.value); setReleaseError("") }} placeholder={`Max ${releaseTarget?.pieces ?? 0}`} inputMode="numeric" />
        </Field>
      </Modal>

      {/* Customer detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Storage customer detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Customer ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Phone" value={detail.phone} />
            <DetailRow label="Email" value={detail.email} />
            <DetailRow label="Pieces On Hand" value={`${detail.pieces} pcs`} />
            <DetailRow label="Days Stored" value={`${detail.days} days`} />
            <DetailRow label="Accrued Charges" value={`₹${detail.charges.toLocaleString()}`} />
            <DetailRow label="Avg Charge / Day" value={`₹${detail.days ? Math.round(detail.charges / detail.days).toLocaleString() : 0}`} />
            <DetailRow label="Status" value={
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", detail.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{detail.status}</span>
            } />
          </div>
        )}
      </Drawer>

      {/* View stock drawer */}
      <Drawer
        open={!!stockTarget}
        onOpenChange={(o) => !o && setStockTarget(null)}
        title={`${stockTarget?.name ?? ""} — Stock`}
        description="Pieces currently held in storage"
        footer={
          <button onClick={() => setStockTarget(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {stockTarget && (
          <div className="space-y-1">
            <DetailRow label="Customer ID" value={<span className="font-mono text-brand">{stockTarget.id}</span>} />
            <DetailRow label="Pieces On Hand" value={<span className="font-bold">{stockTarget.pieces} pcs</span>} />
            <DetailRow label="Days In Storage" value={`${stockTarget.days} days`} />
            <DetailRow label="Accrued Charges" value={`₹${stockTarget.charges.toLocaleString()}`} />
            <DetailRow label="Ageing Bucket" value={stockTarget.days > 60 ? "Over 60 days" : stockTarget.days > 30 ? "31–60 days" : "0–30 days"} />
            <DetailRow label="Account Status" value={stockTarget.status} />
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this customer?"
        message={`${deleteTarget?.name} (${deleteTarget?.id}) holds ${deleteTarget?.pieces ?? 0} pieces and ₹${(deleteTarget?.charges ?? 0).toLocaleString()} in accrued charges. This cannot be undone.`}
        confirmLabel="Delete Customer"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && deleteCustomer(deleteTarget)}
      />
    </div>
  )
}
