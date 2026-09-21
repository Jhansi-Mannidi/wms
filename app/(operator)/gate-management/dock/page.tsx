"use client"
import { useState } from "react"
import { Plus, Wrench, LogOut, Truck } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Dock = {
  id: string; type: string; status: string
  vehicle: string | null; since: string | null; activity: string | null
}

const initialDocks: Dock[] = [
  { id: "Dock 1", type: "Inbound", status: "occupied", vehicle: "AP-28-BX-1190", since: "09:15", activity: "Unloading" },
  { id: "Dock 2", type: "Inbound", status: "available", vehicle: null, since: null, activity: null },
  { id: "Dock 3", type: "Inbound", status: "occupied", vehicle: "TN-09-AX-4421", since: "08:42", activity: "GRN in progress" },
  { id: "Dock 4", type: "Outbound", status: "available", vehicle: null, since: null, activity: null },
  { id: "Dock 5", type: "Outbound", status: "occupied", vehicle: "MH-02-CX-7734", since: "10:30", activity: "Loading" },
  { id: "Dock 6", type: "Outbound", status: "maintenance", vehicle: null, since: null, activity: "Scheduled maintenance" },
  { id: "Dock 7", type: "Mixed", status: "occupied", vehicle: "KL-07-MN-2233", since: "07:50", activity: "Staging" },
  { id: "Dock 8", type: "Mixed", status: "available", vehicle: null, since: null, activity: null },
  { id: "Dock 9", type: "Outbound", status: "occupied", vehicle: "GJ-18-OP-4455", since: "11:05", activity: "Loading" },
  { id: "Dock 10", type: "Inbound", status: "occupied", vehicle: "RJ-14-QR-6677", since: "09:35", activity: "Inspection" },
  { id: "Dock 11", type: "Mixed", status: "maintenance", vehicle: null, since: null, activity: "Dock leveller repair" },
  { id: "Dock 12", type: "Inbound", status: "available", vehicle: null, since: null, activity: null },
]

const DOCK_TYPES = ["Inbound", "Outbound", "Mixed"] as const
const ACTIVITIES = ["Unloading", "Loading", "GRN in progress", "Staging", "Inspection"] as const

const emptyAssign = { vehicle: "", activity: "" }

export default function DockManagementPage() {
  const [docks, setDocks] = useState<Dock[]>(initialDocks)
  const [typeFilter, setTypeFilter] = useState("All")

  const [assignTarget, setAssignTarget] = useState<Dock | null>(null)
  const [assignForm, setAssignForm] = useState(emptyAssign)
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({})

  const [addOpen, setAddOpen] = useState(false)
  const [addForm, setAddForm] = useState({ id: "", type: "Inbound" })
  const [addErrors, setAddErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Dock | null>(null)
  const [releaseTarget, setReleaseTarget] = useState<Dock | null>(null)

  const filtered = docks.filter((d) => typeFilter === "All" || d.type === typeFilter)

  const stats = [
    { label: "Total Docks", value: docks.length },
    { label: "Occupied", value: docks.filter((d) => d.status === "occupied").length },
    { label: "Available", value: docks.filter((d) => d.status === "available").length },
    { label: "Maintenance", value: docks.filter((d) => d.status === "maintenance").length },
  ]

  function nowTime() {
    return new Date().toTimeString().slice(0, 5)
  }

  function openAssign(d: Dock) {
    setAssignTarget(d)
    setAssignForm(emptyAssign)
    setAssignErrors({})
  }

  function assignVehicle() {
    if (!assignTarget) return
    const e: Record<string, string> = {}
    if (!assignForm.vehicle.trim()) e.vehicle = "Vehicle number is required"
    else if (docks.some((d) => d.vehicle?.toLowerCase() === assignForm.vehicle.trim().toLowerCase()))
      e.vehicle = "This vehicle is already assigned to another dock"
    if (!assignForm.activity) e.activity = "Select the dock activity"
    setAssignErrors(e)
    if (Object.keys(e).length) return

    const vehicle = assignForm.vehicle.trim().toUpperCase()
    setDocks((prev) => prev.map((d) => d.id === assignTarget.id
      ? { ...d, status: "occupied", vehicle, since: nowTime(), activity: assignForm.activity }
      : d))
    notify.success("Vehicle assigned", `${vehicle} assigned to ${assignTarget.id}.`)
    setAssignTarget(null)
  }

  function releaseDock(d: Dock) {
    setDocks((prev) => prev.map((x) => x.id === d.id
      ? { ...x, status: "available", vehicle: null, since: null, activity: null }
      : x))
    notify.success("Dock released", `${d.id} is now available for assignment.`)
  }

  function toggleMaintenance(d: Dock) {
    const goingIn = d.status !== "maintenance"
    setDocks((prev) => prev.map((x) => x.id === d.id
      ? { ...x, status: goingIn ? "maintenance" : "available", vehicle: null, since: null, activity: goingIn ? "Scheduled maintenance" : null }
      : x))
    notify.warning(
      goingIn ? "Dock under maintenance" : "Dock back in service",
      goingIn ? `${d.id} has been taken out of service.` : `${d.id} is available again.`,
    )
  }

  function addDock() {
    const e: Record<string, string> = {}
    if (!addForm.id.trim()) e.id = "Dock name is required"
    else if (docks.some((d) => d.id.toLowerCase() === addForm.id.trim().toLowerCase())) e.id = "A dock with this name already exists"
    setAddErrors(e)
    if (Object.keys(e).length) return

    const next: Dock = { id: addForm.id.trim(), type: addForm.type, status: "available", vehicle: null, since: null, activity: null }
    setDocks((prev) => [...prev, next])
    setAddOpen(false)
    setAddForm({ id: "", type: "Inbound" })
    setAddErrors({})
    notify.success("Dock added", `${next.id} (${next.type}) is ready for assignment.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Dock Management</h1><p className="text-sm text-muted-foreground mt-1">Live dock bay status and assignment board</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="dock-status" />
          <button onClick={() => setAddOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Dock</button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="mb-2"><Truck className="w-5 h-5 text-brand" /></div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {["All", ...DOCK_TYPES].map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {filtered.map(d=>(
          <div key={d.id} className={cn("bg-card border rounded-xl p-5 space-y-3", d.status==="occupied"?"border-brand/30":d.status==="maintenance"?"border-amber-300":"border-border")}>
            <div className="flex items-center justify-between">
              <button onClick={() => setDetail(d)} title={`View ${d.id} detail`} className="font-bold text-foreground hover:text-brand transition-colors">{d.id}</button>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", d.status==="occupied"?"bg-brand/10 text-brand":d.status==="available"?"bg-success/10 text-success":"bg-amber-50 text-amber-600")}>{d.status.charAt(0).toUpperCase()+d.status.slice(1)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{d.type}</p>
            {d.vehicle ? (
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{d.vehicle}</p>
                <p className="text-xs text-muted-foreground">Since {d.since} &bull; {d.activity}</p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">{d.activity ?? "Ready for assignment"}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
              {d.status === "available" && (
                <button onClick={() => openAssign(d)} title={`Assign a vehicle to ${d.id}`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors">
                  <Truck className="w-3.5 h-3.5" /> Assign Vehicle
                </button>
              )}
              {d.status === "occupied" && (
                <button onClick={() => setReleaseTarget(d)} title={`Release ${d.id}`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors">
                  <LogOut className="w-3.5 h-3.5" /> Release
                </button>
              )}
              {d.status !== "occupied" && (
                <button onClick={() => toggleMaintenance(d)} title={d.status === "maintenance" ? `Return ${d.id} to service` : `Take ${d.id} out of service`} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
                  <Wrench className="w-3.5 h-3.5" /> {d.status === "maintenance" ? "Back in Service" : "Maintenance"}
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-3 py-10 text-center text-sm text-muted-foreground">No docks match this type filter.</p>
        )}
      </div>

      {/* Assign vehicle */}
      <Modal
        open={!!assignTarget}
        onOpenChange={(o) => !o && setAssignTarget(null)}
        title={`Assign Vehicle — ${assignTarget?.id ?? ""}`}
        description="Occupy this dock bay with an on-site vehicle"
        size="sm"
        footer={<ModalActions onCancel={() => setAssignTarget(null)} onSubmit={assignVehicle} submitLabel="Assign" />}
      >
        <div className="space-y-4">
          <Field label="Vehicle Number" required error={assignErrors.vehicle}>
            <TextInput value={assignForm.vehicle} invalid={!!assignErrors.vehicle} onChange={(e) => setAssignForm({ ...assignForm, vehicle: e.target.value })} placeholder="e.g. TN-09-AX-4421" />
          </Field>
          <Field label="Activity" required error={assignErrors.activity}>
            <Select value={assignForm.activity} invalid={!!assignErrors.activity} onChange={(e) => setAssignForm({ ...assignForm, activity: e.target.value })} options={ACTIVITIES} placeholder="Select Activity" />
          </Field>
        </div>
      </Modal>

      {/* Add dock */}
      <Modal
        open={addOpen}
        onOpenChange={(o) => { setAddOpen(o); if (!o) { setAddForm({ id: "", type: "Inbound" }); setAddErrors({}) } }}
        title="Add Dock Bay"
        description="Register a new dock bay on the board"
        size="sm"
        footer={<ModalActions onCancel={() => setAddOpen(false)} onSubmit={addDock} submitLabel="Add Dock" />}
      >
        <div className="space-y-4">
          <Field label="Dock Name" required error={addErrors.id}>
            <TextInput value={addForm.id} invalid={!!addErrors.id} onChange={(e) => setAddForm({ ...addForm, id: e.target.value })} placeholder="e.g. Dock 7" />
          </Field>
          <Field label="Dock Type" required>
            <Select value={addForm.type} onChange={(e) => setAddForm({ ...addForm, type: e.target.value })} options={DOCK_TYPES} />
          </Field>
        </div>
      </Modal>

      {/* Dock detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Dock bay detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Dock" value={detail.id} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Status" value={detail.status.charAt(0).toUpperCase() + detail.status.slice(1)} />
            <DetailRow label="Vehicle" value={detail.vehicle ?? "—"} />
            <DetailRow label="Occupied Since" value={detail.since ?? "—"} />
            <DetailRow label="Activity" value={detail.activity ?? "Ready for assignment"} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!releaseTarget}
        onOpenChange={(o) => !o && setReleaseTarget(null)}
        title="Release this dock?"
        message={`${releaseTarget?.vehicle} will be cleared from ${releaseTarget?.id} and the bay marked available.`}
        confirmLabel="Release Dock"
        cancelLabel="Keep Occupied"
        onConfirm={() => releaseTarget && releaseDock(releaseTarget)}
      />
    </div>
  )
}
