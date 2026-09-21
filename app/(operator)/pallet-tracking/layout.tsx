import { ModuleLayout } from "@/components/layout/module-layout"
import { Box, MapPin, RefreshCcw, Layers, BarChart3 } from "lucide-react"

export default function PalletTrackingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Pallet Tracking"
      subtitle="Pallet Lifecycle Management"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Pallet Tracking" }]}
      sections={[
        {
          title: "Pallets",
          items: [
            { label: "Pallet Register", href: "/pallet-tracking", icon: <Box className="w-4 h-4" />, badge: 890 },
            { label: "Live Locations", href: "/pallet-tracking/locations", icon: <MapPin className="w-4 h-4" /> },
            { label: "Pallet History", href: "/pallet-tracking/history", icon: <RefreshCcw className="w-4 h-4" /> },
            { label: "Stacking Rules", href: "/pallet-tracking/rules", icon: <Layers className="w-4 h-4" /> },
            { label: "Analytics", href: "/pallet-tracking/analytics", icon: <BarChart3 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
