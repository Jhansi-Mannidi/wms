"use client"
import { useState } from "react"
import { Filter, Shield, ChevronDown } from "lucide-react"

const modules = ["All Modules","Inventory","Orders","GRN","Billing","Workforce","Settings","3PL"]
const actions = ["All Actions","Created","Updated","Deleted","Approved","Rejected","Exported","Login","Logout"]
const logs = [
  { id:"LOG-001",user:"Vijay Kumar",action:"Updated",module:"Inventory",entity:"SKU-001234",ts:"2025-07-19 14:32" },
  { id:"LOG-002",user:"Priya Sharma",action:"Created",module:"GRN",entity:"GRN-0892",ts:"2025-07-19 13:18" },
  { id:"LOG-003",user:"Ravi Kumar",action:"Approved",module:"Orders",entity:"ORD-4421",ts:"2025-07-19 12:55" },
  { id:"LOG-004",user:"Admin",action:"Updated",module:"Billing",entity:"RATE-003",ts:"2025-07-19 11:40" },
  { id:"LOG-005",user:"Meena Patel",action:"Approved",module:"Inventory",entity:"ADJ-0021",ts:"2025-07-19 10:28" },
  { id:"LOG-006",user:"Arjun Nair",action:"Deleted",module:"Inventory",entity:"SKU-999",ts:"2025-07-18 17:05" },
  { id:"LOG-007",user:"Admin",action:"Login",module:"Settings",entity:"—",ts:"2025-07-18 09:00" },
]

export default function AuditFiltersPage() {
  const [mod, setMod] = useState("All Modules")
  const [act, setAct] = useState("All Actions")
  const filtered = logs.filter(l => (mod === "All Modules" || l.module === mod) && (act === "All Actions" || l.action === act))
  return (
    <div className="p-6 space-y-5">
      <div><h1 className="text-2xl font-bold text-foreground">Audit Filters</h1><p className="text-sm text-muted-foreground mt-1">Filter audit logs by module, action type, date range and user</p></div>
      <div className="flex gap-3 flex-wrap">
        {[{ label:"Module", val:mod, setVal:setMod, opts:modules }, { label:"Action", val:act, setVal:setAct, opts:actions }].map(({ label, val, setVal, opts }) => (
          <div key={label} className="relative">
            <select value={val} onChange={e => setVal(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 cursor-pointer">
              {opts.map(o => <option key={o}>{o}</option>)}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        ))}
        <span className="ml-auto text-sm text-muted-foreground self-center">{filtered.length} entries</span>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Log ID","User","Action","Module","Entity","Timestamp"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map(l => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{l.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.action==="Deleted"?"bg-danger/10 text-danger":l.action==="Approved"?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{l.action}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{l.module}</td>
                <td className="px-4 py-3 font-mono text-xs">{l.entity}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{l.ts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="flex flex-col items-center justify-center py-12 text-muted-foreground"><Shield className="w-8 h-8 mb-2 opacity-40" /><p className="text-sm">No entries match selected filters</p></div>}
      </div>
    </div>
  )
}
