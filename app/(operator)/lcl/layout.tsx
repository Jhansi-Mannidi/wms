"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import { LayoutDashboard, Package, Layers, Container, FileText, ArrowLeftRight, MapPin, BarChart2 } from "lucide-react"

const sections = [
  {
    title: "Console",
    items: [
      { label: "LCL Dashboard", href: "/lcl", icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    title: "Inbound",
    items: [
      { label: "Cargo Receipts", href: "/lcl/cargo-receipts", icon: <Package className="w-4 h-4" />, badge: 9 },
      { label: "Consolidation Planner", href: "/lcl/consolidation", icon: <Layers className="w-4 h-4" />, badge: 3 },
    ],
  },
  {
    title: "Build & Export",
    items: [
      { label: "Load Plan", href: "/lcl/load-plan", icon: <Container className="w-4 h-4" /> },
      { label: "Manifest & Docs", href: "/lcl/manifest", icon: <FileText className="w-4 h-4" /> },
    ],
  },
  {
    title: "Import",
    items: [
      { label: "De-Consolidation", href: "/lcl/deconsolidation", icon: <ArrowLeftRight className="w-4 h-4" /> },
    ],
  },
  {
    title: "Tracking",
    items: [
      { label: "Cargo Tracking", href: "/lcl/tracking", icon: <MapPin className="w-4 h-4" /> },
      { label: "Reports", href: "/lcl/reports", icon: <BarChart2 className="w-4 h-4" /> },
    ],
  },
]

export default function LCLLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="LCL Consolidation"
      subtitle="CBM-Based Cargo Ops"
      sections={sections}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "LCL Consolidation" }]}
    >
      {children}
    </ModuleLayout>
  )
}
