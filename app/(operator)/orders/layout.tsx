"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import {
  ShoppingCart, Clock, Package, PackageCheck, Truck, AlertTriangle,
  BarChart2, Upload, Waves
} from "lucide-react"

const sections = [
  {
    title: "Orders",
    items: [
      { label: "All Orders", href: "/orders", icon: <ShoppingCart className="w-4 h-4" /> },
      { label: "Pending Allocation", href: "/orders/pending", icon: <Clock className="w-4 h-4" />, badge: 28 },
      { label: "Ready to Pick", href: "/orders/ready-to-pick", icon: <Package className="w-4 h-4" /> },
      { label: "In Progress", href: "/orders/in-progress", icon: <Waves className="w-4 h-4" />, badge: 45 },
      { label: "Packed", href: "/orders/packed", icon: <PackageCheck className="w-4 h-4" /> },
      { label: "Ready to Ship", href: "/orders/ready-to-ship", icon: <Truck className="w-4 h-4" />, badge: 34 },
    ],
  },
  {
    title: "Issues",
    items: [
      { label: "SLA Breached", href: "/orders/sla-breached", icon: <AlertTriangle className="w-4 h-4" />, badge: 3 },
    ],
  },
  {
    title: "Tools",
    items: [
      { label: "Bulk Import", href: "/orders/import", icon: <Upload className="w-4 h-4" /> },
      { label: "Reports", href: "/orders/reports", icon: <BarChart2 className="w-4 h-4" /> },
    ],
  },
]

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout title="Order Management" subtitle="Orders & Fulfillment" sections={sections}>
      {children}
    </ModuleLayout>
  )
}
