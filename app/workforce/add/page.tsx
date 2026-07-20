"use client"
import { useState } from "react"
import { UserPlus } from "lucide-react"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { appendDemoEntry } from "@/lib/demo-store"

// `type` (not `interface`) so the row stays a plain Record-compatible shape
type WorkerForm = {
  firstName: string; lastName: string; employeeId: string; phone: string
  role: string; shift: string; zone: string
}

const emptyForm: WorkerForm = {
  firstName: "", lastName: "", employeeId: "", phone: "",
  role: "", shift: "", zone: "",
}

const TEXT_FIELDS = [
  { key: "firstName", label: "First Name", placeholder: "e.g. Ravi" },
  { key: "lastName", label: "Last Name", placeholder: "e.g. Kumar" },
  { key: "employeeId", label: "Employee ID", placeholder: "e.g. EMP-010" },
  { key: "phone", label: "Phone", placeholder: "+91 9999999999" },
] as const

const SELECT_FIELDS = [
  { key: "role", label: "Role", options: ["Picker", "Packer", "Forklift Operator", "QC Inspector", "Supervisor", "Driver"] },
  { key: "shift", label: "Shift", options: ["Morning (06:00–14:00)", "Afternoon (14:00–22:00)", "Night (22:00–06:00)"] },
  { key: "zone", label: "Zone", options: ["Zone A", "Zone B", "Zone C", "Dock", "QC Bay", "All Zones"] },
] as const

export default function AddWorkerPage() {
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState<WorkerForm>(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [lastAdded, setLastAdded] = useState<WorkerForm | null>(null)

  const dirty = (Object.keys(emptyForm) as (keyof WorkerForm)[]).some((k) => form[k].trim() !== "")

  function set(key: keyof WorkerForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    setErrors((e) => {
      if (!e[key]) return e
      const next = { ...e }
      delete next[key]
      return next
    })
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.firstName.trim()) e.firstName = "First name is required"
    else if (form.firstName.trim().length < 2) e.firstName = "Enter at least 2 characters"

    if (!form.lastName.trim()) e.lastName = "Last name is required"
    else if (form.lastName.trim().length < 2) e.lastName = "Enter at least 2 characters"

    if (!form.employeeId.trim()) e.employeeId = "Employee ID is required"
    else if (!/^EMP-\d{3,}$/i.test(form.employeeId.trim())) e.employeeId = "Use the format EMP-010"

    if (!form.phone.trim()) e.phone = "Phone is required"
    else if (form.phone.replace(/\D/g, "").length < 10) e.phone = "Enter a valid 10-digit phone number"

    if (!form.role) e.role = "Select a role"
    if (!form.shift) e.shift = "Select a shift"
    if (!form.zone) e.zone = "Select a zone"

    setErrors(e)
    return Object.keys(e).length === 0
  }

  function addWorker() {
    if (!validate()) {
      notify.error("Check the form", "Some required fields need your attention.")
      return
    }
    const saved: WorkerForm = {
      ...form,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      employeeId: form.employeeId.trim().toUpperCase(),
      phone: form.phone.trim(),
    }
    const shiftLabel = saved.shift.includes("Morning") ? "Morning"
      : saved.shift.includes("Afternoon") ? "Afternoon"
      : saved.shift.includes("Night") ? "Night"
      : saved.shift
    appendDemoEntry("workers", {
      id: saved.employeeId,
      name: `${saved.firstName} ${saved.lastName}`,
      role: saved.role,
      shift: shiftLabel,
      zone: saved.zone,
      tasksToday: 0,
      tasksCompleted: 0,
      status: "Active",
      attendance: "Present",
    })
    setLastAdded(saved)
    setForm(emptyForm)
    setErrors({})
    setSubmitted(true)
    notify.success("Worker added", `${saved.firstName} ${saved.lastName} (${saved.employeeId}) registered as ${saved.role}.`)
  }

  function resetForm() {
    setForm(emptyForm)
    setErrors({})
    notify.info("Form cleared", "All entered details were discarded.")
  }

  function handleCancel() {
    if (dirty) setConfirmCancel(true)
    else notify.info("Nothing to clear", "The form is already empty.")
  }

  if (submitted) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="w-14 h-14 rounded-full bg-success/10 flex items-center justify-center">
        <UserPlus className="w-7 h-7 text-success" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">Worker Added Successfully</h2>
      <p className="text-sm text-muted-foreground">
        {lastAdded
          ? `${lastAdded.firstName} ${lastAdded.lastName} (${lastAdded.employeeId}) has been registered as ${lastAdded.role} on the ${lastAdded.shift} shift in ${lastAdded.zone}.`
          : "The new worker has been registered in the system."}
      </p>
      <button onClick={() => { setSubmitted(false); setForm(emptyForm); setErrors({}) }} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Add Another</button>
    </div>
  )

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground">Add Worker</h1>
        <p className="text-sm text-muted-foreground">Register a new warehouse employee</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 w-full space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {TEXT_FIELDS.map(f => (
            <Field key={f.key} label={f.label} required error={errors[f.key]}>
              <TextInput
                value={form[f.key]}
                invalid={!!errors[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
                inputMode={f.key === "phone" ? "tel" : undefined}
              />
            </Field>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SELECT_FIELDS.map(f => (
          <Field key={f.key} label={f.label} required error={errors[f.key]}>
            <Select
              value={form[f.key]}
              invalid={!!errors[f.key]}
              onChange={e => set(f.key, e.target.value)}
              options={f.options}
              placeholder={`Select ${f.label}`}
            />
          </Field>
        ))}
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-border">
          <button onClick={handleCancel} className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={addWorker} className="px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Add Worker</button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onOpenChange={setConfirmCancel}
        title="Discard this worker?"
        message="The details you have entered will be cleared. This cannot be undone."
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={resetForm}
      />
    </div>
  )
}
