import { ModuleLayout } from "@/components/layout/module-layout"
import { Truck, LogIn, LogOut, ClipboardList, BarChart3, CalendarClock } from "lucide-react"

export default function GateManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Gate Management"
      subtitle="Vehicle Entry & Exit"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Gate Management" }]}
      sections={[
        {
          title: "Operations",
          items: [
            { label: "Gate Overview", href: "/gate-management", icon: <Truck className="w-4 h-4" />, badge: 5 },
            { label: "Entry Register", href: "/gate-management/entry", icon: <LogIn className="w-4 h-4" /> },
            { label: "Exit Register", href: "/gate-management/exit", icon: <LogOut className="w-4 h-4" /> },
            { label: "Dock Scheduler", href: "/gate-management/dock", icon: <CalendarClock className="w-4 h-4" /> },
            { label: "Vehicle Log", href: "/gate-management/log", icon: <ClipboardList className="w-4 h-4" /> },
            { label: "Gate Analytics", href: "/gate-management/analytics", icon: <BarChart3 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
