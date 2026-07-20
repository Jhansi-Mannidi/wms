"use client"

import { useState } from "react"
import {
  Warehouse, MapPin, Plus, ChevronDown, Eye, MoreHorizontal,
  Building2, Layers, Grid3X3, Settings2, CheckCircle2, Edit2
} from "lucide-react"
import { cn } from "@/lib/utils"

const warehouses = [
  { id: "WH-01", name: "Main Warehouse", location: "Jhansi, UP", area: "45,000 sqft", zones: 6, docks: 4, gates: 3, status: "Active" },
  { id: "WH-02", name: "Cold Storage Hub", location: "Jhansi, UP", area: "12,000 sqft", zones: 2, docks: 2, gates: 1, status: "Active" },
]

const zones = [
  { id: "ZN-A", warehouse: "Main Warehouse", name: "Zone A", type: "Dry Storage", aisles: 8, bays: 64, levels: 4, total: 256, racking: "Selective", temp: "Ambient" },
  { id: "ZN-B", warehouse: "Main Warehouse", name: "Zone B", type: "Dry Storage", aisles: 6, bays: 48, levels: 4, total: 192, racking: "Drive-In", temp: "Ambient" },
  { id: "ZN-C", warehouse: "Main Warehouse", name: "Zone C", type: "Bulk Storage", aisles: 4, bays: 32, levels: 3, total: 96, racking: "Block Stack", temp: "Ambient" },
  { id: "ZN-D", warehouse: "Main Warehouse", name: "Zone D", type: "Cold Storage", aisles: 3, bays: 24, levels: 5, total: 120, racking: "Selective", temp: "Chilled 2–8°C" },
  { id: "ZN-E", warehouse: "Main Warehouse", name: "Zone E", type: "Hazmat", aisles: 2, bays: 16, levels: 2, total: 32, racking: "Cantilever", temp: "Controlled" },
  { id: "ZN-F", warehouse: "Main Warehouse", name: "Zone F", type: "Staging", aisles: 2, bays: 16, levels: 1, total: 16, racking: "Floor", temp: "Ambient" },
]

const docks = [
  { id: "DK-01", warehouse: "Main Warehouse", name: "Dock 1", type: "Inbound", gate: "Gate 1", status: "Active", equipment: "Dock Leveler" },
  { id: "DK-02", warehouse: "Main Warehouse", name: "Dock 2", type: "Inbound", gate: "Gate 1", status: "Active", equipment: "Dock Leveler" },
  { id: "DK-03", warehouse: "Main Warehouse", name: "Dock 3", type: "Outbound", gate: "Gate 2", status: "Active", equipment: "Dock Leveler" },
  { id: "DK-04", warehouse: "Main Warehouse", name: "Dock 4", type: "Mixed", gate: "Gate 3", status: "Active", equipment: "Dock Seal" },
]

export default function WarehouseSetupPage() {
  const [tab, setTab] = useState<"warehouses" | "zones" | "docks">("warehouses")

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Warehouse Setup</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Configure warehouses, zones, aisles and docks</p>
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Plus className="w-4 h-4" /> Add Warehouse
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Warehouses", value: warehouses.length.toString(), icon: <Warehouse className="w-5 h-5" /> },
            { label: "Total Zones", value: zones.length.toString(), icon: <Layers className="w-5 h-5" /> },
            { label: "Total Locations", value: zones.reduce((s, z) => s + z.total, 0).toString(), icon: <Grid3X3 className="w-5 h-5" /> },
            { label: "Loading Docks", value: docks.length.toString(), icon: <Building2 className="w-5 h-5" /> },
          ].map((stat, i) => (
            <div key={i} className="p-5 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <span className="text-brand">{stat.icon}</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-muted/50 w-fit">
          {(["warehouses", "zones", "docks"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors", tab === t ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60")}>
              {t === "warehouses" ? "Warehouses" : t === "zones" ? "Zones" : "Docks"}
            </button>
          ))}
        </div>

        {tab === "warehouses" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-5 rounded-2xl border border-border bg-card">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/15 flex items-center justify-center">
                      <Warehouse className="w-5 h-5 text-brand" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{wh.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" /> {wh.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-success/15 text-success">{wh.status}</span>
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  {[
                    { label: "Area", value: wh.area },
                    { label: "Zones", value: wh.zones.toString() },
                    { label: "Docks", value: wh.docks.toString() },
                    { label: "Gates", value: wh.gates.toString() },
                  ].map((m, j) => (
                    <div key={j} className="p-3 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-[10px] text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-bold text-foreground mt-0.5">{m.value}</p>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  <button className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                    <Settings2 className="w-3.5 h-3.5" /> Configure
                  </button>
                  <span className="text-border">•</span>
                  <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View Map
                  </button>
                </div>
              </div>
            ))}
            {/* Add warehouse card */}
            <button className="p-5 rounded-2xl border-2 border-dashed border-border hover:border-brand/50 bg-card hover:bg-brand/5 transition-all flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-brand h-40">
              <Plus className="w-8 h-8" />
              <span className="text-sm font-medium">Add New Warehouse</span>
            </button>
          </div>
        )}

        {tab === "zones" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Zone Configuration</h2>
              <button className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Zone
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Zone ID", "Name", "Warehouse", "Type", "Aisles", "Bays", "Levels", "Locations", "Racking", "Temperature", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {zones.map((zone, i) => (
                    <tr key={zone.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs font-mono">{zone.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{zone.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{zone.warehouse}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-brand/10 text-brand">{zone.type}</span>
                      </td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{zone.aisles}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{zone.bays}</td>
                      <td className="px-4 py-3 text-foreground whitespace-nowrap">{zone.levels}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{zone.total}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{zone.racking}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{zone.temp}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "docks" && (
          <div className="rounded-2xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Loading Docks</h2>
              <button className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Plus className="w-3.5 h-3.5" /> Add Dock
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Dock ID", "Name", "Warehouse", "Type", "Gate", "Equipment", "Status", ""].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {docks.map((dock, i) => (
                    <tr key={dock.id} className={cn("border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors", i % 2 === 1 ? "bg-muted/10" : "")}>
                      <td className="px-4 py-3 text-brand font-medium whitespace-nowrap text-xs font-mono">{dock.id}</td>
                      <td className="px-4 py-3 font-semibold text-foreground whitespace-nowrap">{dock.name}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{dock.warehouse}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium", dock.type === "Inbound" ? "bg-success/15 text-success" : dock.type === "Outbound" ? "bg-warning/15 text-warning" : "bg-brand/15 text-brand")}>
                          {dock.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{dock.gate}</td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">{dock.equipment}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {dock.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
