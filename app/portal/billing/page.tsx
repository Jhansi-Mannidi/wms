"use client"

import { useState } from "react"
import { DollarSign, Download, FileText, CheckCircle2, Clock, AlertTriangle, ChevronRight, CreditCard, Eye } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal, Drawer } from "@/components/ui/modal"
import { Field, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

const tabs = ["All", "Outstanding", "Paid", "Overdue"]

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type Invoice = {
  id: string; period: string; storage: number; handling: number; vas: number
  total: number; status: string; issued: string; due: string; paid: string
}

const initialInvoices: Invoice[] = [
  { id: "INV-0445", period: "Jul 1–15, 2025", storage: 18400, handling: 6200, vas: 2800, total: 27400, status: "Outstanding", issued: "Jul 16", due: "Jul 30", paid: "-" },
  { id: "INV-0441", period: "Jun 16–30, 2025", storage: 17800, handling: 5900, vas: 0, total: 23700, status: "Overdue", issued: "Jul 1", due: "Jul 15", paid: "-" },
  { id: "INV-0438", period: "Jun 1–15, 2025", storage: 17200, handling: 6100, vas: 1500, total: 24800, status: "Paid", issued: "Jun 16", due: "Jun 30", paid: "Jun 28" },
  { id: "INV-0432", period: "May 16–31, 2025", storage: 16900, handling: 5700, vas: 3200, total: 25800, status: "Paid", issued: "Jun 1", due: "Jun 15", paid: "Jun 13" },
  { id: "INV-0428", period: "May 1–15, 2025", storage: 16500, handling: 5400, vas: 900, total: 22800, status: "Paid", issued: "May 16", due: "May 30", paid: "May 28" },
]

const statusStyle: Record<string, string> = {
  Outstanding: "bg-brand/15 text-brand",
  Overdue: "bg-danger/15 text-danger",
  Paid: "bg-success/15 text-success",
}

const statusIcon: Record<string, React.ReactNode> = {
  Outstanding: <Clock className="w-3 h-3" />,
  Overdue: <AlertTriangle className="w-3 h-3" />,
  Paid: <CheckCircle2 className="w-3 h-3" />,
}

const PAYMENT_METHODS = ["NEFT / RTGS", "UPI", "Corporate Credit Card", "Cheque"] as const

const rateCard = [
  { item: "Ambient storage", basis: "per unit / month", rate: "₹4.20" },
  { item: "Cold-chain storage (2–8°C)", basis: "per unit / month", rate: "₹11.50" },
  { item: "Inbound handling", basis: "per carton", rate: "₹6.50" },
  { item: "Outbound handling", basis: "per carton", rate: "₹7.00" },
  { item: "Relabelling", basis: "per unit", rate: "₹1.20" },
  { item: "Kitting / co-packing", basis: "per kit", rate: "₹18.00" },
  { item: "Quality inspection", basis: "per lot", rate: "₹950.00" },
  { item: "Palletisation & wrapping", basis: "per pallet", rate: "₹85.00" },
]

function fmt(n: number) { return `₹${(n / 100).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}` }

export default function PortalBillingPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices)
  const [tab, setTab] = useState("All")
  const [payTarget, setPayTarget] = useState<Invoice | null>(null)
  const [method, setMethod] = useState("")
  const [payError, setPayError] = useState("")
  const [detail, setDetail] = useState<Invoice | null>(null)
  const [rateCardOpen, setRateCardOpen] = useState(false)

  const filtered = invoices.filter(inv => tab === "All" || inv.status === tab)
  const unpaid = invoices.filter(i => i.status === "Outstanding" || i.status === "Overdue")
  const outstanding = unpaid.reduce((a, b) => a + b.total, 0)
  const paid30d = invoices.filter(i => i.status === "Paid").slice(0, 2).reduce((a, b) => a + b.total, 0)
  const overdueInvoice = invoices.find(i => i.status === "Overdue")

  function openPayment(target?: Invoice | null) {
    const inv = target ?? unpaid[0]
    if (!inv) {
      notify.info("Nothing to pay", "All invoices on your account are settled.")
      return
    }
    setPayTarget(inv)
    setMethod("")
    setPayError("")
  }

  function confirmPayment() {
    if (!method) { setPayError("Select a payment method"); return }
    if (!payTarget) return
    const paidOn = new Date().toLocaleDateString("en-IN", { month: "short", day: "numeric" })
    setInvoices(prev => prev.map(i => i.id === payTarget.id ? { ...i, status: "Paid", paid: paidOn } : i))
    notify.success("Payment recorded", `${payTarget.id} — ${fmt(payTarget.total)} paid via ${method}.`)
    setPayTarget(null)
    setMethod("")
    setPayError("")
  }

  function download(inv: Invoice) {
    notify.success("Invoice downloaded", `${inv.id} (${inv.period}) saved as PDF to your downloads.`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Billing &amp; Invoices</h1>
          <p className="text-sm text-muted-foreground">Storage, handling, and VAS charges from VoltusFreight</p>
        </div>
        <button onClick={() => openPayment()} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-sm font-medium hover:opacity-90 transition-opacity">
          <CreditCard className="w-4 h-4" /> Pay Now
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total Outstanding", value: fmt(outstanding), color: "text-danger", bg: "bg-danger/15", icon: <AlertTriangle className="w-4 h-4" /> },
          { label: "Overdue", value: fmt(overdueInvoice?.total ?? 0), color: "text-warning", bg: "bg-warning/15", icon: <Clock className="w-4 h-4" /> },
          { label: "Paid (Last 30d)", value: fmt(paid30d), color: "text-success", bg: "bg-success/15", icon: <CheckCircle2 className="w-4 h-4" /> },
          { label: "Avg Monthly Bill", value: fmt(Math.round(invoices.reduce((a, b) => a + b.total, 0) / invoices.length)), color: "text-brand", bg: "bg-brand/15", icon: <DollarSign className="w-4 h-4" /> },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-base font-bold text-[#1E3A5F] dark:text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Overdue alert */}
      {overdueInvoice && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-danger/10 border border-danger/30">
          <AlertTriangle className="w-4 h-4 text-danger shrink-0" />
          <p className="text-sm text-danger font-medium">Invoice {overdueInvoice.id} is overdue (due {overdueInvoice.due}). Please arrange payment to avoid service interruption.</p>
          <button onClick={() => openPayment(overdueInvoice)} className="ml-auto flex items-center gap-1 text-xs text-danger font-semibold hover:underline shrink-0">Pay Now <ChevronRight className="w-3 h-3" /></button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border w-fit">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors", tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground")}>
            {t}
          </button>
        ))}
      </div>

      {/* Invoice cards */}
      <div className="space-y-3">
        {filtered.map(inv => (
          <div key={inv.id} className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] dark:border-border">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-[#1E3A5F] dark:text-brand" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">{inv.id}</p>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full", statusStyle[inv.status])}>
                      {statusIcon[inv.status]} {inv.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{inv.period}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{fmt(inv.total)}</p>
                {inv.status !== "Paid" && (
                  <button
                    onClick={() => openPayment(inv)}
                    title="Pay this invoice"
                    className="px-3 py-1.5 rounded-lg bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
                  >
                    Pay
                  </button>
                )}
                <RowActions
                  items={[
                    { label: "View invoice details", icon: <Eye />, onSelect: () => setDetail(inv) },
                    { label: "Download invoice PDF", icon: <Download />, onSelect: () => download(inv) },
                  ]}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-[#E4E9F0] dark:bg-border">
              {[
                { label: "Storage", value: fmt(inv.storage) },
                { label: "Handling", value: fmt(inv.handling) },
                { label: "VAS", value: fmt(inv.vas) },
                { label: "Issued", value: inv.issued },
                { label: inv.status === "Paid" ? "Paid On" : "Due", value: inv.status === "Paid" ? inv.paid : inv.due },
              ].map((cell, ci) => (
                <div key={ci} className="bg-white dark:bg-card px-4 py-2.5">
                  <p className="text-[10px] text-muted-foreground">{cell.label}</p>
                  <p className={cn("text-xs font-semibold mt-0.5", ci === 4 && inv.status === "Overdue" ? "text-danger" : "text-[#1E3A5F] dark:text-foreground")}>{cell.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm rounded-2xl border border-dashed border-[#E4E9F0] dark:border-border">
            No {tab.toLowerCase()} invoices.
          </div>
        )}
      </div>

      {/* Rate card link */}
      <div className="p-4 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#1E3A5F] dark:text-foreground">Your Rate Card</p>
          <p className="text-xs text-muted-foreground">Storage: ₹4.20/unit/month · Handling in: ₹6.50/carton · Handling out: ₹7.00/carton</p>
        </div>
        <button
          onClick={() => setRateCardOpen(true)}
          title="View full rate card"
          className="flex items-center gap-1 text-xs text-[#1E3A5F] dark:text-brand hover:underline shrink-0"
        >
          View full rate card <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Payment modal */}
      <Modal
        open={!!payTarget}
        onOpenChange={(o) => { if (!o) { setPayTarget(null); setMethod(""); setPayError("") } }}
        title="Pay Invoice"
        description={payTarget ? `${payTarget.id} · ${payTarget.period}` : undefined}
        footer={<ModalActions onCancel={() => setPayTarget(null)} onSubmit={confirmPayment} submitLabel={payTarget ? `Pay ${fmt(payTarget.total)}` : "Pay"} />}
      >
        {payTarget && (
          <div className="space-y-4">
            <div className="space-y-1">
              <DetailRow label="Invoice" value={<span className="font-mono text-brand">{payTarget.id}</span>} />
              <DetailRow label="Billing Period" value={payTarget.period} />
              <DetailRow label="Storage" value={fmt(payTarget.storage)} />
              <DetailRow label="Handling" value={fmt(payTarget.handling)} />
              <DetailRow label="VAS" value={fmt(payTarget.vas)} />
              <DetailRow label="Amount Due" value={<strong>{fmt(payTarget.total)}</strong>} />
              <DetailRow label="Due Date" value={<span className={payTarget.status === "Overdue" ? "text-danger" : undefined}>{payTarget.due}</span>} />
            </div>
            <Field label="Payment Method" required error={payError}>
              <Select value={method} invalid={!!payError} onChange={e => { setMethod(e.target.value); setPayError("") }} options={PAYMENT_METHODS} placeholder="Select Payment Method" />
            </Field>
          </div>
        )}
      </Modal>

      {/* Invoice detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Invoice detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            {detail && (
              <button onClick={() => download(detail)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
                Download PDF
              </button>
            )}
            {detail && detail.status !== "Paid" && (
              <button onClick={() => { const inv = detail; setDetail(null); openPayment(inv) }} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Pay {fmt(detail.total)}
              </button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Invoice" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Billing Period" value={detail.period} />
            <DetailRow label="Storage Charges" value={fmt(detail.storage)} />
            <DetailRow label="Handling Charges" value={fmt(detail.handling)} />
            <DetailRow label="VAS Charges" value={fmt(detail.vas)} />
            <DetailRow label="Invoice Total" value={<strong>{fmt(detail.total)}</strong>} />
            <DetailRow label="Issued" value={detail.issued} />
            <DetailRow label="Due" value={detail.due} />
            <DetailRow label="Paid On" value={detail.paid} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status])}>{detail.status}</span>} />
          </div>
        )}
      </Drawer>

      {/* Rate card drawer */}
      <Drawer
        open={rateCardOpen}
        onOpenChange={setRateCardOpen}
        title="Rate Card — Apex Pharma Ltd"
        description="Contracted rates effective 1 Jan 2025"
        footer={
          <button onClick={() => setRateCardOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        <div className="space-y-1">
          {rateCard.map(r => (
            <DetailRow key={r.item} label={`${r.item} (${r.basis})`} value={<strong>{r.rate}</strong>} />
          ))}
          <DetailRow label="Payment Terms" value="Net 14 days from invoice date" />
          <DetailRow label="Late Payment" value="1.5% per month on overdue balances" />
        </div>
      </Drawer>
    </div>
  )
}
