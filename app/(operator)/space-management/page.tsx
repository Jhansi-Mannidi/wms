"use client"

import { useState } from "react"
import {
  Building2, Users, LayoutGrid, AlertTriangle,
  Plus, Search, Eye, MoreHorizontal, MapPin, TrendingUp, XCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Zone = {
  id: string; name: string; type: string; pallets: number; capacity: number
  utilization: number; tenant: string; temp: string; aisles: number; racking: string
}

type Tenant = {
  id: string; name: string; contract: string; zones: string[]; pallets: number
  space: string; rent: string; status: string; since: string
}

const initialZones: Zone[] = [
  { id: "ZN-A", name: "Zone A", type: "Dry Storage", pallets: 320, capacity: 400, utilization: 80, tenant: "Acme Foods", temp: "Ambient", aisles: 8, racking: "Selective" },
  { id: "ZN-B", name: "Zone B", type: "Dry Storage", pallets: 185, capacity: 250, utilization: 74, tenant: "Multi-tenant", temp: "Ambient", aisles: 6, racking: "Drive-In" },
  { id: "ZN-C", name: "Zone C", type: "Bulk Storage", pallets: 112, capacity: 150, utilization: 75, tenant: "Agro Corp", temp: "Ambient", aisles: 4, racking: "Block Stack" },
  { id: "ZN-D", name: "Zone D", type: "Cold Storage", pallets: 95, capacity: 120, utilization: 79, tenant: "Fresh Farms", temp: "Chilled 2–8°C", aisles: 3, racking: "Selective" },
  { id: "ZN-E", name: "Zone E", type: "Hazmat", pallets: 18, capacity: 40, utilization: 45, tenant: "Restricted", temp: "Controlled", aisles: 2, racking: "Cantilever" },
  { id: "ZN-F", name: "Zone F", type: "Staging", pallets: 44, capacity: 60, utilization: 73, tenant: "All Clients", temp: "Ambient", aisles: 2, racking: "Floor" },
  { id: "ZN-G", name: "Zone G", type: "Cold Storage", pallets: 62, capacity: 80, utilization: 78, tenant: "Tropical Co", temp: "Frozen -18°C", aisles: 3, racking: "Selective" },
  { id: "ZN-H", name: "Zone H", type: "Dry Storage", pallets: 210, capacity: 260, utilization: 81, tenant: "Sweet Mills", temp: "Ambient", aisles: 7, racking: "Drive-In" },
  { id: "ZN-I", name: "Zone I", type: "Bulk Storage", pallets: 130, capacity: 180, utilization: 72, tenant: "Global Oils", temp: "Ambient", aisles: 5, racking: "Block Stack" },
  { id: "ZN-J", name: "Zone J", type: "Staging", pallets: 28, capacity: 50, utilization: 56, tenant: "All Clients", temp: "Ambient", aisles: 2, racking: "Floor" },
  { id: "ZN-K", name: "Zone K", type: "Dry Storage", pallets: 168, capacity: 180, utilization: 93, tenant: "Salt Works", temp: "Ambient", aisles: 6, racking: "Selective" },
  { id: "ZN-L", name: "Zone L", type: "Cold Storage", pallets: 74, capacity: 100, utilization: 74, tenant: "Apex Pharma", temp: "Chilled 2–8°C", aisles: 3, racking: "Selective" },
  { id: "ZN-M", name: "Zone M", type: "Hazmat", pallets: 22, capacity: 35, utilization: 63, tenant: "Restricted", temp: "Controlled", aisles: 2, racking: "Cantilever" },
  { id: "ZN-N", name: "Zone N", type: "Bulk Storage", pallets: 96, capacity: 140, utilization: 69, tenant: "Nova Traders", temp: "Ambient", aisles: 4, racking: "Block Stack" },
]

const initialTenants: Tenant[] = [
  { id: "TNT-001", name: "Acme Foods", contract: "Long-term (3yr)", zones: ["Zone A"], pallets: 320, space: "8,000 sqft", rent: "₹1,20,000/mo", status: "Active", since: "2022-01" },
  { id: "TNT-002", name: "Global Oils", contract: "Annual", zones: ["Zone B partial"], pallets: 90, space: "3,200 sqft", rent: "₹48,000/mo", status: "Active", since: "2023-06" },
  { id: "TNT-003", name: "Agro Corp", contract: "Annual", zones: ["Zone C"], pallets: 112, space: "4,800 sqft", rent: "₹64,000/mo", status: "Active", since: "2023-03" },
  { id: "TNT-004", name: "Fresh Farms", contract: "Monthly", zones: ["Zone D"], pallets: 95, space: "3,600 sqft", rent: "₹90,000/mo", status: "Active", since: "2024-07" },
  { id: "TNT-005", name: "Salt Works", contract: "Annual", zones: ["Zone B partial"], pallets: 55, space: "1,800 sqft", rent: "₹22,000/mo", status: "Active", since: "2023-09" },
  { id: "TNT-006", name: "Sweet Mills", contract: "Annual", zones: ["Zone A partial"], pallets: 40, space: "2,000 sqft", rent: "₹28,000/mo", status: "Active", since: "2024-02" },
  { id: "TNT-007", name: "Tropical Co", contract: "Monthly", zones: ["Zone G"], pallets: 62, space: "2,400 sqft", rent: "₹58,000/mo", status: "Active", since: "2025-01" },
  { id: "TNT-008", name: "Apex Pharma", contract: "Long-term (3yr)", zones: ["Zone L"], pallets: 74, space: "3,000 sqft", rent: "₹96,000/mo", status: "Active", since: "2023-11" },
  { id: "TNT-009", name: "Nova Traders", contract: "Annual", zones: ["Zone N"], pallets: 96, space: "4,200 sqft", rent: "₹54,000/mo", status: "Active", since: "2024-04" },
  { id: "TNT-010", name: "Spice Route Exports", contract: "Annual", zones: ["Zone H partial"], pallets: 68, space: "2,600 sqft", rent: "₹36,000/mo", status: "Active", since: "2024-08" },
  { id: "TNT-011", name: "Kisan Agro Mills", contract: "Monthly", zones: ["Zone I partial"], pallets: 52, space: "2,100 sqft", rent: "₹26,000/mo", status: "Active", since: "2025-02" },
  { id: "TNT-012", name: "Deccan Beverages", contract: "Annual", zones: ["Zone H partial"], pallets: 84, space: "3,400 sqft", rent: "₹44,000/mo", status: "Active", since: "2023-12" },
  { id: "TNT-013", name: "Coastal Seafoods", contract: "Monthly", zones: ["Zone D partial"], pallets: 30, space: "1,200 sqft", rent: "₹38,000/mo", status: "Active", since: "2025-04" },
  { id: "TNT-014", name: "Himalaya Dairy", contract: "Annual", zones: ["Zone L partial"], pallets: 46, space: "1,900 sqft", rent: "₹62,000/mo", status: "Active", since: "2024-10" },
  { id: "TNT-015", name: "Konark Textiles", contract: "Long-term (3yr)", zones: ["Zone I partial"], pallets: 78, space: "3,300 sqft", rent: "₹41,000/mo", status: "Active", since: "2022-08" },
  { id: "TNT-016", name: "Sunrise Bakers", contract: "Annual", zones: ["Zone K partial"], pallets: 58, space: "2,300 sqft", rent: "₹30,000/mo", status: "Active", since: "2024-05" },
  { id: "TNT-017", name: "Ganga Grains", contract: "Annual", zones: ["Zone C partial"], pallets: 66, space: "2,900 sqft", rent: "₹34,000/mo", status: "Active", since: "2023-07" },
  { id: "TNT-018", name: "Meridian Logistics", contract: "Monthly", zones: ["Zone J"], pallets: 28, space: "1,500 sqft", rent: "₹18,000/mo", status: "Active", since: "2025-05" },
  { id: "TNT-019", name: "Sahyadri Farms", contract: "Monthly", zones: ["Zone D partial"], pallets: 24, space: "1,000 sqft", rent: "₹32,000/mo", status: "Active", since: "2025-06" },
  { id: "TNT-020", name: "Vertex Chemicals", contract: "Annual", zones: ["Zone M"], pallets: 22, space: "900 sqft", rent: "₹46,000/mo", status: "Active", since: "2024-03" },
  { id: "TNT-021", name: "Silverline Packaging", contract: "Annual", zones: ["Zone N partial"], pallets: 44, space: "1,800 sqft", rent: "₹23,000/mo", status: "Active", since: "2024-11" },
  { id: "TNT-022", name: "Blue Ridge Foods", contract: "Annual", zones: ["Zone B partial"], pallets: 36, space: "1,500 sqft", rent: "₹19,000/mo", status: "Ended", since: "2022-05" },
  { id: "TNT-023", name: "Orchid Cosmetics", contract: "Monthly", zones: ["Zone K partial"], pallets: 26, space: "1,100 sqft", rent: "₹14,000/mo", status: "Ended", since: "2023-02" },
  { id: "TNT-024", name: "Vermillion Spices", contract: "Annual", zones: ["Zone C partial"], pallets: 34, space: "1,400 sqft", rent: "₹17,000/mo", status: "Ended", since: "2021-11" },
  { id: "TNT-025", name: "Zenith Paper Mills", contract: "Annual", zones: ["Zone H partial"], pallets: 48, space: "2,000 sqft", rent: "₹25,000/mo", status: "Ended", since: "2022-09" },
]

const ZONE_TYPES = ["Dry Storage", "Bulk Storage", "Cold Storage", "Hazmat", "Staging"] as const
const RACKING = ["Selective", "Drive-In", "Block Stack", "Cantilever", "Floor"] as const
const TEMPS = ["Ambient", "Chilled 2–8°C", "Frozen -18°C", "Controlled"] as const

const emptyZoneForm = { name: "", type: "", capacity: "", tenant: "", temp: "", aisles: "", racking: "" }

function UtilBar({ pct }: { pct: number }) {
  const color = pct >= 90 ? "bg-danger" : pct >= 75 ? "bg-warning" : "bg-success"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden min-w-16">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
      <span className={cn("text-xs font-semibold tabular-nums w-8 text-right", pct >= 90 ? "text-danger" : pct >= 75 ? "text-warning" : "text-success")}>
        {pct}%
      </span>
    </div>
  )
}

export default function SpaceManagementPage() {
  const [tab, setTab] = useState<"zones" | "tenants">("zones")
  const [search, setSearch] = useState("")

  const [zones, setZones] = useState<Zone[]>(initialZones)
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants)

  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyZoneForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [zoneDetail, setZoneDetail] = useState<Zone | null>(null)
  const [zoneDeleteTarget, setZoneDeleteTarget] = useState<Zone | null>(null)
  const [tenantDetail, setTenantDetail] = useState<Tenant | null>(null)
  const [tenantEndTarget, setTenantEndTarget] = useState<Tenant | null>(null)

  const totalPallets = zones.reduce((s, z) => s + z.pallets, 0)
  const totalCapacity = zones.reduce((s, z) => s + z.capacity, 0)
  const overallUtil = totalCapacity === 0 ? 0 : Math.round((totalPallets / totalCapacity) * 100)
  const activeTenants = tenants.filter((t) => t.status === "Active").length

  const filteredTenants = tenants.filter((t) => {
    const q = search.toLowerCase()
    return t.name.toLowerCase().includes(q) || t.id.toLowerCase().includes(q)
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim()) e.name = "Zone name is required"
    else if (zones.some((z) => z.name.toLowerCase() === form.name.trim().toLowerCase())) e.name = "A zone with this name already exists"
    if (!form.type) e.type = "Select a zone type"
    if (!form.capacity.trim()) e.capacity = "Capacity is required"
    else if (!/^\d+$/.test(form.capacity) || Number(form.capacity) < 1) e.capacity = "Enter a positive whole number"
    if (!form.tenant.trim()) e.tenant = "Tenant is required"
    if (!form.temp) e.temp = "Select a temperature profile"
    if (!form.aisles.trim()) e.aisles = "Aisle count is required"
    else if (!/^\d+$/.test(form.aisles) || Number(form.aisles) < 1) e.aisles = "Enter a positive whole number"
    if (!form.racking) e.racking = "Select a racking system"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function createZone() {
    if (!validate()) return
    const letter = String.fromCharCode(65 + zones.length)
    const next: Zone = {
      id: `ZN-${letter}`,
      name: form.name.trim(),
      type: form.type,
      pallets: 0,
      capacity: Number(form.capacity),
      utilization: 0,
      tenant: form.tenant.trim(),
      temp: form.temp,
      aisles: Number(form.aisles),
      racking: form.racking,
    }
    setZones((prev) => [...prev, next])
    setCreateOpen(false)
    setForm(emptyZoneForm)
    setErrors({})
    notify.success("Zone created", `${next.name} added with ${next.capacity} pallet positions.`)
  }

  function deleteZone(z: Zone) {
    setZones((prev) => prev.filter((x) => x.id !== z.id))
    setZoneDetail(null)
    notify.warning("Zone removed", `${z.name} has been removed from the warehouse layout.`)
  }

  function endContract(t: Tenant) {
    setTenants((prev) => prev.map((x) => (x.id === t.id ? { ...x, status: "Ended" } : x)))
    setTenantDetail(null)
    notify.warning("Contract ended", `${t.name} is no longer an active tenant.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Space Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Warehouse zones, utilization and tenant management</p>
          </div>
          <button onClick={() => setCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Zone
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Zones", value: zones.length.toString(), sub: "Across warehouse", icon: <LayoutGrid className="w-5 h-5" /> },
            { label: "Total Capacity", value: `${totalCapacity} Pallets`, sub: "Available positions", icon: <Building2 className="w-5 h-5" /> },
            { label: "Overall Utilization", value: `${overallUtil}%`, sub: `${totalPallets} pallets stored`, icon: <TrendingUp className="w-5 h-5" /> },
            { label: "Active Tenants", value: activeTenants.toString(), sub: "Client contracts", icon: <Users className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-3.5 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn(i === 2 && overallUtil >= 85 ? "text-warning" : "text-brand")}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs mt-1 text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        {/* Overall utilization banner */}
        {overallUtil >= 85 && (
          <div className="flex items-center gap-3 p-4 rounded-xl border border-warning/30 bg-warning/10">
            <AlertTriangle className="w-5 h-5 text-warning shrink-0" />
            <p className="text-sm text-warning font-medium">Warehouse utilization is at {overallUtil}%. Consider expanding capacity or redistributing stock.</p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["zones", "tenants"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "zones" ? "Zone Overview" : "Tenants"}
            </button>
          ))}
        </div>

        {tab === "zones" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {zones.map((zone) => (
              <div key={zone.id} className="p-5 rounded-xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-brand/15 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-brand" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{zone.name}</h3>
                        <p className="text-xs text-muted-foreground">{zone.type}</p>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setZoneDetail(zone)} title={`View ${zone.name} details`} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-muted-foreground">Utilization</span>
                    <span className="text-xs text-muted-foreground">{zone.pallets} / {zone.capacity} pallets</span>
                  </div>
                  <UtilBar pct={zone.utilization} />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Tenant</p>
                    <p className="font-medium text-foreground mt-0.5 truncate">{zone.tenant}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Temperature</p>
                    <p className="font-medium text-foreground mt-0.5 truncate">{zone.temp}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Aisles</p>
                    <p className="font-medium text-foreground mt-0.5">{zone.aisles}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Racking</p>
                    <p className="font-medium text-foreground mt-0.5 truncate">{zone.racking}</p>
                  </div>
                </div>
              </div>
            ))}
            {zones.length === 0 && (
              <div className="col-span-full p-10 text-center text-sm text-muted-foreground rounded-xl border border-border bg-card">
                No zones configured. Use “Add Zone” to create one.
              </div>
            )}
          </div>
        )}

        {tab === "tenants" && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-lg border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search tenant..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      {["Tenant ID", "Client Name", "Contract", "Zones", "Pallets", "Space", "Monthly Rent", "Since", "Status", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTenants.map((t, i) => (
                      <tr key={t.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{t.id}</td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t.name}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{t.contract}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex gap-1 flex-wrap">
                            {t.zones.map((z) => (
                              <span key={z} className="px-1.5 py-0.5 rounded-md bg-brand/10 text-brand text-[10px] font-medium">{z}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{t.pallets}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{t.space}</td>
                        <td className="px-4 py-3 font-bold text-foreground whitespace-nowrap">{t.rent}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{t.since}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", t.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{t.status}</span>
                        </td>
                        <td className="px-4 py-3">
                          <RowActions
                            items={[
                              { label: `View ${t.name} details`, icon: <Eye />, onSelect: () => setTenantDetail(t) },
                              {
                                label: t.status === "Active" ? `End contract with ${t.name}` : "Contract already ended",
                                icon: <XCircle />,
                                onSelect: () => setTenantEndTarget(t),
                                disabled: t.status !== "Active",
                                tone: "danger" as const,
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    {filteredTenants.length === 0 && (
                      <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No tenants match your search.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create zone */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyZoneForm); setErrors({}) } }}
        title="Add Zone"
        description="Define a new storage zone in the warehouse"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createZone} submitLabel="Create Zone" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone Name" required error={errors.name}>
            <TextInput value={form.name} invalid={!!errors.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Zone G" />
          </Field>
          <Field label="Zone Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={(e) => setForm({ ...form, type: e.target.value })} options={ZONE_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Capacity (pallets)" required error={errors.capacity}>
            <TextInput value={form.capacity} invalid={!!errors.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} placeholder="e.g. 200" inputMode="numeric" />
          </Field>
          <Field label="Tenant" required error={errors.tenant}>
            <TextInput value={form.tenant} invalid={!!errors.tenant} onChange={(e) => setForm({ ...form, tenant: e.target.value })} placeholder="e.g. Acme Foods" />
          </Field>
          <Field label="Temperature" required error={errors.temp}>
            <Select value={form.temp} invalid={!!errors.temp} onChange={(e) => setForm({ ...form, temp: e.target.value })} options={TEMPS} placeholder="Select Profile" />
          </Field>
          <Field label="Aisles" required error={errors.aisles}>
            <TextInput value={form.aisles} invalid={!!errors.aisles} onChange={(e) => setForm({ ...form, aisles: e.target.value })} placeholder="e.g. 4" inputMode="numeric" />
          </Field>
          <Field label="Racking System" required error={errors.racking}>
            <Select value={form.racking} invalid={!!errors.racking} onChange={(e) => setForm({ ...form, racking: e.target.value })} options={RACKING} placeholder="Select Racking" />
          </Field>
        </div>
      </Modal>

      {/* Zone detail drawer */}
      <Drawer
        open={!!zoneDetail}
        onOpenChange={(o) => !o && setZoneDetail(null)}
        title={zoneDetail?.name ?? ""}
        description="Zone detail"
        footer={
          <>
            <button onClick={() => zoneDetail && setZoneDeleteTarget(zoneDetail)} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90">
              Remove Zone
            </button>
            <button onClick={() => setZoneDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {zoneDetail && (
          <div className="space-y-1">
            <DetailRow label="Zone ID" value={<span className="font-mono text-brand">{zoneDetail.id}</span>} />
            <DetailRow label="Name" value={zoneDetail.name} />
            <DetailRow label="Type" value={zoneDetail.type} />
            <DetailRow label="Tenant" value={zoneDetail.tenant} />
            <DetailRow label="Temperature" value={zoneDetail.temp} />
            <DetailRow label="Pallets Stored" value={`${zoneDetail.pallets} / ${zoneDetail.capacity}`} />
            <DetailRow label="Utilization" value={`${zoneDetail.utilization}%`} />
            <DetailRow label="Aisles" value={zoneDetail.aisles} />
            <DetailRow label="Racking" value={zoneDetail.racking} />
            <DetailRow label="Free Positions" value={`${zoneDetail.capacity - zoneDetail.pallets} pallets`} />
          </div>
        )}
      </Drawer>

      {/* Tenant detail drawer */}
      <Drawer
        open={!!tenantDetail}
        onOpenChange={(o) => !o && setTenantDetail(null)}
        title={tenantDetail?.name ?? ""}
        description="Tenant detail"
        footer={
          <button onClick={() => setTenantDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {tenantDetail && (
          <div className="space-y-1">
            <DetailRow label="Tenant ID" value={<span className="font-mono text-brand">{tenantDetail.id}</span>} />
            <DetailRow label="Client Name" value={tenantDetail.name} />
            <DetailRow label="Contract" value={tenantDetail.contract} />
            <DetailRow label="Zones" value={tenantDetail.zones.join(", ")} />
            <DetailRow label="Pallets" value={tenantDetail.pallets} />
            <DetailRow label="Space" value={tenantDetail.space} />
            <DetailRow label="Monthly Rent" value={tenantDetail.rent} />
            <DetailRow label="Client Since" value={tenantDetail.since} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", tenantDetail.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{tenantDetail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Remove zone confirmation */}
      <ConfirmDialog
        open={!!zoneDeleteTarget}
        onOpenChange={(o) => !o && setZoneDeleteTarget(null)}
        title="Remove this zone?"
        message={`${zoneDeleteTarget?.name} holds ${zoneDeleteTarget?.pallets ?? 0} pallets. Removing it will drop it from the layout and recalculate capacity.`}
        confirmLabel="Remove Zone"
        cancelLabel="Keep It"
        onConfirm={() => zoneDeleteTarget && deleteZone(zoneDeleteTarget)}
      />

      {/* End contract confirmation */}
      <ConfirmDialog
        open={!!tenantEndTarget}
        onOpenChange={(o) => !o && setTenantEndTarget(null)}
        title="End this tenant contract?"
        message={`${tenantEndTarget?.name} will be marked as Ended and excluded from the active tenant count.`}
        confirmLabel="End Contract"
        cancelLabel="Keep Active"
        onConfirm={() => tenantEndTarget && endContract(tenantEndTarget)}
      />
    </div>
  )
}
