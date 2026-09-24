"use client"
import { useState } from "react"
import { Filter, Shield, ChevronDown, Eye, Bookmark, X as XIcon, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { DEMO_AUDIT_SAVED_FILTERS } from "@/lib/fixtures/demo"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Log = { id: string; user: string; action: string; module: string; entity: string; ts: string }
type SavedFilter = { id: string; name: string; module: string; action: string; user: string; from: string; to: string }

const modules = ["All Modules","Inventory","Orders","GRN","Billing","Workforce","Settings","3PL"]
const actions = ["All Actions","Created","Updated","Deleted","Approved","Rejected","Exported","Login","Logout"]
const users = ["All Users","Vijay Kumar","Priya Sharma","Ravi Kumar","Admin","Meena Patel","Arjun Nair"]

const logs: Log[] = [
  { id:"LOG-001",user:"Vijay Kumar",action:"Updated",module:"Inventory",entity:"SKU-001234",ts:"2025-07-19 14:32" },
  { id:"LOG-002",user:"Priya Sharma",action:"Created",module:"GRN",entity:"GRN-0892",ts:"2025-07-19 13:18" },
  { id:"LOG-003",user:"Ravi Kumar",action:"Approved",module:"Orders",entity:"ORD-4421",ts:"2025-07-19 12:55" },
  { id:"LOG-004",user:"Admin",action:"Updated",module:"Billing",entity:"RATE-003",ts:"2025-07-19 11:40" },
  { id:"LOG-005",user:"Meena Patel",action:"Approved",module:"Inventory",entity:"ADJ-0021",ts:"2025-07-19 10:28" },
  { id:"LOG-006",user:"Arjun Nair",action:"Deleted",module:"Inventory",entity:"SKU-999",ts:"2025-07-18 17:05" },
  { id:"LOG-007",user:"Admin",action:"Login",module:"Settings",entity:"—",ts:"2025-07-18 09:00" },
  { id:"LOG-008",user:"Vijay Kumar",action:"Exported",module:"Billing",entity:"INV-2025-0774",ts:"2025-07-18 08:22" },
  { id:"LOG-009",user:"Priya Sharma",action:"Created",module:"Orders",entity:"ORD-4420",ts:"2025-07-17 18:41" },
  { id:"LOG-010",user:"Meena Patel",action:"Rejected",module:"GRN",entity:"GRN-0890",ts:"2025-07-17 16:59" },
  { id:"LOG-011",user:"Arjun Nair",action:"Updated",module:"Workforce",entity:"SHIFT-0221",ts:"2025-07-17 15:14" },
  { id:"LOG-012",user:"Admin",action:"Updated",module:"3PL",entity:"3PL-CTR-012",ts:"2025-07-17 13:30" },
  { id:"LOG-013",user:"Ravi Kumar",action:"Approved",module:"Orders",entity:"ORD-4419",ts:"2025-07-17 11:47" },
  { id:"LOG-014",user:"Vijay Kumar",action:"Deleted",module:"Billing",entity:"RATE-009",ts:"2025-07-17 10:05" },
  { id:"LOG-015",user:"Priya Sharma",action:"Created",module:"GRN",entity:"GRN-0889",ts:"2025-07-16 18:23" },
  { id:"LOG-016",user:"Admin",action:"Logout",module:"Settings",entity:"—",ts:"2025-07-16 17:00" },
  { id:"LOG-017",user:"Meena Patel",action:"Approved",module:"Inventory",entity:"ADJ-0020",ts:"2025-07-16 15:36" },
  { id:"LOG-018",user:"Arjun Nair",action:"Exported",module:"Orders",entity:"ORD-BATCH-77",ts:"2025-07-16 14:02" },
  { id:"LOG-019",user:"Ravi Kumar",action:"Updated",module:"Inventory",entity:"SKU-001240",ts:"2025-07-16 12:18" },
  { id:"LOG-020",user:"Admin",action:"Created",module:"Workforce",entity:"USR-0044",ts:"2025-07-16 10:44" },
  { id:"LOG-021",user:"Vijay Kumar",action:"Approved",module:"Billing",entity:"INV-2025-0773",ts:"2025-07-15 17:51" },
  { id:"LOG-022",user:"Priya Sharma",action:"Rejected",module:"GRN",entity:"GRN-0888",ts:"2025-07-15 16:09" },
  { id:"LOG-023",user:"Meena Patel",action:"Deleted",module:"Inventory",entity:"SKU-998",ts:"2025-07-15 14:27" },
  { id:"LOG-024",user:"Arjun Nair",action:"Created",module:"Orders",entity:"ORD-4418",ts:"2025-07-15 12:40" },
  { id:"LOG-025",user:"Admin",action:"Login",module:"Settings",entity:"—",ts:"2025-07-15 09:02" },
  { id:"LOG-026",user:"Ravi Kumar",action:"Updated",module:"3PL",entity:"3PL-CTR-008",ts:"2025-07-14 18:15" },
  { id:"LOG-027",user:"Vijay Kumar",action:"Exported",module:"Workforce",entity:"ATT-JUL-W2",ts:"2025-07-14 16:33" },
  { id:"LOG-028",user:"Priya Sharma",action:"Approved",module:"Orders",entity:"ORD-4417",ts:"2025-07-14 14:50" },
  { id:"LOG-029",user:"Meena Patel",action:"Created",module:"Inventory",entity:"ADJ-0019",ts:"2025-07-14 11:26" },
  { id:"LOG-030",user:"Admin",action:"Logout",module:"Settings",entity:"—",ts:"2025-07-14 09:48" },
  { id:"LOG-031",user:"Arjun Nair",action:"Updated",module:"Billing",entity:"RATE-007",ts:"2025-07-13 17:12" },
  { id:"LOG-032",user:"Ravi Kumar",action:"Rejected",module:"3PL",entity:"3PL-CTR-015",ts:"2025-07-13 15:29" },
]

export default function AuditFiltersPage() {
  const [mod, setMod] = useState("All Modules")
  const [act, setAct] = useState("All Actions")
  const [usr, setUsr] = useState("All Users")

  // Applied date range; the modal edits a draft until Apply is pressed.
  const [range, setRange] = useState({ from: "", to: "" })
  const [rangeOpen, setRangeOpen] = useState(false)
  const [draftRange, setDraftRange] = useState({ from: "", to: "" })
  const [rangeErrors, setRangeErrors] = useState<Record<string, string>>({})

  const [saved, setSaved] = useState<SavedFilter[]>(DEMO_AUDIT_SAVED_FILTERS)
  const [saveOpen, setSaveOpen] = useState(false)
  const [saveName, setSaveName] = useState("")
  const [saveError, setSaveError] = useState("")
  const [deleteTarget, setDeleteTarget] = useState<SavedFilter | null>(null)

  const [detail, setDetail] = useState<Log | null>(null)

  const rangeActive = !!(range.from || range.to)
  const anyFilterActive = mod !== "All Modules" || act !== "All Actions" || usr !== "All Users" || rangeActive

  const filtered = logs.filter(l => {
    const day = l.ts.slice(0, 10)
    return (mod === "All Modules" || l.module === mod)
      && (act === "All Actions" || l.action === act)
      && (usr === "All Users" || l.user === usr)
      && (!range.from || day >= range.from)
      && (!range.to || day <= range.to)
  })

  function openRange() {
    setDraftRange(range)
    setRangeErrors({})
    setRangeOpen(true)
  }

  function applyRange() {
    const e: Record<string, string> = {}
    if (!draftRange.from && !draftRange.to) e.from = "Enter at least a From or To date"
    if (draftRange.from && draftRange.to && draftRange.from > draftRange.to) e.to = "To date must be on or after the From date"
    setRangeErrors(e)
    if (Object.keys(e).length) return
    setRange(draftRange)
    setRangeOpen(false)
    notify.success("Date range applied", `${draftRange.from || "Any"} → ${draftRange.to || "Any"}`)
  }

  function clearRange() {
    setRange({ from: "", to: "" })
    setDraftRange({ from: "", to: "" })
  }

  function resetAll() {
    setMod("All Modules")
    setAct("All Actions")
    setUsr("All Users")
    clearRange()
    notify.info("Filters reset", "Showing all audit entries.")
  }

  function saveFilter() {
    if (!saveName.trim()) { setSaveError("Give this filter a name"); return }
    if (saved.some(s => s.name.toLowerCase() === saveName.trim().toLowerCase())) { setSaveError("A saved filter with this name already exists"); return }
    const next: SavedFilter = {
      id: `FLT-${String(saved.length + 1).padStart(3, "0")}`,
      name: saveName.trim(), module: mod, action: act, user: usr, from: range.from, to: range.to,
    }
    setSaved(prev => [...prev, next])
    setSaveOpen(false)
    setSaveName("")
    setSaveError("")
    notify.success("Filter saved", `${next.name} can now be applied in one click.`)
  }

  function applySaved(s: SavedFilter) {
    setMod(s.module)
    setAct(s.action)
    setUsr(s.user)
    setRange({ from: s.from, to: s.to })
    notify.info("Filter applied", `${s.name} is now active.`)
  }

  function removeSaved(s: SavedFilter) {
    setSaved(prev => prev.filter(x => x.id !== s.id))
    notify.warning("Saved filter deleted", `${s.name} has been removed.`)
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Audit Filters</h1><p className="text-sm text-muted-foreground mt-1">Filter audit logs by module, action type, date range and user</p></div>
        <div className="flex items-center gap-2">
          <ExportButton data={filtered} filename="audit-filtered" />
          <button onClick={() => { setSaveName(""); setSaveError(""); setSaveOpen(true) }} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Bookmark className="w-4 h-4" /> Save Filter
          </button>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        {[
          { label:"Module", val:mod, setVal:setMod, opts:modules },
          { label:"Action", val:act, setVal:setAct, opts:actions },
          { label:"User", val:usr, setVal:setUsr, opts:users },
        ].map(({ label, val, setVal, opts }) => (
          <div key={label} className="relative">
            <select value={val} onChange={e => setVal(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer">
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        ))}
        <button
          onClick={openRange}
          title="Filter by date range"
          className={cn("flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors", rangeActive ? "bg-brand text-white border-brand" : "border-border bg-card text-muted-foreground hover:text-foreground")}
        >
          <Filter className="w-4 h-4" /> {rangeActive ? `${range.from || "Any"} → ${range.to || "Any"}` : "Date Range"}
        </button>
        {anyFilterActive && (
          <button onClick={resetAll} title="Reset all filters" className="flex items-center gap-1 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground transition-colors">
            <XIcon className="w-4 h-4" /> Reset
          </button>
        )}
        <span className="ml-auto text-sm text-muted-foreground self-center">{filtered.length} entries</span>
      </div>

      {saved.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Saved:</span>
          {saved.map(s => (
            <span key={s.id} className="flex items-center gap-1 pl-3 pr-1 py-1 rounded-full border border-border bg-card text-xs text-foreground">
              <button onClick={() => applySaved(s)} title={`Apply ${s.name}`} className="hover:text-brand transition-colors">{s.name}</button>
              <button onClick={() => setDeleteTarget(s)} title={`Delete ${s.name}`} className="p-1 rounded-full text-muted-foreground hover:bg-danger/10 hover:text-danger transition-colors"><Trash2 className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border"><tr>{["Log ID","User","Action","Module","Entity","Timestamp","Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(l)} title={`View ${l.id}`} className="font-mono text-xs text-brand hover:underline">{l.id}</button>
                </td>
                <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.action==="Deleted"?"bg-danger/10 text-danger":l.action==="Approved"?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{l.action}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{l.module}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.entity}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{l.ts}</td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(l)} title="View details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                <Shield className="w-8 h-8 mx-auto mb-2 opacity-40" />
                No entries match selected filters
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Date range */}
      <Modal
        open={rangeOpen}
        onOpenChange={(o) => { setRangeOpen(o); if (!o) setRangeErrors({}) }}
        title="Filter by Date Range"
        description="Narrow the audit entries to a period"
        size="sm"
        footer={
          <>
            <button onClick={() => { clearRange(); setRangeOpen(false) }} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Clear
            </button>
            <ModalActions onCancel={() => setRangeOpen(false)} onSubmit={applyRange} submitLabel="Apply Range" />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="From Date" error={rangeErrors.from}>
            <TextInput type="date" value={draftRange.from} invalid={!!rangeErrors.from} onChange={e => setDraftRange({ ...draftRange, from: e.target.value })} />
          </Field>
          <Field label="To Date" error={rangeErrors.to} hint="Leave a field empty for an open-ended range">
            <TextInput type="date" value={draftRange.to} invalid={!!rangeErrors.to} onChange={e => setDraftRange({ ...draftRange, to: e.target.value })} />
          </Field>
        </div>
      </Modal>

      {/* Save filter */}
      <Modal
        open={saveOpen}
        onOpenChange={(o) => { setSaveOpen(o); if (!o) { setSaveName(""); setSaveError("") } }}
        title="Save Current Filter"
        description={`Module: ${mod} • Action: ${act} • User: ${usr}${rangeActive ? ` • ${range.from || "Any"} → ${range.to || "Any"}` : ""}`}
        size="sm"
        footer={<ModalActions onCancel={() => setSaveOpen(false)} onSubmit={saveFilter} submitLabel="Save Filter" />}
      >
        <Field label="Filter Name" required error={saveError}>
          <TextInput value={saveName} invalid={!!saveError} autoFocus onChange={e => { setSaveName(e.target.value); setSaveError("") }} placeholder="e.g. Inventory deletions" />
        </Field>
      </Modal>

      {/* Log detail */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Audit entry detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Log ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="User" value={detail.user} />
            <DetailRow label="Action" value={detail.action} />
            <DetailRow label="Module" value={detail.module} />
            <DetailRow label="Entity" value={<span className="font-mono">{detail.entity}</span>} />
            <DetailRow label="Timestamp" value={detail.ts} />
          </div>
        )}
      </Drawer>

      {/* Delete saved filter */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this saved filter?"
        message={`${deleteTarget?.name} will be removed from your saved filters.`}
        confirmLabel="Delete Filter"
        cancelLabel="Keep It"
        onConfirm={() => deleteTarget && removeSaved(deleteTarget)}
      />
    </div>
  )
}
