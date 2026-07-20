"use client"
import { useState } from "react"
import { Settings, Save, RotateCcw } from "lucide-react"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type ConfigItem = { label: string; value: string; type: string }
type ConfigGroup = { group: string; items: ConfigItem[] }

const configs: ConfigGroup[] = [
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

/** Flatten the seeded groups into a { label: value } map. */
function seedValues(): Record<string, string> {
  const out: Record<string, string> = {}
  configs.forEach(g => g.items.forEach(i => { out[i.label] = i.value }))
  return out
}

export default function BillingConfigPage() {
  const [saved, setSaved] = useState<Record<string, string>>(seedValues)
  const [draft, setDraft] = useState<Record<string, string>>(seedValues)

  const changedLabels = Object.keys(draft).filter(k => draft[k] !== saved[k])
  const dirty = changedLabels.length > 0

  function setValue(label: string, value: string) {
    setDraft(prev => ({ ...prev, [label]: value }))
  }

  function toggle(label: string) {
    setDraft(prev => ({ ...prev, [label]: prev[label] === "true" ? "false" : "true" }))
  }

  function save() {
    const invalid = Object.entries(draft).find(([label, value]) => {
      const item = configs.flatMap(g => g.items).find(i => i.label === label)
      if (!item) return false
      if (item.type === "number") return value.trim() === "" || Number.isNaN(Number(value))
      if (item.type === "text") return value.trim() === ""
      return false
    })
    if (invalid) {
      notify.error("Cannot save", `"${invalid[0]}" needs a valid value.`)
      return
    }
    setSaved(draft)
    notify.success("Configuration saved", `${changedLabels.length} setting${changedLabels.length === 1 ? "" : "s"} updated.`)
  }

  function reset() {
    setDraft(saved)
    notify.info("Changes discarded", "Reverted to the last saved configuration.")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Billing Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {dirty ? `${changedLabels.length} unsaved change${changedLabels.length === 1 ? "" : "s"}` : "All changes saved"} — configure invoice settings, rates and notification rules
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} disabled={!dirty} title="Discard unsaved changes" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"><RotateCcw className="w-4 h-4" /> Reset</button>
          <button onClick={save} disabled={!dirty} title="Save configuration" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:pointer-events-none"><Save className="w-4 h-4" /> Save Changes</button>
        </div>
      </div>
      <div className="space-y-5">
        {configs.map(group => (
          <div key={group.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center gap-2"><Settings className="w-4 h-4 text-brand" /><p className="font-semibold text-sm text-foreground">{group.group}</p></div>
            <div className="p-4 space-y-4">
              {group.items.map(item => (
                <div key={item.label} className="flex items-center justify-between gap-4">
                  <label className="text-sm text-foreground">
                    {item.label}
                    {draft[item.label] !== saved[item.label] && <span className="ml-2 text-xs text-warning">unsaved</span>}
                  </label>
                  {item.type === "toggle"
                    ? <button onClick={() => toggle(item.label)} title={`Toggle ${item.label}`} className={`relative w-10 h-5 rounded-full transition-colors ${draft[item.label] === "true" ? "bg-brand" : "bg-muted"}`}><span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${draft[item.label] === "true" ? "translate-x-5" : "translate-x-0.5"}`} /></button>
                    : <input value={draft[item.label]} onChange={e => setValue(item.label, e.target.value)} type={item.type} className="w-40 px-3 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30 text-right" />
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
