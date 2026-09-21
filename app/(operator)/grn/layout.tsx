import { ModuleLayout } from "@/components/layout/module-layout"
import {
  FileText, ClipboardList, PackageCheck, BarChart3, Truck
} from "lucide-react"

export default function GRNLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="GRN"
      subtitle="Goods Receipt Note"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "GRN" }]}
      sections={[
        {
          title: "GRN",
          items: [
            { label: "New GRN", href: "/grn", icon: <FileText className="w-4 h-4" /> },
            { label: "GRN Register", href: "/grn/register", icon: <ClipboardList className="w-4 h-4" /> },
            { label: "Putaway Queue", href: "/grn/putaway", icon: <PackageCheck className="w-4 h-4" /> },
            { label: "Inbound Trucks", href: "/grn/trucks", icon: <Truck className="w-4 h-4" /> },
            { label: "GRN Analytics", href: "/grn/analytics", icon: <BarChart3 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
