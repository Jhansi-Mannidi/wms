"use client"
import { useState } from "react"
import { Plus, Eye, CheckCircle2, Trash2 } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type SpaceTenant = {
  id: string; name: string; zones: string; pallets: number; sqft: number
  rate: string; lease: string; status: string
}

const initialTenants: SpaceTenant[] = [
  { id:"TEN-001",name:"Acme Foods",zones:"Zone A (rows 1-6)",pallets:82,sqft:4200,rate:"₹150/pallet/day",lease:"2025-01-01",status:"Active"},
  { id:"TEN-002",name:"Global Oils",zones:"Zone B (all)",pallets:88,sqft:3800,rate:"₹140/pallet/day",lease:"2024-06-01",status:"Active"},
  { id:"TEN-003",name:"Agro Corp",zones:"Zone C (rows 1-4)",pallets:60,sqft:2800,rate:"₹145/pallet/day",lease:"2025-03-15",status:"Active"},
  { id:"TEN-004",name:"Sweet Mills",zones:"Zone A (rows 7-10)",pallets:40,sqft:2000,rate:"₹155/pallet/day",lease:"2025-07-01",status:"Provisional"},
]

const ZONE_OPTIONS = ["Zone A (rows 1-6)", "Zone A (rows 7-10)", "Zone B (all)", "Zone C (rows 1-4)", "Zone D (all)"] as const
const STATUS_OPTIONS = ["Active", "Provisional"] as const

const emptyForm = { name: "", zones: "", pallets: "", sqft: "", rate: "", lease: "", status: "" }

export default function SpaceTenantsPage() {
  const [tenants, setTenants] = useState<SpaceTenant[]>(initialTenants)
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<SpaceTenant | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SpaceTenant | null>(null)

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Tenant name is required"
    else if (tenants.some((t) => t.name.toLowerCase() === form.name.trim().toLowerCase())) e.name = "This tenant already exists"
    if (!form.zones) e.zones = "Select an allocated zone"
    if (!form.pallets.trim()) e.pallets = "Pallet allocation is required"
    else if (!/^\d+$/.test(form.pallets) || Number(form.pallets) < 1) e.pallets = "Enter a positive whole number"
    if (!form.sqft.trim()) e.sqft = "Square footage is required"
    else if (!/^\d+$/.test(form.sqft) || Number(form.sqft) < 1) e.sqft = "Enter a positive whole number"
    if (!form.rate.trim()) e.rate = "Rate is required"
    if (!form.lease.trim()) e.lease = "Lease start date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.lease)) e.lease = "Use YYYY-MM-DD"
    if (!form.status) e.status = "Select a status"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createTenant() {
    if (!validate()) return
    const seq = String(tenants.length + 1).padStart(3, "0")
    const next: SpaceTenant = {
      id: `TEN-${seq}`,
      name: form.name.trim(),
      zones: form.zones,
      pallets: Number(form.pallets),
      sqft: Number(form.sqft),
      rate: form.rate.trim(),
      lease: form.lease.trim(),
      status: form.status,
    }
    setTenants((prev) => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Tenant added", `${next.name} allocated ${next.pallets} pallets in ${next.zones}.`)
  }

  function activate(t: SpaceTenant) {
    setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: "Active" } : x)))
    notify.success("Tenant activated", `${t.name} is now an active tenant.`)
  }

  function removeTenant(t: SpaceTenant) {
    setTenants((prev) => prev.filter((x) => x.id !== t.id))
    setDetail(null)
    notify.warning("Tenant removed", `${t.name} and their space allocation have been removed.`)
  }

  const totalPallets = tenants.reduce((s, t) => s + t.pallets, 0)
  const totalSqft = tenants.reduce((s, t) => s + t.sqft, 0)

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Tenants</h1><p className="text-sm text-muted-foreground mt-1">Space allocation and tenant details for all clients</p></div>
        <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Tenant</button>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Tenants", value: tenants.length.toString(), sub: `${tenants.filter((t) => t.status === "Active").length} active` },
          { label: "Pallets Allocated", value: totalPallets.toLocaleString(), sub: "across all zones" },
          { label: "Space Allocated", value: `${totalSqft.toLocaleString()} sq ft`, sub: "leased floor area" },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Tenant","Zones Allocated","Pallets","Sq Ft","Rate","Lease Start","Status","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {tenants.map(t=>(
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{t.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{t.name}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{t.zones}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.pallets}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.sqft.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.rate}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.lease}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status==="Active"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{t.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: `View ${t.name} details`, icon: <Eye />, onSelect: () => setDetail(t) },
                      ...(t.status === "Provisional"
                        ? [{ label: `Activate ${t.name}`, icon: <CheckCircle2 />, onSelect: () => activate(t), tone: "success" as const }]
                        : []),
                      { label: `Remove ${t.name}`, icon: <Trash2 />, onSelect: () => setDeleteTarget(t), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No tenants on record. Use “Add Tenant” to create one.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create tenant */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Add Tenant"
        description="Allocate warehouse space to a new client"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createTenant} submitLabel="Add Tenant" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tenant Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nova Traders" />
          </Field>
          <Field label="Zones Allocated" required error={errors.zones}>
            <Select value={form.zones} invalid={!!errors.zones} onChange={(e) => setForm({ ...form, zones: e.target.value })} options={ZONE_OPTIONS} placeholder="Select Zone" />
          </Field>
          <Field label="Pallets" required error={errors.pallets}>
            <TextInput value={form.pallets} invalid={!!errors.pallets} onChange={(e) => setForm({ ...form, pallets: e.target.value })} placeholder="e.g. 60" inputMode="numeric" />
          </Field>
          <Field label="Square Feet" required error={errors.sqft}>
            <TextInput value={form.sqft} invalid={!!errors.sqft} onChange={(e) => setForm({ ...form, sqft: e.target.value })} placeholder="e.g. 3000" inputMode="numeric" />
          </Field>
          <Field label="Rate" required error={errors.rate}>
            <TextInput value={form.rate} invalid={!!errors.rate} onChange={(e) => setForm({ ...form, rate: e.target.value })} placeholder="e.g. ₹150/pallet/day" />
          </Field>
          <Field label="Lease Start" required error={errors.lease} hint="Format YYYY-MM-DD">
            <TextInput value={form.lease} invalid={!!errors.lease} onChange={(e) => setForm({ ...form, lease: e.target.value })} placeholder="2025-08-01" />
          </Field>
          <Field label="Status" required error={errors.status}>
            <Select value={form.status} invalid={!!errors.status} onChange={(e) => setForm({ ...form, status: e.target.value })} options={STATUS_OPTIONS} placeholder="Select Status" />
          </Field>
        </div>
      </Modal>

      {/* Tenant detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Tenant space allocation"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Tenant ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Zones Allocated" value={detail.zones} />
            <DetailRow label="Pallets" value={detail.pallets} />
            <DetailRow label="Square Feet" value={detail.sqft.toLocaleString()} />
            <DetailRow label="Rate" value={detail.rate} />
            <DetailRow label="Lease Start" value={detail.lease} />
            <DetailRow label="Status" value={<span className={`px-2 py-0.5 rounded-full text-xs font-medium ${detail.status==="Active"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Remove this tenant?"
        message={`${deleteTarget?.name} occupies ${deleteTarget?.pallets ?? 0} pallets (${deleteTarget?.sqft.toLocaleString() ?? 0} sq ft). Removing frees that space immediately.`}
        confirmLabel="Remove Tenant"
        cancelLabel="Keep Tenant"
        onConfirm={() => deleteTarget && removeTenant(deleteTarget)}
      />
    </div>
  )
}
