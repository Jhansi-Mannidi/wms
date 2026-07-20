"use client"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"

const payments = [
  { id: "PAY-2024-0201", invoice: "INV-2024-0430", client: "Acme Foods", amount: "₹25,800", method: "NEFT", ref: "NEFT-20240625", date: "2024-06-25", status: "Confirmed" },
  { id: "PAY-2024-0200", invoice: "INV-2024-0420", client: "Sweet Mills", amount: "₹8,400", method: "UPI", ref: "UPI-20240531", date: "2024-05-31", status: "Confirmed" },
  { id: "PAY-2024-0198", invoice: "INV-2024-0415", client: "Salt Works", amount: "₹11,200", method: "Cheque", ref: "CHQ-00451", date: "2024-05-15", status: "Confirmed" },
  { id: "PAY-2024-0195", invoice: "INV-2024-0409", client: "Global Oils", amount: "₹14,800", method: "RTGS", ref: "RTGS-20240510", date: "2024-05-10", status: "Cleared" },
]

export default function BillingPaymentsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Payments</h1><p className="text-sm text-muted-foreground mt-0.5">All recorded payment transactions</p></div>
        <ExportButton data={payments} filename="payments" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Received This Month", value: "₹1.2L" }, { label: "YTD Collections", value: "₹7.8L" }, { label: "Pending Clearance", value: "₹0" }, { label: "Transactions", value: "42" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Payment ID", "Invoice", "Client", "Amount", "Method", "Reference", "Date", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map(p => (
              <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{p.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.invoice}</td>
                <td className="px-4 py-3 text-foreground">{p.client}</td>
                <td className="px-4 py-3 font-semibold text-success">{p.amount}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.method}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{p.ref}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
