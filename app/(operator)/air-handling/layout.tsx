"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import { LayoutDashboard, Package, GitBranch, Truck, Container, MapPin } from "lucide-react"

const sections = [
  {
    title: "Overview",
    items: [
      { label: "Air Dashboard", href: "/air-handling", icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    title: "Inbound",
    items: [
      { label: "Package Capture", href: "/air-handling/capture", icon: <Package className="w-4 h-4" /> },
      { label: "Routing Board", href: "/air-handling/routing", icon: <GitBranch className="w-4 h-4" />, badge: 12 },
    ],
  },
  {
    title: "Local Delivery",
    items: [
      { label: "Courier Console", href: "/air-handling/courier", icon: <Truck className="w-4 h-4" />, badge: 8 },
    ],
  },
  {
    title: "Export",
    items: [
      { label: "ULD Build & MAWB", href: "/air-handling/uld", icon: <Container className="w-4 h-4" /> },
    ],
  },
  {
    title: "Tracking",
    items: [
      { label: "Shipment Tracking", href: "/air-handling/tracking", icon: <MapPin className="w-4 h-4" /> },
    ],
  },
]

export default function AirHandlingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Air Handling"
      subtitle="Local Delivery & Export"
      sections={sections}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Air Handling" }]}
    >
      {children}
    </ModuleLayout>
  )
}
