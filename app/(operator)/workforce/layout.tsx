import { ModuleLayout } from "@/components/layout/module-layout"
import { Users, CalendarDays, ClipboardCheck, BarChart3, UserPlus, Clock } from "lucide-react"

export default function WorkforceLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Workforce"
      subtitle="Shift & Task Management"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Workforce" }]}
      sections={[
        {
          title: "Workforce",
          items: [
            { label: "Overview", href: "/workforce", icon: <Users className="w-4 h-4" />, badge: 45 },
            { label: "Shift Scheduler", href: "/workforce/shifts", icon: <CalendarDays className="w-4 h-4" /> },
            { label: "Task Assignment", href: "/workforce/tasks", icon: <ClipboardCheck className="w-4 h-4" /> },
            { label: "Attendance", href: "/workforce/attendance", icon: <Clock className="w-4 h-4" /> },
            { label: "Add Staff", href: "/workforce/add", icon: <UserPlus className="w-4 h-4" /> },
            { label: "Productivity", href: "/workforce/productivity", icon: <BarChart3 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
