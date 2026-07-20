"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Warehouse, MapPin, Plus, Eye, MoreHorizontal,
  Building2, Layers, Grid3X3, Settings2, CheckCircle2, Edit2, Trash2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type WarehouseRow = {
  id: string; name: string; location: string; area: string
  zones: number; docks: number; gates: number; status: string
  hours: string; putaway: string; timezone: string
}

type ZoneRow = {
  id: string; warehouse: string; name: string; type: string
  aisles: number; bays: number; levels: number; total: number
  racking: string; temp: string
}

type DockRow = {
  id: string; warehouse: string; name: string; type: string
  gate: string; status: string; equipment: string
}

const initialWarehouses: WarehouseRow[] = [
  { id: "WH-01", name: "Main Warehouse", location: "Jhansi, UP", area: "45,000 sqft", zones: 6, docks: 4, gates: 3, status: "Active", hours: "06:00 – 22:00", putaway: "FEFO", timezone: "Asia/Kolkata (IST)" },
  { id: "WH-02", name: "Cold Storage Hub", location: "Jhansi, UP", area: "12,000 sqft", zones: 2, docks: 2, gates: 1, status: "Active", hours: "00:00 – 24:00", putaway: "FIFO", timezone: "Asia/Kolkata (IST)" },
]

const initialZones: ZoneRow[] = [
  { id: "ZN-A", warehouse: "Main Warehouse", name: "Zone A", type: "Dry Storage", aisles: 8, bays: 64, levels: 4, total: 256, racking: "Selective", temp: "Ambient" },
  { id: "ZN-B", warehouse: "Main Warehouse", name: "Zone B", type: "Dry Storage", aisles: 6, bays: 48, levels: 4, total: 192, racking: "Drive-In", temp: "Ambient" },
  { id: "ZN-C", warehouse: "Main Warehouse", name: "Zone C", type: "Bulk Storage", aisles: 4, bays: 32, levels: 3, total: 96, racking: "Block Stack", temp: "Ambient" },
  { id: "ZN-D", warehouse: "Main Warehouse", name: "Zone D", type: "Cold Storage", aisles: 3, bays: 24, levels: 5, total: 120, racking: "Selective", temp: "Chilled 2–8°C" },
  { id: "ZN-E", warehouse: "Main Warehouse", name: "Zone E", type: "Hazmat", aisles: 2, bays: 16, levels: 2, total: 32, racking: "Cantilever", temp: "Controlled" },
  { id: "ZN-F", warehouse: "Main Warehouse", name: "Zone F", type: "Staging", aisles: 2, bays: 16, levels: 1, total: 16, racking: "Floor", temp: "Ambient" },
]

const initialDocks: DockRow[] = [
  { id: "DK-01", warehouse: "Main Warehouse", name: "Dock 1", type: "Inbound", gate: "Gate 1", status: "Active", equipment: "Dock Leveler" },
  { id: "DK-02", warehouse: "Main Warehouse", name: "Dock 2", type: "Inbound", gate: "Gate 1", status: "Active", equipment: "Dock Leveler" },
  { id: "DK-03", warehouse: "Main Warehouse", name: "Dock 3", type: "Outbound", gate: "Gate 2", status: "Active", equipment: "Dock Leveler" },
  { id: "DK-04", warehouse: "Main Warehouse", name: "Dock 4", type: "Mixed", gate: "Gate 3", status: "Active", equipment: "Dock Seal" },
]

const ZONE_TYPES = ["Dry Storage", "Bulk Storage", "Cold Storage", "Hazmat", "Staging"] as const
const RACKING = ["Selective", "Drive-In", "Block Stack", "Cantilever", "Floor", "Push Back"] as const
const TEMPS = ["Ambient", "Chilled 2–8°C", "Frozen -20°C", "Controlled"] as const
const DOCK_TYPES = ["Inbound", "Outbound", "Mixed"] as const
const GATES = ["Gate 1", "Gate 2", "Gate 3"] as const
const EQUIPMENT = ["Dock Leveler", "Dock Seal", "Dock Shelter", "None"] as const
const PUTAWAY = ["FEFO", "FIFO", "LIFO", "Nearest Empty Bin"] as const
const WH_STATUSES = ["Active", "Inactive", "Under Construction"] as const

const emptyWarehouseForm = { name: "", location: "", area: "", gates: "", status: "Active" }
const emptyZoneForm = { name: "", warehouse: "", type: "", aisles: "", bays: "", levels: "", racking: "", temp: "" }
const emptyDockForm = { name: "", warehouse: "", type: "Inbound", gate: "Gate 1", equipment: "Dock Leveler", status: "Active" }

export default function WarehouseSetupPage() {
  const router = useRouter()
  const [tab, setTab] = useState<"warehouses" | "zones" | "docks">("warehouses")

  const [warehouses, setWarehouses] = useState<WarehouseRow[]>(initialWarehouses)
  const [zones, setZones] = useState<ZoneRow[]>(initialZones)
  const [docks, setDocks] = useState<DockRow[]>(initialDocks)

  // Warehouse create / manage / configure
  const [whCreateOpen, setWhCreateOpen] = useState(false)
  const [whForm, setWhForm] = useState(emptyWarehouseForm)
  const [whErrors, setWhErrors] = useState<Record<string, string>>({})
  const [manageWh, setManageWh] = useState<WarehouseRow | null>(null)
  const [configureWh, setConfigureWh] = useState<WarehouseRow | null>(null)
  const [configForm, setConfigForm] = useState({ name: "", location: "", area: "", hours: "", putaway: "", timezone: "", status: "" })
  const [configErrors, setConfigErrors] = useState<Record<string, string>>({})
  const [deleteWh, setDeleteWh] = useState<WarehouseRow | null>(null)

  // Zone create / edit / delete
  const [zoneModalOpen, setZoneModalOpen] = useState(false)
  const [editingZone, setEditingZone] = useState<ZoneRow | null>(null)
  const [zoneForm, setZoneForm] = useState(emptyZoneForm)
  const [zoneErrors, setZoneErrors] = useState<Record<string, string>>({})
  const [deleteZone, setDeleteZone] = useState<ZoneRow | null>(null)

  // Dock create / edit / delete
  const [dockModalOpen, setDockModalOpen] = useState(false)
  const [editingDock, setEditingDock] = useState<DockRow | null>(null)
  const [dockForm, setDockForm] = useState(emptyDockForm)
  const [dockErrors, setDockErrors] = useState<Record<string, string>>({})
  const [deleteDock, setDeleteDock] = useState<DockRow | null>(null)

  const warehouseNames = warehouses.map((w) => w.name)

  /* ---------- Warehouse ---------- */

  function validateWarehouse() {
    const e: Record<string, string> = {}
    if (!whForm.name.trim()) e.name = "Warehouse name is required"
    else if (warehouses.some((w) => w.name.toLowerCase() === whForm.name.trim().toLowerCase())) e.name = "A warehouse with this name already exists"
    if (!whForm.location.trim()) e.location = "Location is required"
    if (!whForm.area.trim()) e.area = "Area is required"
    else if (!/^\d[\d,]*$/.test(whForm.area.trim())) e.area = "Enter area as a number, e.g. 45000"
    if (!whForm.gates.trim()) e.gates = "Gate count is required"
    else if (!/^\d+$/.test(whForm.gates) || Number(whForm.gates) < 1) e.gates = "Enter a positive whole number"
    setWhErrors(e)
    return Object.keys(e).length === 0
  }

  function createWarehouse() {
    if (!validateWarehouse()) return
    const seq = String(warehouses.length + 1).padStart(2, "0")
    const next: WarehouseRow = {
      id: `WH-${seq}`,
      name: whForm.name.trim(),
      location: whForm.location.trim(),
      area: `${Number(whForm.area.replace(/,/g, "")).toLocaleString()} sqft`,
      zones: 0,
      docks: 0,
      gates: Number(whForm.gates),
      status: whForm.status,
      hours: "06:00 – 22:00",
      putaway: "FEFO",
      timezone: "Asia/Kolkata (IST)",
    }
    setWarehouses((prev) => [...prev, next])
    setWhCreateOpen(false)
    setWhForm(emptyWarehouseForm)
    setWhErrors({})
    notify.success("Warehouse added", `${next.id} — ${next.name} created at ${next.location}.`)
  }

  function openConfigure(w: WarehouseRow) {
    setConfigureWh(w)
    setConfigForm({ name: w.name, location: w.location, area: w.area, hours: w.hours, putaway: w.putaway, timezone: w.timezone, status: w.status })
    setConfigErrors({})
  }

  function saveConfigure() {
    if (!configureWh) return
    const e: Record<string, string> = {}
    if (!configForm.name.trim()) e.name = "Warehouse name is required"
    if (!configForm.location.trim()) e.location = "Location is required"
    if (!configForm.area.trim()) e.area = "Area is required"
    if (!/^\d{2}:\d{2}\s*–\s*\d{2}:\d{2}$/.test(configForm.hours.trim())) e.hours = "Use the format 06:00 – 22:00"
    setConfigErrors(e)
    if (Object.keys(e).length) return

    setWarehouses((prev) => prev.map((w) => w.id === configureWh.id
      ? { ...w, name: configForm.name.trim(), location: configForm.location.trim(), area: configForm.area.trim(), hours: configForm.hours.trim(), putaway: configForm.putaway, timezone: configForm.timezone, status: configForm.status }
      : w))
    notify.success("Configuration saved", `${configureWh.id} settings updated.`)
    setConfigureWh(null)
  }

  function toggleWarehouseStatus(w: WarehouseRow) {
    const nextStatus = w.status === "Active" ? "Inactive" : "Active"
    setWarehouses((prev) => prev.map((x) => (x.id === w.id ? { ...x, status: nextStatus } : x)))
    notify.success("Status updated", `${w.name} is now ${nextStatus}.`)
    setManageWh(null)
  }

  function removeWarehouse(w: WarehouseRow) {
    setWarehouses((prev) => prev.filter((x) => x.id !== w.id))
    setZones((prev) => prev.filter((z) => z.warehouse !== w.name))
    setDocks((prev) => prev.filter((d) => d.warehouse !== w.name))
    notify.warning("Warehouse deleted", `${w.name} and its zones and docks were removed.`)
  }

  /* ---------- Zones ---------- */

  function openZoneCreate() {
    setEditingZone(null)
    setZoneForm({ ...emptyZoneForm, warehouse: warehouseNames[0] ?? "" })
    setZoneErrors({})
    setZoneModalOpen(true)
  }

  function openZoneEdit(z: ZoneRow) {
    setEditingZone(z)
    setZoneForm({
      name: z.name, warehouse: z.warehouse, type: z.type,
      aisles: String(z.aisles), bays: String(z.bays), levels: String(z.levels),
      racking: z.racking, temp: z.temp,
    })
    setZoneErrors({})
    setZoneModalOpen(true)
  }

  function saveZone() {
    const e: Record<string, string> = {}
    if (!zoneForm.name.trim()) e.name = "Zone name is required"
    else if (zones.some((z) => z.name.toLowerCase() === zoneForm.name.trim().toLowerCase() && z.id !== editingZone?.id)) e.name = "A zone with this name already exists"
    if (!zoneForm.warehouse) e.warehouse = "Select a warehouse"
    if (!zoneForm.type) e.type = "Select a zone type"
    for (const k of ["aisles", "bays", "levels"] as const) {
      const v = zoneForm[k]
      if (!v.trim()) e[k] = "Required"
      else if (!/^\d+$/.test(v) || Number(v) < 1) e[k] = "Positive whole number"
    }
    if (!zoneForm.racking) e.racking = "Select a racking type"
    if (!zoneForm.temp) e.temp = "Select a temperature band"
    setZoneErrors(e)
    if (Object.keys(e).length) return

    const bays = Number(zoneForm.bays)
    const levels = Number(zoneForm.levels)
    const row = {
      warehouse: zoneForm.warehouse,
      name: zoneForm.name.trim(),
      type: zoneForm.type,
      aisles: Number(zoneForm.aisles),
      bays,
      levels,
      total: bays * levels,
      racking: zoneForm.racking,
      temp: zoneForm.temp,
    }

    if (editingZone) {
      setZones((prev) => prev.map((z) => (z.id === editingZone.id ? { ...z, ...row } : z)))
      notify.success("Zone updated", `${row.name} now has ${row.total} locations.`)
    } else {
      const letter = String.fromCharCode(65 + zones.length)
      const next: ZoneRow = { id: `ZN-${letter}`, ...row }
      setZones((prev) => [...prev, next])
      setWarehouses((prev) => prev.map((w) => (w.name === row.warehouse ? { ...w, zones: w.zones + 1 } : w)))
      notify.success("Zone created", `${next.id} — ${next.name} with ${next.total} locations.`)
    }
    setZoneModalOpen(false)
    setEditingZone(null)
    setZoneForm(emptyZoneForm)
  }

  function removeZone(z: ZoneRow) {
    setZones((prev) => prev.filter((x) => x.id !== z.id))
    setWarehouses((prev) => prev.map((w) => (w.name === z.warehouse ? { ...w, zones: Math.max(0, w.zones - 1) } : w)))
    notify.warning("Zone deleted", `${z.name} and its ${z.total} locations were removed.`)
  }

  /* ---------- Docks ---------- */

  function openDockCreate() {
    setEditingDock(null)
    setDockForm({ ...emptyDockForm, warehouse: warehouseNames[0] ?? "" })
    setDockErrors({})
    setDockModalOpen(true)
  }

  function openDockEdit(d: DockRow) {
    setEditingDock(d)
    setDockForm({ name: d.name, warehouse: d.warehouse, type: d.type, gate: d.gate, equipment: d.equipment, status: d.status })
    setDockErrors({})
    setDockModalOpen(true)
  }

  function saveDock() {
    const e: Record<string, string> = {}
    if (!dockForm.name.trim()) e.name = "Dock name is required"
    else if (docks.some((d) => d.name.toLowerCase() === dockForm.name.trim().toLowerCase() && d.id !== editingDock?.id)) e.name = "A dock with this name already exists"
    if (!dockForm.warehouse) e.warehouse = "Select a warehouse"
    setDockErrors(e)
    if (Object.keys(e).length) return

    const row = {
      warehouse: dockForm.warehouse,
      name: dockForm.name.trim(),
      type: dockForm.type,
      gate: dockForm.gate,
      equipment: dockForm.equipment,
      status: dockForm.status,
    }

    if (editingDock) {
      setDocks((prev) => prev.map((d) => (d.id === editingDock.id ? { ...d, ...row } : d)))
      notify.success("Dock updated", `${row.name} saved.`)
    } else {
      const next: DockRow = { id: `DK-${String(docks.length + 1).padStart(2, "0")}`, ...row }
      setDocks((prev) => [...prev, next])
      setWarehouses((prev) => prev.map((w) => (w.name === row.warehouse ? { ...w, docks: w.docks + 1 } : w)))
      notify.success("Dock created", `${next.id} — ${next.name} on ${next.gate}.`)
    }
    setDockModalOpen(false)
    setEditingDock(null)
    setDockForm(emptyDockForm)
  }

  function removeDock(d: DockRow) {
    setDocks((prev) => prev.filter((x) => x.id !== d.id))
    setWarehouses((prev) => prev.map((w) => (w.name === d.warehouse ? { ...w, docks: Math.max(0, w.docks - 1) } : w)))
    notify.warning("Dock deleted", `${d.name} was removed from ${d.warehouse}.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Warehouse Setup</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure warehouses, zones, aisles and docks</p>
          </div>
          <button onClick={() => setWhCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Warehouses", value: warehouses.length.toString(), icon: <Warehouse className="w-5 h-5" /> },
            { label: "Total Zones", value: zones.length.toString(), icon: <Layers className="w-5 h-5" /> },
            { label: "Total Locations", value: zones.reduce((s, z) => s + z.total, 0).toString(), icon: <Grid3X3 className="w-5 h-5" /> },
            { label: "Loading Docks", value: docks.length.toString(), icon: <Building2 className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-brand">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["warehouses", "zones", "docks"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "warehouses" ? "Warehouses" : t === "zones" ? "Zones" : "Docks"}
            </button>
          ))}
        </div>

        {tab === "warehouses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{wh.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {wh.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-medium", wh.status === "Active" ? "bg-success/15 text-success" : wh.status === "Inactive" ? "bg-muted text-muted-foreground" : "bg-warning/15 text-warning")}>{wh.status}</span>
                    <button onClick={() => setManageWh(wh)} title={`Manage ${wh.name}`} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Area", value: wh.area },
                    { label: "Zones", value: wh.zones.toString() },
                    { label: "Docks", value: wh.docks.toString() },
                    { label: "Gates", value: wh.gates.toString() },
                  ].map((m, j) => (
                    <div key={j} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  <button onClick={() => openConfigure(wh)} title={`Configure ${wh.name}`} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                  <span className="text-border">•</span>
                  <button onClick={() => router.push("/warehouse-setup/map")} title="Open the location map" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View Map
                  </button>
                </div>
              </div>
            ))}
            {/* Add warehouse card */}
            <button onClick={() => setWhCreateOpen(true)} className="p-5 rounded-2xl border-2 border-dashed border-border hover:border-brand/50 bg-card hover:bg-brand/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-brand h-40">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add New Warehouse</span>
            </button>
          </div>
        )}

        {tab === "zones" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Zone Configuration</h2>
              <button onClick={openZoneCreate} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Zone
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Zone ID", "Name", "Warehouse", "Type", "Aisles", "Bays", "Levels", "Locations", "Racking", "Temperature", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone, i) => (
                    <tr key={zone.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs font-mono">{zone.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{zone.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{zone.warehouse}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/10 text-brand">{zone.type}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{zone.aisles}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{zone.bays}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{zone.levels}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{zone.total}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{zone.racking}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{zone.temp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openZoneEdit(zone)} title="Edit zone" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteZone(zone)} title="Delete zone" className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {zones.length === 0 && (
                    <tr><td colSpan={11} className="px-4 py-10 text-center text-sm text-muted-foreground">No zones configured yet. Use “Add Zone” to create one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "docks" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Loading Docks</h2>
              <button onClick={openDockCreate} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Dock
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Dock ID", "Name", "Warehouse", "Type", "Gate", "Equipment", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docks.map((dock, i) => (
                    <tr key={dock.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs font-mono">{dock.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{dock.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{dock.warehouse}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", dock.type === "Inbound" ? "bg-success/15 text-success" : dock.type === "Outbound" ? "bg-warning/15 text-warning" : "bg-brand/15 text-brand")}>
                          {dock.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{dock.gate}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{dock.equipment}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("flex items-center gap-1.5 text-xs font-medium", dock.status === "Active" ? "text-success" : "text-muted-foreground")}>
                          <CheckCircle2 className="w-3.5 h-3.5" /> {dock.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openDockEdit(dock)} title="Edit dock" className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteDock(dock)} title="Delete dock" className="p-1.5 rounded-lg hover:bg-danger/10 transition-colors text-muted-foreground hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {docks.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No docks configured yet. Use “Add Dock” to create one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create warehouse */}
      <Modal
        open={whCreateOpen}
        onOpenChange={(o) => { setWhCreateOpen(o); if (!o) { setWhForm(emptyWarehouseForm); setWhErrors({}) } }}
        title="Add Warehouse"
        description="Register a new warehouse facility"
        footer={<ModalActions onCancel={() => setWhCreateOpen(false)} onSubmit={createWarehouse} submitLabel="Add Warehouse" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Warehouse Name" required error={whErrors.name}>
            <TextInput value={whForm.name} invalid={!!whErrors.name} onChange={(e) => setWhForm({ ...whForm, name: e.target.value })} placeholder="e.g. South Distribution Centre" />
          </Field>
          <Field label="Location" required error={whErrors.location}>
            <TextInput value={whForm.location} invalid={!!whErrors.location} onChange={(e) => setWhForm({ ...whForm, location: e.target.value })} placeholder="e.g. Hyderabad, TS" />
          </Field>
          <Field label="Area (sqft)" required error={whErrors.area}>
            <TextInput value={whForm.area} invalid={!!whErrors.area} onChange={(e) => setWhForm({ ...whForm, area: e.target.value })} placeholder="e.g. 45000" inputMode="numeric" />
          </Field>
          <Field label="Gates" required error={whErrors.gates}>
            <TextInput value={whForm.gates} invalid={!!whErrors.gates} onChange={(e) => setWhForm({ ...whForm, gates: e.target.value })} placeholder="e.g. 3" inputMode="numeric" />
          </Field>
          <Field label="Status" required>
            <Select value={whForm.status} onChange={(e) => setWhForm({ ...whForm, status: e.target.value })} options={WH_STATUSES} />
          </Field>
        </div>
      </Modal>

      {/* Configure warehouse */}
      <Modal
        open={!!configureWh}
        onOpenChange={(o) => !o && setConfigureWh(null)}
        title={`Configure — ${configureWh?.name ?? ""}`}
        description="Operational settings for this facility"
        footer={<ModalActions onCancel={() => setConfigureWh(null)} onSubmit={saveConfigure} submitLabel="Save Configuration" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Warehouse Name" required error={configErrors.name}>
            <TextInput value={configForm.name} invalid={!!configErrors.name} onChange={(e) => setConfigForm({ ...configForm, name: e.target.value })} />
          </Field>
          <Field label="Location" required error={configErrors.location}>
            <TextInput value={configForm.location} invalid={!!configErrors.location} onChange={(e) => setConfigForm({ ...configForm, location: e.target.value })} />
          </Field>
          <Field label="Area" required error={configErrors.area}>
            <TextInput value={configForm.area} invalid={!!configErrors.area} onChange={(e) => setConfigForm({ ...configForm, area: e.target.value })} placeholder="e.g. 45,000 sqft" />
          </Field>
          <Field label="Operating Hours" required error={configErrors.hours} hint="Format: 06:00 – 22:00">
            <TextInput value={configForm.hours} invalid={!!configErrors.hours} onChange={(e) => setConfigForm({ ...configForm, hours: e.target.value })} />
          </Field>
          <Field label="Default Putaway Strategy" required>
            <Select value={configForm.putaway} onChange={(e) => setConfigForm({ ...configForm, putaway: e.target.value })} options={PUTAWAY} />
          </Field>
          <Field label="Time Zone" required>
            <Select value={configForm.timezone} onChange={(e) => setConfigForm({ ...configForm, timezone: e.target.value })} options={["Asia/Kolkata (IST)", "Asia/Dubai (GST)", "UTC"]} />
          </Field>
          <Field label="Status" required>
            <Select value={configForm.status} onChange={(e) => setConfigForm({ ...configForm, status: e.target.value })} options={WH_STATUSES} />
          </Field>
        </div>
      </Modal>

      {/* Manage warehouse */}
      <Modal
        open={!!manageWh}
        onOpenChange={(o) => !o && setManageWh(null)}
        title="Manage Warehouse"
        description={manageWh ? `${manageWh.id} — ${manageWh.name}` : ""}
        size="sm"
        footer={
          <button onClick={() => setManageWh(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {manageWh && (
          <div className="space-y-2">
            <button onClick={() => { const w = manageWh; setManageWh(null); openConfigure(w) }} className="w-full flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
              <Settings2 className="w-4 h-4 text-brand" /> Configure settings
            </button>
            <button onClick={() => toggleWarehouseStatus(manageWh)} className="w-full flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors">
              <CheckCircle2 className="w-4 h-4 text-success" /> Mark as {manageWh.status === "Active" ? "Inactive" : "Active"}
            </button>
            <button onClick={() => { setDeleteWh(manageWh); setManageWh(null) }} className="w-full flex items-center gap-2 rounded-lg border border-border px-3 py-2.5 text-sm text-danger hover:bg-danger/10 transition-colors">
              <Trash2 className="w-4 h-4" /> Delete warehouse
            </button>
          </div>
        )}
      </Modal>

      {/* Zone create / edit */}
      <Modal
        open={zoneModalOpen}
        onOpenChange={(o) => { setZoneModalOpen(o); if (!o) { setEditingZone(null); setZoneForm(emptyZoneForm); setZoneErrors({}) } }}
        title={editingZone ? `Edit Zone — ${editingZone.name}` : "Add Zone"}
        description="Aisles, bays and levels define the zone's total storage locations"
        footer={<ModalActions onCancel={() => setZoneModalOpen(false)} onSubmit={saveZone} submitLabel={editingZone ? "Save Zone" : "Create Zone"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Zone Name" required error={zoneErrors.name}>
            <TextInput value={zoneForm.name} invalid={!!zoneErrors.name} onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} placeholder="e.g. Zone G" />
          </Field>
          <Field label="Warehouse" required error={zoneErrors.warehouse}>
            <Select value={zoneForm.warehouse} invalid={!!zoneErrors.warehouse} onChange={(e) => setZoneForm({ ...zoneForm, warehouse: e.target.value })} options={warehouseNames} placeholder="Select Warehouse" />
          </Field>
          <Field label="Zone Type" required error={zoneErrors.type}>
            <Select value={zoneForm.type} invalid={!!zoneErrors.type} onChange={(e) => setZoneForm({ ...zoneForm, type: e.target.value })} options={ZONE_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Racking" required error={zoneErrors.racking}>
            <Select value={zoneForm.racking} invalid={!!zoneErrors.racking} onChange={(e) => setZoneForm({ ...zoneForm, racking: e.target.value })} options={RACKING} placeholder="Select Racking" />
          </Field>
          <Field label="Aisles" required error={zoneErrors.aisles}>
            <TextInput value={zoneForm.aisles} invalid={!!zoneErrors.aisles} onChange={(e) => setZoneForm({ ...zoneForm, aisles: e.target.value })} placeholder="e.g. 8" inputMode="numeric" />
          </Field>
          <Field label="Bays" required error={zoneErrors.bays}>
            <TextInput value={zoneForm.bays} invalid={!!zoneErrors.bays} onChange={(e) => setZoneForm({ ...zoneForm, bays: e.target.value })} placeholder="e.g. 64" inputMode="numeric" />
          </Field>
          <Field label="Levels" required error={zoneErrors.levels} hint="Locations = bays × levels">
            <TextInput value={zoneForm.levels} invalid={!!zoneErrors.levels} onChange={(e) => setZoneForm({ ...zoneForm, levels: e.target.value })} placeholder="e.g. 4" inputMode="numeric" />
          </Field>
          <Field label="Temperature" required error={zoneErrors.temp}>
            <Select value={zoneForm.temp} invalid={!!zoneErrors.temp} onChange={(e) => setZoneForm({ ...zoneForm, temp: e.target.value })} options={TEMPS} placeholder="Select Band" />
          </Field>
        </div>
      </Modal>

      {/* Dock create / edit */}
      <Modal
        open={dockModalOpen}
        onOpenChange={(o) => { setDockModalOpen(o); if (!o) { setEditingDock(null); setDockForm(emptyDockForm); setDockErrors({}) } }}
        title={editingDock ? `Edit Dock — ${editingDock.name}` : "Add Dock"}
        description="Loading dock bay configuration"
        footer={<ModalActions onCancel={() => setDockModalOpen(false)} onSubmit={saveDock} submitLabel={editingDock ? "Save Dock" : "Create Dock"} />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Dock Name" required error={dockErrors.name}>
            <TextInput value={dockForm.name} invalid={!!dockErrors.name} onChange={(e) => setDockForm({ ...dockForm, name: e.target.value })} placeholder="e.g. Dock 5" />
          </Field>
          <Field label="Warehouse" required error={dockErrors.warehouse}>
            <Select value={dockForm.warehouse} invalid={!!dockErrors.warehouse} onChange={(e) => setDockForm({ ...dockForm, warehouse: e.target.value })} options={warehouseNames} placeholder="Select Warehouse" />
          </Field>
          <Field label="Dock Type" required>
            <Select value={dockForm.type} onChange={(e) => setDockForm({ ...dockForm, type: e.target.value })} options={DOCK_TYPES} />
          </Field>
          <Field label="Gate" required>
            <Select value={dockForm.gate} onChange={(e) => setDockForm({ ...dockForm, gate: e.target.value })} options={GATES} />
          </Field>
          <Field label="Equipment" required>
            <Select value={dockForm.equipment} onChange={(e) => setDockForm({ ...dockForm, equipment: e.target.value })} options={EQUIPMENT} />
          </Field>
          <Field label="Status" required>
            <Select value={dockForm.status} onChange={(e) => setDockForm({ ...dockForm, status: e.target.value })} options={["Active", "Inactive"]} />
          </Field>
        </div>
      </Modal>

      {/* Destructive confirmations */}
      <ConfirmDialog
        open={!!deleteWh}
        onOpenChange={(o) => !o && setDeleteWh(null)}
        title="Delete this warehouse?"
        message={`${deleteWh?.name} will be removed along with all of its zones and docks. This cannot be undone.`}
        confirmLabel="Delete Warehouse"
        cancelLabel="Keep It"
        onConfirm={() => deleteWh && removeWarehouse(deleteWh)}
      />
      <ConfirmDialog
        open={!!deleteZone}
        onOpenChange={(o) => !o && setDeleteZone(null)}
        title="Delete this zone?"
        message={`${deleteZone?.name} and its ${deleteZone?.total} storage locations will be removed. This cannot be undone.`}
        confirmLabel="Delete Zone"
        cancelLabel="Keep It"
        onConfirm={() => deleteZone && removeZone(deleteZone)}
      />
      <ConfirmDialog
        open={!!deleteDock}
        onOpenChange={(o) => !o && setDeleteDock(null)}
        title="Delete this dock?"
        message={`${deleteDock?.name} on ${deleteDock?.gate} will be removed from ${deleteDock?.warehouse}.`}
        confirmLabel="Delete Dock"
        cancelLabel="Keep It"
        onConfirm={() => deleteDock && removeDock(deleteDock)}
      />
    </div>
  )
}
