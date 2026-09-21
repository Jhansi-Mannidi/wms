import { ModuleLayout } from "@/components/layout/module-layout"
import { Warehouse, Grid3x3, Map, Settings2, Building2 } from "lucide-react"

export default function WarehouseSetupLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Warehouse Setup"
      subtitle="Configure Warehouses & Zones"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Warehouse Setup" }]}
      sections={[
        {
          title: "Setup",
          items: [
            { label: "Warehouses", href: "/warehouse-setup", icon: <Warehouse className="w-4 h-4" /> },
            { label: "Zones & Aisles", href: "/warehouse-setup/zones", icon: <Grid3x3 className="w-4 h-4" /> },
            { label: "Location Map", href: "/warehouse-setup/map", icon: <Map className="w-4 h-4" /> },
            { label: "Clients", href: "/warehouse-setup/clients", icon: <Building2 className="w-4 h-4" /> },
            { label: "Configuration", href: "/warehouse-setup/config", icon: <Settings2 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
