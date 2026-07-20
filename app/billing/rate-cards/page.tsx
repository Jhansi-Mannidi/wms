"use client"
import { useState } from "react"
import { Plus, Edit2, Eye } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type RateCard = {
  client: string; storagePerPallet: string; inboundHandling: string
  outboundHandling: string; vasPacking: string; minCharge: string; effectiveFrom: string
}

const initialRates: RateCard[] = [
  { client: "Acme Foods", storagePerPallet: "₹450/day", inboundHandling: "₹12/unit", outboundHandling: "₹15/unit", vasPacking: "₹8/unit", minCharge: "₹5,000", effectiveFrom: "2024-01-01" },
  { client: "Global Oils", storagePerPallet: "₹380/day", inboundHandling: "₹10/unit", outboundHandling: "₹12/unit", vasPacking: "₹6/unit", minCharge: "₹3,000", effectiveFrom: "2024-02-01" },
  { client: "Agro Corp", storagePerPallet: "₹420/day", inboundHandling: "₹11/unit", outboundHandling: "₹14/unit", vasPacking: "₹7/unit", minCharge: "₹4,000", effectiveFrom: "2024-01-15" },
  { client: "Sweet Mills", storagePerPallet: "₹350/day", inboundHandling: "₹9/unit", outboundHandling: "₹11/unit", vasPacking: "₹5/unit", minCharge: "₹2,500", effectiveFrom: "2024-03-01" },
]

const emptyForm = {
  client: "", storagePerPallet: "", inboundHandling: "",
  outboundHandling: "", vasPacking: "", minCharge: "", effectiveFrom: "",
}

export default function RateCardsPage() {
  const [rates, setRates] = useState<RateCard[]>(initialRates)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<RateCard | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<RateCard | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RateCard | null>(null)

  function openNew() {
    setEditing(null); setForm(emptyForm); setErrors({}); setModalOpen(true)
  }

  function openEdit(r: RateCard) {
    setEditing(r)
    setForm({ ...r })
    setErrors({})
    setDetail(null)
    setModalOpen(true)
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client.trim()) e.client = "Client name is required"
    else if (!editing && rates.some(r => r.client.toLowerCase() === form.client.trim().toLowerCase())) e.client = "This client already has a rate card"
    if (!form.storagePerPallet.trim()) e.storagePerPallet = "Storage rate is required"
    if (!form.inboundHandling.trim()) e.inboundHandling = "Inbound handling rate is required"
    if (!form.outboundHandling.trim()) e.outboundHandling = "Outbound handling rate is required"
    if (!form.vasPacking.trim()) e.vasPacking = "VAS packing rate is required"
    if (!form.minCharge.trim()) e.minCharge = "Minimum charge is required"
    if (!form.effectiveFrom.trim()) e.effectiveFrom = "Effective date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.effectiveFrom)) e.effectiveFrom = "Use format YYYY-MM-DD"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function submit() {
    if (!validate()) return
    const row: RateCard = {
      client: form.client.trim(),
      storagePerPallet: form.storagePerPallet.trim(),
      inboundHandling: form.inboundHandling.trim(),
      outboundHandling: form.outboundHandling.trim(),
      vasPacking: form.vasPacking.trim(),
      minCharge: form.minCharge.trim(),
      effectiveFrom: form.effectiveFrom.trim(),
    }
    if (editing) {
      setRates(prev => prev.map(r => r.client === editing.client ? row : r))
      notify.success("Rate card updated", `${row.client} rates effective ${row.effectiveFrom}.`)
    } else {
      setRates(prev => [row, ...prev])
      notify.success("Rate card added", `${row.client} onboarded with storage at ${row.storagePerPallet}.`)
    }
    setModalOpen(false); setEditing(null); setForm(emptyForm); setErrors({})
  }

  function remove(r: RateCard) {
    setRates(prev => prev.filter(x => x.client !== r.client))
    setDetail(null)
    notify.warning("Rate card deleted", `${r.client} no longer has contracted rates.`)
  }

  return (
    <div className="w-full p-6 space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div><h1 className="text-2xl font-bold text-foreground">Rate Cards</h1><p className="text-sm text-muted-foreground mt-0.5">Billing rates configured for {rates.length} client{rates.length === 1 ? "" : "s"}</p></div>
        <button onClick={openNew} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Rate Card</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Client", "Storage/Pallet/Day", "Inbound Handling", "Outbound Handling", "VAS Packing", "Min Charge", "Effective From", ""].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rates.map(r => (
              <tr key={r.client} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-semibold text-foreground">{r.client}</td>
                <td className="px-4 py-3 text-foreground">{r.storagePerPallet}</td>
                <td className="px-4 py-3 text-foreground">{r.inboundHandling}</td>
                <td className="px-4 py-3 text-foreground">{r.outboundHandling}</td>
                <td className="px-4 py-3 text-foreground">{r.vasPacking}</td>
                <td className="px-4 py-3 text-foreground">{r.minCharge}</td>
                <td className="px-4 py-3 text-muted-foreground">{r.effectiveFrom}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetail(r)} title="View rate card" className="text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(r)} title="Edit rate card" className="text-muted-foreground hover:text-brand transition-colors"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {rates.length === 0 && (
              <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No rate cards configured yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={modalOpen}
        onOpenChange={(o) => { setModalOpen(o); if (!o) { setEditing(null); setForm(emptyForm); setErrors({}) } }}
        title={editing ? "Edit Rate Card" : "Add Rate Card"}
        description={editing ? `Update contracted rates for ${editing.client}` : "Define contracted rates for a client"}
        footer={
          <>
            {editing && (
              <button
                onClick={() => { const r = editing; setModalOpen(false); setDeleteTarget(r) }}
                className="mr-auto rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10"
              >
                Delete
              </button>
            )}
            <ModalActions onCancel={() => setModalOpen(false)} onSubmit={submit} submitLabel={editing ? "Save Rate Card" : "Add Rate Card"} />
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <TextInput value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="e.g. Fresh Farms" disabled={!!editing} />
          </Field>
          <Field label="Storage / Pallet / Day" required error={errors.storagePerPallet}>
            <TextInput value={form.storagePerPallet} invalid={!!errors.storagePerPallet} onChange={e => setForm({ ...form, storagePerPallet: e.target.value })} placeholder="e.g. ₹450/day" />
          </Field>
          <Field label="Inbound Handling" required error={errors.inboundHandling}>
            <TextInput value={form.inboundHandling} invalid={!!errors.inboundHandling} onChange={e => setForm({ ...form, inboundHandling: e.target.value })} placeholder="e.g. ₹12/unit" />
          </Field>
          <Field label="Outbound Handling" required error={errors.outboundHandling}>
            <TextInput value={form.outboundHandling} invalid={!!errors.outboundHandling} onChange={e => setForm({ ...form, outboundHandling: e.target.value })} placeholder="e.g. ₹15/unit" />
          </Field>
          <Field label="VAS Packing" required error={errors.vasPacking}>
            <TextInput value={form.vasPacking} invalid={!!errors.vasPacking} onChange={e => setForm({ ...form, vasPacking: e.target.value })} placeholder="e.g. ₹8/unit" />
          </Field>
          <Field label="Minimum Charge" required error={errors.minCharge}>
            <TextInput value={form.minCharge} invalid={!!errors.minCharge} onChange={e => setForm({ ...form, minCharge: e.target.value })} placeholder="e.g. ₹5,000" />
          </Field>
          <Field label="Effective From" required error={errors.effectiveFrom} hint="YYYY-MM-DD">
            <TextInput value={form.effectiveFrom} invalid={!!errors.effectiveFrom} onChange={e => setForm({ ...form, effectiveFrom: e.target.value })} placeholder="2024-08-01" />
          </Field>
        </div>
      </Modal>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.client ?? ""}
        description="Contracted rate card"
        footer={
          <>
            <button onClick={() => detail && setDeleteTarget(detail)} className="rounded-lg border border-danger/30 px-4 py-2 text-sm font-medium text-danger transition-colors hover:bg-danger/10">
              Delete
            </button>
            <button onClick={() => detail && openEdit(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
              Edit Rates
            </button>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Storage / Pallet / Day" value={detail.storagePerPallet} />
            <DetailRow label="Inbound Handling" value={detail.inboundHandling} />
            <DetailRow label="Outbound Handling" value={detail.outboundHandling} />
            <DetailRow label="VAS Packing" value={detail.vasPacking} />
            <DetailRow label="Minimum Charge" value={detail.minCharge} />
            <DetailRow label="Effective From" value={detail.effectiveFrom} />
          </div>
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete this rate card?"
        message={`${deleteTarget?.client} will have no contracted rates and invoices cannot be auto-generated. This cannot be undone.`}
        confirmLabel="Delete Rate Card"
        onConfirm={() => deleteTarget && remove(deleteTarget)}
      />
    </div>
  )
}
