import { ModuleLayout } from "@/components/layout/module-layout"
import { Shield, FileSearch, Download, Filter } from "lucide-react"

export default function AuditTrailLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Audit Trail"
      subtitle="Compliance & Logging"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Audit Trail" }]}
      sections={[
        {
          title: "Audit",
          items: [
            { label: "All Logs", href: "/audit-trail", icon: <Shield className="w-4 h-4" /> },
            { label: "Search Logs", href: "/audit-trail/search", icon: <FileSearch className="w-4 h-4" /> },
            { label: "Audit Filters", href: "/audit-trail/filters", icon: <Filter className="w-4 h-4" /> },
            { label: "Export Audit", href: "/audit-trail/export", icon: <Download className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
