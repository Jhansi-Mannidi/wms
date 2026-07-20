"use client"
import { useState } from "react"
import { Users, Plus, Search, Eye, Edit2, Power, Trash2, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Client = {
  id: string; name: string; type: string; contact: string
  email: string; zones: string; skus: number; status: string
}

const initialClients: Client[] = [
  { id:"CLT-001",name:"Acme Foods Pvt Ltd",type:"FMCG",contact:"Sunita Rao",email:"sunita@acmefoods.in",zones:"Zone A",skus:412,status:"Active"},
  { id:"CLT-002",name:"Global Oils Ltd",type:"FMCG",contact:"Ramesh Pillai",email:"ramesh@globaloils.com",zones:"Zone B",skus:88,status:"Active"},
  { id:"CLT-003",name:"Agro Corp India",type:"Agriculture",contact:"Meena Patel",email:"meena@agrocorp.in",zones:"Zone C",skus:145,status:"Active"},
  { id:"CLT-004",name:"Sweet Mills",type:"Food",contact:"Vijay Kumar",email:"vijay@sweetmills.in",zones:"Zone A (partial)",skus:64,status:"Provisional"},
]

const CLIENT_TYPES = ["FMCG", "Agriculture", "Food", "Pharma", "Retail", "Industrial"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone A (partial)", "Zone B (partial)", "Cold Room A"] as const
const STATUSES = ["Active", "Provisional", "Suspended"] as const

const statusClass = (s: string) =>
  s === "Active" ? "bg-success/10 text-success"
  : s === "Suspended" ? "bg-danger/10 text-danger"
  : "bg-amber-50 text-amber-600"

const emptyForm = { name: "", type: "", contact: "", email: "", zones: "", skus: "", status: "Provisional" }

export default function WarehouseClientsPage() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")

  const [showMoreFilters, setShowMoreFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState("All Types")
  const [zoneFilter, setZoneFilter] = useState("All Zones")
  const [minSkus, setMinSkus] = useState("")

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Client | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null)

  const extraFilterCount =
    (typeFilter !== "All Types" ? 1 : 0) + (zoneFilter !== "All Zones" ? 1 : 0) + (minSkus ? 1 : 0)

  const filtered = clients.filter((c) => {
    const q = search.toLowerCase()
    return (
      (c.id.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.contact.toLowerCase().includes(q) || c.email.toLowerCase().includes(q)) &&
      (statusFilter === "All" || c.status === statusFilter) &&
      (typeFilter === "All Types" || c.type === typeFilter) &&
      (zoneFilter === "All Zones" || c.zones === zoneFilter) &&
      (!minSkus || c.skus >= Number(minSkus))
    )
  })

  const stats = [
    { label: "Total Clients", value: clients.length },
    { label: "Active", value: clients.filter((c) => c.status === "Active").length },
    { label: "Provisional", value: clients.filter((c) => c.status === "Provisional").length },
    { label: "Total SKUs", value: clients.reduce((s, c) => s + c.skus, 0).toLocaleString() },
  ]

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setErrors({})
    setModalOpen(true)
  }

  function openEdit(c: Client) {
    setEditing(c)
    setForm({ name: c.name, type: c.type, contact: c.contact, email: c.email, zones: c.zones, skus: String(c.skus), status: c.status })
    setErrors({})
    setModalOpen(true)
  }

  function save() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Client name is required"
    else if (clients.some((c) => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editing?.id)) e.name = "This client already exists"
    if (!form.type) e.type = "Select a client type"
    if (!form.contact.trim()) e.contact = "Contact person is required"
    if (!form.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email address"
    if (!form.zones) e.zones = "Assign at least one zone"
    if (!form.skus.trim()) e.skus = "SKU count is required"
    else if (!/^\d+$/.test(form.skus)) e.skus = "Enter a whole number"
    setErrors(e)
    if (Object.keys(e).length) return

    const row = {
      name: form.name.trim(),
      type: form.type,
      contact: form.contact.trim(),
      email: form.email.trim().toLowerCase(),
      zones: form.zones,
      skus: Number(form.skus),
      status: form.status,
    }

    if (editing) {
      setClients((prev) => prev.map((c) => (c.id === editing.id ? { ...c, ...row } : c)))
      notify.success("Client updated", `${row.name} details saved.`)
    } else {
      const next: Client = { id: `CLT-${String(clients.length + 1).padStart(3, "0")}`, ...row }
      setClients((prev) => [...prev, next])
      notify.success("Client onboarded", `${next.id} — ${next.name} added with ${next.skus} SKUs.`)
    }
    setModalOpen(false)
    setEditing(null)
    setForm(emptyForm)
  }

  function toggleStatus(c: Client) {
    const nextStatus = c.status === "Suspended" ? "Active" : "Suspended"
    setClients((prev) => prev.map((x) => (x.id === c.id ? { ...x, status: nextStatus } : x)))
    notify.success("Client status updated", `${c.name} is now ${nextStatus}.`)
  }

  function removeClient(c: Client) {
    setClients((prev) => prev.filter((x) => x.id !== c.id))
    notify.warning("Client removed", `${c.name} has been offboarded.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Clients</h1><p className="text-sm text-muted-foreground mt-1">Client onboarding and account management</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="warehouse-clients" />
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Client</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <div className="mb-2"><Users className="w-5 h-5 text-brand" /></div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search client, contact, email..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
          </div>
          {["All", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", statusFilter === s ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{s}</button>
          ))}
          <button
            onClick={() => setShowMoreFilters((v) => !v)}
            title="Toggle additional filters"
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border bg-card text-sm transition-colors", showMoreFilters || extraFilterCount > 0 ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}
          >
            <Filter className="w-4 h-4" /> More Filters
            {extraFilterCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-brand text-white text-[10px] font-semibold">{extraFilterCount}</span>}
          </button>
        </div>

        {showMoreFilters && (
          <div className="p-4 rounded-xl border border-border bg-card grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
            <Field label="Client Type">
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} options={["All Types", ...CLIENT_TYPES]} />
            </Field>
            <Field label="Assigned Zone">
              <Select value={zoneFilter} onChange={(e) => setZoneFilter(e.target.value)} options={["All Zones", ...ZONES]} />
            </Field>
            <Field label="Min SKUs">
              <TextInput value={minSkus} onChange={(e) => setMinSkus(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 100" inputMode="numeric" />
            </Field>
            <button
              onClick={() => { setTypeFilter("All Types"); setZoneFilter("All Zones"); setMinSkus(""); notify.info("Filters cleared", "Showing all clients.") }}
              className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"
            >
              Clear Filters
            </button>
            <p className="sm:col-span-4 text-xs text-muted-foreground">Showing {filtered.length} of {clients.length} clients.</p>
          </div>
        )}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Client","Type","Contact","Email","Zones","SKUs","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(c=>(
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{c.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.type}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.contact}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{c.email}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.zones}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.skus}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(c.status))}>{c.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(c) },
                      { label: "Edit client", icon: <Edit2 />, onSelect: () => openEdit(c) },
                      { label: c.status === "Suspended" ? "Reactivate client" : "Suspend client", icon: <Power />, onSelect: () => toggleStatus(c) },
                      { label: "Offboard client", icon: <Trash2 />, onSelect: () => setDeleteTarget(c), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No clients match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create / edit client */}
      <Modal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title={editing ? `Edit Client — ${editing.name}` : "Add Client"}
        description="Client account and zone allocation"
        footer={<ModalActions onCancel={() => setModalOpen(false)} onSubmit={save} submitLabel={editing ? "Save Client" : "Add Client"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Acme Foods Pvt Ltd" />
          </Field>
          <Field label="Client Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={CLIENT_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Contact Person" required error={errors.contact}>
            <TextInput value={form.contact} invalid={!!errors.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} placeholder="e.g. Sunita Rao" />
          </Field>
          <Field label="Email" required error={errors.email}>
            <TextInput value={form.email} invalid={!!errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="e.g. sunita@acmefoods.in" type="email" />
          </Field>
          <Field label="Assigned Zone" required error={errors.zones}>
            <Select value={form.zones} invalid={!!errors.zones} onChange={(e) => setForm({ ...form, zones: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="SKU Count" required error={errors.skus}>
            <TextInput value={form.skus} invalid={!!errors.skus} onChange={(e) => setForm({ ...form, skus: e.target.value })} placeholder="e.g. 412" inputMode="numeric" />
          </Field>
          <Field label="Status" required>
            <Select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUSES} />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Client account detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Client ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Contact Person" value={detail.contact} />
            <DetailRow label="Email" value={detail.email} />
            <DetailRow label="Assigned Zone" value={detail.zones} />
            <DetailRow label="SKUs Stored" value={detail.skus.toLocaleString()} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Offboard this client?"
        message={`${deleteTarget?.name} and their ${deleteTarget?.skus} SKU records will be removed from this warehouse. This cannot be undone.`}
        confirmLabel="Offboard Client"
        cancelLabel="Keep Client"
        onConfirm={() => deleteTarget && removeClient(deleteTarget)}
      />
    </div>
  )
}
