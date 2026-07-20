"use client"
import { useState } from "react"
import { Save, RotateCcw, Settings2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type SettingGroup = { group: string; fields: { l: string; v: string }[] }

const settings: SettingGroup[] = [
  { group:"Warehouse Details", fields:[{l:"Warehouse Name",v:"Main Warehouse — CFS Zone A"},{l:"Location",v:"Hyderabad, IN"},{l:"Total Area (sq ft)",v:"42,000"},{l:"Operating Hours",v:"06:00 – 22:00"}]},
  { group:"GRN Settings", fields:[{l:"Default Putaway Strategy",v:"FEFO"},{l:"Auto-create bin location",v:"Enabled"},{l:"GRN Approval Required",v:"Yes"},{l:"Photo Capture on GRN",v:"Mandatory"}]},
  { group:"System Preferences", fields:[{l:"Default Currency",v:"INR"},{l:"Date Format",v:"DD-MM-YYYY"},{l:"Time Zone",v:"Asia/Kolkata (IST)"},{l:"Low Stock Alert Threshold (%)",v:"15"}]},
  { group:"Inventory Controls", fields:[{l:"Cycle Count Frequency (days)",v:"30"},{l:"Reorder Lead Time (days)",v:"7"},{l:"Max Stack Height (pallets)",v:"4"},{l:"Batch Expiry Warning (days)",v:"45"}]},
  { group:"Dispatch Settings", fields:[{l:"Dispatch Cut-off Time",v:"18:00"},{l:"Pick List Batch Size",v:"25"},{l:"Loading Bay Buffer (mins)",v:"20"},{l:"Dispatch Approval Level",v:"Supervisor"}]},
  { group:"Safety & Compliance", fields:[{l:"Fire Drill Interval (months)",v:"6"},{l:"Hazmat Handling Licence",v:"HZ-UP-2024-118"},{l:"Safety Officer",v:"Ravi Kumar"},{l:"Last Audit Date",v:"12-05-2026"}]},
]

// Choice lists for the per-group Configure modal — free-text fields fall back to a TextInput.
const CHOICES: Record<string, readonly string[]> = {
  "Default Putaway Strategy": ["FEFO", "FIFO", "LIFO", "Nearest Empty Bin"],
  "Auto-create bin location": ["Enabled", "Disabled"],
  "GRN Approval Required": ["Yes", "No"],
  "Photo Capture on GRN": ["Mandatory", "Optional", "Disabled"],
  "Default Currency": ["INR", "USD", "EUR", "AED"],
  "Date Format": ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"],
  "Time Zone": ["Asia/Kolkata (IST)", "Asia/Dubai (GST)", "UTC"],
}

const NUMERIC = ["Low Stock Alert Threshold (%)"]

// Flatten the seed data into a single label -> value map held in state.
const initialValues: Record<string, string> = Object.fromEntries(
  settings.flatMap((g) => g.fields.map((f) => [f.l, f.v])),
)

export default function WarehouseConfigPage() {
  const [saved, setSaved] = useState<Record<string, string>>(initialValues)
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [configureGroup, setConfigureGroup] = useState<SettingGroup | null>(null)
  const [groupDraft, setGroupDraft] = useState<Record<string, string>>({})
  const [groupErrors, setGroupErrors] = useState<Record<string, string>>({})
  const [resetOpen, setResetOpen] = useState(false)

  const dirtyKeys = Object.keys(values).filter((k) => values[k] !== saved[k])
  const isDirty = dirtyKeys.length > 0

  function validate(draft: Record<string, string>) {
    const e: Record<string, string> = {}
    for (const [label, value] of Object.entries(draft)) {
      if (!value.trim()) { e[label] = "This field cannot be empty"; continue }
      if (NUMERIC.includes(label)) {
        if (!/^\d+$/.test(value.trim())) e[label] = "Enter a whole number"
        else if (Number(value) < 1 || Number(value) > 100) e[label] = "Enter a percentage between 1 and 100"
      }
      if (label === "Operating Hours" && !/^\d{2}:\d{2}\s*–\s*\d{2}:\d{2}$/.test(value.trim())) {
        e[label] = "Use the format 06:00 – 22:00"
      }
    }
    return e
  }

  function saveAll() {
    const e = validate(values)
    setErrors(e)
    if (Object.keys(e).length) {
      notify.error("Configuration not saved", `${Object.keys(e).length} field${Object.keys(e).length > 1 ? "s" : ""} need attention.`)
      return
    }
    setSaved(values)
    notify.success("Configuration saved", isDirty ? `${dirtyKeys.length} setting${dirtyKeys.length > 1 ? "s" : ""} updated.` : "No changes to apply.")
  }

  function discardAll() {
    setValues(saved)
    setErrors({})
    notify.info("Changes discarded", "All fields reverted to the last saved configuration.")
  }

  function openGroupConfigure(g: SettingGroup) {
    setConfigureGroup(g)
    setGroupDraft(Object.fromEntries(g.fields.map((f) => [f.l, values[f.l]])))
    setGroupErrors({})
  }

  function saveGroup() {
    if (!configureGroup) return
    const e = validate(groupDraft)
    setGroupErrors(e)
    if (Object.keys(e).length) return
    setValues((prev) => ({ ...prev, ...groupDraft }))
    setSaved((prev) => ({ ...prev, ...groupDraft }))
    setErrors((prev) => {
      const next = { ...prev }
      for (const k of Object.keys(groupDraft)) delete next[k]
      return next
    })
    notify.success("Group saved", `${configureGroup.group} settings applied.`)
    setConfigureGroup(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Warehouse Configuration</h1>
          <p className="text-sm text-muted-foreground mt-1">Core settings, preferences and operational parameters</p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && (
            <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-medium">
              {dirtyKeys.length} unsaved change{dirtyKeys.length > 1 ? "s" : ""}
            </span>
          )}
          <button
            onClick={() => setResetOpen(true)}
            disabled={!isDirty}
            title="Discard unsaved changes"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <RotateCcw className="w-4 h-4" /> Discard
          </button>
          <button onClick={saveAll} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
            <Save className="w-4 h-4" /> Save
          </button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-5">
        {settings.map(g=>(
          <div key={g.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <p className="font-semibold text-sm text-foreground">{g.group}</p>
              <button onClick={() => openGroupConfigure(g)} title={`Configure ${g.group}`} className="flex items-center gap-1.5 text-xs text-brand hover:underline">
                <Settings2 className="w-3.5 h-3.5" /> Configure
              </button>
            </div>
            <div className="p-4 space-y-3">
              {g.fields.map(f=>(
                <div key={f.l}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.l}</label>
                  {CHOICES[f.l] ? (
                    <Select
                      value={values[f.l]}
                      invalid={!!errors[f.l]}
                      onChange={(e) => setValues({ ...values, [f.l]: e.target.value })}
                      options={CHOICES[f.l]}
                    />
                  ) : (
                    <input
                      value={values[f.l]}
                      onChange={(e) => setValues({ ...values, [f.l]: e.target.value })}
                      className={cn(
                        "w-full px-3 py-2 rounded-lg border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30",
                        errors[f.l] ? "border-danger" : "border-border",
                      )}
                    />
                  )}
                  {errors[f.l] && <p className="mt-1 text-xs text-danger">{errors[f.l]}</p>}
                  {!errors[f.l] && values[f.l] !== saved[f.l] && (
                    <p className="mt-1 text-xs text-amber-600">Unsaved — was “{saved[f.l]}”</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Per-group configure modal */}
      <Modal
        open={!!configureGroup}
        onOpenChange={(o) => !o && setConfigureGroup(null)}
        title={`Configure — ${configureGroup?.group ?? ""}`}
        description="Changes here are applied and saved immediately"
        footer={<ModalActions onCancel={() => setConfigureGroup(null)} onSubmit={saveGroup} submitLabel="Apply & Save" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {configureGroup?.fields.map((f) => (
            <Field key={f.l} label={f.l} required error={groupErrors[f.l]}>
              {CHOICES[f.l] ? (
                <Select
                  value={groupDraft[f.l] ?? ""}
                  invalid={!!groupErrors[f.l]}
                  onChange={(e) => setGroupDraft({ ...groupDraft, [f.l]: e.target.value })}
                  options={CHOICES[f.l]}
                />
              ) : (
                <TextInput
                  value={groupDraft[f.l] ?? ""}
                  invalid={!!groupErrors[f.l]}
                  onChange={(e) => setGroupDraft({ ...groupDraft, [f.l]: e.target.value })}
                  inputMode={NUMERIC.includes(f.l) ? "numeric" : undefined}
                />
              )}
            </Field>
          ))}
        </div>
      </Modal>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Discard unsaved changes?"
        message={`${dirtyKeys.length} modified setting${dirtyKeys.length > 1 ? "s" : ""} will revert to the last saved configuration.`}
        confirmLabel="Discard Changes"
        cancelLabel="Keep Editing"
        onConfirm={discardAll}
      />
    </div>
  )
}
