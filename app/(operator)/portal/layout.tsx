"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import { Home, Package, Inbox, Truck, Wrench, DollarSign, FileText, User } from "lucide-react"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Customer Portal"
      subtitle="Apex Pharma Ltd — Client Account"
      moduleIcon={<Home className="w-3.5 h-3.5" />}
      sections={[
        {
          items: [
            { label: "Home", href: "/portal", icon: <Home className="w-3.5 h-3.5" /> },
            { label: "My Inventory", href: "/portal/inventory", icon: <Package className="w-3.5 h-3.5" /> },
            { label: "Inbound (ASN)", href: "/portal/asn", icon: <Inbox className="w-3.5 h-3.5" /> },
            { label: "Ship-Out", href: "/portal/ship-out", icon: <Truck className="w-3.5 h-3.5" /> },
            { label: "Tracking", href: "/portal/tracking", icon: <Truck className="w-3.5 h-3.5" /> },
            { label: "VAS Requests", href: "/portal/vas", icon: <Wrench className="w-3.5 h-3.5" /> },
            { label: "Billing", href: "/portal/billing", icon: <DollarSign className="w-3.5 h-3.5" /> },
            { label: "Reports & Docs", href: "/portal/reports", icon: <FileText className="w-3.5 h-3.5" /> },
            { label: "Profile & Users", href: "/portal/profile", icon: <User className="w-3.5 h-3.5" /> },
          ],
        },
      ]}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Customer Portal" }]}
    >
      {children}
    </ModuleLayout>
  )
}
