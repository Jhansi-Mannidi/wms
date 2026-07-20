import { ModuleLayout } from "@/components/layout/module-layout"
import { Clock, CalendarDays, Zap, History, Settings2 } from "lucide-react"

export default function SchedulerLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Scheduler"
      subtitle="Jobs, SLAs & Automation"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Scheduler" }]}
      sections={[
        {
          title: "Scheduler",
          items: [
            { label: "Job Queue", href: "/scheduler", icon: <Clock className="w-4 h-4" />, badge: 8 },
            { label: "Calendar View", href: "/scheduler/calendar", icon: <CalendarDays className="w-4 h-4" /> },
            { label: "Automation Rules", href: "/scheduler/automation", icon: <Zap className="w-4 h-4" /> },
            { label: "Run History", href: "/scheduler/history", icon: <History className="w-4 h-4" /> },
            { label: "SLA Config", href: "/scheduler/sla", icon: <Settings2 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
