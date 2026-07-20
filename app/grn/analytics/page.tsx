"use client"
import { BarChart2, TrendingUp, Clock, AlertTriangle } from "lucide-react"

const suppliersData = [
  { supplier: "Acme Foods Ltd", grns: 18, onTime: 16, discrepancy: 1, avgTime: "28m" },
  { supplier: "Global Oils Corp", grns: 12, onTime: 10, discrepancy: 2, avgTime: "35m" },
  { supplier: "Agro Corp", grns: 8, onTime: 8, discrepancy: 0, avgTime: "22m" },
  { supplier: "Salt Works", grns: 5, onTime: 5, discrepancy: 0, avgTime: "18m" },
  { supplier: "Fresh Farms", grns: 5, onTime: 3, discrepancy: 2, avgTime: "45m" },
  { supplier: "Sweet Mills Pvt Ltd", grns: 14, onTime: 13, discrepancy: 1, avgTime: "26m" },
  { supplier: "Tropical Co", grns: 9, onTime: 8, discrepancy: 1, avgTime: "31m" },
  { supplier: "Apex Pharma", grns: 11, onTime: 11, discrepancy: 0, avgTime: "19m" },
  { supplier: "Sunrise Mills", grns: 7, onTime: 6, discrepancy: 1, avgTime: "38m" },
  { supplier: "Farm Direct Agro", grns: 6, onTime: 5, discrepancy: 1, avgTime: "42m" },
  { supplier: "Pure Salt Industries", grns: 10, onTime: 9, discrepancy: 2, avgTime: "24m" },
  { supplier: "Mill Fresh Foods", grns: 13, onTime: 12, discrepancy: 1, avgTime: "27m" },
  { supplier: "Sweet House Sugars", grns: 4, onTime: 4, discrepancy: 0, avgTime: "21m" },
  { supplier: "Nature's Best Ltd", grns: 16, onTime: 14, discrepancy: 3, avgTime: "33m" },
]

export default function GRNAnalyticsPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">GRN Analytics</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Supplier performance and receipt trends</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "GRNs This Month", value: "48", icon: <BarChart2 className="w-4 h-4 text-brand" /> },
          { label: "On-Time Receipt", value: "91.6%", icon: <TrendingUp className="w-4 h-4 text-success" /> },
          { label: "Avg Processing Time", value: "29m", icon: <Clock className="w-4 h-4 text-amber-500" /> },
          { label: "Discrepancy Rate", value: "6.2%", icon: <AlertTriangle className="w-4 h-4 text-danger" /> },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">{s.icon}</div>
            <div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold text-foreground">{s.value}</p></div>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl p-5">
        <p className="font-semibold text-foreground mb-4">Supplier Scorecard</p>
        <table className="w-full text-sm">
          <thead className="border-b border-border">
            <tr>{["Supplier", "GRNs", "On-Time", "Discrepancies", "Avg Time", "Score"].map(h => <th key={h} className="pb-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {suppliersData.map(s => {
              const score = Math.round((s.onTime / s.grns) * 100) - (s.discrepancy * 5)
              return (
                <tr key={s.supplier} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3 text-foreground font-medium">{s.supplier}</td>
                  <td className="py-3 text-foreground">{s.grns}</td>
                  <td className="py-3 text-success font-medium">{s.onTime}</td>
                  <td className="py-3"><span className={s.discrepancy > 0 ? "text-danger font-medium" : "text-muted-foreground"}>{s.discrepancy}</span></td>
                  <td className="py-3 text-muted-foreground">{s.avgTime}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-muted rounded-full h-1.5"><div className="h-1.5 rounded-full bg-brand" style={{ width: `${score}%` }} /></div>
                      <span className="text-xs font-semibold text-foreground">{score}%</span>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
