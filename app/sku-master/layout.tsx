import { ModuleLayout } from "@/components/layout/module-layout"
import { Tag, Plus, Upload, Layers, Settings2 } from "lucide-react"

export default function SKUMasterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="SKU Master"
      subtitle="Product Definitions & Mappings"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "SKU Master" }]}
      sections={[
        {
          title: "SKU Master",
          items: [
            { label: "All SKUs", href: "/sku-master", icon: <Tag className="w-4 h-4" /> },
            { label: "Add SKU", href: "/sku-master/add", icon: <Plus className="w-4 h-4" /> },
            { label: "Bulk Import", href: "/sku-master/import", icon: <Upload className="w-4 h-4" /> },
            { label: "Categories", href: "/sku-master/categories", icon: <Layers className="w-4 h-4" /> },
            { label: "Attributes", href: "/sku-master/attributes", icon: <Settings2 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
