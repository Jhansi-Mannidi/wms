import { ModuleLayout } from "@/components/layout/module-layout"
import { Forklift, Wrench, Activity, AlertTriangle, BarChart3 } from "lucide-react"

export default function MHELayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="MHE Operations"
      subtitle="Equipment Tracking"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "MHE Operations" }]}
      sections={[
        {
          title: "MHE",
          items: [
            { label: "Fleet Overview", href: "/mhe-operations", icon: <Forklift className="w-4 h-4" />, badge: 12 },
            { label: "Live Tracking", href: "/mhe-operations/tracking", icon: <Activity className="w-4 h-4" /> },
            { label: "Maintenance", href: "/mhe-operations/maintenance", icon: <Wrench className="w-4 h-4" /> },
            { label: "Incidents", href: "/mhe-operations/incidents", icon: <AlertTriangle className="w-4 h-4" /> },
            { label: "Utilization", href: "/mhe-operations/utilization", icon: <BarChart3 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
