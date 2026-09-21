import { ModuleLayout } from "@/components/layout/module-layout"
import { BarChart2, TrendingUp, Package, ShoppingCart, Users, Download } from "lucide-react"

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Analytics"
      subtitle="Dashboards & Insights"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Analytics" }]}
      sections={[
        {
          title: "Reports",
          items: [
            { label: "Overview", href: "/analytics", icon: <BarChart2 className="w-4 h-4" /> },
            { label: "Inventory Report", href: "/analytics/inventory", icon: <Package className="w-4 h-4" /> },
            { label: "Order Report", href: "/analytics/orders", icon: <ShoppingCart className="w-4 h-4" /> },
            { label: "Workforce Report", href: "/analytics/workforce", icon: <Users className="w-4 h-4" /> },
            { label: "Performance KPIs", href: "/analytics/kpis", icon: <TrendingUp className="w-4 h-4" /> },
            { label: "Export Reports", href: "/analytics/export", icon: <Download className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
