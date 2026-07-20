"use client"
import { DollarSign } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const bills = [
  { id:"INV-2025-0041",customer:"Ravi Sharma",period:"Jun 2025",storage:"₹4,200",handling:"₹820",delivery:"₹350",total:"₹5,370",status:"Paid"},
  { id:"INV-2025-0042",customer:"Priya Mehta",period:"Jun 2025",storage:"₹2,100",handling:"₹410",delivery:"₹180",total:"₹2,690",status:"Overdue"},
  { id:"INV-2025-0043",customer:"Suresh Kumar",period:"Jun 2025",storage:"₹6,300",handling:"₹1,240",delivery:"₹520",total:"₹8,060",status:"Paid"},
  { id:"INV-2025-0044",customer:"Anjali Patel",period:"Jul 2025",storage:"₹1,800",handling:"₹360",delivery:"₹150",total:"₹2,310",status:"Pending"},
  { id:"INV-2025-0045",customer:"Arjun Singh",period:"Jul 2025",storage:"₹3,500",handling:"₹700",delivery:"₹280",total:"₹4,480",status:"Pending"},
]

export default function StorageSaasBillingPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Billing</h1><p className="text-sm text-muted-foreground mt-1">Customer invoices and payment status for storage services</p></div>
        <ExportButton data={bills} filename="storage-billing" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Invoice","Customer","Period","Storage","Handling","Delivery","Total","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {bills.map(b=>(
              <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{b.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{b.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.period}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.storage}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.handling}</td>
                <td className="px-4 py-3 text-muted-foreground">{b.delivery}</td>
                <td className="px-4 py-3 font-bold text-foreground">{b.total}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${b.status==="Paid"?"bg-success/10 text-success":b.status==="Overdue"?"bg-danger/10 text-danger":"bg-amber-50 text-amber-600"}`}>{b.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
