"use client"

import { useState } from "react"
import { Plus, ArrowUp, ArrowDown, Building2 } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/wms/page-header"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Activity = {
  id: string; type: string; customer: string; pieces: number
  time: string; space: string; customerInit: string; customerColor: string
}

type SpaceState = {
  ownUsed: number; ownTotal: number
  leasedUsed: number; leasedTotal: number; leasedCost: number
}

const initialActivity: Activity[] = [
  { id: "AC-105", type: "drop-off", customer: "Ravi Textiles", pieces: 24, time: "12m ago", space: "Own", customerInit: "RT", customerColor: "bg-blue-500" },
  { id: "AC-104", type: "release", customer: "Priya Exports", pieces: 6, time: "45m ago", space: "Leased-In", customerInit: "PE", customerColor: "bg-emerald-500" },
  { id: "AC-103", type: "drop-off", customer: "Sharma & Co.", pieces: 12, time: "1.5h ago", space: "Own", customerInit: "SC", customerColor: "bg-amber-500" },
  { id: "AC-102", type: "drop-off", customer: "Buildmart Pvt.", pieces: 40, time: "3h ago", space: "Leased-In", customerInit: "BM", customerColor: "bg-violet-500" },
  { id: "AC-101", type: "release", customer: "Ravi Textiles", pieces: 8, time: "4h ago", space: "Own", customerInit: "RT", customerColor: "bg-blue-500" },
  { id: "AC-100", type: "release", customer: "Sharma & Co.", pieces: 15, time: "5h ago", space: "Own", customerInit: "SC", customerColor: "bg-amber-500" },
  { id: "AC-099", type: "drop-off", customer: "Meena Traders", pieces: 32, time: "6h ago", space: "Own", customerInit: "MT", customerColor: "bg-rose-500" },
  { id: "AC-098", type: "drop-off", customer: "Nair Agro", pieces: 18, time: "7h ago", space: "Leased-In", customerInit: "NA", customerColor: "bg-orange-500" },
  { id: "AC-097", type: "release", customer: "Buildmart Pvt.", pieces: 10, time: "8h ago", space: "Leased-In", customerInit: "BM", customerColor: "bg-violet-500" },
  { id: "AC-096", type: "drop-off", customer: "Kavitha Enterprises", pieces: 26, time: "9h ago", space: "Own", customerInit: "KE", customerColor: "bg-blue-500" },
  { id: "AC-095", type: "release", customer: "Ravi Textiles", pieces: 14, time: "10h ago", space: "Own", customerInit: "RT", customerColor: "bg-blue-500" },
  { id: "AC-094", type: "drop-off", customer: "Priya Exports", pieces: 20, time: "11h ago", space: "Leased-In", customerInit: "PE", customerColor: "bg-emerald-500" },
  { id: "AC-093", type: "release", customer: "Meena Traders", pieces: 9, time: "12h ago", space: "Own", customerInit: "MT", customerColor: "bg-rose-500" },
]

const initialSpaces: SpaceState = {
  ownUsed: 370, ownTotal: 500,
  leasedUsed: 305, leasedTotal: 500, leasedCost: 4200,
}

/** Customers on the books that have had no movement today. */
const DORMANT_CUSTOMERS = 14
const SQFT_PER_PIECE = 2
const STORAGE_REVENUE_PER_PIECE = 150
const HANDLING_REVENUE_PER_PIECE = 25
const MARGIN_PER_PIECE = 60

const PALETTE = ["bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-violet-500", "bg-rose-500", "bg-orange-500"]
const SPACE_TYPES = ["Own", "Leased-In"] as const

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "??"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

const emptyMovementForm = { customer: "", pieces: "", space: "" }
const emptySpaceForm = { type: "", capacity: "", cost: "" }

export default function StorageSaaSPage() {
  const [activity, setActivity] = useState<Activity[]>(initialActivity)
  const [spaces, setSpaces] = useState<SpaceState>(initialSpaces)
  const [revenue, setRevenue] = useState(124000)
  const [margin, setMargin] = useState(28500)

  const [movementKind, setMovementKind] = useState<"drop-off" | "release" | null>(null)
  const [movementForm, setMovementForm] = useState(emptyMovementForm)
  const [movementErrors, setMovementErrors] = useState<Record<string, string>>({})

  const [spaceOpen, setSpaceOpen] = useState(false)
  const [spaceForm, setSpaceForm] = useState(emptySpaceForm)
  const [spaceErrors, setSpaceErrors] = useState<Record<string, string>>({})

  const [detail, setDetail] = useState<Activity | null>(null)

  const ownPct = Math.round((spaces.ownUsed / spaces.ownTotal) * 100)
  const leasedPct = Math.round((spaces.leasedUsed / spaces.leasedTotal) * 100)
  const activeCustomers = new Set(activity.map(a => a.customer)).size + DORMANT_CUSTOMERS
  const dropOffs = activity.filter(a => a.type === "drop-off")
  const releases = activity.filter(a => a.type === "release")
  const piecesIn = dropOffs.reduce((s, a) => s + a.pieces, 0)
  const piecesOut = releases.reduce((s, a) => s + a.pieces, 0)

  const kpis = [
    { label: "Occupancy — Own", value: `${ownPct}%`, sub: `${spaces.ownUsed} / ${spaces.ownTotal} sqft`, color: "text-brand", bar: ownPct, barColor: "bg-brand" },
    { label: "Occupancy — Leased-In", value: `${leasedPct}%`, sub: `${spaces.leasedUsed} / ${spaces.leasedTotal} sqft · ₹${spaces.leasedCost.toLocaleString()}/mo cost`, color: "text-orange-400", bar: leasedPct, barColor: "bg-orange-400" },
    { label: "Active Customers", value: String(activeCustomers), sub: "3 new this month", color: "text-success", bar: null, barColor: "" },
    { label: "Pieces In Today", value: String(piecesIn), sub: `${dropOffs.length} drop-offs`, color: "text-blue-400", bar: null, barColor: "" },
    { label: "Pieces Out Today", value: String(piecesOut), sub: `${releases.length} releases`, color: "text-amber-400", bar: null, barColor: "" },
    { label: "Revenue MTD", value: `₹${(revenue / 100000).toFixed(2)}L`, sub: `Margin: ₹${margin.toLocaleString()}`, color: "text-success", bar: null, barColor: "" },
  ]

  const spaceHealth = [
    { label: "Own Space", used: spaces.ownUsed, free: spaces.ownTotal - spaces.ownUsed, total: spaces.ownTotal, color: "bg-brand", textColor: "text-brand", border: "border-brand/30", bg: "bg-brand/5", margin: "" },
    { label: "Leased-In Space", used: spaces.leasedUsed, free: spaces.leasedTotal - spaces.leasedUsed, total: spaces.leasedTotal, color: "bg-orange-400", textColor: "text-orange-400", border: "border-orange-400/30", bg: "bg-orange-400/5", margin: `₹${spaces.leasedCost.toLocaleString()}/mo` },
  ]

  function validateMovement() {
    const e: Record<string, string> = {}
    if (!movementForm.customer.trim()) e.customer = "Customer is required"
    if (!movementForm.pieces.trim()) e.pieces = "Piece count is required"
    else if (!/^\d+$/.test(movementForm.pieces) || Number(movementForm.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!movementForm.space) e.space = "Select a space"
    else if (!e.pieces && movementKind === "drop-off") {
      const needed = Number(movementForm.pieces) * SQFT_PER_PIECE
      const free = movementForm.space === "Own"
        ? spaces.ownTotal - spaces.ownUsed
        : spaces.leasedTotal - spaces.leasedUsed
      if (needed > free) e.pieces = `Only ${free} sqft free in ${movementForm.space} space (needs ${needed} sqft)`
    } else if (!e.pieces && movementKind === "release") {
      const held = movementForm.space === "Own" ? spaces.ownUsed : spaces.leasedUsed
      if (Number(movementForm.pieces) * SQFT_PER_PIECE > held) {
        e.pieces = `Only ${Math.floor(held / SQFT_PER_PIECE)} pieces held in ${movementForm.space} space`
      }
    }
    setMovementErrors(e)
    return Object.keys(e).length === 0
  }

  function submitMovement() {
    if (!movementKind || !validateMovement()) return
    const pieces = Number(movementForm.pieces)
    const sqft = pieces * SQFT_PER_PIECE
    const isDropOff = movementKind === "drop-off"

    const next: Activity = {
      id: `AC-${activity.length + 101}`,
      type: movementKind,
      customer: movementForm.customer.trim(),
      pieces,
      time: "just now",
      space: movementForm.space,
      customerInit: initialsOf(movementForm.customer),
      customerColor: PALETTE[activity.length % PALETTE.length],
    }

    setActivity(prev => [next, ...prev])
    setSpaces(prev => {
      const delta = isDropOff ? sqft : -sqft
      return movementForm.space === "Own"
        ? { ...prev, ownUsed: Math.max(0, Math.min(prev.ownTotal, prev.ownUsed + delta)) }
        : { ...prev, leasedUsed: Math.max(0, Math.min(prev.leasedTotal, prev.leasedUsed + delta)) }
    })
    setRevenue(prev => prev + pieces * (isDropOff ? STORAGE_REVENUE_PER_PIECE : HANDLING_REVENUE_PER_PIECE))
    setMargin(prev => prev + pieces * MARGIN_PER_PIECE)

    setMovementKind(null)
    setMovementForm(emptyMovementForm)
    setMovementErrors({})
    notify.success(
      isDropOff ? "Drop-off recorded" : "Release dispatched",
      `${next.customer} — ${pieces} pieces ${isDropOff ? "into" : "out of"} ${next.space} space.`,
    )
  }

  function validateSpace() {
    const e: Record<string, string> = {}
    if (!spaceForm.type) e.type = "Select a space type"
    if (!spaceForm.capacity.trim()) e.capacity = "Capacity is required"
    else if (!/^\d+$/.test(spaceForm.capacity) || Number(spaceForm.capacity) < 1) e.capacity = "Enter a positive whole number of sqft"
    if (spaceForm.type === "Leased-In") {
      if (!spaceForm.cost.trim()) e.cost = "Monthly cost is required for leased-in space"
      else if (!/^\d+$/.test(spaceForm.cost) || Number(spaceForm.cost) < 1) e.cost = "Enter a positive whole number"
    }
    setSpaceErrors(e)
    return Object.keys(e).length === 0
  }

  function submitSpace() {
    if (!validateSpace()) return
    const capacity = Number(spaceForm.capacity)
    const cost = Number(spaceForm.cost || 0)
    setSpaces(prev => spaceForm.type === "Own"
      ? { ...prev, ownTotal: prev.ownTotal + capacity }
      : { ...prev, leasedTotal: prev.leasedTotal + capacity, leasedCost: prev.leasedCost + cost })
    setSpaceOpen(false)
    setSpaceForm(emptySpaceForm)
    setSpaceErrors({})
    notify.success(
      "Space added",
      spaceForm.type === "Own"
        ? `${capacity} sqft of own space brought online.`
        : `${capacity} sqft sub-leased at ₹${cost.toLocaleString()}/mo.`,
    )
  }

  return (
    <div className="p-6 h-full overflow-y-auto">
      <PageHeader title="Storage Dashboard" description="Mini-warehouse occupancy, drop-offs and revenue at a glance" className="mb-6" />
      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {kpis.map(k => (
          <div key={k.label} className="flex flex-col gap-1.5 p-3 rounded-xl border border-border bg-card">
            <span className="text-[11px] text-muted-foreground leading-tight">{k.label}</span>
            <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
            {k.bar !== null && (
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className={cn("h-full rounded-full", k.barColor)} style={{ width: `${k.bar}%` }} />
              </div>
            )}
            <p className="text-[10px] text-muted-foreground leading-tight">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Space health strip */}
      <div className="mb-6 p-5 rounded-xl border border-border bg-card">
        <h2 className="text-sm font-bold text-foreground mb-4">Space Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {spaceHealth.map(s => (
            <div key={s.label} className={cn("p-4 rounded-xl border", s.border, s.bg)}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-foreground">{s.label}</span>
                {s.margin && <span className="text-[11px] text-orange-400 font-semibold">Cost: {s.margin}</span>}
              </div>
              <div className="h-4 rounded-full bg-muted/40 overflow-hidden mb-2">
                <div className={cn("h-full rounded-full", s.color)} style={{ width: `${(s.used / s.total) * 100}%` }} />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span><span className={cn("font-bold", s.textColor)}>{s.used} sqft</span> used</span>
                <span><span className="font-semibold text-foreground">{s.free} sqft</span> free</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Quick actions */}
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground">Quick Actions</h2>
          <button
            onClick={() => { setMovementForm(emptyMovementForm); setMovementErrors({}); setMovementKind("drop-off") }}
            title="Record a new drop-off"
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl bg-brand text-white font-semibold text-sm hover:bg-brand/90 transition-colors">
            <Plus className="w-5 h-5" />
            <div className="text-left">
              <p>New Drop-Off</p>
              <p className="text-[11px] font-normal opacity-80">Record customer goods intake</p>
            </div>
          </button>
          <button
            onClick={() => { setMovementForm(emptyMovementForm); setMovementErrors({}); setMovementKind("release") }}
            title="Dispatch a new release"
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors">
            <ArrowUp className="w-5 h-5 text-success" />
            <div className="text-left">
              <p>New Release</p>
              <p className="text-[11px] font-normal text-muted-foreground">Dispatch customer goods</p>
            </div>
          </button>
          <button
            onClick={() => { setSpaceForm(emptySpaceForm); setSpaceErrors({}); setSpaceOpen(true) }}
            title="Manage spaces and sub-lease"
            className="w-full flex items-center gap-3 px-4 py-4 rounded-xl border border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-colors">
            <Building2 className="w-5 h-5 text-brand" />
            <div className="text-left">
              <p>Manage Spaces</p>
              <p className="text-[11px] font-normal text-muted-foreground">Sub-lease &amp; allocation</p>
            </div>
          </button>
        </div>

        {/* Recent activity feed */}
        <div className="lg:col-span-2">
          <h2 className="text-sm font-bold text-foreground mb-3">Recent Activity</h2>
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            {activity.map((a, i) => (
              <button
                key={a.id}
                onClick={() => setDetail(a)}
                title={`View ${a.customer} ${a.type} detail`}
                className={cn("w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/20 transition-colors", i < activity.length - 1 ? "border-b border-border/50" : "")}>
                <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", a.customerColor)}>{a.customerInit}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">{a.customer}</span>
                    <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full",
                      a.type === "drop-off" ? "bg-brand/15 text-brand" : "bg-success/15 text-success"
                    )}>
                      {a.type === "drop-off" ? "Drop-Off" : "Release"}
                    </span>
                    <span className="text-[10px] text-muted-foreground ml-auto">{a.space}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">{a.pieces} pieces · {a.time}</p>
                </div>
                {a.type === "drop-off"
                  ? <ArrowDown className="w-4 h-4 text-brand shrink-0" />
                  : <ArrowUp className="w-4 h-4 text-success shrink-0" />}
              </button>
            ))}
            {activity.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-muted-foreground">No activity recorded today.</div>
            )}
          </div>
        </div>
      </div>

      {/* New drop-off / new release */}
      <Modal
        open={!!movementKind}
        onOpenChange={(o) => { if (!o) { setMovementKind(null); setMovementForm(emptyMovementForm); setMovementErrors({}) } }}
        title={movementKind === "release" ? "New Release Dispatch" : "New Drop-Off Record"}
        description={movementKind === "release" ? "Dispatch customer goods out of storage" : "Record customer goods intake"}
        size="sm"
        footer={
          <ModalActions
            onCancel={() => setMovementKind(null)}
            onSubmit={submitMovement}
            submitLabel={movementKind === "release" ? "Dispatch Release" : "Record Drop-Off"}
          />
        }
      >
        <div className="space-y-4">
          <Field label="Customer" required error={movementErrors.customer}>
            <TextInput value={movementForm.customer} invalid={!!movementErrors.customer} onChange={e => setMovementForm({ ...movementForm, customer: e.target.value })} placeholder="e.g. Ravi Textiles" />
          </Field>
          <Field label="Pieces" required error={movementErrors.pieces}>
            <TextInput value={movementForm.pieces} invalid={!!movementErrors.pieces} onChange={e => setMovementForm({ ...movementForm, pieces: e.target.value })} placeholder="e.g. 24" inputMode="numeric" />
          </Field>
          <Field label="Space" required error={movementErrors.space} hint={`${SQFT_PER_PIECE} sqft is reserved per piece`}>
            <Select value={movementForm.space} invalid={!!movementErrors.space} onChange={e => setMovementForm({ ...movementForm, space: e.target.value })} options={SPACE_TYPES} placeholder="Select Space" />
          </Field>
        </div>
      </Modal>

      {/* Manage spaces / sub-lease */}
      <Modal
        open={spaceOpen}
        onOpenChange={(o) => { setSpaceOpen(o); if (!o) { setSpaceForm(emptySpaceForm); setSpaceErrors({}) } }}
        title="Manage Spaces"
        description="Bring own space online or sub-lease additional capacity"
        size="sm"
        footer={<ModalActions onCancel={() => setSpaceOpen(false)} onSubmit={submitSpace} submitLabel="Add Capacity" />}
      >
        <div className="space-y-4">
          <Field label="Space Type" required error={spaceErrors.type}>
            <Select value={spaceForm.type} invalid={!!spaceErrors.type} onChange={e => setSpaceForm({ ...spaceForm, type: e.target.value })} options={SPACE_TYPES} placeholder="Select Space Type" />
          </Field>
          <Field label="Capacity (sqft)" required error={spaceErrors.capacity}>
            <TextInput value={spaceForm.capacity} invalid={!!spaceErrors.capacity} onChange={e => setSpaceForm({ ...spaceForm, capacity: e.target.value })} placeholder="e.g. 250" inputMode="numeric" />
          </Field>
          {spaceForm.type === "Leased-In" && (
            <Field label="Monthly Cost (₹)" required error={spaceErrors.cost}>
              <TextInput value={spaceForm.cost} invalid={!!spaceErrors.cost} onChange={e => setSpaceForm({ ...spaceForm, cost: e.target.value })} placeholder="e.g. 4200" inputMode="numeric" />
            </Field>
          )}
        </div>
      </Modal>

      {/* Activity detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.customer ?? ""}
        description={detail?.type === "release" ? "Release dispatch detail" : "Drop-off record detail"}
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Reference" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Customer" value={detail.customer} />
            <DetailRow label="Movement" value={
              <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", detail.type === "drop-off" ? "bg-brand/15 text-brand" : "bg-success/15 text-success")}>
                {detail.type === "drop-off" ? "Drop-Off" : "Release"}
              </span>
            } />
            <DetailRow label="Pieces" value={`${detail.pieces} pcs`} />
            <DetailRow label="Space" value={detail.space} />
            <DetailRow label="Footprint" value={`${detail.pieces * SQFT_PER_PIECE} sqft`} />
            <DetailRow label="When" value={detail.time} />
            <DetailRow
              label={detail.type === "drop-off" ? "Storage Revenue" : "Handling Revenue"}
              value={`₹${(detail.pieces * (detail.type === "drop-off" ? STORAGE_REVENUE_PER_PIECE : HANDLING_REVENUE_PER_PIECE)).toLocaleString()}`}
            />
          </div>
        )}
      </Drawer>
    </div>
  )
}
