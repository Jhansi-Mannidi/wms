"use client"
import { FileText, Plus } from "lucide-react"

const leases = [
  { id:"LSE-001",tenant:"Acme Foods",start:"2025-01-01",end:"2025-12-31",value:"₹18.9L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-002",tenant:"Global Oils",start:"2024-06-01",end:"2025-05-31",value:"₹15.1L",type:"Annual",autoRenew:false,status:"Expiring Soon"},
  { id:"LSE-003",tenant:"Agro Corp",start:"2025-03-15",end:"2026-03-14",value:"₹12.4L",type:"Annual",autoRenew:true,status:"Active"},
  { id:"LSE-004",tenant:"Sweet Mills",start:"2025-07-01",end:"2025-09-30",value:"₹2.8L",type:"Quarterly",autoRenew:false,status:"Active"},
]

export default function SpaceLeasesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Lease Agreements</h1><p className="text-sm text-muted-foreground mt-1">Storage lease contracts, terms and renewal status</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> New Lease</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Lease ID","Tenant","Start","End","Value","Type","Auto-Renew","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {leases.map(l=>(
              <tr key={l.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{l.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.tenant}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.start}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.end}</td>
                <td className="px-4 py-3 font-medium text-foreground">{l.value}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.type}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs ${l.autoRenew?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{l.autoRenew?"Yes":"No"}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${l.status==="Active"?"bg-success/10 text-success":"bg-amber-50 text-amber-600"}`}>{l.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
