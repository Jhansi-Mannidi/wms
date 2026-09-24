"use client"

import { useState } from "react"
import { Inbox, Plus, Search, FileText, Clock, CheckCircle2, AlertTriangle, Truck, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/wms/empty-state"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, TextArea, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

const tabs = ["All ASNs", "Draft", "Submitted", "Received", "Exception"]

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type ASN = {
  id: string; po: string; supplier: string; lines: number; cartons: number; cbm: number
  status: string; submitted: string; expected: string; received: string; remarks: string
}

const initialAsns: ASN[] = [
  { id: "ASN-2245", po: "PO-8812", supplier: "Cipla Ltd", lines: 6, cartons: 240, cbm: 4.8, status: "Received", submitted: "Jul 18", expected: "Jul 19", received: "Jul 19", remarks: "" },
  { id: "ASN-2244", po: "PO-8809", supplier: "Sun Pharma", lines: 4, cartons: 180, cbm: 3.2, status: "In Transit", submitted: "Jul 19", expected: "Jul 20", received: "-", remarks: "" },
  { id: "ASN-2243", po: "PO-8801", supplier: "Dr Reddy's", lines: 8, cartons: 320, cbm: 6.4, status: "Submitted", submitted: "Jul 19", expected: "Jul 21", received: "-", remarks: "" },
  { id: "ASN-2240", po: "PO-8790", supplier: "Cipla Ltd", lines: 3, cartons: 96, cbm: 1.9, status: "Exception", submitted: "Jul 17", expected: "Jul 18", received: "Jul 19", remarks: "Short receipt — 4 cartons damaged in transit" },
  { id: "ASN-2238", po: "PO-8785", supplier: "Mankind Pharma", lines: 5, cartons: 200, cbm: 4.0, status: "Received", submitted: "Jul 16", expected: "Jul 17", received: "Jul 17", remarks: "" },
  { id: "ASN-2231", po: "PO-8770", supplier: "Abbott India", lines: 7, cartons: 280, cbm: 5.6, status: "Received", submitted: "Jul 14", expected: "Jul 15", received: "Jul 15", remarks: "" },
  { id: "ASN-2229", po: "PO-8766", supplier: "Lupin Ltd", lines: 5, cartons: 210, cbm: 4.2, status: "In Transit", submitted: "Jul 18", expected: "Jul 21", received: "-", remarks: "" },
  { id: "ASN-2226", po: "PO-8761", supplier: "Torrent Pharma", lines: 9, cartons: 360, cbm: 7.2, status: "Submitted", submitted: "Jul 18", expected: "Jul 22", received: "-", remarks: "" },
  { id: "ASN-2224", po: "PO-8757", supplier: "Zydus Lifesciences", lines: 4, cartons: 160, cbm: 3.1, status: "Received", submitted: "Jul 13", expected: "Jul 14", received: "Jul 14", remarks: "" },
  { id: "ASN-2221", po: "PO-8752", supplier: "Alkem Labs", lines: 6, cartons: 250, cbm: 5.0, status: "In Transit", submitted: "Jul 17", expected: "Jul 20", received: "-", remarks: "" },
  { id: "ASN-2218", po: "PO-8748", supplier: "Glenmark Pharma", lines: 3, cartons: 120, cbm: 2.4, status: "Exception", submitted: "Jul 15", expected: "Jul 16", received: "Jul 17", remarks: "Temperature excursion logged on 2 cold-chain cartons" },
  { id: "ASN-2215", po: "PO-8743", supplier: "Aurobindo Pharma", lines: 7, cartons: 290, cbm: 5.8, status: "Received", submitted: "Jul 12", expected: "Jul 13", received: "Jul 13", remarks: "" },
  { id: "ASN-2212", po: "PO-8739", supplier: "Hetero Drugs", lines: 5, cartons: 195, cbm: 3.9, status: "Draft", submitted: "-", expected: "Jul 24", received: "-", remarks: "Awaiting supplier packing list" },
  { id: "ASN-2209", po: "PO-8734", supplier: "Intas Pharma", lines: 8, cartons: 315, cbm: 6.3, status: "Received", submitted: "Jul 11", expected: "Jul 12", received: "Jul 12", remarks: "" },
  { id: "ASN-2206", po: "PO-8730", supplier: "Cipla Ltd", lines: 4, cartons: 175, cbm: 3.5, status: "Submitted", submitted: "Jul 16", expected: "Jul 23", received: "-", remarks: "" },
  { id: "ASN-2203", po: "PO-8725", supplier: "Sun Pharma", lines: 6, cartons: 245, cbm: 4.9, status: "Received", submitted: "Jul 10", expected: "Jul 11", received: "Jul 11", remarks: "" },
  { id: "ASN-2200", po: "PO-8721", supplier: "Dr Reddy's", lines: 10, cartons: 400, cbm: 8.1, status: "Received", submitted: "Jul 9", expected: "Jul 10", received: "Jul 10", remarks: "" },
  { id: "ASN-2197", po: "PO-8716", supplier: "Mankind Pharma", lines: 3, cartons: 110, cbm: 2.2, status: "Draft", submitted: "-", expected: "Jul 25", received: "-", remarks: "Cold chain lane to be confirmed" },
  { id: "ASN-2194", po: "PO-8712", supplier: "Abbott India", lines: 5, cartons: 205, cbm: 4.1, status: "Received", submitted: "Jul 8", expected: "Jul 9", received: "Jul 9", remarks: "" },
  { id: "ASN-2191", po: "PO-8707", supplier: "Lupin Ltd", lines: 7, cartons: 280, cbm: 5.6, status: "In Transit", submitted: "Jul 17", expected: "Jul 20", received: "-", remarks: "" },
  { id: "ASN-2188", po: "PO-8703", supplier: "Torrent Pharma", lines: 4, cartons: 150, cbm: 3.0, status: "Received", submitted: "Jul 6", expected: "Jul 7", received: "Jul 7", remarks: "" },
  { id: "ASN-2185", po: "PO-8698", supplier: "Zydus Lifesciences", lines: 6, cartons: 235, cbm: 4.7, status: "Exception", submitted: "Jul 4", expected: "Jul 5", received: "Jul 6", remarks: "Batch numbers mismatched against PO — 1 line held for QC" },
  { id: "ASN-2182", po: "PO-8694", supplier: "Alkem Labs", lines: 5, cartons: 190, cbm: 3.8, status: "Received", submitted: "Jul 3", expected: "Jul 4", received: "Jul 4", remarks: "" },
  { id: "ASN-2179", po: "PO-8689", supplier: "Glenmark Pharma", lines: 8, cartons: 330, cbm: 6.6, status: "Received", submitted: "Jul 1", expected: "Jul 2", received: "Jul 2", remarks: "" },
  { id: "ASN-2176", po: "PO-8685", supplier: "Aurobindo Pharma", lines: 4, cartons: 165, cbm: 3.3, status: "Draft", submitted: "-", expected: "Jul 26", received: "-", remarks: "" },
  { id: "ASN-2173", po: "PO-8680", supplier: "Hetero Drugs", lines: 6, cartons: 260, cbm: 5.2, status: "Submitted", submitted: "Jul 15", expected: "Jul 22", received: "-", remarks: "Consolidated with PO-8681" },
  { id: "ASN-2170", po: "PO-8676", supplier: "Intas Pharma", lines: 5, cartons: 220, cbm: 4.4, status: "Received", submitted: "Jun 28", expected: "Jun 29", received: "Jun 29", remarks: "" },
  { id: "ASN-2167", po: "PO-8671", supplier: "Cipla Ltd", lines: 9, cartons: 355, cbm: 7.1, status: "Received", submitted: "Jun 26", expected: "Jun 27", received: "Jun 27", remarks: "" },
  { id: "ASN-2164", po: "PO-8667", supplier: "Sun Pharma", lines: 4, cartons: 145, cbm: 2.9, status: "Draft", submitted: "-", expected: "Jul 28", received: "-", remarks: "Quarterly restock — pending PO confirmation" },
  { id: "ASN-2161", po: "PO-8663", supplier: "Dr Reddy's", lines: 6, cartons: 240, cbm: 4.8, status: "Submitted", submitted: "Jul 14", expected: "Jul 23", received: "-", remarks: "" },
]

const statusStyle: Record<string, string> = {
  Received: "bg-success/15 text-success",
  "In Transit": "bg-brand/15 text-brand",
  Submitted: "bg-blue-400/15 text-blue-400",
  Exception: "bg-danger/15 text-danger",
  Draft: "bg-muted text-muted-foreground",
}

const statusIcon: Record<string, React.ReactNode> = {
  Received: <CheckCircle2 className="w-3 h-3" />,
  "In Transit": <Truck className="w-3 h-3" />,
  Submitted: <Clock className="w-3 h-3" />,
  Exception: <AlertTriangle className="w-3 h-3" />,
  Draft: <FileText className="w-3 h-3" />,
}

const emptyForm = { po: "", supplier: "", expected: "", cartons: "", cbm: "", lines: "", remarks: "" }

function today() {
  return new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })
}

export default function PortalASNPage() {
  const [asns, setAsns] = useState<ASN[]>(initialAsns)
  const [tab, setTab] = useState("All ASNs")
  const [search, setSearch] = useState("")
  const [createOpen, setCreateOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [detail, setDetail] = useState<ASN | null>(null)
  const [cancelTarget, setCancelTarget] = useState<ASN | null>(null)

  const filtered = asns.filter(a => {
    const matchTab = tab === "All ASNs" || a.status === tab
    const matchSearch = !search || a.id.toLowerCase().includes(search.toLowerCase()) || a.supplier.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  function set(key: keyof typeof emptyForm, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.po.trim()) e.po = "Purchase order number is required"
    if (!form.supplier.trim()) e.supplier = "Supplier name is required"
    if (!form.expected.trim()) e.expected = "Expected arrival date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.expected.trim())) e.expected = "Use the format YYYY-MM-DD"
    if (!form.cartons.trim()) e.cartons = "Carton count is required"
    else if (!/^\d+$/.test(form.cartons.trim()) || Number(form.cartons) < 1) e.cartons = "Enter a positive whole number"
    if (!form.cbm.trim()) e.cbm = "Total CBM is required"
    else if (!/^\d+(\.\d+)?$/.test(form.cbm.trim()) || Number(form.cbm) <= 0) e.cbm = "Enter a positive number"
    if (!form.lines.trim()) e.lines = "Line item count is required"
    else if (!/^\d+$/.test(form.lines.trim()) || Number(form.lines) < 1) e.lines = "Enter a positive whole number"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function nextId() {
    const max = asns.reduce((m, a) => Math.max(m, Number(a.id.replace("ASN-", "")) || 0), 2245)
    return `ASN-${max + 1}`
  }

  function submitAsn(status: "Draft" | "Submitted") {
    // Drafts only need a PO reference; a real submission is fully validated.
    if (status === "Draft") {
      if (!form.po.trim()) { setErrors({ po: "Add at least a PO reference to save a draft" }); return }
    } else if (!validate()) return

    const expectedLabel = form.expected.trim()
      ? new Date(form.expected.trim()).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
      : "-"

    const next: ASN = {
      id: nextId(),
      po: form.po.trim().toUpperCase(),
      supplier: form.supplier.trim() || "-",
      lines: Number(form.lines) || 0,
      cartons: Number(form.cartons) || 0,
      cbm: Number(form.cbm) || 0,
      status,
      submitted: status === "Submitted" ? today() : "-",
      expected: expectedLabel === "Invalid Date" ? form.expected.trim() : expectedLabel,
      received: "-",
      remarks: form.remarks.trim(),
    }
    setAsns(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    if (status === "Draft") {
      notify.info("Draft saved", `${next.id} saved as a draft — submit it when the shipment is ready.`)
      setTab("Draft")
    } else {
      notify.success("ASN submitted", `${next.id} for ${next.supplier} — ${next.cartons} cartons expected ${next.expected}.`)
      setTab("Submitted")
    }
  }

  function submitDraft(a: ASN) {
    setAsns(prev => prev.map(x => x.id === a.id ? { ...x, status: "Submitted", submitted: today() } : x))
    setDetail(null)
    notify.success("ASN submitted", `${a.id} has been sent to the VoltusFreight inbound team.`)
  }

  function cancelAsn(a: ASN) {
    setAsns(prev => prev.filter(x => x.id !== a.id))
    setDetail(null)
    notify.warning("ASN withdrawn", `${a.id} has been removed from your inbound queue.`)
  }

  const fields = [
    { key: "po" as const, label: "Purchase Order #", placeholder: "e.g. PO-8820", required: true },
    { key: "supplier" as const, label: "Supplier Name", placeholder: "e.g. Cipla Ltd", required: true },
    { key: "expected" as const, label: "Expected Arrival Date", placeholder: "YYYY-MM-DD", required: true },
    { key: "cartons" as const, label: "No. of Cartons", placeholder: "e.g. 120", required: true },
    { key: "cbm" as const, label: "Total CBM", placeholder: "e.g. 2.4", required: true },
    { key: "lines" as const, label: "No. of Line Items", placeholder: "e.g. 5", required: true },
  ]

  return (
    <div className="p-6 space-y-6 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Inbound ASNs</h1>
          <p className="text-sm text-muted-foreground">Submit and track your Advance Shipment Notices</p>
        </div>
        <button type="button" onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New ASN
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total ASNs", value: asns.length, color: "text-brand", bg: "bg-brand/15" },
          { label: "In Transit", value: asns.filter(a => a.status === "In Transit").length, color: "text-brand", bg: "bg-brand/15" },
          { label: "Received", value: asns.filter(a => a.status === "Received").length, color: "text-success", bg: "bg-success/15" },
          { label: "Exceptions", value: asns.filter(a => a.status === "Exception").length, color: "text-danger", bg: "bg-danger/15" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
              <Inbox className={cn("w-4 h-4", s.color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="Submit New ASN"
        description="Advance Shipment Notice for inbound cargo"
        size="lg"
        footer={
          <>
            <button type="button" onClick={() => setCreateOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Cancel</button>
            <button type="button" onClick={() => submitAsn("Draft")} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted">Save Draft</button>
            <button type="button" onClick={() => submitAsn("Submitted")} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">Submit ASN</button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {fields.map(f => (
            <Field key={f.key} label={f.label} required={f.required} error={errors[f.key]}>
              <TextInput value={form[f.key]} invalid={!!errors[f.key]} onChange={e => set(f.key, e.target.value)} placeholder={f.placeholder} />
            </Field>
          ))}
        </div>
        <div className="mt-4">
          <Field label="Remarks / Special Instructions">
            <TextArea rows={2} value={form.remarks} onChange={e => set("remarks", e.target.value)} placeholder="Any special handling, cold chain requirements, etc." />
          </Field>
        </div>
      </Modal>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-0.5 rounded-lg bg-muted/40 border border-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === t ? "bg-brand text-white" : "text-muted-foreground hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ASN or supplier..." className="bg-transparent outline-none text-xs w-40 placeholder:text-muted-foreground text-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">ASN ID</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">PO Reference</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Supplier</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">Lines</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground hidden md:table-cell">Cartons</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Expected</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden lg:table-cell">Received</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setDetail(a)} className="hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-brand">{a.id}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.po}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{a.supplier}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{a.lines}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden md:table-cell">{a.cartons}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{a.expected}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{a.received}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[a.status])}>
                      {statusIcon[a.status]} {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); setDetail(a) }}
                      title="View ASN details"
                      className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    {tab === "Draft" ? (
                      <EmptyState
                        icon={FileText}
                        title="No draft ASNs"
                        description="Start one with “New ASN” and choose Save Draft."
                        action={{ label: "New ASN", icon: Plus, onClick: () => { setForm(emptyForm); setErrors({}); setCreateOpen(true) } }}
                      />
                    ) : (
                      <EmptyState
                        icon={Search}
                        title="No ASNs match your filters"
                        description="Try a different search term or switch tabs."
                        action={{ label: "Clear Filters", onClick: () => { setSearch(""); setTab("All ASNs") } }}
                      />
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-border text-xs text-muted-foreground">
          Showing {filtered.length} of {asns.length} ASNs
        </div>
      </div>

      {/* ASN detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Advance shipment notice detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            {detail?.status === "Draft" && (
              <button onClick={() => detail && submitDraft(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Submit ASN
              </button>
            )}
            {detail && (detail.status === "Draft" || detail.status === "Submitted") && (
              <button onClick={() => setCancelTarget(detail)} className="rounded-lg bg-danger px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-danger/90">
                Withdraw
              </button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="ASN ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="PO Reference" value={<span className="font-mono">{detail.po}</span>} />
            <DetailRow label="Supplier" value={detail.supplier} />
            <DetailRow label="Line Items" value={detail.lines} />
            <DetailRow label="Cartons" value={detail.cartons} />
            <DetailRow label="Total CBM" value={`${detail.cbm} m³`} />
            <DetailRow label="Submitted" value={detail.submitted} />
            <DetailRow label="Expected Arrival" value={detail.expected} />
            <DetailRow label="Received" value={detail.received} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
            <DetailRow label="Remarks" value={detail.remarks || "—"} />
          </div>
        )}
      </Drawer>

      {/* Withdraw confirmation */}
      <ConfirmDialog
        open={!!cancelTarget}
        onOpenChange={(o) => !o && setCancelTarget(null)}
        title="Withdraw this ASN?"
        message={`${cancelTarget?.id} for ${cancelTarget?.supplier} will be removed from your inbound queue. This cannot be undone.`}
        confirmLabel="Withdraw ASN"
        cancelLabel="Keep It"
        onConfirm={() => cancelTarget && cancelAsn(cancelTarget)}
      />
    </div>
  )
}
