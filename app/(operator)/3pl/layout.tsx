"use client"

import { ModuleLayout } from "@/components/layout/module-layout"
import { Users, Handshake, Inbox, Package, ShoppingCart, Wrench, DollarSign, FileCheck, Layers } from "lucide-react"

export default function ThreePLLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="3PL Operations"
      subtitle="Multi-Client End-to-End"
      moduleIcon={<Layers className="w-3.5 h-3.5" />}
      sections={[
        {
          title: "Clients",
          items: [
            { label: "Client Directory", href: "/3pl", icon: <Users className="w-3.5 h-3.5" /> },
            { label: "Agreements", href: "/3pl/agreements", icon: <Handshake className="w-3.5 h-3.5" /> },
          ],
        },
        {
          title: "Operations",
          items: [
            { label: "ASN / Inbound Board", href: "/3pl/asn", icon: <Inbox className="w-3.5 h-3.5" />, badge: 8, badgeVariant: "warning" as const },
            { label: "Owned Stock Explorer", href: "/3pl/stock", icon: <Package className="w-3.5 h-3.5" /> },
            { label: "Ship-Out Queue", href: "/3pl/ship-out", icon: <ShoppingCart className="w-3.5 h-3.5" />, badge: 14, badgeVariant: "brand" as const },
            { label: "VAS Work Orders", href: "/3pl/vas", icon: <Wrench className="w-3.5 h-3.5" />, badge: 3 },
          ],
        },
        {
          title: "Billing",
          items: [
            { label: "Billable Events", href: "/3pl/billable-events", icon: <DollarSign className="w-3.5 h-3.5" />, badge: 28, badgeVariant: "warning" as const },
            { label: "Invoice Run", href: "/3pl/invoices", icon: <FileCheck className="w-3.5 h-3.5" /> },
          ],
        },
      ]}
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "3PL Operations" }]}
    >
      {children}
    </ModuleLayout>
  )
}
