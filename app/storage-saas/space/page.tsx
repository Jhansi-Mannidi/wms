"use client"

import { useState } from "react"
import { Plus, Building2, TrendingUp, TrendingDown, ArrowUpRight, Trash2 } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type LeasedSpace = {
  id: string; name: string; area: string; slots: number
  cost: number; term: string; used: number; free: number
}

type Allocation = {
  id: string; customer: string; initials: string; color: string
  source: string; area: string; slots: number
  sellRate: number; costRate: number; margin: number
}

type OwnZone = { id: string; label: string; total: number; used: number; rate: string }

const initialLeasedSpaces: LeasedSpace[] = [
  { id: "LS001", name: "ColdStar Warehousing", area: "500 sqft", slots: 50, cost: 18000, term: "Jul–Dec 2026", used: 38, free: 12 },
  { id: "LS002", name: "EcoStore Logistics", area: "800 sqft", slots: 80, cost: 24000, term: "Jun–Nov 2026", used: 71, free: 9 },
]

const initialAllocations: Allocation[] = [
  { id: "A001", customer: "Priya Fashion Store", initials: "PF", color: "bg-emerald-500", source: "Own", area: "120 sqft", slots: 12, sellRate: 450, costRate: 280, margin: 38 },
  { id: "A002", customer: "TechGadgets Ltd", initials: "TG", color: "bg-violet-500", source: "ColdStar", area: "80 sqft", slots: 8, sellRate: 380, costRate: 300, margin: 21 },
  { id: "A003", customer: "Spice & Grain Co.", initials: "SG", color: "bg-amber-500", source: "Own", area: "200 sqft", slots: 20, sellRate: 420, costRate: 260, margin: 38 },
  { id: "A004", customer: "MedEquip Traders", initials: "ME", color: "bg-orange-500", source: "EcoStore", area: "100 sqft", slots: 10, sellRate: 360, costRate: 290, margin: 19 },
  { id: "A005", customer: "Rajesh Kumar", initials: "RK", color: "bg-blue-500", source: "Own", area: "60 sqft", slots: 6, sellRate: 400, costRate: 260, margin: 35 },
]

const initialOwnZones: OwnZone[] = [
  { id: "OZ001", label: "Zone A – Ground Floor", total: 2000, used: 1450, rate: "₹260/slot" },
  { id: "OZ002", label: "Zone B – Mezzanine", total: 1200, used: 780, rate: "₹240/slot" },
]

const PALETTE = ["bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-orange-500", "bg-blue-500", "bg-rose-500"]

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const emptyLeaseForm = { name: "", area: "", slots: "", cost: "", term: "" }
const emptyAllocForm = { customer: "", source: "", area: "", slots: "", sellRate: "", costRate: "" }

export default function SpaceManagerPage() {
  const [activeTab, setActiveTab] = useState<"own" | "leased" | "allocations">("allocations")

  const [leasedSpaces, setLeasedSpaces] = useState<LeasedSpace[]>(initialLeasedSpaces)
  const [allocations, setAllocations] = useState<Allocation[]>(initialAllocations)
  const [ownZones] = useState<OwnZone[]>(initialOwnZones)

  const [leaseOpen, setLeaseOpen] = useState(false)
  const [leaseForm, setLeaseForm] = useState(emptyLeaseForm)
  const [leaseErrors, setLeaseErrors] = useState<Record<string, string>>({})

  const [allocOpen, setAllocOpen] = useState(false)
  const [allocForm, setAllocForm] = useState(emptyAllocForm)
  const [allocErrors, setAllocErrors] = useState<Record<string, string>>({})

  const [allocDetail, setAllocDetail] = useState<Allocation | null>(null)
  const [leaseDetail, setLeaseDetail] = useState<LeasedSpace | null>(null)
  const [zoneDetail, setZoneDetail] = useState<OwnZone | null>(null)

  const [deleteAlloc, setDeleteAlloc] = useState<Allocation | null>(null)
  const [deleteLease, setDeleteLease] = useState<LeasedSpace | null>(null)

  const totalSell = allocations.reduce((s, a) => s + a.sellRate * a.slots, 0)
  const totalCost = leasedSpaces.reduce((s, l) => s + l.cost, 0)
  const netMargin = totalSell - totalCost

  const sourceOptions = ["Own", ...leasedSpaces.map(l => l.name.split(" ")[0])]

  function validateLease() {
    const e: Record<string, string> = {}
    if (!leaseForm.name.trim()) e.name = "Provider name is required"
    if (!leaseForm.area.trim()) e.area = "Area is required"
    else if (!/^\d+$/.test(leaseForm.area) || Number(leaseForm.area) < 1) e.area = "Enter a positive whole number of sqft"
    if (!leaseForm.slots.trim()) e.slots = "Slot count is required"
    else if (!/^\d+$/.test(leaseForm.slots) || Number(leaseForm.slots) < 1) e.slots = "Enter a positive whole number"
    if (!leaseForm.cost.trim()) e.cost = "Monthly cost is required"
    else if (!/^\d+$/.test(leaseForm.cost) || Number(leaseForm.cost) < 1) e.cost = "Enter a positive whole number"
    if (!leaseForm.term.trim()) e.term = "Lease term is required"
    setLeaseErrors(e)
    return Object.keys(e).length === 0
  }

  function createLease() {
    if (!validateLease()) return
    const slots = Number(leaseForm.slots)
    const next: LeasedSpace = {
      id: `LS${String(leasedSpaces.length + 1).padStart(3, "0")}`,
      name: leaseForm.name.trim(),
      area: `${leaseForm.area} sqft`,
      slots,
      cost: Number(leaseForm.cost),
      term: leaseForm.term.trim(),
      used: 0,
      free: slots,
    }
    setLeasedSpaces(prev => [next, ...prev])
    setLeaseOpen(false)
    setLeaseForm(emptyLeaseForm)
    setLeaseErrors({})
    setActiveTab("leased")
    notify.success("Leased-in space added", `${next.name} — ${next.area} at ₹${next.cost.toLocaleString()}/mo.`)
  }

  function validateAlloc() {
    const e: Record<string, string> = {}
    if (!allocForm.customer.trim()) e.customer = "Customer name is required"
    if (!allocForm.source) e.source = "Select a space source"
    if (!allocForm.area.trim()) e.area = "Area is required"
    else if (!/^\d+$/.test(allocForm.area) || Number(allocForm.area) < 1) e.area = "Enter a positive whole number of sqft"
    if (!allocForm.slots.trim()) e.slots = "Slot count is required"
    else if (!/^\d+$/.test(allocForm.slots) || Number(allocForm.slots) < 1) e.slots = "Enter a positive whole number"
    if (!allocForm.sellRate.trim()) e.sellRate = "Sell rate is required"
    else if (!/^\d+$/.test(allocForm.sellRate) || Number(allocForm.sellRate) < 1) e.sellRate = "Enter a positive whole number"
    if (!allocForm.costRate.trim()) e.costRate = "Cost rate is required"
    else if (!/^\d+$/.test(allocForm.costRate) || Number(allocForm.costRate) < 1) e.costRate = "Enter a positive whole number"
    else if (Number(allocForm.costRate) >= Number(allocForm.sellRate || 0)) e.costRate = "Cost rate must be below the sell rate"
    setAllocErrors(e)
    return Object.keys(e).length === 0
  }

  function createAllocation() {
    if (!validateAlloc()) return
    const sellRate = Number(allocForm.sellRate)
    const costRate = Number(allocForm.costRate)
    const next: Allocation = {
      id: `A${String(allocations.length + 1).padStart(3, "0")}`,
      customer: allocForm.customer.trim(),
      initials: initialsOf(allocForm.customer),
      color: PALETTE[allocations.length % PALETTE.length],
      source: allocForm.source,
      area: `${allocForm.area} sqft`,
      slots: Number(allocForm.slots),
      sellRate,
      costRate,
      margin: Math.round(((sellRate - costRate) / sellRate) * 100),
    }
    setAllocations(prev => [next, ...prev])
    setAllocOpen(false)
    setAllocForm(emptyAllocForm)
    setAllocErrors({})
    setActiveTab("allocations")
    notify.success("Space allocated", `${next.customer} — ${next.area} / ${next.slots} slots at ₹${next.sellRate}/slot.`)
  }

  function removeAllocation(a: Allocation) {
    setAllocations(prev => prev.filter(x => x.id !== a.id))
    notify.warning("Allocation released", `${a.customer}'s ${a.area} allocation was released.`)
  }

  function removeLease(l: LeasedSpace) {
    setLeasedSpaces(prev => prev.filter(x => x.id !== l.id))
    notify.warning("Lease ended", `${l.name} (${l.id}) removed — ₹${l.cost.toLocaleString()}/mo cost released.`)
  }

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Space &amp; Sub-Lease Manager</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Own vs leased-in space · allocation · margin arbitrage</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setLeaseForm(emptyLeaseForm); setLeaseErrors({}); setLeaseOpen(true) }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground">
            <Plus className="w-4 h-4" /> Add Leased-In Space
          </button>
          <button
            onClick={() => { setAllocForm(emptyAllocForm); setAllocErrors({}); setAllocOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
            <Plus className="w-4 h-4" /> Allocate Space
          </button>
        </div>
      </div>

      {/* Portfolio summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Total Sell Revenue</p>
          <p className="text-2xl font-bold text-foreground">₹{(totalSell / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Monthly, from all allocations</p>
        </div>
        <div className="p-4 rounded-xl border border-border bg-card">
          <p className="text-xs text-muted-foreground mb-1">Leased-In Cost</p>
          <p className="text-2xl font-bold text-danger">₹{(totalCost / 1000).toFixed(1)}K</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Monthly payments</p>
        </div>
        <div className={cn("p-4 rounded-xl border", netMargin > 0 ? "border-success/30 bg-success/10" : "border-danger/30 bg-danger/10")}>
          <p className="text-xs text-muted-foreground mb-1">Net Margin</p>
          <p className={cn("text-2xl font-bold", netMargin > 0 ? "text-success" : "text-danger")}>
            ₹{Math.abs(netMargin / 1000).toFixed(1)}K
          </p>
          <div className="flex items-center gap-1 text-[10px] mt-0.5">
            {netMargin > 0 ? <TrendingUp className="w-3 h-3 text-success" /> : <TrendingDown className="w-3 h-3 text-danger" />}
            <span className={netMargin > 0 ? "text-success" : "text-danger"}>
              {((netMargin / (totalSell || 1)) * 100).toFixed(0)}% margin
            </span>
            <span className="text-muted-foreground ml-1">(read-only computed)</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5">
        {([
          { id: "allocations", label: "Customer Allocations" },
          { id: "own", label: "Own Space" },
          { id: "leased", label: "Leased-In Space" },
        ] as const).map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              activeTab === tab.id ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted/50")}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "allocations" && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Customer", "Space Source", "Area / Slots", "Sell Rate (₹/slot)", "Cost Rate (₹/slot)", "Markup %", "Margin ₹/mo", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allocations.map((a, i) => {
                  const marginAmt = (a.sellRate - a.costRate) * a.slots
                  return (
                    <tr key={a.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", a.color)}>{a.initials}</div>
                          <span className="text-xs font-semibold text-foreground">{a.customer}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                          a.source === "Own" ? "bg-navy/20 text-foreground" : "bg-warning/15 text-warning")}>
                          {a.source === "Own" ? "Own Space" : a.source}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-foreground">{a.area} · {a.slots} slots</td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">₹{a.sellRate}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">₹{a.costRate}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-bold", a.margin > 25 ? "text-success" : a.margin > 10 ? "text-warning" : "text-danger")}>
                          {a.margin}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-bold text-success">₹{marginAmt.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setAllocDetail(a)} title="View allocation details" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => setDeleteAlloc(a)} title="Release allocation" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {allocations.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No customer allocations yet. Use “Allocate Space” to create one.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "own" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ownZones.map(zone => {
            const pct = (zone.used / zone.total) * 100
            return (
              <button key={zone.id} onClick={() => setZoneDetail(zone)} title={`View ${zone.label} details`}
                className="text-left p-5 rounded-xl border border-border bg-card hover:border-brand/40 transition-colors">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-navy/20 flex items-center justify-center"><Building2 className="w-4 h-4 text-foreground" /></div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{zone.label}</p>
                    <p className="text-[10px] text-muted-foreground">Own Space · {zone.rate}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Capacity</span>
                    <span className="text-foreground font-semibold">{zone.total} sqft</span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all", pct > 85 ? "bg-danger" : pct > 70 ? "bg-warning" : "bg-brand")}
                      style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[10px] text-muted-foreground">
                    <span>Used: {zone.used} sqft ({pct.toFixed(0)}%)</span>
                    <span>Free: {zone.total - zone.used} sqft</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {activeTab === "leased" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {leasedSpaces.map(ls => {
            const pct = (ls.used / ls.slots) * 100
            return (
              <div key={ls.id} className="p-5 rounded-xl border border-warning/30 bg-warning/5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm font-bold text-foreground">{ls.name}</p>
                    <p className="text-[10px] text-muted-foreground">{ls.id} · {ls.term}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-warning/20 text-warning font-semibold">Leased-In</span>
                    <button onClick={() => setLeaseDetail(ls)} title="View lease details" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setDeleteLease(ls)} title="End lease" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Area Leased</p>
                    <p className="font-bold text-foreground">{ls.area}</p>
                  </div>
                  <div className="p-2.5 rounded-lg bg-muted/30">
                    <p className="text-muted-foreground">Monthly Cost</p>
                    <p className="font-bold text-danger">₹{ls.cost.toLocaleString()}</p>
                  </div>
                </div>
                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden mb-1">
                  <div className={cn("h-full rounded-full", pct > 85 ? "bg-danger" : pct > 60 ? "bg-warning" : "bg-success")}
                    style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>{ls.used}/{ls.slots} slots used</span>
                  <span>{ls.free} slots free</span>
                </div>
              </div>
            )
          })}
          {leasedSpaces.length === 0 && (
            <div className="sm:col-span-2 p-10 rounded-xl border border-border bg-card text-center text-sm text-muted-foreground">
              No leased-in space on the books. Use “Add Leased-In Space” to record a lease.
            </div>
          )}
        </div>
      )}

      {/* Add leased-in space */}
      <Modal
        open={leaseOpen}
        onOpenChange={(o) => { setLeaseOpen(o); if (!o) { setLeaseForm(emptyLeaseForm); setLeaseErrors({}) } }}
        title="Add Leased-In Space"
        description="Record a third-party space lease and its monthly cost"
        footer={<ModalActions onCancel={() => setLeaseOpen(false)} onSubmit={createLease} submitLabel="Add Space" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Provider Name" required error={leaseErrors.name}>
            <TextInput value={leaseForm.name} invalid={!!leaseErrors.name} onChange={e => setLeaseForm({ ...leaseForm, name: e.target.value })} placeholder="e.g. ColdStar Warehousing" />
          </Field>
          <Field label="Lease Term" required error={leaseErrors.term}>
            <TextInput value={leaseForm.term} invalid={!!leaseErrors.term} onChange={e => setLeaseForm({ ...leaseForm, term: e.target.value })} placeholder="e.g. Jul–Dec 2026" />
          </Field>
          <Field label="Area (sqft)" required error={leaseErrors.area}>
            <TextInput value={leaseForm.area} invalid={!!leaseErrors.area} onChange={e => setLeaseForm({ ...leaseForm, area: e.target.value })} placeholder="e.g. 500" inputMode="numeric" />
          </Field>
          <Field label="Slots" required error={leaseErrors.slots}>
            <TextInput value={leaseForm.slots} invalid={!!leaseErrors.slots} onChange={e => setLeaseForm({ ...leaseForm, slots: e.target.value })} placeholder="e.g. 50" inputMode="numeric" />
          </Field>
          <Field label="Monthly Cost (₹)" required error={leaseErrors.cost}>
            <TextInput value={leaseForm.cost} invalid={!!leaseErrors.cost} onChange={e => setLeaseForm({ ...leaseForm, cost: e.target.value })} placeholder="e.g. 18000" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Allocate space */}
      <Modal
        open={allocOpen}
        onOpenChange={(o) => { setAllocOpen(o); if (!o) { setAllocForm(emptyAllocForm); setAllocErrors({}) } }}
        title="Allocate Space"
        description="Assign own or leased-in space to a customer"
        footer={<ModalActions onCancel={() => setAllocOpen(false)} onSubmit={createAllocation} submitLabel="Allocate Space" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Customer" required error={allocErrors.customer}>
            <TextInput value={allocForm.customer} invalid={!!allocErrors.customer} onChange={e => setAllocForm({ ...allocForm, customer: e.target.value })} placeholder="e.g. Priya Fashion Store" />
          </Field>
          <Field label="Space Source" required error={allocErrors.source}>
            <Select value={allocForm.source} invalid={!!allocErrors.source} onChange={e => setAllocForm({ ...allocForm, source: e.target.value })} options={sourceOptions} placeholder="Select Source" />
          </Field>
          <Field label="Area (sqft)" required error={allocErrors.area}>
            <TextInput value={allocForm.area} invalid={!!allocErrors.area} onChange={e => setAllocForm({ ...allocForm, area: e.target.value })} placeholder="e.g. 120" inputMode="numeric" />
          </Field>
          <Field label="Slots" required error={allocErrors.slots}>
            <TextInput value={allocForm.slots} invalid={!!allocErrors.slots} onChange={e => setAllocForm({ ...allocForm, slots: e.target.value })} placeholder="e.g. 12" inputMode="numeric" />
          </Field>
          <Field label="Sell Rate (₹/slot)" required error={allocErrors.sellRate}>
            <TextInput value={allocForm.sellRate} invalid={!!allocErrors.sellRate} onChange={e => setAllocForm({ ...allocForm, sellRate: e.target.value })} placeholder="e.g. 450" inputMode="numeric" />
          </Field>
          <Field label="Cost Rate (₹/slot)" required error={allocErrors.costRate} hint="Must be below the sell rate">
            <TextInput value={allocForm.costRate} invalid={!!allocErrors.costRate} onChange={e => setAllocForm({ ...allocForm, costRate: e.target.value })} placeholder="e.g. 280" inputMode="numeric" />
          </Field>
        </div>
      </Modal>

      {/* Allocation detail */}
      <Drawer
        open={!!allocDetail}
        onOpenChange={(o) => !o && setAllocDetail(null)}
        title={allocDetail?.customer ?? ""}
        description="Customer space allocation detail"
        footer={
          <button onClick={() => setAllocDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {allocDetail && (
          <div className="space-y-1">
            <DetailRow label="Allocation ID" value={<span className="font-mono text-brand">{allocDetail.id}</span>} />
            <DetailRow label="Customer" value={allocDetail.customer} />
            <DetailRow label="Space Source" value={allocDetail.source === "Own" ? "Own Space" : allocDetail.source} />
            <DetailRow label="Area" value={allocDetail.area} />
            <DetailRow label="Slots" value={`${allocDetail.slots} slots`} />
            <DetailRow label="Sell Rate" value={`₹${allocDetail.sellRate} / slot`} />
            <DetailRow label="Cost Rate" value={`₹${allocDetail.costRate} / slot`} />
            <DetailRow label="Markup" value={<span className="font-bold text-success">{allocDetail.margin}%</span>} />
            <DetailRow label="Monthly Revenue" value={`₹${(allocDetail.sellRate * allocDetail.slots).toLocaleString()}`} />
            <DetailRow label="Monthly Cost" value={`₹${(allocDetail.costRate * allocDetail.slots).toLocaleString()}`} />
            <DetailRow label="Monthly Margin" value={<span className="font-bold text-success">₹{((allocDetail.sellRate - allocDetail.costRate) * allocDetail.slots).toLocaleString()}</span>} />
          </div>
        )}
      </Drawer>

      {/* Leased space detail */}
      <Drawer
        open={!!leaseDetail}
        onOpenChange={(o) => !o && setLeaseDetail(null)}
        title={leaseDetail?.name ?? ""}
        description="Leased-in space detail"
        footer={
          <button onClick={() => setLeaseDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {leaseDetail && (
          <div className="space-y-1">
            <DetailRow label="Lease ID" value={<span className="font-mono text-brand">{leaseDetail.id}</span>} />
            <DetailRow label="Provider" value={leaseDetail.name} />
            <DetailRow label="Term" value={leaseDetail.term} />
            <DetailRow label="Area Leased" value={leaseDetail.area} />
            <DetailRow label="Total Slots" value={`${leaseDetail.slots} slots`} />
            <DetailRow label="Slots Used" value={`${leaseDetail.used} slots`} />
            <DetailRow label="Slots Free" value={`${leaseDetail.free} slots`} />
            <DetailRow label="Utilisation" value={`${((leaseDetail.used / leaseDetail.slots) * 100).toFixed(0)}%`} />
            <DetailRow label="Monthly Cost" value={<span className="font-bold text-danger">₹{leaseDetail.cost.toLocaleString()}</span>} />
            <DetailRow label="Cost / Slot" value={`₹${Math.round(leaseDetail.cost / leaseDetail.slots).toLocaleString()}`} />
          </div>
        )}
      </Drawer>

      {/* Own zone detail */}
      <Drawer
        open={!!zoneDetail}
        onOpenChange={(o) => !o && setZoneDetail(null)}
        title={zoneDetail?.label ?? ""}
        description="Own space zone detail"
        footer={
          <button onClick={() => setZoneDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {zoneDetail && (
          <div className="space-y-1">
            <DetailRow label="Zone ID" value={<span className="font-mono text-brand">{zoneDetail.id}</span>} />
            <DetailRow label="Zone" value={zoneDetail.label} />
            <DetailRow label="Ownership" value="Own Space" />
            <DetailRow label="Rate" value={zoneDetail.rate} />
            <DetailRow label="Capacity" value={`${zoneDetail.total} sqft`} />
            <DetailRow label="Used" value={`${zoneDetail.used} sqft`} />
            <DetailRow label="Free" value={`${zoneDetail.total - zoneDetail.used} sqft`} />
            <DetailRow label="Utilisation" value={`${((zoneDetail.used / zoneDetail.total) * 100).toFixed(0)}%`} />
          </div>
        )}
      </Drawer>

      {/* Release allocation confirmation */}
      <ConfirmDialog
        open={!!deleteAlloc}
        onOpenChange={(o) => !o && setDeleteAlloc(null)}
        title="Release this allocation?"
        message={`${deleteAlloc?.customer}'s ${deleteAlloc?.area} (${deleteAlloc?.slots} slots) allocation will be released, removing ₹${(((deleteAlloc?.sellRate ?? 0) - (deleteAlloc?.costRate ?? 0)) * (deleteAlloc?.slots ?? 0)).toLocaleString()}/mo of margin. This cannot be undone.`}
        confirmLabel="Release Allocation"
        cancelLabel="Keep It"
        onConfirm={() => deleteAlloc && removeAllocation(deleteAlloc)}
      />

      {/* End lease confirmation */}
      <ConfirmDialog
        open={!!deleteLease}
        onOpenChange={(o) => !o && setDeleteLease(null)}
        title="End this lease?"
        message={`${deleteLease?.name} (${deleteLease?.id}) will be removed from the portfolio, releasing ₹${(deleteLease?.cost ?? 0).toLocaleString()}/mo of cost. This cannot be undone.`}
        confirmLabel="End Lease"
        cancelLabel="Keep It"
        onConfirm={() => deleteLease && removeLease(deleteLease)}
      />
    </div>
  )
}
