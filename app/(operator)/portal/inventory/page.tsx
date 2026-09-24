"use client"

import { useState } from "react"
import { Package, Search, Filter, ChevronDown, RefreshCw, AlertTriangle, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { EmptyState } from "@/components/wms/empty-state"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

const categories = ["All", "Pharma", "OTC", "Cold Chain", "Bulk"]
const zones = ["All Zones", "Zone A", "Zone B", "Zone C", "Zone D"]

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type StockItem = {
  sku: string; desc: string; category: string; zone: string; batch: string
  qty: number; uom: string; reorder: number; expiry: string; status: string
}

const initialInventory: StockItem[] = [
  { sku: "APX-7712", desc: "Paracetamol 500mg Tablets", category: "Pharma", zone: "Zone A", batch: "BT-2024-441", qty: 4800, uom: "Units", reorder: 1000, expiry: "2026-03-31", status: "OK" },
  { sku: "APX-4421", desc: "Syringes 5ml Disposable", category: "Pharma", zone: "Zone A", batch: "BT-2024-328", qty: 2200, uom: "Units", reorder: 500, expiry: "2027-01-15", status: "OK" },
  { sku: "APX-2209", desc: "IV Drip Set Standard", category: "Pharma", zone: "Zone B", batch: "BT-2024-291", qty: 850, uom: "Sets", reorder: 200, expiry: "2026-06-30", status: "OK" },
  { sku: "APX-7790", desc: "Amoxicillin 250mg Capsules", category: "Pharma", zone: "Zone A", batch: "BT-2024-112", qty: 48, uom: "Units", reorder: 500, expiry: "2026-09-30", status: "Low" },
  { sku: "APX-1102", desc: "Nitrile Gloves Large (Box)", category: "OTC", zone: "Zone B", batch: "BT-2024-501", qty: 320, uom: "Boxes", reorder: 100, expiry: "2028-12-31", status: "OK" },
  { sku: "APX-0091", desc: "Isopropyl Alcohol Swabs", category: "OTC", zone: "Zone B", batch: "BT-2024-488", qty: 6500, uom: "Pcs", reorder: 2000, expiry: "2026-11-30", status: "OK" },
  { sku: "APX-3301", desc: "Insulin Glargine 100U/mL", category: "Cold Chain", zone: "Zone C", batch: "BT-2024-771", qty: 240, uom: "Vials", reorder: 100, expiry: "2026-08-15", status: "Near Expiry" },
  { sku: "APX-3302", desc: "Adalimumab Injection 40mg", category: "Cold Chain", zone: "Zone C", batch: "BT-2024-772", qty: 90, uom: "Pens", reorder: 50, expiry: "2026-10-01", status: "OK" },
  { sku: "APX-6601", desc: "Glucose Saline 500mL Bags", category: "Bulk", zone: "Zone D", batch: "BT-2024-321", qty: 1800, uom: "Bags", reorder: 500, expiry: "2026-04-30", status: "OK" },
  { sku: "APX-6610", desc: "Normal Saline 1000mL Bags", category: "Bulk", zone: "Zone D", batch: "BT-2024-322", qty: 420, uom: "Bags", reorder: 500, expiry: "2026-05-31", status: "Low" },
  { sku: "APX-7715", desc: "Paracetamol 650mg Tablets", category: "Pharma", zone: "Zone A", batch: "BT-2024-452", qty: 3600, uom: "Units", reorder: 1000, expiry: "2026-08-31", status: "OK" },
  { sku: "APX-7801", desc: "Azithromycin 500mg Tablets", category: "Pharma", zone: "Zone A", batch: "BT-2024-118", qty: 2750, uom: "Units", reorder: 800, expiry: "2026-02-28", status: "OK" },
  { sku: "APX-7822", desc: "Cefixime 200mg Tablets", category: "Pharma", zone: "Zone A", batch: "BT-2024-126", qty: 640, uom: "Units", reorder: 700, expiry: "2026-01-31", status: "Low" },
  { sku: "APX-4430", desc: "Syringes 10ml Disposable", category: "Pharma", zone: "Zone A", batch: "BT-2024-335", qty: 1850, uom: "Units", reorder: 500, expiry: "2027-03-31", status: "OK" },
  { sku: "APX-4455", desc: "Surgical Blades No. 15", category: "Pharma", zone: "Zone A", batch: "BT-2024-341", qty: 4200, uom: "Pcs", reorder: 1200, expiry: "2028-06-30", status: "OK" },
  { sku: "APX-2215", desc: "IV Cannula 20G", category: "Pharma", zone: "Zone B", batch: "BT-2024-298", qty: 1450, uom: "Pcs", reorder: 400, expiry: "2026-09-30", status: "OK" },
  { sku: "APX-2230", desc: "Urine Bag 2000mL", category: "Pharma", zone: "Zone B", batch: "BT-2024-305", qty: 380, uom: "Pcs", reorder: 400, expiry: "2027-05-31", status: "Low" },
  { sku: "APX-7845", desc: "Metformin 500mg Tablets", category: "Pharma", zone: "Zone B", batch: "BT-2024-133", qty: 5200, uom: "Units", reorder: 1500, expiry: "2026-09-15", status: "Near Expiry" },
  { sku: "APX-1110", desc: "Nitrile Gloves Medium (Box)", category: "OTC", zone: "Zone B", batch: "BT-2024-509", qty: 260, uom: "Boxes", reorder: 100, expiry: "2028-10-31", status: "OK" },
  { sku: "APX-1125", desc: "Latex Examination Gloves (Box)", category: "OTC", zone: "Zone B", batch: "BT-2024-514", qty: 85, uom: "Boxes", reorder: 120, expiry: "2027-11-30", status: "Low" },
  { sku: "APX-0098", desc: "Cotton Gauze Rolls 10cm", category: "OTC", zone: "Zone B", batch: "BT-2024-492", qty: 2400, uom: "Rolls", reorder: 600, expiry: "2027-02-28", status: "OK" },
  { sku: "APX-0105", desc: "Adhesive Bandages Assorted", category: "OTC", zone: "Zone B", batch: "BT-2024-497", qty: 7800, uom: "Pcs", reorder: 2000, expiry: "2026-12-31", status: "OK" },
  { sku: "APX-0112", desc: "Hand Sanitiser 500mL", category: "OTC", zone: "Zone B", batch: "BT-2024-503", qty: 940, uom: "Bottles", reorder: 300, expiry: "2026-09-20", status: "Near Expiry" },
  { sku: "APX-3310", desc: "Human Albumin 20% 50mL", category: "Cold Chain", zone: "Zone C", batch: "BT-2024-778", qty: 160, uom: "Vials", reorder: 60, expiry: "2026-01-31", status: "OK" },
  { sku: "APX-3318", desc: "Rabies Vaccine 1mL", category: "Cold Chain", zone: "Zone C", batch: "BT-2024-784", qty: 44, uom: "Vials", reorder: 50, expiry: "2026-03-31", status: "Low" },
  { sku: "APX-3325", desc: "Enoxaparin 60mg Syringe", category: "Cold Chain", zone: "Zone C", batch: "BT-2024-790", qty: 310, uom: "Syringes", reorder: 120, expiry: "2026-09-10", status: "Near Expiry" },
  { sku: "APX-3331", desc: "Influenza Vaccine Quadrivalent", category: "Cold Chain", zone: "Zone C", batch: "BT-2024-796", qty: 520, uom: "Vials", reorder: 200, expiry: "2026-07-31", status: "OK" },
  { sku: "APX-6620", desc: "Ringer Lactate 500mL Bags", category: "Bulk", zone: "Zone D", batch: "BT-2024-330", qty: 1350, uom: "Bags", reorder: 400, expiry: "2026-08-31", status: "OK" },
  { sku: "APX-6635", desc: "Dextrose 5% 1000mL Bags", category: "Bulk", zone: "Zone D", batch: "BT-2024-338", qty: 2100, uom: "Bags", reorder: 600, expiry: "2026-10-31", status: "OK" },
  { sku: "APX-6648", desc: "Sterile Water for Injection 10mL", category: "Bulk", zone: "Zone D", batch: "BT-2024-345", qty: 8600, uom: "Ampoules", reorder: 2500, expiry: "2026-09-30", status: "Near Expiry" },
]

const statusStyle: Record<string, string> = {
  OK: "bg-success/15 text-success",
  Low: "bg-warning/15 text-warning",
  "Near Expiry": "bg-danger/15 text-danger",
}

export default function PortalInventoryPage() {
  const [inventory, setInventory] = useState<StockItem[]>(initialInventory)
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("All")
  const [zone, setZone] = useState("All Zones")
  const [detail, setDetail] = useState<StockItem | null>(null)

  const filtered = inventory.filter(item => {
    const matchSearch = !search || item.sku.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === "All" || item.category === category
    const matchZone = zone === "All Zones" || item.zone === zone
    return matchSearch && matchCat && matchZone
  })

  const totalSkus = filtered.length
  const totalUnits = filtered.reduce((a, b) => a + b.qty, 0)
  const lowStock = filtered.filter(i => i.status === "Low" || i.status === "Near Expiry").length

  // Recomputes each SKU's status from live qty / reorder level / expiry window.
  function refresh() {
    const soon = new Date()
    soon.setDate(soon.getDate() + 60)
    let changed = 0
    setInventory(prev => prev.map(item => {
      const next =
        item.qty <= item.reorder ? "Low"
        : new Date(item.expiry) <= soon ? "Near Expiry"
        : "OK"
      if (next !== item.status) changed++
      return next === item.status ? item : { ...item, status: next }
    }))
    notify.info("Inventory refreshed", changed > 0
      ? `${changed} SKU status${changed === 1 ? "" : "es"} updated from live stock levels.`
      : "All SKU statuses are already up to date.")
  }

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Inventory</h1>
          <p className="text-sm text-muted-foreground">Real-time view of your stored stock</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            title="Refresh stock statuses"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <ExportButton data={filtered} filename="portal-inventory" label="Export CSV" className="!bg-brand !text-white !border-transparent hover:!bg-brand/90" />
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand/15 border border-brand/20">
          <Package className="w-4 h-4 text-brand" />
          <span className="text-xs font-semibold text-brand">{totalSkus} SKUs</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-success/10 border border-success/20">
          <span className="text-xs font-semibold text-success">{totalUnits.toLocaleString()} Units total</span>
        </div>
        {lowStock > 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs font-semibold text-warning">{lowStock} items need attention</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search SKU or description..."
            className="bg-transparent outline-none text-xs w-44 placeholder:text-muted-foreground text-foreground"
          />
        </div>
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/40 border border-border">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors",
                category === c ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
              )}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-xs cursor-pointer">
          <Filter className="w-3.5 h-3.5 text-muted-foreground" />
          <select value={zone} onChange={e => setZone(e.target.value)} className="bg-transparent outline-none text-xs text-foreground cursor-pointer">
            {zones.map(z => <option key={z}>{z}</option>)}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">SKU</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Description</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Zone</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Batch</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Qty</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Expiry</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((item) => (
                <tr key={item.sku} onClick={() => setDetail(item)} className="hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-brand">{item.sku}</td>
                  <td className="px-4 py-3 text-foreground max-w-[180px] truncate">{item.desc}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{item.zone}</td>
                  <td className="px-4 py-3 font-mono text-muted-foreground hidden md:table-cell">{item.batch}</td>
                  <td className="px-4 py-3 text-right font-bold text-foreground">
                    {item.qty.toLocaleString()}
                    <span className="text-muted-foreground font-normal ml-1">{item.uom}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{item.expiry}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[item.status])}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetail(item) }}
                      title="View SKU details"
                      className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8}>
                  <EmptyState
                    icon={Search}
                    title="No SKUs match your filters"
                    description="Try a different search term or clear the active filters."
                    action={{ label: "Clear Filters", onClick: () => { setSearch(""); setCategory("All"); setZone("All Zones") } }}
                  />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {inventory.length} SKUs
        </div>
      </div>

      {/* SKU detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.sku ?? ""}
        description="Stock item detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="SKU" value={<span className="font-mono text-brand">{detail.sku}</span>} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Category" value={detail.category} />
            <DetailRow label="Zone" value={detail.zone} />
            <DetailRow label="Batch" value={<span className="font-mono">{detail.batch}</span>} />
            <DetailRow label="Quantity on Hand" value={`${detail.qty.toLocaleString()} ${detail.uom}`} />
            <DetailRow label="Reorder Level" value={`${detail.reorder.toLocaleString()} ${detail.uom}`} />
            <DetailRow label="Cover vs Reorder" value={detail.qty <= detail.reorder
              ? <span className="text-warning">{(detail.reorder - detail.qty).toLocaleString()} below reorder level</span>
              : <span className="text-success">{(detail.qty - detail.reorder).toLocaleString()} above reorder level</span>} />
            <DetailRow label="Expiry" value={detail.expiry} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
