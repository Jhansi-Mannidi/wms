"use client"
import { useState } from "react"
import { Eye, UserPlus, UserMinus, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Unit = {
  id: string; type: string; model: string; operator: string
  zone: string; status: string; battery: number; lastMove: string
}

const initialEquipment: Unit[] = [
  { id:"MHE-001",type:"Forklift",model:"Toyota 8FBN25",operator:"Suresh Yadav",zone:"Zone A",status:"Active",battery:85,lastMove:"5m ago"},
  { id:"MHE-002",type:"Reach Truck",model:"Crown RR5225",operator:"Arjun Nair",zone:"Zone B",status:"Idle",battery:62,lastMove:"22m ago"},
  { id:"MHE-003",type:"Pallet Jack",model:"Crown PE 4500",operator:"Unassigned",zone:"Dock Area",status:"Charging",battery:35,lastMove:"1h ago"},
  { id:"MHE-004",type:"Forklift",model:"Hyster H50FT",operator:"Kavitha Rao",zone:"Zone C",status:"Active",battery:91,lastMove:"2m ago"},
  { id:"MHE-005",type:"Order Picker",model:"Crown SP 3040",operator:"Ravi Kumar",zone:"Zone A",status:"Active",battery:78,lastMove:"8m ago"},
  { id:"MHE-006",type:"Reach Truck",model:"Toyota 8FBMT",operator:"Unassigned",zone:"Workshop",status:"Maintenance",battery:0,lastMove:"2d ago"},
  { id:"MHE-007",type:"Forklift",model:"Godrej GX 300",operator:"Meena Patel",zone:"Zone B",status:"Active",battery:74,lastMove:"3m ago"},
  { id:"MHE-008",type:"Reach Truck",model:"Crown RR5225",operator:"Priya Sharma",zone:"Zone C",status:"Active",battery:68,lastMove:"11m ago"},
  { id:"MHE-009",type:"Pallet Jack",model:"Crown WP 3080",operator:"Unassigned",zone:"Zone A",status:"Idle",battery:54,lastMove:"35m ago"},
  { id:"MHE-010",type:"Order Picker",model:"Crown SP 3040",operator:"Ravi Kumar",zone:"Zone B",status:"Active",battery:81,lastMove:"6m ago"},
  { id:"MHE-011",type:"Forklift",model:"Hyster J2.0XN",operator:"Unassigned",zone:"Charging Bay",status:"Charging",battery:28,lastMove:"48m ago"},
  { id:"MHE-012",type:"Reach Truck",model:"Toyota 8FBMT",operator:"Kavitha Rao",zone:"Zone A",status:"Active",battery:59,lastMove:"14m ago"},
  { id:"MHE-013",type:"Pallet Jack",model:"Crown PE 4500",operator:"Unassigned",zone:"Workshop",status:"Maintenance",battery:0,lastMove:"3d ago"},
  { id:"MHE-014",type:"Forklift",model:"Toyota 8FBE18",operator:"Suresh Yadav",zone:"Dock Area",status:"Active",battery:47,lastMove:"9m ago"},
  { id:"MHE-015",type:"Order Picker",model:"Crown SP 3040",operator:"Unassigned",zone:"Zone C",status:"Idle",battery:72,lastMove:"1h ago"},
  { id:"MHE-016",type:"Reach Truck",model:"Crown RR5225",operator:"Arjun Nair",zone:"Zone B",status:"Active",battery:88,lastMove:"4m ago"},
  { id:"MHE-017",type:"Pallet Jack",model:"Crown WP 3080",operator:"Unassigned",zone:"Charging Bay",status:"Charging",battery:19,lastMove:"52m ago"},
  { id:"MHE-018",type:"Forklift",model:"Hyster H50FT",operator:"Meena Patel",zone:"Zone C",status:"Active",battery:93,lastMove:"1m ago"},
  { id:"MHE-019",type:"Order Picker",model:"Yale ERP 025",operator:"Unassigned",zone:"Workshop",status:"Maintenance",battery:0,lastMove:"5d ago"},
  { id:"MHE-020",type:"Reach Truck",model:"Linde E20",operator:"Unassigned",zone:"Zone A",status:"Idle",battery:63,lastMove:"27m ago"},
  { id:"MHE-021",type:"Pallet Jack",model:"Crown PE 4500",operator:"Priya Sharma",zone:"Dock Area",status:"Active",battery:76,lastMove:"7m ago"},
  { id:"MHE-022",type:"Forklift",model:"Godrej GX 300",operator:"Unassigned",zone:"Charging Bay",status:"Charging",battery:12,lastMove:"1h ago"},
  { id:"MHE-023",type:"Order Picker",model:"Crown SP 3040",operator:"Unassigned",zone:"Zone B",status:"Idle",battery:45,lastMove:"41m ago"},
  { id:"MHE-024",type:"Reach Truck",model:"Toyota 8FBMT",operator:"Unassigned",zone:"Workshop",status:"Maintenance",battery:0,lastMove:"1d ago"},
  { id:"MHE-025",type:"Pallet Jack",model:"BYD ECB 25",operator:"Unassigned",zone:"Charging Bay",status:"Charging",battery:33,lastMove:"38m ago"},
  { id:"MHE-026",type:"Forklift",model:"Crown FC 5252",operator:"Unassigned",zone:"Zone C",status:"Idle",battery:57,lastMove:"18m ago"},
]

const OPERATORS = ["Suresh Yadav", "Arjun Nair", "Kavitha Rao", "Ravi Kumar", "Priya Sharma", "Meena Patel"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Dock Area", "Charging Bay", "Workshop"] as const

function statusClass(s: string) {
  return s === "Active" ? "bg-success/10 text-success"
    : s === "Idle" ? "bg-muted text-muted-foreground"
    : s === "Charging" ? "bg-brand/10 text-brand"
    : "bg-amber-50 text-amber-600"
}

export default function MHETrackingPage() {
  const [equipment, setEquipment] = useState<Unit[]>(initialEquipment)
  const [detail, setDetail] = useState<Unit | null>(null)

  const [assignTarget, setAssignTarget] = useState<Unit | null>(null)
  const [assignForm, setAssignForm] = useState({ operator: "", zone: "" })
  const [assignErrors, setAssignErrors] = useState<Record<string, string>>({})

  const [releaseTarget, setReleaseTarget] = useState<Unit | null>(null)

  function openAssign(u: Unit) {
    setAssignTarget(u)
    setAssignForm({ operator: u.operator === "Unassigned" ? "" : u.operator, zone: u.zone })
    setAssignErrors({})
  }

  function submitAssign() {
    if (!assignTarget) return
    const e: Record<string, string> = {}
    if (!assignForm.operator) e.operator = "Select an operator"
    if (!assignForm.zone) e.zone = "Select a zone"
    setAssignErrors(e)
    if (Object.keys(e).length > 0) return
    setEquipment(prev => prev.map(x => x.id === assignTarget.id
      ? { ...x, operator: assignForm.operator, zone: assignForm.zone, status: "Active", lastMove: "just now" }
      : x))
    notify.success("Operator assigned", `${assignForm.operator} is now operating ${assignTarget.id} in ${assignForm.zone}.`)
    setAssignTarget(null)
  }

  function release(u: Unit) {
    setEquipment(prev => prev.map(x => x.id === u.id
      ? { ...x, operator: "Unassigned", status: "Idle", lastMove: "just now" }
      : x))
    notify.warning("Operator released", `${u.id} is now idle and unassigned.`)
  }

  function sendToCharge(u: Unit) {
    setEquipment(prev => prev.map(x => x.id === u.id
      ? { ...x, status: "Charging", zone: "Charging Bay", operator: "Unassigned", lastMove: "just now" }
      : x))
    notify.info("Sent to charging bay", `${u.id} moved to the charging bay at ${u.battery}%.`)
  }

  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Equipment Tracking</h1><p className="text-sm text-muted-foreground mt-1">Live location, operator assignment and battery status</p></div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Equipment ID","Type","Model","Operator","Zone","Battery","Status","Last Move","Actions"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {equipment.map(e=>(
              <tr key={e.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{e.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{e.type}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.model}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.operator}</td>
                <td className="px-4 py-3 text-muted-foreground">{e.zone}</td>
                <td className="px-4 py-3">
                  {e.battery > 0 ? <div className="flex items-center gap-2"><div className="w-16 bg-muted rounded-full h-1.5"><div className={`h-1.5 rounded-full ${e.battery>50?"bg-success":e.battery>20?"bg-amber-400":"bg-danger"}`} style={{width:`${e.battery}%`}} /></div><span className="text-xs">{e.battery}%</span></div> : <span className="text-xs text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(e.status))}>{e.status}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{e.lastMove}</td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(e) },
                      ...(e.operator === "Unassigned"
                        ? [{ label: "Assign operator", icon: <UserPlus />, onSelect: () => openAssign(e) }]
                        : []),
                      ...(e.status !== "Charging" && e.status !== "Maintenance"
                        ? [{ label: "Send to charging bay", icon: <Zap />, onSelect: () => sendToCharge(e) }]
                        : []),
                      ...(e.operator !== "Unassigned"
                        ? [{ label: "Release operator", icon: <UserMinus />, onSelect: () => setReleaseTarget(e), tone: "danger" as const }]
                        : []),
                    ]}
                  />
                </td>
              </tr>
            ))}
            {equipment.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-10 text-center text-sm text-muted-foreground">No equipment is currently tracked.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Assign operator */}
      <Modal
        open={!!assignTarget}
        onOpenChange={(o) => { if (!o) { setAssignTarget(null); setAssignErrors({}) } }}
        title={`Assign Operator — ${assignTarget?.id ?? ""}`}
        description="Put this unit back into active service"
        footer={<ModalActions onCancel={() => setAssignTarget(null)} onSubmit={submitAssign} submitLabel="Assign" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Operator" required error={assignErrors.operator}>
            <Select value={assignForm.operator} invalid={!!assignErrors.operator} onChange={e => setAssignForm({ ...assignForm, operator: e.target.value })} options={OPERATORS} placeholder="Select Operator" />
          </Field>
          <Field label="Zone" required error={assignErrors.zone}>
            <Select value={assignForm.zone} invalid={!!assignErrors.zone} onChange={e => setAssignForm({ ...assignForm, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
          </Field>
        </div>
      </Modal>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Equipment tracking detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Equipment ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Model" value={detail.model} />
            <DetailRow label="Operator" value={detail.operator} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Battery" value={detail.battery > 0 ? `${detail.battery}%` : "—"} />
            <DetailRow label="Last Move" value={detail.lastMove} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusClass(detail.status))}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Release confirmation */}
      <ConfirmDialog
        open={!!releaseTarget}
        onOpenChange={(o) => !o && setReleaseTarget(null)}
        title="Release this operator?"
        message={`${releaseTarget?.operator} will be unassigned from ${releaseTarget?.id} and the unit will go idle.`}
        confirmLabel="Release"
        cancelLabel="Keep Assigned"
        onConfirm={() => releaseTarget && release(releaseTarget)}
      />
    </div>
  )
}
