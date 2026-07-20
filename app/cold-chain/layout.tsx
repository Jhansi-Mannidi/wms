import { ModuleLayout } from "@/components/layout/module-layout"
import { Thermometer, Activity, AlertTriangle, ClipboardList, BarChart3 } from "lucide-react"

export default function ColdChainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Cold Chain"
      subtitle="Temperature Monitoring"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cold Chain" }]}
      sections={[
        {
          title: "Cold Chain",
          items: [
            { label: "Dashboard", href: "/cold-chain", icon: <Thermometer className="w-4 h-4" />, badge: 2 },
            { label: "Live Sensors", href: "/cold-chain/sensors", icon: <Activity className="w-4 h-4" /> },
            { label: "Breach Log", href: "/cold-chain/breaches", icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Compliance", href: "/cold-chain/compliance", icon: <ClipboardList className="w-4 h-4" /> },
            { label: "Analytics", href: "/cold-chain/analytics", icon: <BarChart3 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
