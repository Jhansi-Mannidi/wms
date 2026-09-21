"use client"
import { useState } from "react"
import { Save, RotateCcw } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

type SettingField = { label: string; val: string }
type SettingGroup = { group: string; fields: SettingField[] }

const settings: SettingGroup[] = [
  { group:"Warehouse Dimensions", fields:[{label:"Total Floor Area (sq ft)",val:"42,000"},{label:"Usable Storage Area (sq ft)",val:"34,500"},{label:"Dock Area (sq ft)",val:"3,200"},{label:"Office / Common (sq ft)",val:"4,300"}]},
  { group:"Zone Defaults", fields:[{label:"Standard Zone Height (m)",val:"8.5"},{label:"Max Pallet Stack (levels)",val:"3"},{label:"Aisle Width (m)",val:"3.5"},{label:"Racking System",val:"Selective Pallet Racking"}]},
  { group:"Billing Defaults", fields:[{label:"Base Storage Rate (₹/pallet/day)",val:"150"},{label:"Overflow Rate Premium (%)",val:"25"},{label:"Cold Storage Premium (₹/pallet/day)",val:"80"},{label:"Min Billing (pallets/month)",val:"20"}]},
  { group:"Dock & Staging", fields:[{label:"Dock Doors (count)",val:"12"},{label:"Staging Bays (count)",val:"8"},{label:"Dock Door Width (m)",val:"2.7"},{label:"Staging Dwell Limit (hours)",val:"6"}]},
  { group:"Utilization Thresholds", fields:[{label:"Zone Warning Threshold (%)",val:"75"},{label:"Zone Critical Threshold (%)",val:"90"},{label:"Target Overall Utilization (%)",val:"82"},{label:"Reserve Buffer (pallets)",val:"120"}]},
  { group:"Compliance & Safety", fields:[{label:"Fire Aisle Clearance (m)",val:"1.2"},{label:"Max Hazmat Pallets per Zone",val:"40"},{label:"Cold Chain Audit Interval (days)",val:"30"},{label:"Rack Inspection Interval (days)",val:"180"}]},
]

// Every field except the free-text racking system must parse as a positive number.
const TEXT_FIELDS = new Set(["Racking System"])

const initialValues: Record<string, string> = Object.fromEntries(
  settings.flatMap((g) => g.fields.map((f) => [f.label, f.val]))
)

export default function SpaceConfigPage() {
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [saved, setSaved] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resetOpen, setResetOpen] = useState(false)

  const dirtyFields = Object.keys(values).filter((k) => values[k] !== saved[k])

  function validate() {
    const e: Record<string, string> = {}
    for (const [label, value] of Object.entries(values)) {
      if (!value.trim()) { e[label] = "Required"; continue }
      if (TEXT_FIELDS.has(label)) continue
      const numeric = Number(value.replace(/,/g, ""))
      if (!Number.isFinite(numeric)) e[label] = "Enter a number"
      else if (numeric <= 0) e[label] = "Must be greater than zero"
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function save() {
    if (!validate()) {
      notify.error("Cannot save configuration", "Fix the highlighted fields and try again.")
      return
    }
    if (dirtyFields.length === 0) {
      notify.info("Nothing to save", "No configuration values have changed.")
      return
    }
    setSaved(values)
    notify.success("Configuration saved", `${dirtyFields.length} setting${dirtyFields.length > 1 ? "s" : ""} updated.`)
  }

  function reset() {
    setValues(saved)
    setErrors({})
    notify.info("Changes discarded", "Reverted to the last saved configuration.")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Space Configuration</h1><p className="text-sm text-muted-foreground mt-1">Warehouse dimensions, zone defaults and billing rules</p></div>
        <div className="flex items-center gap-2">
          {dirtyFields.length > 0 && (
            <button onClick={() => setResetOpen(true)} title="Discard unsaved changes" className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors"><RotateCcw className="w-4 h-4" /> Discard</button>
          )}
          <button onClick={save} title="Save configuration" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save{dirtyFields.length > 0 ? ` (${dirtyFields.length})` : ""}</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {settings.map(g=>(
          <div key={g.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">{g.group}</p></div>
            <div className="p-4 space-y-3">
              {g.fields.map(f=>(
                <div key={f.label}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  <input
                    value={values[f.label]}
                    onChange={(e) => {
                      const next = e.target.value
                      setValues((prev) => ({ ...prev, [f.label]: next }))
                      setErrors((prev) => { const n = { ...prev }; delete n[f.label]; return n })
                    }}
                    className={cn("w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2", errors[f.label] ? "border-danger focus:ring-danger/30" : "border-border focus:ring-brand/30")}
                  />
                  {errors[f.label] && <p className="mt-1 text-xs text-danger">{errors[f.label]}</p>}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Discard unsaved changes?"
        message={`${dirtyFields.length} field${dirtyFields.length > 1 ? "s" : ""} will revert to the last saved configuration.`}
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={reset}
      />
    </div>
  )
}
