"use client"
import { useState } from "react"
import { Package, TrendingUp, AlertTriangle, BarChart2, Eye } from "lucide-react"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type CategoryRow = {
  category: string; skus: number; qty: number
  value: string; turnover: number; fill: number
}

const categoryData: CategoryRow[] = [
  { category: "Food & Beverage", skus: 412, qty: 48200, value: "₹12.4 Cr", turnover: 8.2, fill: 82 },
  { category: "FMCG", skus: 318, qty: 31500, value: "₹9.8 Cr", turnover: 12.1, fill: 75 },
  { category: "Pharma", skus: 204, qty: 18900, value: "₹7.2 Cr", turnover: 6.4, fill: 68 },
  { category: "Electronics", skus: 156, qty: 9200, value: "₹14.1 Cr", turnover: 4.8, fill: 55 },
  { category: "Apparel", skus: 287, qty: 22400, value: "₹4.6 Cr", turnover: 15.3, fill: 88 },
  { category: "Industrial", skus: 98, qty: 6800, value: "₹3.1 Cr", turnover: 3.2, fill: 42 },
]

/** "₹12.4 Cr" -> 12.4 */
function crores(value: string) {
  return Number(value.replace(/[^\d.]/g, ""))
}

export default function AnalyticsInventoryPage() {
  const [detail, setDetail] = useState<CategoryRow | null>(null)

  const totalSkus = categoryData.reduce((s, r) => s + r.skus, 0)
  const totalQty = categoryData.reduce((s, r) => s + r.qty, 0)
  const totalValue = categoryData.reduce((s, r) => s + crores(r.value), 0)
  const avgTurnover = categoryData.reduce((s, r) => s + r.turnover, 0) / categoryData.length

  const stats = [
    { label: "Total SKUs", value: totalSkus.toLocaleString(), icon: <Package className="w-5 h-5 text-brand" />, sub: `${totalQty.toLocaleString()} units on hand` },
    { label: "Stock Value", value: `₹${totalValue.toFixed(1)} Cr`, icon: <BarChart2 className="w-5 h-5 text-brand" />, sub: "at cost" },
    { label: "Avg Turnover", value: `${avgTurnover.toFixed(1)}x`, icon: <TrendingUp className="w-5 h-5 text-success" />, sub: "annualised" },
    { label: "Dead Stock", value: "143 SKUs", icon: <AlertTriangle className="w-5 h-5 text-amber-500" />, sub: ">90 days no movement" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Inventory Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Stock health, turnover and category breakdown</p>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <div className="flex justify-between items-start mb-2">{s.icon}</div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.sub}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">By Category</p></div>
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b border-border">
            <tr>{["Category","SKUs","Qty on Hand","Value","Turnover","Fill Rate","Actions"].map(h => <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categoryData.map((r) => (
              <tr key={r.category} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">{r.category}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.skus}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.qty.toLocaleString()}</td>
                <td className="px-4 py-3 font-medium text-foreground">{r.value}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.turnover}x</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-1.5"><div className="bg-brand h-1.5 rounded-full" style={{ width: `${r.fill}%` }} /></div>
                    <span className="text-xs w-8">{r.fill}%</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => setDetail(r)} title={`View ${r.category} breakdown`} className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                </td>
              </tr>
            ))}
            {categoryData.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">No category data available.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.category ?? ""}
        description="Category breakdown"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Category" value={detail.category} />
            <DetailRow label="SKUs" value={detail.skus.toLocaleString()} />
            <DetailRow label="Qty on Hand" value={detail.qty.toLocaleString()} />
            <DetailRow label="Stock Value" value={detail.value} />
            <DetailRow label="Turnover" value={`${detail.turnover}x annualised`} />
            <DetailRow label="Fill Rate" value={`${detail.fill}%`} />
            <DetailRow label="Share of SKUs" value={`${Math.round((detail.skus / totalSkus) * 100)}%`} />
            <DetailRow label="Share of Value" value={`${Math.round((crores(detail.value) / totalValue) * 100)}%`} />
            <DetailRow label="Avg Units per SKU" value={Math.round(detail.qty / detail.skus).toLocaleString()} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
