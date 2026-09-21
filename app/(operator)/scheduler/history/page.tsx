"use client"
import { useState } from "react"
import { Search, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type HistoryEntry = { id: string; type: string; detail: string; by: string; date: string; status: string }

const initialHistory: HistoryEntry[] = [
  { id:"SCH-001",type:"Shift Assignment",detail:"Morning Shift — 22 workers assigned",by:"Auto",date:"2025-07-19",status:"Completed"},
  { id:"SCH-002",type:"Task Creation",detail:"Stock Count — Zone A (18 tasks)",by:"Vijay Kumar",date:"2025-07-19",status:"Completed"},
  { id:"SCH-003",type:"Shift Change",detail:"Afternoon Shift — Suresh Yadav moved to Zone B",by:"Kavitha Rao",date:"2025-07-18",status:"Completed"},
  { id:"SCH-004",type:"Automation Fired",detail:"SLA breach alert sent for ORD-4421",by:"Auto",date:"2025-07-18",status:"Completed"},
  { id:"SCH-005",type:"Schedule Published",detail:"Week 29 schedule published to all workers",by:"Vijay Kumar",date:"2025-07-14",status:"Completed"},
]

const TYPES = ["All", "Shift Assignment", "Task Creation", "Shift Change", "Automation Fired", "Schedule Published"]

export default function SchedulerHistoryPage() {
  const [history] = useState<HistoryEntry[]>(initialHistory)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [detail, setDetail] = useState<HistoryEntry | null>(null)

  const filtered = history.filter(h =>
    (typeFilter === "All" || h.type === typeFilter) &&
    (h.id.toLowerCase().includes(search.toLowerCase()) ||
      h.detail.toLowerCase().includes(search.toLowerCase()) ||
      h.by.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Schedule History</h1><p className="text-sm text-muted-foreground mt-1">Audit log of all scheduling actions and automations</p></div>
        <ExportButton data={filtered} filename="scheduler-history" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search entry ID, detail, user..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
        </div>
        {TYPES.map(t => (
          <button key={t} onClick={() => setTypeFilter(t)} className={cn("px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", typeFilter === t ? "bg-brand text-white" : "bg-card border border-border text-muted-foreground hover:text-foreground")}>{t}</button>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Type","Detail","By","Date","Status",""].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(h=>(
              <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{h.id}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{h.type}</span></td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{h.detail}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.by}</td>
                <td className="px-4 py-3 text-muted-foreground">{h.date}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{h.status}</span></td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(h)} title="View entry details" className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No history entries match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Schedule history entry"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Entry ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Detail" value={detail.detail} />
            <DetailRow label="Performed By" value={detail.by} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Status" value={<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
