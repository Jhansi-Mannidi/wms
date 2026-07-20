"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import { LayoutDashboard, PackagePlus, Layers, Users, DollarSign, FileText } from "lucide-react"

const sections = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", href: "/storage-saas", icon: <LayoutDashboard className="w-4 h-4" /> },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Quick Drop-Off", href: "/storage-saas/drop-off", icon: <PackagePlus className="w-4 h-4" /> },
      { label: "Space & Sub-Lease", href: "/storage-saas/space", icon: <Layers className="w-4 h-4" /> },
      { label: "Customer Stock & Release", href: "/storage-saas/stock", icon: <Users className="w-4 h-4" /> },
    ],
  },
  {
    title: "Finance",
    items: [
      { label: "Storage Billing", href: "/storage-saas/billing", icon: <DollarSign className="w-4 h-4" /> },
      { label: "Inventory Report", href: "/storage-saas/report", icon: <FileText className="w-4 h-4" /> },
    ],
  },
]

export default function StorageSaaSLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Storage-as-a-Service"
      subtitle="Mini-Warehouse & Sub-Lease"
      sections={sections}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Storage-as-a-Service" }]}
    >
      {children}
    </ModuleLayout>
  )
}
