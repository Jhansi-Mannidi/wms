"use client"

import { useState } from "react"
import { Inbox, Plus, Search, FileText, Clock, CheckCircle2, AlertTriangle, Truck, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { DetailRow } from "@/components/ui/form"
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
  const [showForm, setShowForm] = useState(false)
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
    setShowForm(false)
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
    <div className="p-4 sm:p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Inbound ASNs</h1>
          <p className="text-sm text-muted-foreground">Submit and track your Advance Shipment Notices</p>
        </div>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" /> New ASN
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total ASNs", value: asns.length, color: "text-[#1E3A5F] dark:text-brand", bg: "bg-[#1E3A5F]/10 dark:bg-brand/15" },
          { label: "In Transit", value: asns.filter(a => a.status === "In Transit").length, color: "text-brand", bg: "bg-brand/15" },
          { label: "Received", value: asns.filter(a => a.status === "Received").length, color: "text-success", bg: "bg-success/15" },
          { label: "Exceptions", value: asns.filter(a => a.status === "Exception").length, color: "text-danger", bg: "bg-danger/15" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg)}>
              <Inbox className={cn("w-4 h-4", s.color)} />
            </div>
            <div>
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* New ASN Form */}
      {showForm && (
        <div className="rounded-2xl border border-[#1E3A5F]/30 dark:border-brand/30 bg-white dark:bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Submit New ASN</h2>
            <button onClick={() => { setShowForm(false); setForm(emptyForm); setErrors({}) }} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(f => (
              <div key={f.key}>
                <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
                  {f.label}{f.required && <span className="ml-0.5 text-danger">*</span>}
                </label>
                <input
                  value={form[f.key]}
                  onChange={e => set(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className={cn(
                    "w-full px-3 py-2 rounded-lg border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none transition-colors",
                    errors[f.key]
                      ? "border-danger focus:border-danger"
                      : "border-[#E4E9F0] dark:border-border focus:border-[#1E3A5F] dark:focus:border-brand",
                  )}
                />
                {errors[f.key] && <p className="mt-1 text-[10px] text-danger">{errors[f.key]}</p>}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Remarks / Special Instructions</label>
            <textarea
              rows={2}
              value={form.remarks}
              onChange={e => set("remarks", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/40 text-xs text-[#1E3A5F] dark:text-foreground outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors resize-none"
              placeholder="Any special handling, cold chain requirements, etc."
            />
          </div>
          <div className="mt-4 flex gap-2 justify-end">
            <button onClick={() => submitAsn("Draft")} className="px-4 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Save Draft</button>
            <button onClick={() => submitAsn("Submitted")} className="px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">Submit ASN</button>
          </div>
        </div>
      )}

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground"
              )}>
              {t}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ASN or supplier..." className="bg-transparent outline-none text-xs w-40 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground" />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/30">
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
            <tbody className="divide-y divide-[#E4E9F0] dark:divide-border">
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setDetail(a)} className="hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-mono font-bold text-[#1E3A5F] dark:text-brand">{a.id}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{a.po}</td>
                  <td className="px-4 py-3 font-medium text-[#1E3A5F] dark:text-foreground">{a.supplier}</td>
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
                      className="w-7 h-7 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted hover:text-[#1E3A5F] dark:hover:text-foreground transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">
                    {tab === "Draft" ? "No draft ASNs — start one with “New ASN” and choose Save Draft." : "No ASNs match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 border-t border-[#E4E9F0] dark:border-border text-xs text-muted-foreground">
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
