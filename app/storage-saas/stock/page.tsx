"use client"
import { Package } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"

const stock = [
  { id:"STK-001",customer:"Ravi Sharma",item:"Personal Belongings Box",pieces:12,location:"Unit A-04",since:"2025-05-10",days:70,charges:"₹4,200"},
  { id:"STK-002",customer:"Priya Mehta",item:"Furniture — 2BHK Set",pieces:28,location:"Unit B-12",since:"2025-04-01",days:109,charges:"₹7,630"},
  { id:"STK-003",customer:"Suresh Kumar",item:"Office Equipment",pieces:45,location:"Unit C-07",since:"2025-03-15",days:126,charges:"₹8,820"},
  { id:"STK-004",customer:"Anjali Patel",item:"Seasonal Inventory",pieces:8,location:"Unit A-09",since:"2025-07-01",days:18,charges:"₹1,260"},
  { id:"STK-005",customer:"Arjun Singh",item:"Household Items",pieces:20,location:"Unit B-03",since:"2025-06-15",days:34,charges:"₹2,380"},
]

export default function StorageSaasStockPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Customer Stock</h1><p className="text-sm text-muted-foreground mt-1">Items currently in storage with location and billing details</p></div>
        <ExportButton data={stock} filename="storage-stock" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["Stock ID","Customer","Item","Pieces","Location","Since","Days","Charges"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {stock.map(s=>(
              <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{s.id}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.customer}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.item}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.pieces}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{s.location}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.since}</td>
                <td className="px-4 py-3 text-muted-foreground">{s.days}</td>
                <td className="px-4 py-3 font-medium text-foreground">{s.charges}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
