"use client"

import { useState } from "react"
import {
  Search, Filter, Plus, MoreHorizontal, Eye, Edit,
  Globe, AlertCircle, LayoutGrid, List, TrendingUp,
  CheckCircle2, ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Client = {
  id: string; name: string; gstin: string; avatarColor: string; initials: string
  agreement: string; spaceUsed: number; skus: number; openOrders: number
  dues: number; kam: string; kamInitials: string; lastActivity: string
}

const initialClients: Client[] = [
  { id: "C001", name: "Apex Pharma Ltd", gstin: "29AAPCA1234A1Z5", avatarColor: "bg-blue-500", initials: "AP", agreement: "Active", spaceUsed: 78, skus: 234, openOrders: 12, dues: 0, kam: "Rahul M.", kamInitials: "RM", lastActivity: "2h ago" },
  { id: "C002", name: "Sunrise Electronics", gstin: "27BBBCE5678B2Y4", avatarColor: "bg-emerald-500", initials: "SE", agreement: "Renewal-Due", spaceUsed: 45, skus: 89, openOrders: 6, dues: 142500, kam: "Priya S.", kamInitials: "PS", lastActivity: "4h ago" },
  { id: "C003", name: "GlobalTex Fabrics", gstin: "06CCCGT9012C3X3", avatarColor: "bg-amber-500", initials: "GT", agreement: "Active", spaceUsed: 92, skus: 512, openOrders: 24, dues: 0, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "30m ago" },
  { id: "C004", name: "FreshFarm Organics", gstin: "24DDDFF3456D4W2", avatarColor: "bg-orange-500", initials: "FF", agreement: "Active", spaceUsed: 33, skus: 67, openOrders: 3, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "1d ago" },
  { id: "C005", name: "TechCore Systems", gstin: "33EEETE7890E5V1", avatarColor: "bg-violet-500", initials: "TC", agreement: "Expired", spaceUsed: 0, skus: 0, openOrders: 0, dues: 89000, kam: "Rahul M.", kamInitials: "RM", lastActivity: "5d ago" },
  { id: "C006", name: "MediSupply Corp", gstin: "07FFFMS2345F6U0", avatarColor: "bg-rose-500", initials: "MS", agreement: "Active", spaceUsed: 61, skus: 178, openOrders: 9, dues: 0, kam: "Priya S.", kamInitials: "PS", lastActivity: "6h ago" },
  { id: "C007", name: "AutoParts India", gstin: "19GGGAP6789G7T9", avatarColor: "bg-cyan-500", initials: "AI", agreement: "Active", spaceUsed: 55, skus: 320, openOrders: 17, dues: 55200, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "3h ago" },
]

const agreementColors: Record<string, string> = {
  "Active": "bg-success/15 text-success",
  "Renewal-Due": "bg-warning/15 text-warning",
  "Expired": "bg-danger/15 text-danger",
}

const AGREEMENTS = ["Active", "Renewal-Due", "Expired"] as const
const KAMS = ["Rahul M.", "Priya S.", "Ankit J.", "Meera K."] as const
const AVATAR_COLORS = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-orange-500", "bg-violet-500", "bg-rose-500", "bg-cyan-500"]

const emptyForm = { name: "", gstin: "", agreement: "", kam: "", skus: "", spaceUsed: "" }

function initialsOf(name: string) {
  return name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join("").toUpperCase()
}

export default function ThreePLPage() {
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [activeFilter, setActiveFilter] = useState("all")
  const [pageSize, setPageSize] = useState(10)

  const [filterOpen, setFilterOpen] = useState(false)
  const [agreementFilter, setAgreementFilter] = useState("All")
  const [kamFilter, setKamFilter] = useState("All")
  const [draftFilter, setDraftFilter] = useState({ agreement: "All", kam: "All" })

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Client | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Client | null>(null)
  const [offboardTarget, setOffboardTarget] = useState<Client | null>(null)

  const matched = clients.filter(c => {
    const q = search.toLowerCase()
    if (!(c.name.toLowerCase().includes(q) || c.gstin.toLowerCase().includes(q))) return false
    if (activeFilter === "active" && c.agreement !== "Active") return false
    if (activeFilter === "overdue" && c.dues <= 0) return false
    if (agreementFilter !== "All" && c.agreement !== agreementFilter) return false
    if (kamFilter !== "All" && c.kam !== kamFilter) return false
    return true
  })
  const filtered = matched.slice(0, pageSize)

  const totalDues = clients.reduce((s, c) => s + c.dues, 0)
  const avgSpace = clients.length ? Math.round(clients.reduce((s, c) => s + c.spaceUsed, 0) / clients.length) : 0
  const kpiCards = [
    { label: "Active Clients", value: String(clients.filter(c => c.agreement === "Active").length), sub: `${clients.length} total on book`, icon: <Globe className="w-4 h-4" />, filter: "active", color: "text-brand" },
    { label: "Total SKUs Stored", value: clients.reduce((s, c) => s + c.skus, 0).toLocaleString(), sub: "Across all clients", icon: <TrendingUp className="w-4 h-4" />, filter: "all", color: "text-success" },
    { label: "Space Occupied", value: `${avgSpace}%`, sub: "Average across clients", icon: <LayoutGrid className="w-4 h-4" />, filter: "all", color: "text-warning" },
    { label: "Open Ship-Outs", value: String(clients.reduce((s, c) => s + c.openOrders, 0)), sub: "Across all clients", icon: <CheckCircle2 className="w-4 h-4" />, filter: "active", color: "text-brand" },
    { label: "Overdue Invoices", value: `₹${totalDues.toLocaleString()}`, sub: `${clients.filter(c => c.dues > 0).length} clients affected`, icon: <AlertCircle className="w-4 h-4" />, filter: "overdue", color: "text-danger" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Client name is required"
    else if (clients.some(c => c.name.toLowerCase() === form.name.trim().toLowerCase() && c.id !== editTarget?.id)) e.name = "A client with this name already exists"
    if (!form.gstin.trim()) e.gstin = "GSTIN is required"
    else if (!/^[0-9A-Z]{15}$/.test(form.gstin.trim().toUpperCase())) e.gstin = "GSTIN must be 15 alphanumeric characters"
    if (!form.agreement) e.agreement = "Select an agreement status"
    if (!form.kam) e.kam = "Select a key account manager"
    if (!form.skus.trim()) e.skus = "SKU count is required"
    else if (!/^\d+$/.test(form.skus)) e.skus = "Enter a whole number"
    if (!form.spaceUsed.trim()) e.spaceUsed = "Space used is required"
    else if (!/^\d+$/.test(form.spaceUsed) || Number(form.spaceUsed) > 100) e.spaceUsed = "Enter 0–100"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createClient() {
    if (!validate()) return
    const seq = clients.length + 1
    const next: Client = {
      id: `C${String(seq).padStart(3, "0")}`,
      name: form.name.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      avatarColor: AVATAR_COLORS[clients.length % AVATAR_COLORS.length],
      initials: initialsOf(form.name),
      agreement: form.agreement,
      spaceUsed: Number(form.spaceUsed),
      skus: Number(form.skus),
      openOrders: 0,
      dues: 0,
      kam: form.kam,
      kamInitials: initialsOf(form.kam.replace(".", "")),
      lastActivity: "just now",
    }
    setClients(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Client onboarded", `${next.name} (${next.id}) added to the 3PL book.`)
  }

  function saveEdit() {
    if (!editTarget || !validate()) return
    setClients(prev => prev.map(c => c.id === editTarget.id ? {
      ...c,
      name: form.name.trim(),
      gstin: form.gstin.trim().toUpperCase(),
      initials: initialsOf(form.name),
      agreement: form.agreement,
      skus: Number(form.skus),
      spaceUsed: Number(form.spaceUsed),
      kam: form.kam,
      kamInitials: initialsOf(form.kam.replace(".", "")),
    } : c))
    notify.success("Client updated", `${form.name.trim()} saved.`)
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
  }

  function openEdit(c: Client) {
    setForm({ name: c.name, gstin: c.gstin, agreement: c.agreement, kam: c.kam, skus: String(c.skus), spaceUsed: String(c.spaceUsed) })
    setErrors({})
    setEditTarget(c)
  }

  function offboard(c: Client) {
    setClients(prev => prev.filter(x => x.id !== c.id))
    notify.warning("Client offboarded", `${c.name} removed from the active 3PL book.`)
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* KPI filter cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        {kpiCards.map((k) => (
          <button key={k.label}
            onClick={() => setActiveFilter(k.filter)}
            className={cn(
              "flex flex-col gap-2 p-4 rounded-xl border text-left transition-all",
              activeFilter === k.filter
                ? "border-brand bg-brand/10"
                : "border-border bg-card hover:border-brand/40 hover:bg-brand/5"
            )}>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium">{k.label}</span>
              <span className={k.color}>{k.icon}</span>
            </div>
            <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground">{k.sub}</p>
          </button>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search clients, GSTIN..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60"
          />
        </div>
        <button
          onClick={() => { setDraftFilter({ agreement: agreementFilter, kam: kamFilter }); setFilterOpen(true) }}
          title="Filter clients"
          className={cn(
            "flex items-center gap-1.5 px-3 py-2 rounded-lg border bg-card text-sm transition-colors",
            agreementFilter !== "All" || kamFilter !== "All"
              ? "border-brand text-brand"
              : "border-border text-muted-foreground hover:text-foreground"
          )}>
          <Filter className="w-4 h-4" /> Filter
          {(agreementFilter !== "All" || kamFilter !== "All") && (
            <span className="ml-0.5 text-[10px] font-bold bg-brand text-white rounded-full px-1.5">
              {[agreementFilter !== "All", kamFilter !== "All"].filter(Boolean).length}
            </span>
          )}
        </button>
        <ExportButton data={filtered.map(c => ({ id: c.id, name: c.name, gstin: c.gstin, agreement: c.agreement, spaceUsed: c.spaceUsed, skus: c.skus, openOrders: c.openOrders, dues: c.dues, kam: c.kam, lastActivity: c.lastActivity }))} filename="3pl-clients" />
        <div className="flex items-center gap-1 ml-auto">
          <button onClick={() => setViewMode("table")} title="Table view" className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", viewMode === "table" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><List className="w-4 h-4" /></button>
          <button onClick={() => setViewMode("card")} title="Card view" className={cn("w-8 h-8 flex items-center justify-center rounded-lg border transition-colors", viewMode === "card" ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}><LayoutGrid className="w-4 h-4" /></button>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
          <Plus className="w-4 h-4" /> New Client
        </button>
      </div>

      {/* Table view */}
      {viewMode === "table" ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Client", "GSTIN", "Agreement", "Space Used", "SKUs", "Open Orders", "Dues (₹)", "KAM", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 === 0 ? "" : "bg-muted/5")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", c.avatarColor)}>{c.initials}</div>
                        <div>
                          <p className="font-semibold text-foreground text-xs">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground font-mono">{c.gstin}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", agreementColors[c.agreement])}>{c.agreement}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", c.spaceUsed > 85 ? "bg-danger" : c.spaceUsed > 70 ? "bg-warning" : "bg-success")} style={{ width: `${c.spaceUsed}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{c.spaceUsed}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs font-semibold text-foreground">{c.skus.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      {c.openOrders > 0 ? (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-brand/15 text-brand">{c.openOrders}</span>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {c.dues > 0 ? (
                        <span className="text-xs font-bold text-danger">₹{c.dues.toLocaleString()}</span>
                      ) : <span className="text-xs text-success">Nil</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[10px] font-bold">{c.kamInitials}</div>
                        <span className="text-xs text-muted-foreground">{c.kam}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setDetail(c)} title="View client detail" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-brand"><Eye className="w-3.5 h-3.5" /></button>
                        <button onClick={() => openEdit(c)} title="Edit client" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-brand"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => notify.info("Client portal", `Opening the ${c.name} portal workspace in a new session.`)} title="Open client portal" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-brand"><ExternalLink className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setOffboardTarget(c)} title="Offboard client" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-danger"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No clients match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Showing 1–{filtered.length} of {matched.length} clients</span>
            <div className="flex items-center gap-1">
              {["10","25","50"].map(n => (
                <button key={n} onClick={() => setPageSize(Number(n))} title={`Show ${n} per page`} className={cn("px-2 py-1 rounded text-xs", pageSize === Number(n) ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{n}</button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Card view */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-border bg-card hover:border-brand/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0", c.avatarColor)}>{c.initials}</div>
                  <div>
                    <p className="font-bold text-sm text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.gstin}</p>
                  </div>
                </div>
                <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", agreementColors[c.agreement])}>{c.agreement}</span>
              </div>
              <div className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Space Used</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", c.spaceUsed > 85 ? "bg-danger" : c.spaceUsed > 70 ? "bg-warning" : "bg-success")} style={{ width: `${c.spaceUsed}%` }} />
                    </div>
                    <span className="font-semibold text-foreground">{c.spaceUsed}%</span>
                  </div>
                </div>
                <div className="flex justify-between"><span>SKUs on Hand</span><span className="font-semibold text-foreground">{c.skus}</span></div>
                <div className="flex justify-between"><span>Open Orders</span><span className="font-semibold text-brand">{c.openOrders}</span></div>
                <div className="flex justify-between"><span>Dues</span><span className={cn("font-semibold", c.dues > 0 ? "text-danger" : "text-success")}>{c.dues > 0 ? `₹${c.dues.toLocaleString()}` : "Nil"}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-brand/20 flex items-center justify-center text-brand text-[9px] font-bold">{c.kamInitials}</div>
                  <span className="text-[10px] text-muted-foreground">{c.kam} · {c.lastActivity}</span>
                </div>
                <button onClick={() => setDetail(c)} title="View client detail" className="flex items-center gap-1 text-xs text-brand hover:underline">View <ExternalLink className="w-3 h-3" /></button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-10 text-center text-sm text-muted-foreground">No clients match your filters.</div>
          )}
        </div>
      )}

      {/* Filter modal */}
      <Modal
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Filter Clients"
        description="Narrow the client book by agreement and account manager"
        size="sm"
        footer={
          <ModalActions
            onCancel={() => { setAgreementFilter("All"); setKamFilter("All"); setFilterOpen(false); notify.info("Filters cleared", "Showing all clients.") }}
            cancelLabel="Clear All"
            onSubmit={() => {
              setAgreementFilter(draftFilter.agreement)
              setKamFilter(draftFilter.kam)
              setFilterOpen(false)
              notify.success("Filters applied", `Agreement: ${draftFilter.agreement} · KAM: ${draftFilter.kam}`)
            }}
            submitLabel="Apply Filters"
          />
        }
      >
        <div className="space-y-4">
          <Field label="Agreement Status">
            <Select value={draftFilter.agreement} onChange={e => setDraftFilter({ ...draftFilter, agreement: e.target.value })} options={["All", ...AGREEMENTS]} />
          </Field>
          <Field label="Key Account Manager">
            <Select value={draftFilter.kam} onChange={e => setDraftFilter({ ...draftFilter, kam: e.target.value })} options={["All", ...KAMS]} />
          </Field>
        </div>
      </Modal>

      {/* Create client */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Onboard New Client"
        description="Add a 3PL client to the book"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createClient} submitLabel="Create Client" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Apex Pharma Ltd" />
          </Field>
          <Field label="GSTIN" required error={errors.gstin}>
            <TextInput value={form.gstin} invalid={!!errors.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} placeholder="e.g. 29AAPCA1234A1Z5" />
          </Field>
          <Field label="Agreement Status" required error={errors.agreement}>
            <Select value={form.agreement} invalid={!!errors.agreement} onChange={e => setForm({ ...form, agreement: e.target.value })} options={AGREEMENTS} placeholder="Select Status" />
          </Field>
          <Field label="Key Account Manager" required error={errors.kam}>
            <Select value={form.kam} invalid={!!errors.kam} onChange={e => setForm({ ...form, kam: e.target.value })} options={KAMS} placeholder="Select KAM" />
          </Field>
          <Field label="SKUs on Hand" required error={errors.skus}>
            <TextInput value={form.skus} invalid={!!errors.skus} onChange={e => setForm({ ...form, skus: e.target.value })} placeholder="e.g. 234" inputMode="numeric" />
          </Field>
          <Field label="Space Used (%)" required error={errors.spaceUsed}>
            <TextInput value={form.spaceUsed} invalid={!!errors.spaceUsed} onChange={e => setForm({ ...form, spaceUsed: e.target.value })} placeholder="0–100" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Edit client */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setForm(emptyForm); setErrors({}) } }}
        title={`Edit ${editTarget?.name ?? ""}`}
        description="Update client master data"
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="GSTIN" required error={errors.gstin}>
            <TextInput value={form.gstin} invalid={!!errors.gstin} onChange={e => setForm({ ...form, gstin: e.target.value })} />
          </Field>
          <Field label="Agreement Status" required error={errors.agreement}>
            <Select value={form.agreement} invalid={!!errors.agreement} onChange={e => setForm({ ...form, agreement: e.target.value })} options={AGREEMENTS} placeholder="Select Status" />
          </Field>
          <Field label="Key Account Manager" required error={errors.kam}>
            <Select value={form.kam} invalid={!!errors.kam} onChange={e => setForm({ ...form, kam: e.target.value })} options={KAMS} placeholder="Select KAM" />
          </Field>
          <Field label="SKUs on Hand" required error={errors.skus}>
            <TextInput value={form.skus} invalid={!!errors.skus} onChange={e => setForm({ ...form, skus: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Space Used (%)" required error={errors.spaceUsed}>
            <TextInput value={form.spaceUsed} invalid={!!errors.spaceUsed} onChange={e => setForm({ ...form, spaceUsed: e.target.value })} inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Client detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="3PL client detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Client ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client Name" value={detail.name} />
            <DetailRow label="GSTIN" value={<span className="font-mono">{detail.gstin}</span>} />
            <DetailRow label="Agreement" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", agreementColors[detail.agreement])}>{detail.agreement}</span>} />
            <DetailRow label="Space Used" value={`${detail.spaceUsed}%`} />
            <DetailRow label="SKUs on Hand" value={detail.skus.toLocaleString()} />
            <DetailRow label="Open Orders" value={String(detail.openOrders)} />
            <DetailRow label="Outstanding Dues" value={detail.dues > 0 ? <span className="text-danger font-semibold">₹{detail.dues.toLocaleString()}</span> : <span className="text-success">Nil</span>} />
            <DetailRow label="Key Account Manager" value={detail.kam} />
            <DetailRow label="Last Activity" value={detail.lastActivity} />
          </div>
        )}
      </Drawer>

      {/* Offboard confirmation */}
      <ConfirmDialog
        open={!!offboardTarget}
        onOpenChange={(o) => !o && setOffboardTarget(null)}
        title="Offboard this client?"
        message={`${offboardTarget?.name} will be removed from the active 3PL book. This cannot be undone.`}
        confirmLabel="Offboard Client"
        cancelLabel="Keep Client"
        onConfirm={() => offboardTarget && offboard(offboardTarget)}
      />
    </div>
  )
}
