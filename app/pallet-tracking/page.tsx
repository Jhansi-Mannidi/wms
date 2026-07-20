"use client"

import { useState } from "react"
import {
  Box, MapPin, Clock, CheckCircle2, AlertTriangle,
  Plus, Search, ChevronDown, Eye, MoreHorizontal, QrCode, RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

const pallets = [
  { id: "PLT-2024-0890", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", client: "Acme Foods", location: "A-12-03-L1", qty: 50, weight: "250 kg", status: "Stored", type: "Euro", created: "2024-12-10", age: "6 days" },
  { id: "PLT-2024-0889", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", client: "Acme Foods", location: "A-12-04-L2", qty: 40, weight: "400 kg", status: "Stored", type: "Standard", created: "2024-12-12", age: "4 days" },
  { id: "PLT-2024-0888", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", client: "Global Oils", location: "B-05-01-L1", qty: 30, weight: "180 kg", status: "In Transit", type: "Euro", created: "2024-12-14", age: "2 days" },
  { id: "PLT-2024-0887", sku: "SKU-001237", product: "Chickpea Lentils 25kg", client: "Agro Corp", location: "Staging Area", qty: 20, weight: "500 kg", status: "Staging", type: "Standard", created: "2024-12-15", age: "1 day" },
  { id: "PLT-2024-0886", sku: "SKU-001239", product: "Iodized Salt 1kg", client: "Salt Works", location: "C-03-07-L3", qty: 100, weight: "100 kg", status: "Stored", type: "Half", created: "2024-12-08", age: "8 days" },
  { id: "PLT-2024-0885", sku: "SKU-001240", product: "Tomato Puree 400g", client: "Fresh Farms", location: "D-01-05-L1", qty: 60, weight: "144 kg", status: "Reserved", type: "Euro", created: "2024-12-13", age: "3 days" },
  { id: "PLT-2024-0884", sku: "SKU-001241", product: "Coconut Milk 400ml", client: "Tropical Co", location: "D-02-03-L2", qty: 80, weight: "192 kg", status: "Damaged", type: "Standard", created: "2024-12-11", age: "5 days" },
]

const statusConfig: Record<string, { color: string; bg: string }> = {
  Stored: { color: "text-success", bg: "bg-success/15" },
  "In Transit": { color: "text-brand", bg: "bg-brand/15" },
  Staging: { color: "text-warning", bg: "bg-warning/15" },
  Reserved: { color: "text-purple-400", bg: "bg-purple-400/15" },
  Damaged: { color: "text-danger", bg: "bg-danger/15" },
}

export default function PalletTrackingPage() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("All Status")
  const [clientFilter, setClientFilter] = useState("All Clients")

  const filtered = pallets.filter((p) => {
    const q = search.toLowerCase()
    return (
      (p.id.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.product.toLowerCase().includes(q)) &&
      (statusFilter === "All Status" || p.status === statusFilter) &&
      (clientFilter === "All Clients" || p.client === clientFilter)
    )
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pallet Tracking</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Real-time pallet lifecycle and location management</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <QrCode className="w-4 h-4" /> Scan Pallet
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
              <Plus className="w-4 h-4" /> New Pallet
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Pallets", value: pallets.length.toString(), icon: <Box className="w-5 h-5" />, color: "text-brand" },
            { label: "Stored", value: pallets.filter((p) => p.status === "Stored").length.toString(), icon: <CheckCircle2 className="w-5 h-5" />, color: "text-success" },
            { label: "In Transit", value: pallets.filter((p) => p.status === "In Transit").length.toString(), icon: <RefreshCw className="w-5 h-5" />, color: "text-brand" },
            { label: "Staging", value: pallets.filter((p) => p.status === "Staging").length.toString(), icon: <Clock className="w-5 h-5" />, color: "text-warning" },
            { label: "Damaged", value: pallets.filter((p) => p.status === "Damaged").length.toString(), icon: <AlertTriangle className="w-5 h-5" />, color: "text-danger" },
          ].map((stat, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs text-muted-foreground">{stat.label}</span>
                <span className={stat.color}>{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-48 px-3 py-2 rounded-xl border border-border bg-card">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground text-foreground" placeholder="Search pallet ID, SKU, product..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          {[
            { value: statusFilter, options: ["All Status", "Stored", "In Transit", "Staging", "Reserved", "Damaged"], onChange: setStatusFilter },
            { value: clientFilter, options: ["All Clients", "Acme Foods", "Global Oils", "Agro Corp", "Salt Works", "Fresh Farms", "Tropical Co"], onChange: setClientFilter },
          ].map((f, i) => (
            <div key={i} className="relative">
              <select className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border bg-card text-sm text-foreground outline-none cursor-pointer" value={f.value} onChange={(e) => f.onChange(e.target.value)}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
              <ChevronDown className="w-4 h-4 text-muted-foreground absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Pallet ID", "SKU", "Product", "Client", "Location", "Qty", "Weight", "Type", "Age", "Status", ""].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-brand font-medium hover:underline cursor-pointer flex items-center gap-1.5 text-xs">
                        <Box className="w-3.5 h-3.5" /> {p.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs font-mono">{p.sku}</td>
                    <td className="px-4 py-3 font-medium text-foreground max-w-44"><span className="line-clamp-1">{p.product}</span></td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{p.client}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="flex items-center gap-1 text-muted-foreground text-xs font-mono">
                        <MapPin className="w-3 h-3 shrink-0" /> {p.location}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{p.qty}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{p.weight}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{p.type}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {p.age}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", statusConfig[p.status]?.bg, statusConfig[p.status]?.color)}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Box className="w-10 h-10 mb-3 opacity-40" />
                <p className="font-medium">No pallets found</p>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/20">
            <span className="text-xs text-muted-foreground">Showing {filtered.length} of {pallets.length} pallets</span>
            <div className="flex gap-1">
              {[1, 2, 3].map((p) => (
                <button key={p} className={cn("w-7 h-7 rounded-lg text-xs transition-colors", p === 1 ? "bg-brand text-white" : "text-muted-foreground hover:bg-muted")}>{p}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
