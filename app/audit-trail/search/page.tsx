"use client"
import { useState } from "react"
import { Search, Filter, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

const logs = [
  { id: "LOG-001", user: "Vijay Kumar", action: "Updated SKU", module: "Inventory", entity: "SKU-001234", timestamp: "2025-07-19 14:32:01", ip: "192.168.1.10" },
  { id: "LOG-002", user: "Priya Sharma", action: "Created GRN", module: "GRN", entity: "GRN-2025-0892", timestamp: "2025-07-19 13:18:44", ip: "192.168.1.22" },
  { id: "LOG-003", user: "Ravi Kumar", action: "Picked Order", module: "Orders", entity: "ORD-2025-4421", timestamp: "2025-07-19 12:55:10", ip: "192.168.1.15" },
  { id: "LOG-004", user: "Admin", action: "Changed Rate Card", module: "Billing", entity: "RATE-003", timestamp: "2025-07-19 11:40:00", ip: "192.168.1.1" },
  { id: "LOG-005", user: "Meena Patel", action: "Approved Adjustment", module: "Inventory", entity: "ADJ-0021", timestamp: "2025-07-19 10:28:35", ip: "192.168.1.18" },
]

export default function AuditSearchPage() {
  const [q, setQ] = useState("")
  const filtered = logs.filter(l => JSON.stringify(l).toLowerCase().includes(q.toLowerCase()))
  return (
    <div className="p-6 space-y-5">
      <div><h1 className="text-2xl font-bold text-foreground">Audit Search</h1><p className="text-sm text-muted-foreground mt-1">Full-text search across all audit log entries</p></div>
      <div className="flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by user, action, entity, module..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" /></div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Log ID","User","Action","Module","Entity","Timestamp","IP"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {filtered.map((l) => (
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{l.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.user}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.action}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full bg-muted text-xs text-muted-foreground">{l.module}</span></td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{l.entity}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{l.timestamp}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="flex flex-col items-center justify-center py-16 text-muted-foreground"><Shield className="w-8 h-8 mb-2 opacity-40" /><p className="text-sm">No audit entries match your search</p></div>}
      </div>
    </div>
  )
}
