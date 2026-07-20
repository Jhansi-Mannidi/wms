"use client"
import { DollarSign, Settings, Save } from "lucide-react"

const configs = [
  { group: "Invoice Settings", items: [
    { label: "Invoice Prefix", value: "INV-", type: "text" },
    { label: "Tax Rate (GST)", value: "18", type: "number" },
    { label: "Payment Terms (days)", value: "30", type: "number" },
    { label: "Auto-generate invoices", value: "true", type: "toggle" },
  ]},
  { group: "Rate Card Defaults", items: [
    { label: "Storage Rate (per pallet/day)", value: "150", type: "number" },
    { label: "Handling In Rate (per unit)", value: "2.50", type: "number" },
    { label: "Handling Out Rate (per unit)", value: "3.00", type: "number" },
    { label: "Late Surcharge (%)", value: "5", type: "number" },
  ]},
  { group: "Notifications", items: [
    { label: "Send invoice email automatically", value: "true", type: "toggle" },
    { label: "Overdue reminder (days before)", value: "7", type: "number" },
  ]},
]

export default function BillingConfigPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Billing Configuration</h1><p className="text-sm text-muted-foreground mt-1">Configure invoice settings, rates and notification rules</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save Changes</button>
      </div>
      <div className="space-y-5">
        {configs.map(group => (
          <div key={group.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2"><Settings className="w-4 h-4 text-brand" /><p className="font-semibold text-sm text-foreground">{group.group}</p></div>
            <div className="p-4 space-y-4">
              {group.items.map(item => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-foreground">{item.label}</label>
                  {item.type === "toggle"
                    ? <button className={`relative w-10 h-5 rounded-full transition-colors ${item.value === "true" ? "bg-brand" : "bg-muted"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${item.value === "true" ? "translate-x-5" : "translate-x-0.5"}`} /></button>
                    : <input defaultValue={item.value} type={item.type} className="w-40 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 text-right" />
                  }
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
