import { ModuleLayout } from "@/components/layout/module-layout"
import { Building, Grid3x3, Users, DollarSign, Settings2 } from "lucide-react"

export default function SpaceManagementLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Space Management"
      subtitle="Facility & Tenant Management"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Space Management" }]}
      sections={[
        {
          title: "Space",
          items: [
            { label: "Overview", href: "/space-management", icon: <Building className="w-4 h-4" /> },
            { label: "Floor Plan", href: "/space-management/floor-plan", icon: <Grid3x3 className="w-4 h-4" /> },
            { label: "Tenants", href: "/space-management/tenants", icon: <Users className="w-4 h-4" /> },
            { label: "Leases", href: "/space-management/leases", icon: <DollarSign className="w-4 h-4" /> },
            { label: "Configuration", href: "/space-management/config", icon: <Settings2 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
