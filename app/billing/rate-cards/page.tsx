"use client"
import { Plus, Edit2 } from "lucide-react"

const rates = [
  { client: "Acme Foods", storagePerPallet: "₹450/day", inboundHandling: "₹12/unit", outboundHandling: "₹15/unit", vasPacking: "₹8/unit", minCharge: "₹5,000", effectiveFrom: "2024-01-01" },
  { client: "Global Oils", storagePerPallet: "₹380/day", inboundHandling: "₹10/unit", outboundHandling: "₹12/unit", vasPacking: "₹6/unit", minCharge: "₹3,000", effectiveFrom: "2024-02-01" },
  { client: "Agro Corp", storagePerPallet: "₹420/day", inboundHandling: "₹11/unit", outboundHandling: "₹14/unit", vasPacking: "₹7/unit", minCharge: "₹4,000", effectiveFrom: "2024-01-15" },
  { client: "Sweet Mills", storagePerPallet: "₹350/day", inboundHandling: "₹9/unit", outboundHandling: "₹11/unit", vasPacking: "₹5/unit", minCharge: "₹2,500", effectiveFrom: "2024-03-01" },
]

export default function RateCardsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Rate Cards</h1><p className="text-sm text-muted-foreground mt-0.5">Billing rates configured per client</p></div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Rate Card</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Client", "Storage/Pallet/Day", "Inbound Handling", "Outbound Handling", "VAS Packing", "Min Charge", "Effective From", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map(r => (
              <tr key={r.client} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{r.client}</td>
                <td className="px-4 py-3 text-foreground">{r.storagePerPallet}</td>
                <td className="px-4 py-3 text-foreground">{r.inboundHandling}</td>
                <td className="px-4 py-3 text-foreground">{r.outboundHandling}</td>
                <td className="px-4 py-3 text-foreground">{r.vasPacking}</td>
                <td className="px-4 py-3 text-foreground">{r.minCharge}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.effectiveFrom}</td>
                <td className="px-4 py-3"><button className="text-muted-foreground hover:text-brand transition-colors"><Edit2 className="w-4 h-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
