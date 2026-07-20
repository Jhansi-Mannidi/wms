"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import {
  LayoutDashboard, MapPin, Layers, Hash, RefreshCw, ArrowUpDown,
  Truck, PackageCheck, ArrowLeftRight, PackageMinus, BarChart2
} from "lucide-react"

const sections = [
  {
    title: "Inventory",
    items: [
      { label: "Stock Overview", href: "/inventory", icon: <LayoutDashboard className="w-4 h-4" /> },
      { label: "Location Browser", href: "/inventory/locations", icon: <MapPin className="w-4 h-4" /> },
      { label: "Batch Management", href: "/inventory/batches", icon: <Layers className="w-4 h-4" /> },
      { label: "Serial Tracking", href: "/inventory/serials", icon: <Hash className="w-4 h-4" /> },
      { label: "Cycle Counts", href: "/inventory/cycle-counts", icon: <RefreshCw className="w-4 h-4" />, badge: 3 },
      { label: "Stock Adjustments", href: "/inventory/adjustments", icon: <ArrowUpDown className="w-4 h-4" /> },
    ],
  },
  {
    title: "Inbound",
    items: [
      { label: "Expected Receipts", href: "/inventory/expected-receipts", icon: <Truck className="w-4 h-4" />, badge: 8 },
      { label: "GRN History", href: "/inventory/grn-history", icon: <PackageCheck className="w-4 h-4" /> },
    ],
  },
  {
    title: "Movements",
    items: [
      { label: "Transfer Orders", href: "/inventory/transfers", icon: <ArrowLeftRight className="w-4 h-4" />, badge: 5 },
      { label: "Write-offs", href: "/inventory/write-offs", icon: <PackageMinus className="w-4 h-4" /> },
      { label: "Reports", href: "/inventory/reports", icon: <BarChart2 className="w-4 h-4" /> },
    ],
  },
]

export default function InventoryLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Inventory Management"
      subtitle="Stock & Warehouse"
      sections={sections}
    >
      {children}
    </ModuleLayout>
  )
}
