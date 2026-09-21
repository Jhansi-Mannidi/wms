"use client"
import { useState } from "react"
import { Plus, Eye, RefreshCw, XCircle } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Lease = {
  id: string; tenant: string; start: string; end: string; value: string
  type: string; autoRenew: boolean; status: string
}

const initialLeases: Lease[] = [
  { id:"LSE-001",tenant:"Acme Foods",start:"2025-01-01",end:"2025-12-31",value:"₹18.9L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-002",tenant:"Global Oils",start:"2024-06-01",end:"2025-05-31",value:"₹15.1L",type:"Annual",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-003",tenant:"Agro Corp",start:"2025-03-15",end:"2026-03-14",value:"₹12.4L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-004",tenant:"Sweet Mills",start:"2025-07-01",end:"2025-09-30",value:"₹2.8L",type:"Quarterly",autoRenew:false,status:"Active"},
  { id:"LSE-005",tenant:"Fresh Farms",start:"2025-02-01",end:"2026-01-31",value:"₹10.8L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-006",tenant:"Salt Works",start:"2024-10-01",end:"2025-09-30",value:"₹6.4L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-007",tenant:"Acme Foods",start:"2023-04-01",end:"2026-03-31",value:"₹52.5L",type:"Long-term (3yr)",autoRenew:true,status:"Active"},
  { id:"LSE-008",tenant:"Global Oils",start:"2025-04-01",end:"2025-06-30",value:"₹3.6L",type:"Quarterly",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-009",tenant:"Agro Corp",start:"2024-09-01",end:"2025-08-31",value:"₹11.2L",type:"Annual",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-010",tenant:"Sweet Mills",start:"2024-11-01",end:"2025-10-31",value:"₹9.6L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-011",tenant:"Fresh Farms",start:"2025-05-01",end:"2025-05-31",value:"₹0.9L",type:"Monthly",autoRenew:true,status:"Active"},
  { id:"LSE-012",tenant:"Salt Works",start:"2024-01-01",end:"2026-12-31",value:"₹21.6L",type:"Long-term (3yr)",autoRenew:true,status:"Active"},
  { id:"LSE-013",tenant:"Acme Foods",start:"2024-05-01",end:"2025-04-30",value:"₹17.4L",type:"Annual",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-014",tenant:"Global Oils",start:"2025-01-15",end:"2026-01-14",value:"₹14.7L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-015",tenant:"Agro Corp",start:"2025-06-01",end:"2025-08-31",value:"₹3.1L",type:"Quarterly",autoRenew:false,status:"Active"},
  { id:"LSE-016",tenant:"Sweet Mills",start:"2023-08-01",end:"2024-07-31",value:"₹8.2L",type:"Annual",autoRenew:false,status:"Expired"},
  { id:"LSE-017",tenant:"Fresh Farms",start:"2023-02-01",end:"2024-01-31",value:"₹9.4L",type:"Annual",autoRenew:false,status:"Expired"},
  { id:"LSE-018",tenant:"Salt Works",start:"2024-03-01",end:"2025-02-28",value:"₹6.1L",type:"Annual",autoRenew:false,status:"Terminated"},
  { id:"LSE-019",tenant:"Acme Foods",start:"2025-03-01",end:"2025-05-31",value:"₹4.8L",type:"Quarterly",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-020",tenant:"Global Oils",start:"2024-12-01",end:"2025-11-30",value:"₹15.6L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-021",tenant:"Agro Corp",start:"2025-04-01",end:"2028-03-31",value:"₹38.4L",type:"Long-term (3yr)",autoRenew:true,status:"Active"},
  { id:"LSE-022",tenant:"Sweet Mills",start:"2025-02-01",end:"2026-01-31",value:"₹7.8L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-023",tenant:"Fresh Farms",start:"2024-08-01",end:"2025-07-31",value:"₹10.2L",type:"Annual",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-024",tenant:"Salt Works",start:"2025-05-01",end:"2025-07-31",value:"₹2.2L",type:"Quarterly",autoRenew:false,status:"Active"},
  { id:"LSE-025",tenant:"Acme Foods",start:"2024-02-01",end:"2025-01-31",value:"₹16.8L",type:"Annual",autoRenew:false,status:"Terminated"},
  { id:"LSE-026",tenant:"Global Oils",start:"2025-06-01",end:"2026-05-31",value:"₹15.9L",type:"Annual",autoRenew:true,status:"Active"},
]

const TENANTS = ["Acme Foods", "Global Oils", "Agro Corp", "Sweet Mills", "Fresh Farms", "Salt Works"] as const
const LEASE_TYPES = ["Annual", "Quarterly", "Monthly", "Long-term (3yr)"] as const
const AUTO_RENEW = ["Yes", "No"] as const

const emptyForm = { tenant: "", start: "", end: "", value: "", type: "", autoRenew: "" }

function statusClass(status: string) {
  if (status === "Active") return "bg-success/10 text-success"
  if (status === "Terminated") return "bg-danger/10 text-danger"
  return "bg-amber-50 text-amber-600"
}

/** Adds one lease term to a YYYY-MM-DD date, used when renewing. */
function addTerm(end: string, type: string) {
  const d = new Date(end)
  const months = type === "Quarterly" ? 3 : type === "Monthly" ? 1 : type === "Long-term (3yr)" ? 36 : 12
  d.setMonth(d.getMonth() + months)
  return d.toISOString().slice(0, 10)
}

export default function SpaceLeasesPage() {
  const [leases, setLeases] = useState<Lease[]>(initialLeases)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<Lease | null>(null)
  const [terminateTarget, setTerminateTarget] = useState<Lease | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.tenant) e.tenant = "Select a tenant"
    if (!form.start.trim()) e.start = "Start date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.start)) e.start = "Use YYYY-MM-DD"
    if (!form.end.trim()) e.end = "End date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.end)) e.end = "Use YYYY-MM-DD"
    else if (form.start && form.end <= form.start) e.end = "End must be after start"
    if (!form.value.trim()) e.value = "Contract value is required"
    if (!form.type) e.type = "Select a lease type"
    if (!form.autoRenew) e.autoRenew = "Choose an auto-renew setting"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createLease() {
    if (!validate()) return
    const seq = String(leases.length + 1).padStart(3, "0")
    const next: Lease = {
      id: `LSE-${seq}`,
      tenant: form.tenant,
      start: form.start.trim(),
      end: form.end.trim(),
      value: form.value.trim(),
      type: form.type,
      autoRenew: form.autoRenew === "Yes",
      status: "Active",
    }
    setLeases((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Lease created", `${next.id} — ${next.tenant}, ${next.type} through ${next.end}.`)
  }

  function toggleAutoRenew(l: Lease) {
    setLeases((prev) => prev.map((x) => (x.id === l.id ? { ...x, autoRenew: !x.autoRenew } : x)))
    notify.info("Auto-renew updated", `${l.id} auto-renew turned ${l.autoRenew ? "off" : "on"}.`)
  }

  function renew(l: Lease) {
    const newEnd = addTerm(l.end, l.type)
    setLeases((prev) => prev.map((x) => (x.id === l.id ? { ...x, start: x.end, end: newEnd, status: "Active" } : x)))
    notify.success("Lease renewed", `${l.id} extended to ${newEnd}.`)
  }

  function terminate(l: Lease) {
    setLeases((prev) => prev.map((x) => (x.id === l.id ? { ...x, status: "Terminated", autoRenew: false } : x)))
    setDetail(null)
    notify.warning("Lease terminated", `${l.id} for ${l.tenant} has been terminated.`)
  }

  const activeCount = leases.filter((l) => l.status === "Active").length
  const expiringCount = leases.filter((l) => l.status === "Expiring Soon").length

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Lease Agreements</h1><p className="text-sm text-muted-foreground mt-1">Storage lease contracts, terms and renewal status</p></div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Lease</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Leases", value: leases.length.toString(), sub: "on record" },
          { label: "Active", value: activeCount.toString(), sub: "currently in force" },
          { label: "Expiring Soon", value: expiringCount.toString(), sub: "need renewal" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Lease ID","Tenant","Start","End","Value","Type","Auto-Renew","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {leases.map(l=>(
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{l.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.tenant}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.start}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.end}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.value}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.type}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleAutoRenew(l)}
                    disabled={l.status === "Terminated"}
                    title={`Turn auto-renew ${l.autoRenew ? "off" : "on"} for ${l.id}`}
                    className={`px-2 py-0.5 rounded-full text-xs transition-colors disabled:opacity-40 disabled:pointer-events-none ${l.autoRenew?"bg-success/10 text-success hover:bg-success/20":"bg-muted text-muted-foreground hover:bg-muted/70"}`}
                  >
                    {l.autoRenew?"Yes":"No"}
                  </button>
                </td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(l.status)}`}>{l.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: `View ${l.id}`, icon: <Eye />, onSelect: () => setDetail(l) },
                      ...(l.status !== "Terminated"
                        ? [
                            { label: `Renew ${l.id}`, icon: <RefreshCw />, onSelect: () => renew(l), tone: "success" as const },
                            { label: `Terminate ${l.id}`, icon: <XCircle />, onSelect: () => setTerminateTarget(l), tone: "danger" as const },
                          ]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {leases.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No lease agreements on record. Use “New Lease” to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create lease */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Lease"
        description="Draft a storage lease agreement"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createLease} submitLabel="Create Lease" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tenant" required error={errors.tenant}>
            <Select value={form.tenant} invalid={!!errors.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })} options={TENANTS} placeholder="Select Tenant" />
          </Field>
          <Field label="Lease Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={LEASE_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Start Date" required error={errors.start} hint="Format YYYY-MM-DD">
            <TextInput value={form.start} invalid={!!errors.start} onChange={(e) => setForm({ ...form, start: e.target.value })} placeholder="2025-08-01" />
          </Field>
          <Field label="End Date" required error={errors.end} hint="Format YYYY-MM-DD">
            <TextInput value={form.end} invalid={!!errors.end} onChange={(e) => setForm({ ...form, end: e.target.value })} placeholder="2026-07-31" />
          </Field>
          <Field label="Contract Value" required error={errors.value}>
            <TextInput value={form.value} invalid={!!errors.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder="e.g. ₹14.2L" />
          </Field>
          <Field label="Auto-Renew" required error={errors.autoRenew}>
            <Select value={form.autoRenew} invalid={!!errors.autoRenew} onChange={(e) => setForm({ ...form, autoRenew: e.target.value })} options={AUTO_RENEW} placeholder="Select" />
          </Field>
        </div>
      </Modal>

      {/* Lease detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Lease agreement detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Lease ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Tenant" value={detail.tenant} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Start" value={detail.start} />
            <DetailRow label="End" value={detail.end} />
            <DetailRow label="Contract Value" value={detail.value} />
            <DetailRow label="Auto-Renew" value={detail.autoRenew ? "Yes" : "No"} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusClass(detail.status)}`}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!terminateTarget}
        onOpenChange={(o) => !o && setTerminateTarget(null)}
        title="Terminate this lease?"
        message={`${terminateTarget?.id} with ${terminateTarget?.tenant} (${terminateTarget?.value}) will be terminated and auto-renew switched off. This cannot be undone.`}
        confirmLabel="Terminate Lease"
        cancelLabel="Keep Lease"
        onConfirm={() => terminateTarget && terminate(terminateTarget)}
      />
    </div>
  )
}
