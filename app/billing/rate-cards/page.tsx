"use client"
import { useState } from "react"
import { Plus, Edit2, Eye } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

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
  { client: "Salt Works", storagePerPallet: "₹320/day", inboundHandling: "₹8/unit", outboundHandling: "₹10/unit", vasPacking: "₹4/unit", minCharge: "₹2,000", effectiveFrom: "2024-02-15" },
  { client: "Fresh Farms", storagePerPallet: "₹610/day", inboundHandling: "₹18/unit", outboundHandling: "₹21/unit", vasPacking: "₹11/unit", minCharge: "₹8,000", effectiveFrom: "2024-01-01" },
  { client: "Tropical Co", storagePerPallet: "₹470/day", inboundHandling: "₹13/unit", outboundHandling: "₹16/unit", vasPacking: "₹8/unit", minCharge: "₹5,500", effectiveFrom: "2024-04-01" },
  { client: "Apex Pharma", storagePerPallet: "₹720/day", inboundHandling: "₹22/unit", outboundHandling: "₹26/unit", vasPacking: "₹14/unit", minCharge: "₹12,000", effectiveFrom: "2024-01-01" },
  { client: "Sunrise Beverages", storagePerPallet: "₹390/day", inboundHandling: "₹10/unit", outboundHandling: "₹13/unit", vasPacking: "₹6/unit", minCharge: "₹3,500", effectiveFrom: "2024-03-15" },
  { client: "Deccan Spices", storagePerPallet: "₹410/day", inboundHandling: "₹11/unit", outboundHandling: "₹14/unit", vasPacking: "₹7/unit", minCharge: "₹4,200", effectiveFrom: "2024-02-01" },
  { client: "Nova Textiles", storagePerPallet: "₹300/day", inboundHandling: "₹7/unit", outboundHandling: "₹9/unit", vasPacking: "₹5/unit", minCharge: "₹2,200", effectiveFrom: "2024-04-15" },
  { client: "Konkan Seafoods", storagePerPallet: "₹680/day", inboundHandling: "₹20/unit", outboundHandling: "₹24/unit", vasPacking: "₹12/unit", minCharge: "₹9,500", effectiveFrom: "2024-01-15" },
  { client: "Bharat Grains", storagePerPallet: "₹360/day", inboundHandling: "₹9/unit", outboundHandling: "₹12/unit", vasPacking: "₹5/unit", minCharge: "₹2,800", effectiveFrom: "2024-05-01" },
  { client: "Orchid Cosmetics", storagePerPallet: "₹540/day", inboundHandling: "₹16/unit", outboundHandling: "₹19/unit", vasPacking: "₹10/unit", minCharge: "₹6,500", effectiveFrom: "2024-03-01" },
  { client: "Nilgiri Tea Estates", storagePerPallet: "₹430/day", inboundHandling: "₹12/unit", outboundHandling: "₹15/unit", vasPacking: "₹7/unit", minCharge: "₹4,500", effectiveFrom: "2024-02-15" },
  { client: "Coastal Chemicals", storagePerPallet: "₹590/day", inboundHandling: "₹17/unit", outboundHandling: "₹20/unit", vasPacking: "₹9/unit", minCharge: "₹7,200", effectiveFrom: "2024-01-01" },
  { client: "Vindhya Paper Mills", storagePerPallet: "₹280/day", inboundHandling: "₹6/unit", outboundHandling: "₹8/unit", vasPacking: "₹4/unit", minCharge: "₹1,800", effectiveFrom: "2024-05-15" },
  { client: "Sagar Dairy", storagePerPallet: "₹650/day", inboundHandling: "₹19/unit", outboundHandling: "₹23/unit", vasPacking: "₹11/unit", minCharge: "₹8,800", effectiveFrom: "2024-04-01" },
  { client: "Rajdhani Confectionery", storagePerPallet: "₹370/day", inboundHandling: "₹10/unit", outboundHandling: "₹12/unit", vasPacking: "₹6/unit", minCharge: "₹3,200", effectiveFrom: "2024-06-01" },
  { client: "Meridian Electronics", storagePerPallet: "₹510/day", inboundHandling: "₹15/unit", outboundHandling: "₹18/unit", vasPacking: "₹9/unit", minCharge: "₹6,000", effectiveFrom: "2024-03-15" },
  { client: "Ganga Edible Oils", storagePerPallet: "₹400/day", inboundHandling: "₹11/unit", outboundHandling: "₹13/unit", vasPacking: "₹6/unit", minCharge: "₹3,800", effectiveFrom: "2024-05-01" },
  { client: "Ashoka Agro Seeds", storagePerPallet: "₹340/day", inboundHandling: "₹8/unit", outboundHandling: "₹11/unit", vasPacking: "₹5/unit", minCharge: "₹2,600", effectiveFrom: "2024-06-15" },
  { client: "Zenith Home Care", storagePerPallet: "₹460/day", inboundHandling: "₹13/unit", outboundHandling: "₹16/unit", vasPacking: "₹8/unit", minCharge: "₹5,200", effectiveFrom: "2024-02-01" },
  { client: "Malabar Coffee Works", storagePerPallet: "₹440/day", inboundHandling: "₹12/unit", outboundHandling: "₹15/unit", vasPacking: "₹7/unit", minCharge: "₹4,800", effectiveFrom: "2024-04-15" },
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
                  <RowActions
                    items={[
                      { label: "View rate card", icon: <Eye />, onSelect: () => setDetail(r) },
                      { label: "Edit rate card", icon: <Edit2 />, onSelect: () => openEdit(r) },
                    ]}
                  />
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
