import { ModuleLayout } from "@/components/layout/module-layout"
import { DollarSign, FileText, Receipt, TrendingUp, Settings2, CreditCard } from "lucide-react"

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ModuleLayout
      title="Billing"
      subtitle="Invoices & Payments"
      breadcrumbs={[{ label: "Home", href: "/" }, { label: "Billing" }]}
      sections={[
        {
          title: "Billing",
          items: [
            { label: "Overview", href: "/billing", icon: <DollarSign className="w-4 h-4" />, badge: 12 },
            { label: "Invoices", href: "/billing/invoices", icon: <FileText className="w-4 h-4" /> },
            { label: "Rate Cards", href: "/billing/rate-cards", icon: <Receipt className="w-4 h-4" /> },
            { label: "Payments", href: "/billing/payments", icon: <CreditCard className="w-4 h-4" /> },
            { label: "Revenue Reports", href: "/billing/reports", icon: <TrendingUp className="w-4 h-4" /> },
            { label: "Billing Config", href: "/billing/config", icon: <Settings2 className="w-4 h-4" /> },
          ],
        },
      ]}
    >
      {children}
    </ModuleLayout>
  )
}
