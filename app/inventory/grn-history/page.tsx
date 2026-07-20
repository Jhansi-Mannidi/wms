"use client"
import { useState } from "react"
import { Search, Eye, Check, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type GRN = {
  id: string; asn: string; supplier: string; items: number; qty: number
  received: string; dock: string; receivedBy: string; discrepancy: boolean; status: string
}

const initialHistory: GRN[] = [
  { id: "GRN-2024-1050", asn: "ASN-2024-0875", supplier: "Sweet Mills", items: 3, qty: 600, received: "2024-07-19 09:14", dock: "Dock 2", receivedBy: "Ravi Kumar", discrepancy: false, status: "Completed" },
  { id: "GRN-2024-1049", asn: "ASN-2024-0870", supplier: "Acme Foods Ltd", items: 5, qty: 1200, received: "2024-07-18 14:30", dock: "Dock 1", receivedBy: "Priya Sharma", discrepancy: false, status: "Completed" },
  { id: "GRN-2024-1048", asn: "ASN-2024-0865", supplier: "Global Oils Corp", items: 2, qty: 400, received: "2024-07-17 11:00", dock: "Dock 3", receivedBy: "Meena Patel", discrepancy: true, status: "With Discrepancy" },
  { id: "GRN-2024-1047", asn: "ASN-2024-0860", supplier: "Agro Corp", items: 4, qty: 2000, received: "2024-07-16 16:45", dock: "Dock 2", receivedBy: "Suresh Yadav", discrepancy: false, status: "Completed" },
  { id: "GRN-2024-1046", asn: "ASN-2024-0855", supplier: "Salt Works", items: 1, qty: 5000, received: "2024-07-15 08:00", dock: "Dock 1", receivedBy: "Arjun Nair", discrepancy: false, status: "Completed" },
]

export default function GRNHistoryPage() {
  const [history, setHistory] = useState<GRN[]>(initialHistory)
  const [search, setSearch] = useState("")

  const [detail, setDetail] = useState<GRN | null>(null)
  const [voidTarget, setVoidTarget] = useState<GRN | null>(null)

  const filtered = history.filter(g => g.id.toLowerCase().includes(search.toLowerCase()) || g.supplier.toLowerCase().includes(search.toLowerCase()))

  const stats = [
    { label: "GRNs This Month", value: history.length.toLocaleString() },
    { label: "Total Items Received", value: history.reduce((s, g) => s + g.qty, 0).toLocaleString() },
    { label: "With Discrepancy", value: history.filter(g => g.discrepancy).length.toLocaleString(), cls: "text-amber-600" },
    { label: "Suppliers", value: new Set(history.map(g => g.supplier)).size.toLocaleString() },
  ]

  function resolveDiscrepancy(g: GRN) {
    setHistory(prev => prev.map(x => x.id === g.id ? { ...x, discrepancy: false, status: "Completed" } : x))
    notify.success("Discrepancy resolved", `${g.id} from ${g.supplier} is now marked Completed.`)
  }

  function voidGrn(g: GRN) {
    setHistory(prev => prev.filter(x => x.id !== g.id))
    if (detail?.id === g.id) setDetail(null)
    notify.warning("GRN voided", `${g.id} has been removed from the history.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">GRN History</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Historical record of all goods received notes</p>
        </div>
        <ExportButton data={filtered} filename="grn-history" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search GRN ID, supplier..." className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["GRN ID", "ASN", "Supplier", "Items", "Qty", "Received At", "Dock", "By", "Status", "Actions"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map(g => (
              <tr key={g.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{g.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{g.asn}</td>
                <td className="px-4 py-3 text-foreground">{g.supplier}</td>
                <td className="px-4 py-3 text-foreground">{g.items}</td>
                <td className="px-4 py-3 font-semibold text-foreground">{g.qty.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground">{g.received}</td>
                <td className="px-4 py-3 text-muted-foreground">{g.dock}</td>
                <td className="px-4 py-3 text-foreground">{g.receivedBy}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", g.discrepancy ? "bg-amber-100 text-amber-700" : "bg-success/10 text-success")}>{g.status}</span></td>
                <td className="px-4 py-3">
                  <RowActions
                    items={[
                      { label: "View details", icon: <Eye />, onSelect: () => setDetail(g) },
                      ...(g.discrepancy
                        ? [{ label: "Resolve discrepancy", icon: <Check />, onSelect: () => resolveDiscrepancy(g), tone: "success" as const }]
                        : []),
                      { label: "Void GRN", icon: <Trash2 />, onSelect: () => setVoidTarget(g), tone: "danger" as const },
                    ]}
                  />
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="px-4 py-10 text-center text-sm text-muted-foreground">No goods received notes match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Goods received note detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="GRN ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="ASN" value={<span className="font-mono">{detail.asn}</span>} />
            <DetailRow label="Supplier" value={detail.supplier} />
            <DetailRow label="Line Items" value={detail.items} />
            <DetailRow label="Quantity" value={`${detail.qty.toLocaleString()} units`} />
            <DetailRow label="Received At" value={detail.received} />
            <DetailRow label="Dock" value={detail.dock} />
            <DetailRow label="Received By" value={detail.receivedBy} />
            <DetailRow label="Discrepancy" value={detail.discrepancy ? "Yes" : "No"} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", detail.discrepancy ? "bg-amber-100 text-amber-700" : "bg-success/10 text-success")}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Void confirmation */}
      <ConfirmDialog
        open={!!voidTarget}
        onOpenChange={(o) => !o && setVoidTarget(null)}
        title="Void this GRN?"
        message={`${voidTarget?.id} from ${voidTarget?.supplier} will be removed from the history. This cannot be undone.`}
        confirmLabel="Void GRN"
        cancelLabel="Keep It"
        onConfirm={() => voidTarget && voidGrn(voidTarget)}
      />
    </div>
  )
}
