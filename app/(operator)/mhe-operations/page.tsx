"use client"

import { useState } from "react"
import {
  Forklift, Wrench, AlertTriangle, CheckCircle2,
  Plus, Search, ChevronDown, Eye, Pencil, Trash2, Battery, MapPin
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Equipment = {
  id: string; name: string; type: string; operator: string; zone: string
  battery: number; status: string; lastService: string; nextService: string
}

type MaintenanceLog = {
  id: string; equipment: string; type: string; date: string
  tech: string; status: string; notes: string
}

const initialEquipment: Equipment[] = [
  { id: "MHE-001", name: "Reach Truck 1", type: "Reach Truck", operator: "Suresh Yadav", zone: "Zone A", battery: 85, status: "In Use", lastService: "2024-11-20", nextService: "2025-01-20" },
  { id: "MHE-002", name: "Forklift 1", type: "Counterbalance Forklift", operator: "Arjun Nair", zone: "Dock", battery: 42, status: "In Use", lastService: "2024-10-15", nextService: "2024-12-15" },
  { id: "MHE-003", name: "Pallet Jack 1", type: "Electric Pallet Jack", operator: "Ravi Kumar", zone: "Zone B", battery: 91, status: "Available", lastService: "2024-12-01", nextService: "2025-02-01" },
  { id: "MHE-004", name: "Forklift 2", type: "Counterbalance Forklift", operator: "—", zone: "Workshop", battery: 10, status: "Under Maintenance", lastService: "2024-12-10", nextService: "2025-01-10" },
  { id: "MHE-005", name: "Order Picker 1", type: "Order Picker", operator: "Priya Sharma", zone: "Zone C", battery: 68, status: "In Use", lastService: "2024-11-05", nextService: "2025-01-05" },
  { id: "MHE-006", name: "Reach Truck 2", type: "Reach Truck", operator: "—", zone: "Charging Bay", battery: 5, status: "Charging", lastService: "2024-11-28", nextService: "2025-01-28" },
  { id: "MHE-007", name: "Forklift 3", type: "Counterbalance Forklift", operator: "Meena Patel", zone: "Zone A", battery: 76, status: "In Use", lastService: "2026-05-12", nextService: "2026-08-12" },
  { id: "MHE-008", name: "Reach Truck 3", type: "Reach Truck", operator: "Vikram Sharma", zone: "Zone B", battery: 64, status: "In Use", lastService: "2026-04-28", nextService: "2026-07-28" },
  { id: "MHE-009", name: "Pallet Jack 2", type: "Electric Pallet Jack", operator: "—", zone: "Zone C", battery: 88, status: "Available", lastService: "2026-05-20", nextService: "2026-09-20" },
  { id: "MHE-010", name: "Stacker 1", type: "Stacker", operator: "Kavitha Rao", zone: "Zone A", battery: 57, status: "In Use", lastService: "2026-03-15", nextService: "2026-06-15" },
  { id: "MHE-011", name: "Order Picker 2", type: "Order Picker", operator: "—", zone: "Zone B", battery: 94, status: "Available", lastService: "2026-06-02", nextService: "2026-10-02" },
  { id: "MHE-012", name: "Forklift 4", type: "Counterbalance Forklift", operator: "Anita Desai", zone: "Dock", battery: 38, status: "In Use", lastService: "2026-05-05", nextService: "2026-09-05" },
  { id: "MHE-013", name: "Reach Truck 4", type: "Reach Truck", operator: "—", zone: "Workshop", battery: 12, status: "Under Maintenance", lastService: "2026-06-18", nextService: "2026-08-18" },
  { id: "MHE-014", name: "Pallet Jack 3", type: "Electric Pallet Jack", operator: "Rahul Mehta", zone: "Dock", battery: 71, status: "In Use", lastService: "2026-04-10", nextService: "2026-08-10" },
  { id: "MHE-015", name: "Stacker 2", type: "Stacker", operator: "—", zone: "Charging Bay", battery: 18, status: "Charging", lastService: "2026-05-25", nextService: "2026-09-25" },
  { id: "MHE-016", name: "Forklift 5", type: "Counterbalance Forklift", operator: "Deepa Menon", zone: "Zone C", battery: 82, status: "In Use", lastService: "2026-06-08", nextService: "2026-10-08" },
  { id: "MHE-017", name: "Order Picker 3", type: "Order Picker", operator: "—", zone: "Zone A", battery: 90, status: "Available", lastService: "2026-05-30", nextService: "2026-09-30" },
  { id: "MHE-018", name: "Reach Truck 5", type: "Reach Truck", operator: "Sanjay Gupta", zone: "Zone B", battery: 49, status: "In Use", lastService: "2026-03-22", nextService: "2026-06-22" },
  { id: "MHE-019", name: "Pallet Jack 4", type: "Electric Pallet Jack", operator: "—", zone: "Charging Bay", battery: 8, status: "Charging", lastService: "2026-06-12", nextService: "2026-10-12" },
  { id: "MHE-020", name: "Forklift 6", type: "Counterbalance Forklift", operator: "—", zone: "Workshop", battery: 15, status: "Under Maintenance", lastService: "2026-06-20", nextService: "2026-08-20" },
  { id: "MHE-021", name: "Stacker 3", type: "Stacker", operator: "Priya Sharma", zone: "Zone C", battery: 66, status: "In Use", lastService: "2026-05-16", nextService: "2026-09-16" },
  { id: "MHE-022", name: "Order Picker 4", type: "Order Picker", operator: "—", zone: "Zone B", battery: 79, status: "Available", lastService: "2026-04-18", nextService: "2026-08-18" },
  { id: "MHE-023", name: "Reach Truck 6", type: "Reach Truck", operator: "Ravi Kumar", zone: "Dock", battery: 55, status: "In Use", lastService: "2026-06-01", nextService: "2026-10-01" },
  { id: "MHE-024", name: "Pallet Jack 5", type: "Electric Pallet Jack", operator: "—", zone: "Zone A", battery: 96, status: "Available", lastService: "2026-06-14", nextService: "2026-11-14" },
  { id: "MHE-025", name: "Forklift 7", type: "Counterbalance Forklift", operator: "Arjun Nair", zone: "Zone A", battery: 33, status: "In Use", lastService: "2026-05-09", nextService: "2026-09-09" },
  { id: "MHE-026", name: "Stacker 4", type: "Stacker", operator: "—", zone: "Workshop", battery: 4, status: "Under Maintenance", lastService: "2026-06-25", nextService: "2026-08-25" },
  { id: "MHE-027", name: "Order Picker 5", type: "Order Picker", operator: "—", zone: "Charging Bay", battery: 20, status: "Charging", lastService: "2026-05-28", nextService: "2026-09-28" },
  { id: "MHE-028", name: "Reach Truck 7", type: "Reach Truck", operator: "—", zone: "Zone C", battery: 87, status: "Available", lastService: "2026-06-16", nextService: "2026-11-16" },
]

const initialMaintenanceLogs: MaintenanceLog[] = [
  { id: "MNT-045", equipment: "Forklift 2", type: "Scheduled Service", date: "2024-12-10", tech: "Ramesh Mechanics", status: "In Progress", notes: "Annual service + battery check" },
  { id: "MNT-044", equipment: "Reach Truck 1", type: "Preventive Maintenance", date: "2024-11-20", tech: "Ramesh Mechanics", status: "Completed", notes: "Oil change, brake inspection" },
  { id: "MNT-043", equipment: "Order Picker 1", type: "Breakdown Repair", date: "2024-11-05", tech: "XYZ Services", status: "Completed", notes: "Hydraulic pump replaced" },
  { id: "MNT-042", equipment: "Reach Truck 4", type: "Breakdown Repair", date: "2026-06-18", tech: "In-house Workshop", status: "In Progress", notes: "Mast chain replacement in progress" },
  { id: "MNT-041", equipment: "Forklift 6", type: "Scheduled Service", date: "2026-06-20", tech: "Ramesh Mechanics", status: "In Progress", notes: "500-hour service, awaiting filter stock" },
  { id: "MNT-040", equipment: "Stacker 4", type: "Breakdown Repair", date: "2026-06-25", tech: "XYZ Services", status: "In Progress", notes: "Drive motor rewind, unit off road" },
  { id: "MNT-039", equipment: "Forklift 3", type: "Preventive Maintenance", date: "2026-05-12", tech: "Ramesh Mechanics", status: "Completed", notes: "Oil change and hydraulic hose check" },
  { id: "MNT-038", equipment: "Reach Truck 3", type: "Safety Inspection", date: "2026-04-28", tech: "XYZ Services", status: "Completed", notes: "Annual load test certificate issued" },
  { id: "MNT-037", equipment: "Pallet Jack 2", type: "Preventive Maintenance", date: "2026-05-20", tech: "In-house Workshop", status: "Completed", notes: "Wheel bearing greased, deck cleaned" },
  { id: "MNT-036", equipment: "Stacker 1", type: "Scheduled Service", date: "2026-03-15", tech: "Ramesh Mechanics", status: "Completed", notes: "Quarterly service, forks aligned" },
  { id: "MNT-035", equipment: "Order Picker 2", type: "Preventive Maintenance", date: "2026-06-02", tech: "In-house Workshop", status: "Completed", notes: "Safety harness anchor inspection" },
  { id: "MNT-034", equipment: "Forklift 4", type: "Breakdown Repair", date: "2026-05-05", tech: "XYZ Services", status: "Completed", notes: "Steering cylinder seal kit replaced" },
  { id: "MNT-033", equipment: "Pallet Jack 3", type: "Preventive Maintenance", date: "2026-04-10", tech: "In-house Workshop", status: "Completed", notes: "Battery terminals cleaned and torqued" },
  { id: "MNT-032", equipment: "Stacker 2", type: "Scheduled Service", date: "2026-05-25", tech: "Ramesh Mechanics", status: "Completed", notes: "Annual service, mast rollers replaced" },
  { id: "MNT-031", equipment: "Forklift 5", type: "Safety Inspection", date: "2026-06-08", tech: "XYZ Services", status: "Completed", notes: "Overhead guard and seatbelt check" },
  { id: "MNT-030", equipment: "Order Picker 3", type: "Preventive Maintenance", date: "2026-05-30", tech: "In-house Workshop", status: "Completed", notes: "Platform gate sensor recalibrated" },
  { id: "MNT-029", equipment: "Reach Truck 5", type: "Breakdown Repair", date: "2026-03-22", tech: "Ramesh Mechanics", status: "Completed", notes: "Hydraulic hose burst, line replaced" },
  { id: "MNT-028", equipment: "Pallet Jack 4", type: "Scheduled Service", date: "2026-06-12", tech: "In-house Workshop", status: "Completed", notes: "Charger port rewired, brushes replaced" },
  { id: "MNT-027", equipment: "Stacker 3", type: "Preventive Maintenance", date: "2026-05-16", tech: "Ramesh Mechanics", status: "Completed", notes: "Chain tension adjusted, forks gauged" },
  { id: "MNT-026", equipment: "Order Picker 4", type: "Safety Inspection", date: "2026-04-18", tech: "XYZ Services", status: "Completed", notes: "Emergency stop circuit verified" },
  { id: "MNT-025", equipment: "Reach Truck 6", type: "Preventive Maintenance", date: "2026-06-01", tech: "In-house Workshop", status: "Completed", notes: "Tyre wear check, brakes bled" },
  { id: "MNT-024", equipment: "Pallet Jack 5", type: "Scheduled Service", date: "2026-08-14", tech: "Ramesh Mechanics", status: "Scheduled", notes: "Six-monthly service booked with vendor" },
  { id: "MNT-023", equipment: "Forklift 7", type: "Preventive Maintenance", date: "2026-08-09", tech: "In-house Workshop", status: "Scheduled", notes: "Filter change and hydraulic top-up" },
  { id: "MNT-022", equipment: "Reach Truck 7", type: "Safety Inspection", date: "2026-08-16", tech: "XYZ Services", status: "Scheduled", notes: "Statutory inspection due before renewal" },
  { id: "MNT-021", equipment: "Order Picker 5", type: "Scheduled Service", date: "2026-08-28", tech: "Ramesh Mechanics", status: "Scheduled", notes: "Annual service and battery capacity test" },
  { id: "MNT-020", equipment: "Forklift 1", type: "Breakdown Repair", date: "2026-07-22", tech: "XYZ Services", status: "Scheduled", notes: "Intermittent lift fault, diagnostics booked" },
]

const statusConfig: Record<string, { color: string; bg: string; dot: string }> = {
  "In Use": { color: "text-brand", bg: "bg-brand/15", dot: "bg-brand" },
  "Available": { color: "text-success", bg: "bg-success/15", dot: "bg-success" },
  "Under Maintenance": { color: "text-danger", bg: "bg-danger/15", dot: "bg-danger" },
  "Charging": { color: "text-warning", bg: "bg-warning/15", dot: "bg-warning" },
}

const mntStatusConfig: Record<string, { color: string; bg: string }> = {
  "In Progress": { color: "text-brand", bg: "bg-brand/15" },
  "Completed": { color: "text-success", bg: "bg-success/15" },
  "Scheduled": { color: "text-warning", bg: "bg-warning/15" },
}

const EQUIP_TYPES = ["Reach Truck", "Counterbalance Forklift", "Electric Pallet Jack", "Order Picker", "Stacker"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Dock", "Workshop", "Charging Bay"] as const
const EQUIP_STATUSES = ["In Use", "Available", "Under Maintenance", "Charging"] as const
const MNT_TYPES = ["Scheduled Service", "Preventive Maintenance", "Breakdown Repair", "Safety Inspection"] as const
const TECHS = ["Ramesh Mechanics", "XYZ Services", "In-house Workshop"] as const
const MNT_STATUSES = ["Scheduled", "In Progress", "Completed"] as const

const emptyEquipForm = { id: "", name: "", type: "", operator: "", zone: "", battery: "", status: "", lastService: "", nextService: "" }
const emptyMntForm = { equipment: "", type: "", date: "", tech: "", status: "", notes: "" }

function BatteryBar({ level }: { level: number }) {
  const color = level <= 20 ? "bg-danger" : level <= 50 ? "bg-warning" : "bg-success"
  return (
    <div className="flex items-center gap-2 min-w-20">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${level}%` }} />
      </div>
      <span className="text-xs text-muted-foreground w-8 text-right">{level}%</span>
    </div>
  )
}

export default function MHEOperationsPage() {
  const [equipment, setEquipment] = useState<Equipment[]>(initialEquipment)
  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(initialMaintenanceLogs)

  const [tab, setTab] = useState<"fleet" | "maintenance">("fleet")
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")

  const [equipCreateOpen, setEquipCreateOpen] = useState(false)
  const [equipForm, setEquipForm] = useState(emptyEquipForm)
  const [equipErrors, setEquipErrors] = useState<Record<string, string>>({})

  const [equipEditTarget, setEquipEditTarget] = useState<Equipment | null>(null)
  const [equipEditForm, setEquipEditForm] = useState(emptyEquipForm)
  const [equipEditErrors, setEquipEditErrors] = useState<Record<string, string>>({})

  const [equipDetail, setEquipDetail] = useState<Equipment | null>(null)
  const [equipDeleteTarget, setEquipDeleteTarget] = useState<Equipment | null>(null)

  const [mntCreateOpen, setMntCreateOpen] = useState(false)
  const [mntForm, setMntForm] = useState(emptyMntForm)
  const [mntErrors, setMntErrors] = useState<Record<string, string>>({})
  const [mntDetail, setMntDetail] = useState<MaintenanceLog | null>(null)

  const filtered = equipment.filter((e) => {
    const q = search.toLowerCase()
    return (
      (e.id.toLowerCase().includes(q) || e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || e.status === statusFilter)
    )
  })

  const inUse = equipment.filter((e) => e.status === "In Use").length
  const maintenance = equipment.filter((e) => e.status === "Under Maintenance").length
  const lowBattery = equipment.filter((e) => e.battery <= 20).length

  const overdue = equipment.filter((e) => new Date(e.nextService) < new Date())

  function validateEquip(f: typeof emptyEquipForm, isEdit: boolean) {
    const e: Record<string, string> = {}
    if (!f.id.trim()) e.id = "Equipment ID is required"
    else if (!isEdit && equipment.some(x => x.id.toLowerCase() === f.id.trim().toLowerCase())) e.id = "This ID already exists"
    if (!f.name.trim()) e.name = "Name is required"
    if (!f.type) e.type = "Select a type"
    if (!f.zone) e.zone = "Select a zone"
    if (!f.status) e.status = "Select a status"
    if (!f.battery.trim()) e.battery = "Battery level is required"
    else if (!/^\d+$/.test(f.battery) || Number(f.battery) > 100) e.battery = "Enter a whole number 0–100"
    if (!f.nextService.trim()) e.nextService = "Next service date is required"
    return e
  }

  function createEquipment() {
    const e = validateEquip(equipForm, false)
    setEquipErrors(e)
    if (Object.keys(e).length > 0) return
    const next: Equipment = {
      id: equipForm.id.trim().toUpperCase(),
      name: equipForm.name.trim(),
      type: equipForm.type,
      operator: equipForm.operator.trim() || "—",
      zone: equipForm.zone,
      battery: Number(equipForm.battery),
      status: equipForm.status,
      lastService: equipForm.lastService.trim() || "—",
      nextService: equipForm.nextService,
    }
    setEquipment(prev => [next, ...prev])
    setEquipCreateOpen(false)
    setEquipForm(emptyEquipForm)
    setEquipErrors({})
    notify.success("Equipment added", `${next.id} — ${next.name} registered in ${next.zone}.`)
  }

  function openEquipEdit(eq: Equipment) {
    setEquipEditTarget(eq)
    setEquipEditForm({
      id: eq.id, name: eq.name, type: eq.type, operator: eq.operator === "—" ? "" : eq.operator,
      zone: eq.zone, battery: String(eq.battery), status: eq.status,
      lastService: eq.lastService === "—" ? "" : eq.lastService, nextService: eq.nextService,
    })
    setEquipEditErrors({})
  }

  function saveEquipEdit() {
    if (!equipEditTarget) return
    const e = validateEquip(equipEditForm, true)
    setEquipEditErrors(e)
    if (Object.keys(e).length > 0) return
    setEquipment(prev => prev.map(x => x.id === equipEditTarget.id ? {
      ...x,
      name: equipEditForm.name.trim(),
      type: equipEditForm.type,
      operator: equipEditForm.operator.trim() || "—",
      zone: equipEditForm.zone,
      battery: Number(equipEditForm.battery),
      status: equipEditForm.status,
      lastService: equipEditForm.lastService.trim() || "—",
      nextService: equipEditForm.nextService,
    } : x))
    notify.success("Equipment updated", `${equipEditTarget.id} has been updated.`)
    setEquipEditTarget(null)
  }

  function retireEquipment(eq: Equipment) {
    setEquipment(prev => prev.filter(x => x.id !== eq.id))
    notify.warning("Equipment retired", `${eq.id} — ${eq.name} removed from the fleet.`)
  }

  function createMaintenanceLog() {
    const e: Record<string, string> = {}
    if (!mntForm.equipment) e.equipment = "Select the equipment"
    if (!mntForm.type) e.type = "Select a maintenance type"
    if (!mntForm.date.trim()) e.date = "Date is required"
    if (!mntForm.tech) e.tech = "Select a technician"
    if (!mntForm.status) e.status = "Select a status"
    if (!mntForm.notes.trim()) e.notes = "Notes are required"
    setMntErrors(e)
    if (Object.keys(e).length > 0) return
    const seq = 46 + maintenanceLogs.length - initialMaintenanceLogs.length
    const next: MaintenanceLog = {
      id: `MNT-0${seq}`,
      equipment: mntForm.equipment,
      type: mntForm.type,
      date: mntForm.date,
      tech: mntForm.tech,
      status: mntForm.status,
      notes: mntForm.notes.trim(),
    }
    setMaintenanceLogs(prev => [next, ...prev])
    // Keep fleet status consistent with the log we just wrote.
    if (next.status === "In Progress") {
      setEquipment(prev => prev.map(x => x.name === next.equipment ? { ...x, status: "Under Maintenance", operator: "—" } : x))
    }
    setMntCreateOpen(false)
    setMntForm(emptyMntForm)
    setMntErrors({})
    notify.success("Maintenance logged", `${next.id} — ${next.type} on ${next.equipment}.`)
  }

  function completeLog(log: MaintenanceLog) {
    setMaintenanceLogs(prev => prev.map(x => x.id === log.id ? { ...x, status: "Completed" } : x))
    setEquipment(prev => prev.map(x => x.name === log.equipment && x.status === "Under Maintenance"
      ? { ...x, status: "Available", lastService: log.date }
      : x))
    notify.success("Maintenance completed", `${log.id} closed — ${log.equipment} returned to service.`)
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">MHE Operations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Material handling equipment tracking & maintenance</p>
          </div>
          <button onClick={() => setEquipCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Equipment
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Equipment", value: equipment.length.toString(), sub: "Across all zones", icon: <Forklift className="w-5 h-5" /> },
            { label: "In Use", value: inUse.toString(), sub: "Currently active", icon: <CheckCircle2 className="w-5 h-5" /> },
            { label: "Under Maintenance", value: maintenance.toString(), sub: "Unavailable", icon: <Wrench className="w-5 h-5" /> },
            { label: "Low Battery", value: lowBattery.toString(), sub: "Below 20%", icon: <Battery className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-3.5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className={cn(i === 2 ? "text-danger" : i === 3 ? "text-warning" : "text-brand")}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs mt-1 text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["fleet", "maintenance"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "fleet" ? "Fleet Status" : "Maintenance Log"}
            </button>
          ))}
        </div>

        {tab === "fleet" && (
          <>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="relative">
                <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  {["All Status", "In Use", "Available", "Under Maintenance", "Charging"].map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["ID", "Equipment", "Type", "Operator", "Zone", "Battery", "Status", "Next Service", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((eq, i) => (
                      <tr key={eq.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{eq.id}</td>
                        <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{eq.name}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{eq.type}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{eq.operator}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="flex items-center gap-1 text-muted-foreground text-xs">
                            <MapPin className="w-3 h-3" /> {eq.zone}
                          </span>
                        </td>
                        <td className="px-4 py-3"><BatteryBar level={eq.battery} /></td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium w-fit", statusConfig[eq.status]?.bg, statusConfig[eq.status]?.color)}>
                            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig[eq.status]?.dot)} />
                            {eq.status}
                          </span>
                        </td>
                        <td className={cn("px-4 py-3 whitespace-nowrap text-xs", new Date(eq.nextService) < new Date() ? "text-danger font-semibold" : "text-muted-foreground")}>
                          {eq.nextService}
                        </td>
                        <td className="px-4 py-3">
                          <RowActions
                            items={[
                              { label: "View details", icon: <Eye />, onSelect: () => setEquipDetail(eq) },
                              { label: "Edit equipment", icon: <Pencil />, onSelect: () => openEquipEdit(eq) },
                              { label: "Retire equipment", icon: <Trash2 />, onSelect: () => setEquipDeleteTarget(eq), tone: "danger" as const },
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    {filtered.length === 0 && (
                      <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No equipment matches your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {tab === "maintenance" && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button onClick={() => setMntCreateOpen(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
                <Plus className="w-4 h-4" /> Log Maintenance
              </button>
            </div>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      {["Log ID", "Equipment", "Type", "Date", "Technician", "Status", "Notes", ""].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {maintenanceLogs.map((log, i) => (
                      <tr key={log.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                        <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs">{log.id}</td>
                        <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{log.equipment}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{log.type}</td>
                        <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{log.date}</td>
                        <td className="px-4 py-3 text-foreground whitespace-nowrap">{log.tech}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn("px-2 py-1 rounded-full text-xs font-medium", mntStatusConfig[log.status]?.bg, mntStatusConfig[log.status]?.color)}>
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-48 truncate">{log.notes}</td>
                        <td className="px-4 py-3">
                          <RowActions
                            items={[
                              { label: "View log details", icon: <Eye />, onSelect: () => setMntDetail(log) },
                              ...(log.status !== "Completed"
                                ? [{ label: "Mark completed", icon: <CheckCircle2 />, onSelect: () => completeLog(log), tone: "success" as const }]
                                : []),
                            ]}
                          />
                        </td>
                      </tr>
                    ))}
                    {maintenanceLogs.length === 0 && (
                      <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No maintenance has been logged yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {overdue.length > 0 && (
              <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Upcoming Maintenance Due</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {overdue.map(e => `${e.name} (due ${e.nextService})`).join(" · ")} — service overdue. Schedule immediately.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add equipment */}
      <Modal
        open={equipCreateOpen}
        onOpenChange={(o) => { setEquipCreateOpen(o); if (!o) { setEquipForm(emptyEquipForm); setEquipErrors({}) } }}
        title="Add Equipment"
        description="Register a new material handling unit into the fleet"
        footer={<ModalActions onCancel={() => setEquipCreateOpen(false)} onSubmit={createEquipment} submitLabel="Add Equipment" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Equipment ID" required error={equipErrors.id}>
            <TextInput value={equipForm.id} invalid={!!equipErrors.id} onChange={e => setEquipForm({ ...equipForm, id: e.target.value })} placeholder="e.g. MHE-007" />
          </Field>
          <Field label="Name" required error={equipErrors.name}>
            <TextInput value={equipForm.name} invalid={!!equipErrors.name} onChange={e => setEquipForm({ ...equipForm, name: e.target.value })} placeholder="e.g. Reach Truck 3" />
          </Field>
          <Field label="Type" required error={equipErrors.type}>
            <Select value={equipForm.type} invalid={!!equipErrors.type} onChange={e => setEquipForm({ ...equipForm, type: e.target.value })} options={EQUIP_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Zone" required error={equipErrors.zone}>
            <Select value={equipForm.zone} invalid={!!equipErrors.zone} onChange={e => setEquipForm({ ...equipForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Status" required error={equipErrors.status}>
            <Select value={equipForm.status} invalid={!!equipErrors.status} onChange={e => setEquipForm({ ...equipForm, status: e.target.value })} options={EQUIP_STATUSES} placeholder="Select Status" />
          </Field>
          <Field label="Battery %" required error={equipErrors.battery}>
            <TextInput value={equipForm.battery} invalid={!!equipErrors.battery} onChange={e => setEquipForm({ ...equipForm, battery: e.target.value })} placeholder="e.g. 90" inputMode="numeric" />
          </Field>
          <Field label="Operator" hint="Leave blank if unassigned">
            <TextInput value={equipForm.operator} onChange={e => setEquipForm({ ...equipForm, operator: e.target.value })} placeholder="e.g. Ravi Kumar" />
          </Field>
          <Field label="Last Service">
            <TextInput type="date" value={equipForm.lastService} onChange={e => setEquipForm({ ...equipForm, lastService: e.target.value })} />
          </Field>
          <Field label="Next Service" required error={equipErrors.nextService}>
            <TextInput type="date" value={equipForm.nextService} invalid={!!equipErrors.nextService} onChange={e => setEquipForm({ ...equipForm, nextService: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Edit equipment */}
      <Modal
        open={!!equipEditTarget}
        onOpenChange={(o) => { if (!o) { setEquipEditTarget(null); setEquipEditErrors({}) } }}
        title={`Edit ${equipEditTarget?.id ?? "Equipment"}`}
        description="Update assignment, location or service schedule"
        footer={<ModalActions onCancel={() => setEquipEditTarget(null)} onSubmit={saveEquipEdit} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Name" required error={equipEditErrors.name}>
            <TextInput value={equipEditForm.name} invalid={!!equipEditErrors.name} onChange={e => setEquipEditForm({ ...equipEditForm, name: e.target.value })} />
          </Field>
          <Field label="Type" required error={equipEditErrors.type}>
            <Select value={equipEditForm.type} invalid={!!equipEditErrors.type} onChange={e => setEquipEditForm({ ...equipEditForm, type: e.target.value })} options={EQUIP_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Zone" required error={equipEditErrors.zone}>
            <Select value={equipEditForm.zone} invalid={!!equipEditErrors.zone} onChange={e => setEquipEditForm({ ...equipEditForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
          <Field label="Status" required error={equipEditErrors.status}>
            <Select value={equipEditForm.status} invalid={!!equipEditErrors.status} onChange={e => setEquipEditForm({ ...equipEditForm, status: e.target.value })} options={EQUIP_STATUSES} placeholder="Select Status" />
          </Field>
          <Field label="Battery %" required error={equipEditErrors.battery}>
            <TextInput value={equipEditForm.battery} invalid={!!equipEditErrors.battery} onChange={e => setEquipEditForm({ ...equipEditForm, battery: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Operator" hint="Leave blank if unassigned">
            <TextInput value={equipEditForm.operator} onChange={e => setEquipEditForm({ ...equipEditForm, operator: e.target.value })} />
          </Field>
          <Field label="Last Service">
            <TextInput type="date" value={equipEditForm.lastService} onChange={e => setEquipEditForm({ ...equipEditForm, lastService: e.target.value })} />
          </Field>
          <Field label="Next Service" required error={equipEditErrors.nextService}>
            <TextInput type="date" value={equipEditForm.nextService} invalid={!!equipEditErrors.nextService} onChange={e => setEquipEditForm({ ...equipEditForm, nextService: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Log maintenance */}
      <Modal
        open={mntCreateOpen}
        onOpenChange={(o) => { setMntCreateOpen(o); if (!o) { setMntForm(emptyMntForm); setMntErrors({}) } }}
        title="Log Maintenance"
        description="Record service work against a unit in the fleet"
        footer={<ModalActions onCancel={() => setMntCreateOpen(false)} onSubmit={createMaintenanceLog} submitLabel="Log Maintenance" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Equipment" required error={mntErrors.equipment}>
            <Select value={mntForm.equipment} invalid={!!mntErrors.equipment} onChange={e => setMntForm({ ...mntForm, equipment: e.target.value })} options={equipment.map(e => e.name)} placeholder="Select Equipment" />
          </Field>
          <Field label="Maintenance Type" required error={mntErrors.type}>
            <Select value={mntForm.type} invalid={!!mntErrors.type} onChange={e => setMntForm({ ...mntForm, type: e.target.value })} options={MNT_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Date" required error={mntErrors.date}>
            <TextInput type="date" value={mntForm.date} invalid={!!mntErrors.date} onChange={e => setMntForm({ ...mntForm, date: e.target.value })} />
          </Field>
          <Field label="Technician" required error={mntErrors.tech}>
            <Select value={mntForm.tech} invalid={!!mntErrors.tech} onChange={e => setMntForm({ ...mntForm, tech: e.target.value })} options={TECHS} placeholder="Select Technician" />
          </Field>
          <Field label="Status" required error={mntErrors.status} hint="Logging as In Progress marks the unit Under Maintenance">
            <Select value={mntForm.status} invalid={!!mntErrors.status} onChange={e => setMntForm({ ...mntForm, status: e.target.value })} options={MNT_STATUSES} placeholder="Select Status" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notes" required error={mntErrors.notes}>
              <TextArea value={mntForm.notes} invalid={!!mntErrors.notes} onChange={e => setMntForm({ ...mntForm, notes: e.target.value })} placeholder="e.g. Annual service + battery check" />
            </Field>
          </div>
        </div>
      </Modal>

      {/* Equipment detail */}
      <Drawer
        open={!!equipDetail}
        onOpenChange={(o) => !o && setEquipDetail(null)}
        title={equipDetail?.id ?? ""}
        description="Equipment detail"
        footer={
          <button onClick={() => setEquipDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {equipDetail && (
          <div className="space-y-1">
            <DetailRow label="Equipment ID" value={<span className="font-mono text-brand">{equipDetail.id}</span>} />
            <DetailRow label="Name" value={equipDetail.name} />
            <DetailRow label="Type" value={equipDetail.type} />
            <DetailRow label="Operator" value={equipDetail.operator} />
            <DetailRow label="Zone" value={equipDetail.zone} />
            <DetailRow label="Battery" value={`${equipDetail.battery}%`} />
            <DetailRow label="Last Service" value={equipDetail.lastService} />
            <DetailRow label="Next Service" value={equipDetail.nextService} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusConfig[equipDetail.status]?.bg, statusConfig[equipDetail.status]?.color)}>{equipDetail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Maintenance log detail */}
      <Drawer
        open={!!mntDetail}
        onOpenChange={(o) => !o && setMntDetail(null)}
        title={mntDetail?.id ?? ""}
        description="Maintenance log detail"
        footer={
          <button onClick={() => setMntDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {mntDetail && (
          <div className="space-y-1">
            <DetailRow label="Log ID" value={<span className="font-mono text-brand">{mntDetail.id}</span>} />
            <DetailRow label="Equipment" value={mntDetail.equipment} />
            <DetailRow label="Type" value={mntDetail.type} />
            <DetailRow label="Date" value={mntDetail.date} />
            <DetailRow label="Technician" value={mntDetail.tech} />
            <DetailRow label="Notes" value={mntDetail.notes} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", mntStatusConfig[mntDetail.status]?.bg, mntStatusConfig[mntDetail.status]?.color)}>{mntDetail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Retire confirmation */}
      <ConfirmDialog
        open={!!equipDeleteTarget}
        onOpenChange={(o) => !o && setEquipDeleteTarget(null)}
        title="Retire this equipment?"
        message={`${equipDeleteTarget?.id} — ${equipDeleteTarget?.name} will be removed from the fleet. This cannot be undone.`}
        confirmLabel="Retire"
        cancelLabel="Keep It"
        onConfirm={() => equipDeleteTarget && retireEquipment(equipDeleteTarget)}
      />
    </div>
  )
}
