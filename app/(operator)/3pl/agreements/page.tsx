"use client"

import { useState } from "react"
import { Plus, Search, FileText, Edit2, Eye, AlertTriangle, CheckCircle2, Clock, CalendarDays, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { AvatarChip } from "@/components/wms/avatar-chip"
import { ExportButton } from "@/components/wms/export-button"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { RowActions } from "@/components/ui/row-actions"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Agreement = {
  id: string; client: string; type: string; startDate: string; endDate: string
  status: string; billingFreq: string; value: string; autoRenew: boolean; daysLeft: number
  zone?: string; allocatedSqft?: number; slaProfile?: string; rateCardId?: string; deposit?: string
}

type RateCard = {
  id: string; name: string; service: string; uom: string; rate: number; appliesTo: string
}

const initialAgreements: Agreement[] = [
  { id: "AGR-001", client: "Reliance Retail Ltd", type: "Standard 3PL", startDate: "2024-01-01", endDate: "2025-12-31", status: "active", billingFreq: "Monthly", value: "₹4.2L/mo", autoRenew: true, daysLeft: 165 },
  { id: "AGR-002", client: "Tata Consumer Products", type: "Standard 3PL", startDate: "2024-03-15", endDate: "2025-09-14", status: "renewal", billingFreq: "Monthly", value: "₹2.8L/mo", autoRenew: false, daysLeft: 56 },
  { id: "AGR-003", client: "Hindustan Unilever", type: "Premium 3PL + VAS", startDate: "2023-07-01", endDate: "2026-06-30", status: "active", billingFreq: "Monthly", value: "₹11.5L/mo", autoRenew: true, daysLeft: 345 },
  { id: "AGR-004", client: "Myntra Designs Pvt", type: "Standard 3PL", startDate: "2023-01-01", endDate: "2025-01-31", status: "expired", billingFreq: "Monthly", value: "₹3.1L/mo", autoRenew: false, daysLeft: -170 },
  { id: "AGR-005", client: "Amazon Seller Svc", type: "Enterprise 3PL", startDate: "2024-06-01", endDate: "2027-05-31", status: "active", billingFreq: "Monthly", value: "₹28.4L/mo", autoRenew: true, daysLeft: 680 },
  { id: "AGR-006", client: "D-Mart Avenue", type: "Standard 3PL", startDate: "2024-09-01", endDate: "2025-08-31", status: "active", billingFreq: "Quarterly", value: "₹1.6L/mo", autoRenew: false, daysLeft: 42 },
  { id: "AGR-007", client: "Flipkart Internet Pvt", type: "Enterprise 3PL", startDate: "2024-04-01", endDate: "2027-03-31", status: "active", billingFreq: "Monthly", value: "₹22.7L/mo", autoRenew: true, daysLeft: 619 },
  { id: "AGR-008", client: "ITC Foods Division", type: "Premium 3PL + VAS", startDate: "2023-10-01", endDate: "2026-09-30", status: "active", billingFreq: "Monthly", value: "₹8.9L/mo", autoRenew: true, daysLeft: 437 },
  { id: "AGR-009", client: "Britannia Industries", type: "Standard 3PL", startDate: "2024-02-01", endDate: "2025-08-15", status: "renewal", billingFreq: "Monthly", value: "₹3.6L/mo", autoRenew: false, daysLeft: 26 },
  { id: "AGR-010", client: "Dabur India Ltd", type: "Standard 3PL", startDate: "2023-05-01", endDate: "2025-04-30", status: "expired", billingFreq: "Quarterly", value: "₹2.4L/mo", autoRenew: false, daysLeft: -81 },
  { id: "AGR-011", client: "Godrej Consumer Products", type: "Premium 3PL + VAS", startDate: "2024-07-01", endDate: "2026-06-30", status: "active", billingFreq: "Monthly", value: "₹6.7L/mo", autoRenew: true, daysLeft: 345 },
  { id: "AGR-012", client: "Nykaa E-Retail", type: "Standard 3PL", startDate: "2024-11-01", endDate: "2025-09-30", status: "renewal", billingFreq: "Monthly", value: "₹2.2L/mo", autoRenew: true, daysLeft: 72 },
  { id: "AGR-013", client: "Marico Ltd", type: "Standard 3PL", startDate: "2023-08-01", endDate: "2026-07-31", status: "active", billingFreq: "Annually", value: "₹4.8L/mo", autoRenew: true, daysLeft: 376 },
  { id: "AGR-014", client: "Asian Paints Ltd", type: "Enterprise 3PL", startDate: "2024-01-15", endDate: "2028-01-14", status: "active", billingFreq: "Monthly", value: "₹34.1L/mo", autoRenew: true, daysLeft: 909 },
  { id: "AGR-015", client: "Havells India Ltd", type: "Standard 3PL", startDate: "2023-03-01", endDate: "2025-02-28", status: "expired", billingFreq: "Monthly", value: "₹3.9L/mo", autoRenew: false, daysLeft: -142 },
  { id: "AGR-016", client: "Parle Products Pvt", type: "Standard 3PL", startDate: "2024-08-01", endDate: "2025-08-31", status: "renewal", billingFreq: "Quarterly", value: "₹2.9L/mo", autoRenew: false, daysLeft: 42 },
  { id: "AGR-017", client: "Pidilite Industries", type: "Premium 3PL + VAS", startDate: "2024-05-01", endDate: "2026-04-30", status: "active", billingFreq: "Monthly", value: "₹7.3L/mo", autoRenew: true, daysLeft: 284 },
  { id: "AGR-018", client: "BigBasket Innovative", type: "Enterprise 3PL", startDate: "2024-10-01", endDate: "2027-09-30", status: "active", billingFreq: "Monthly", value: "₹19.6L/mo", autoRenew: true, daysLeft: 802 },
  { id: "AGR-019", client: "Emami Ltd", type: "Standard 3PL", startDate: "2023-02-01", endDate: "2025-01-31", status: "expired", billingFreq: "Quarterly", value: "₹1.9L/mo", autoRenew: false, daysLeft: -170 },
  { id: "AGR-020", client: "Wipro Consumer Care", type: "Premium 3PL + VAS", startDate: "2024-03-01", endDate: "2026-02-28", status: "active", billingFreq: "Monthly", value: "₹5.4L/mo", autoRenew: true, daysLeft: 223 },
  { id: "AGR-021", client: "Zydus Wellness Ltd", type: "Standard 3PL", startDate: "2024-09-15", endDate: "2025-09-14", status: "renewal", billingFreq: "Monthly", value: "₹2.6L/mo", autoRenew: true, daysLeft: 56 },
  { id: "AGR-022", client: "Bajaj Electricals", type: "Standard 3PL", startDate: "2024-06-01", endDate: "2026-05-31", status: "active", billingFreq: "Quarterly", value: "₹3.3L/mo", autoRenew: false, daysLeft: 315 },
  { id: "AGR-023", client: "VIP Industries Ltd", type: "Standard 3PL", startDate: "2023-04-01", endDate: "2025-03-31", status: "expired", billingFreq: "Monthly", value: "₹1.4L/mo", autoRenew: false, daysLeft: -111 },
  { id: "AGR-024", client: "Blue Star Ltd", type: "Premium 3PL + VAS", startDate: "2024-12-01", endDate: "2026-11-30", status: "active", billingFreq: "Monthly", value: "₹9.8L/mo", autoRenew: true, daysLeft: 498 },
  { id: "AGR-025", client: "Symphony Cooling Ltd", type: "Standard 3PL", startDate: "2024-10-15", endDate: "2025-09-01", status: "renewal", billingFreq: "Annually", value: "₹1.8L/mo", autoRenew: false, daysLeft: 43 },
  { id: "AGR-026", client: "Cera Sanitaryware", type: "Enterprise 3PL", startDate: "2025-01-01", endDate: "2028-12-31", status: "active", billingFreq: "Monthly", value: "₹16.2L/mo", autoRenew: true, daysLeft: 1260 },
]

const initialRateCards: RateCard[] = [
  { id: "RC-101", name: "Standard Pallet Storage", service: "Storage", uom: "pallet-day", rate: 45, appliesTo: "Standard 3PL" },
  { id: "RC-102", name: "Rack Storage", service: "Storage", uom: "pallet-day", rate: 38, appliesTo: "Standard 3PL" },
  { id: "RC-103", name: "Inbound Receipt Handling", service: "Handling", uom: "piece", rate: 2.5, appliesTo: "Standard 3PL" },
  { id: "RC-104", name: "Kitting Service", service: "VAS", uom: "unit", rate: 35, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-105", name: "Temperature Monitoring", service: "Ancillary", uom: "month", rate: 5000, appliesTo: "Enterprise 3PL" },
  { id: "RC-106", name: "Bulk Floor Storage", service: "Storage", uom: "sqft-month", rate: 28, appliesTo: "Standard 3PL" },
  { id: "RC-107", name: "Cold Room Storage", service: "Storage", uom: "pallet-day", rate: 96, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-108", name: "Bonded Warehouse Storage", service: "Storage", uom: "pallet-day", rate: 74, appliesTo: "Enterprise 3PL" },
  { id: "RC-109", name: "Mezzanine Bin Storage", service: "Storage", uom: "sqft-month", rate: 42, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-110", name: "Outbound Pick & Pack", service: "Handling", uom: "piece", rate: 3.2, appliesTo: "Standard 3PL" },
  { id: "RC-111", name: "Pallet In / Pallet Out", service: "Handling", uom: "pallet-day", rate: 65, appliesTo: "Standard 3PL" },
  { id: "RC-112", name: "Container Destuffing", service: "Handling", uom: "unit", rate: 4200, appliesTo: "Enterprise 3PL" },
  { id: "RC-113", name: "Cross-Dock Transfer", service: "Handling", uom: "piece", rate: 1.8, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-114", name: "Returns Inspection", service: "Handling", uom: "piece", rate: 6.5, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-115", name: "Labelling & Barcoding", service: "VAS", uom: "unit", rate: 4, appliesTo: "Standard 3PL" },
  { id: "RC-116", name: "Shrink Wrapping", service: "VAS", uom: "unit", rate: 18, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-117", name: "Gift Wrapping", service: "VAS", uom: "unit", rate: 22, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-118", name: "Re-Palletisation", service: "VAS", uom: "pallet-day", rate: 130, appliesTo: "Enterprise 3PL" },
  { id: "RC-119", name: "Batch Coding & MRP Sticker", service: "VAS", uom: "unit", rate: 2.75, appliesTo: "Standard 3PL" },
  { id: "RC-120", name: "Assembly & Sub-Kitting", service: "VAS", uom: "unit", rate: 48, appliesTo: "Enterprise 3PL" },
  { id: "RC-121", name: "Serial Number Capture", service: "VAS", uom: "piece", rate: 5.5, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-122", name: "Fumigation Treatment", service: "Ancillary", uom: "pallet-day", rate: 210, appliesTo: "Enterprise 3PL" },
  { id: "RC-123", name: "Insurance Surcharge", service: "Ancillary", uom: "month", rate: 3200, appliesTo: "Standard 3PL" },
  { id: "RC-124", name: "Dedicated Supervisor", service: "Ancillary", uom: "month", rate: 42000, appliesTo: "Enterprise 3PL" },
  { id: "RC-125", name: "Cycle Count Audit", service: "Ancillary", uom: "month", rate: 8500, appliesTo: "Premium 3PL + VAS" },
  { id: "RC-126", name: "Security & CCTV Access", service: "Ancillary", uom: "month", rate: 2400, appliesTo: "Standard 3PL" },
]

const agreementTypes = ["All", "Standard 3PL", "Premium 3PL + VAS", "Enterprise 3PL"]
const AGREEMENT_TYPES = ["Standard 3PL", "Premium 3PL + VAS", "Enterprise 3PL"] as const
const BILLING_FREQS = ["Monthly", "Quarterly", "Annually"] as const
const AUTO_RENEW = ["Yes", "No"] as const
const SERVICES = ["Storage", "Handling", "VAS", "Ancillary"] as const
const UOMS = ["pallet-day", "piece", "unit", "month", "sqft-month"] as const
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Cold Room A"] as const
const SLA_PROFILES = ["Standard SLA — 24h turnaround", "Premium SLA — 12h turnaround", "Custom SLA — per addendum"] as const

const tabs = ["All Agreements", "Active", "Renewal Due", "Expired", "Rate Cards"] as const
type Tab = typeof tabs[number]

const statusConfig: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  active:  { label: "Active",       bg: "bg-success/15", text: "text-success",  icon: <CheckCircle2 className="w-3 h-3" /> },
  renewal: { label: "Renewal Due",  bg: "bg-warning/15", text: "text-warning",  icon: <AlertTriangle className="w-3 h-3" /> },
  expired: { label: "Expired",      bg: "bg-danger/15",  text: "text-danger",   icon: <Clock className="w-3 h-3" /> },
}

const emptyForm = {
  client: "", type: "", startDate: "", endDate: "", billingFreq: "", value: "", autoRenew: "",
  zone: "", allocatedSqft: "", slaProfile: "", rateCardId: "", deposit: "",
}
const emptyRateForm = { name: "", service: "", uom: "", rate: "", appliesTo: "" }

function rateCardLabel(r: RateCard) {
  return `${r.name} (${r.id}) — ₹${r.rate}/${r.uom}`
}

function daysBetween(from: string, to: string) {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.round(ms / 86_400_000)
}

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>(initialAgreements)
  const [rateCards, setRateCards] = useState<RateCard[]>(initialRateCards)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("All")
  const [tab, setTab] = useState<Tab>("All Agreements")

  const [createOpen, setCreateOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Agreement | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [rateOpen, setRateOpen] = useState(false)
  const [rateForm, setRateForm] = useState(emptyRateForm)
  const [rateErrors, setRateErrors] = useState<Record<string, string>>({})
  const [rateDeleteTarget, setRateDeleteTarget] = useState<RateCard | null>(null)

  const [detail, setDetail] = useState<Agreement | null>(null)
  const [terminateTarget, setTerminateTarget] = useState<Agreement | null>(null)

  const tabStatus: Record<string, string | null> = {
    "All Agreements": null, Active: "active", "Renewal Due": "renewal", Expired: "expired", "Rate Cards": null,
  }

  const filtered = agreements.filter(a =>
    (typeFilter === "All" || a.type === typeFilter) &&
    (tabStatus[tab] === null || a.status === tabStatus[tab]) &&
    (a.client.toLowerCase().includes(search.toLowerCase()) || a.id.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredRates = rateCards.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) || r.service.toLowerCase().includes(search.toLowerCase())
  )

  const eligibleRateCards = rateCards.filter(r => !form.type || r.appliesTo === form.type)
  const selectedRateCard = rateCards.find(r => rateCardLabel(r) === form.rateCardId)
  const estimatedMonthly = selectedRateCard && form.allocatedSqft && selectedRateCard.uom === "sqft-month"
    ? selectedRateCard.rate * Number(form.allocatedSqft)
    : null

  const kpis = [
    { label: "Active Agreements", value: String(agreements.filter(a => a.status === "active").length), color: "text-success" },
    { label: "Renewal Due (< 60d)", value: String(agreements.filter(a => a.status === "renewal" || (a.daysLeft >= 0 && a.daysLeft < 60)).length), color: "text-warning" },
    { label: "Expired", value: String(agreements.filter(a => a.status === "expired").length), color: "text-danger" },
    { label: "Auto-Renew Enabled", value: String(agreements.filter(a => a.autoRenew).length), color: "text-brand" },
  ]

  function validate() {
    const e: Record<string, string> = {}
    if (!form.client.trim()) e.client = "Client name is required"
    if (!form.type) e.type = "Select an agreement type"
    if (!form.startDate.trim()) e.startDate = "Start date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.startDate)) e.startDate = "Use YYYY-MM-DD"
    if (!form.endDate.trim()) e.endDate = "End date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(form.endDate)) e.endDate = "Use YYYY-MM-DD"
    else if (form.startDate && form.endDate <= form.startDate) e.endDate = "End date must be after start date"
    if (!form.billingFreq) e.billingFreq = "Select a billing frequency"
    if (!form.value.trim()) e.value = "Contract value is required"
    if (!form.autoRenew) e.autoRenew = "Select auto-renew"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function statusFor(endDate: string) {
    const left = daysBetween(new Date().toISOString().slice(0, 10), endDate)
    return { left, status: left < 0 ? "expired" : left < 60 ? "renewal" : "active" }
  }

  function createAgreement() {
    if (!validate()) return
    const { left, status } = statusFor(form.endDate)
    const next: Agreement = {
      id: `AGR-${String(agreements.length + 1).padStart(3, "0")}`,
      client: form.client.trim(),
      type: form.type,
      startDate: form.startDate,
      endDate: form.endDate,
      status,
      billingFreq: form.billingFreq,
      value: form.value.trim(),
      autoRenew: form.autoRenew === "Yes",
      daysLeft: left,
      zone: form.zone || undefined,
      allocatedSqft: form.allocatedSqft ? Number(form.allocatedSqft) : undefined,
      slaProfile: form.slaProfile || undefined,
      rateCardId: selectedRateCard?.id,
      deposit: form.deposit.trim() || undefined,
    }
    setAgreements(prev => [next, ...prev])
    setCreateOpen(false)
    setForm(emptyForm)
    setErrors({})
    notify.success("Agreement activated", `${next.id} — ${next.client} (${next.type})`)
  }

  function openEdit(a: Agreement) {
    setForm({
      client: a.client, type: a.type, startDate: a.startDate, endDate: a.endDate, billingFreq: a.billingFreq, value: a.value, autoRenew: a.autoRenew ? "Yes" : "No",
      zone: a.zone ?? "", allocatedSqft: a.allocatedSqft ? String(a.allocatedSqft) : "", slaProfile: a.slaProfile ?? "", rateCardId: a.rateCardId ?? "", deposit: a.deposit ?? "",
    })
    setErrors({})
    setEditTarget(a)
  }

  function saveEdit() {
    if (!editTarget || !validate()) return
    const { left, status } = statusFor(form.endDate)
    setAgreements(prev => prev.map(a => a.id === editTarget.id ? {
      ...a,
      client: form.client.trim(), type: form.type, startDate: form.startDate, endDate: form.endDate,
      billingFreq: form.billingFreq, value: form.value.trim(), autoRenew: form.autoRenew === "Yes",
      status, daysLeft: left,
      zone: form.zone || undefined,
      allocatedSqft: form.allocatedSqft ? Number(form.allocatedSqft) : undefined,
      slaProfile: form.slaProfile || undefined,
      rateCardId: form.rateCardId || undefined,
      deposit: form.deposit.trim() || undefined,
    } : a))
    notify.success("Agreement updated", `${editTarget.id} saved.`)
    setEditTarget(null)
    setForm(emptyForm)
    setErrors({})
  }

  function terminate(a: Agreement) {
    setAgreements(prev => prev.map(x => x.id === a.id ? { ...x, status: "expired", autoRenew: false, daysLeft: 0 } : x))
    notify.warning("Agreement terminated", `${a.id} for ${a.client} is now marked expired.`)
  }

  function validateRate() {
    const e: Record<string, string> = {}
    if (!rateForm.name.trim()) e.name = "Rate card name is required"
    if (!rateForm.service) e.service = "Select a service"
    if (!rateForm.uom) e.uom = "Select a UOM"
    if (!rateForm.rate.trim()) e.rate = "Rate is required"
    else if (!/^\d+(\.\d+)?$/.test(rateForm.rate) || Number(rateForm.rate) <= 0) e.rate = "Enter a positive amount"
    if (!rateForm.appliesTo) e.appliesTo = "Select an agreement type"
    setRateErrors(e)
    return Object.keys(e).length === 0
  }

  function createRate() {
    if (!validateRate()) return
    const next: RateCard = {
      id: `RC-${101 + rateCards.length}`,
      name: rateForm.name.trim(),
      service: rateForm.service,
      uom: rateForm.uom,
      rate: Number(rateForm.rate),
      appliesTo: rateForm.appliesTo,
    }
    setRateCards(prev => [next, ...prev])
    setRateOpen(false)
    setRateForm(emptyRateForm)
    setRateErrors({})
    notify.success("Rate card added", `${next.name} at ₹${next.rate}/${next.uom}`)
  }

  function deleteRate(r: RateCard) {
    setRateCards(prev => prev.filter(x => x.id !== r.id))
    notify.warning("Rate card removed", `${r.name} deleted from the catalogue.`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 px-5 pt-4 border-b border-border shrink-0">
        {tabs.map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn(
            "px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
            tab === t ? "border-brand text-brand" : "border-transparent text-muted-foreground hover:text-foreground"
          )}>{t}</button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {kpis.map(k => (
            <div key={k.label} className="bg-card border border-border rounded-lg px-4 py-3">
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", k.color)}>{k.value}</p>
            </div>
          ))}
        </div>

        {tab === "Rate Cards" ? (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rate cards…"
                  className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
              </div>
              <ExportButton data={filteredRates.map(r => ({ id: r.id, name: r.name, service: r.service, uom: r.uom, rate: r.rate, appliesTo: r.appliesTo }))} filename="3pl-rate-cards" className="ml-auto" />
              <button onClick={() => { setRateForm(emptyRateForm); setRateErrors({}); setRateOpen(true) }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Rate Card
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Rate Card", "Service", "UOM", "Rate (₹)", "Applies To", ""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredRates.map((r, i) => (
                    <tr key={r.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-foreground">{r.name}</p>
                        <p className="font-mono text-[10px] text-muted-foreground">{r.id}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{r.service}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.uom}</td>
                      <td className="px-4 py-3 font-semibold text-foreground">₹{r.rate.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{r.appliesTo}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setRateDeleteTarget(r)} title="Delete rate card"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredRates.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-[12px] text-muted-foreground">No rate cards match your search.</td></tr>
                  )}
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Showing {filteredRates.length} rate cards</span>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search agreements…"
                  className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
              </div>
              <div className="flex gap-1">
                {agreementTypes.map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)} className={cn(
                    "px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
                    typeFilter === t ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                  )}>{t}</button>
                ))}
              </div>
              <ExportButton data={filtered.map(a => ({ id: a.id, client: a.client, type: a.type, startDate: a.startDate, endDate: a.endDate, status: a.status, billingFreq: a.billingFreq, value: a.value, autoRenew: a.autoRenew, daysLeft: a.daysLeft }))} filename="3pl-agreements" className="ml-auto" />
              <button onClick={() => { setForm(emptyForm); setErrors({}); setCreateOpen(true) }}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Agreement
              </button>
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {["Client", "Type", "Period", "Status", "Days Left", "Billing", "Value", "Auto-Renew", ""].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((a, i) => {
                    const s = statusConfig[a.status]
                    return (
                      <tr key={a.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                        <td className="px-4 py-3"><AvatarChip name={a.client} sub={a.id} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{a.type}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <CalendarDays className="w-3 h-3" />
                            <span>{a.startDate.slice(0,7)} → {a.endDate.slice(0,7)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", s.bg, s.text)}>
                            {s.icon}{s.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={cn("font-semibold", a.daysLeft < 0 ? "text-danger" : a.daysLeft < 60 ? "text-warning" : "text-foreground")}>
                            {a.daysLeft < 0 ? `${Math.abs(a.daysLeft)}d ago` : `${a.daysLeft}d`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{a.billingFreq}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{a.value}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => {
                              setAgreements(prev => prev.map(x => x.id === a.id ? { ...x, autoRenew: !x.autoRenew } : x))
                              notify.success("Auto-renew updated", `${a.id} auto-renew turned ${a.autoRenew ? "off" : "on"}.`)
                            }}
                            title={a.autoRenew ? "Disable auto-renew" : "Enable auto-renew"}
                            className="cursor-pointer">
                            {a.autoRenew
                              ? <span className="text-[11px] font-semibold text-success bg-success/15 px-2 py-0.5 rounded-full">Yes</span>
                              : <span className="text-[11px] font-semibold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">No</span>}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <RowActions
                            items={[
                              { label: "View agreement", icon: <Eye />, onSelect: () => setDetail(a) },
                              { label: "Edit agreement", icon: <Edit2 />, onSelect: () => openEdit(a) },
                              { label: "Contract document", icon: <FileText />, onSelect: () => notify.info("Contract document", `Generating the signed contract PDF for ${a.id}.`) },
                              ...(a.status !== "expired"
                                ? [{ label: "Terminate agreement", icon: <Trash2 />, onSelect: () => setTerminateTarget(a), tone: "danger" as const }]
                                : []),
                            ]}
                          />
                        </td>
                      </tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-[12px] text-muted-foreground">No agreements match your filters.</td></tr>
                  )}
                </tbody>
              </table>
              <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Showing {filtered.length} agreements</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Create agreement — builder: terms, space allocation, SLA, rate card, deposit */}
      <Modal
        open={createOpen}
        onOpenChange={(o) => { setCreateOpen(o); if (!o) { setForm(emptyForm); setErrors({}) } }}
        title="New Agreement"
        description="Set up a 3PL contract for a client"
        size="lg"
        footer={<ModalActions onCancel={() => setCreateOpen(false)} onSubmit={createAgreement} submitLabel="Activate Agreement" />}
      >
        <div className="space-y-5">
          <div>
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5">Contract Terms</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Client" required error={errors.client}>
                <TextInput value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} placeholder="e.g. Reliance Retail Ltd" />
              </Field>
              <Field label="Agreement Type" required error={errors.type}>
                <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value, rateCardId: "" })} options={AGREEMENT_TYPES} placeholder="Select Type" />
              </Field>
              <Field label="Start Date" required error={errors.startDate} hint="YYYY-MM-DD">
                <TextInput value={form.startDate} invalid={!!errors.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} placeholder="2025-01-01" />
              </Field>
              <Field label="End Date" required error={errors.endDate} hint="YYYY-MM-DD">
                <TextInput value={form.endDate} invalid={!!errors.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} placeholder="2026-12-31" />
              </Field>
              <Field label="Billing Frequency" required error={errors.billingFreq}>
                <Select value={form.billingFreq} invalid={!!errors.billingFreq} onChange={e => setForm({ ...form, billingFreq: e.target.value })} options={BILLING_FREQS} placeholder="Select Frequency" />
              </Field>
              <Field label="Contract Value" required error={errors.value}>
                <TextInput value={form.value} invalid={!!errors.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="e.g. ₹4.2L/mo" />
              </Field>
              <Field label="Auto-Renew" required error={errors.autoRenew}>
                <Select value={form.autoRenew} invalid={!!errors.autoRenew} onChange={e => setForm({ ...form, autoRenew: e.target.value })} options={AUTO_RENEW} placeholder="Select" />
              </Field>
              <Field label="Security Deposit">
                <TextInput value={form.deposit} onChange={e => setForm({ ...form, deposit: e.target.value })} placeholder="e.g. ₹50,000" />
              </Field>
            </div>
          </div>

          <div className="pt-1 border-t border-border">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 mt-4">Space Allocation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Warehouse Zone">
                <Select value={form.zone} onChange={e => setForm({ ...form, zone: e.target.value })} options={ZONES} placeholder="Select Zone" />
              </Field>
              <Field label="Allocated Area (sqft)">
                <TextInput value={form.allocatedSqft} onChange={e => setForm({ ...form, allocatedSqft: e.target.value.replace(/\D/g, "") })} placeholder="e.g. 4500" inputMode="numeric" />
              </Field>
            </div>
          </div>

          <div className="pt-1 border-t border-border">
            <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 mt-4">SLA Profile & Rate Card</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="SLA Profile">
                <Select value={form.slaProfile} onChange={e => setForm({ ...form, slaProfile: e.target.value })} options={SLA_PROFILES} placeholder="Select SLA Profile" />
              </Field>
              <Field label="Rate Card" hint={form.type ? undefined : "Select an agreement type to filter applicable rate cards"}>
                <Select
                  value={form.rateCardId}
                  onChange={e => setForm({ ...form, rateCardId: e.target.value })}
                  options={eligibleRateCards.map(rateCardLabel)}
                  placeholder="Select Rate Card"
                />
              </Field>
            </div>
            {estimatedMonthly !== null && (
              <div className="mt-3 flex items-center justify-between px-3 py-2 rounded-lg bg-brand/10 border border-brand/30">
                <span className="text-xs font-medium text-foreground">Estimated storage cost ({form.allocatedSqft} sqft × ₹{selectedRateCard?.rate}/sqft-mo)</span>
                <span className="text-sm font-bold text-brand">₹{estimatedMonthly.toLocaleString()}/mo</span>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Edit agreement */}
      <Modal
        open={!!editTarget}
        onOpenChange={(o) => { if (!o) { setEditTarget(null); setForm(emptyForm); setErrors({}) } }}
        title={`Edit ${editTarget?.id ?? ""}`}
        description="Update contract terms"
        footer={<ModalActions onCancel={() => setEditTarget(null)} onSubmit={saveEdit} submitLabel="Save Changes" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Client" required error={errors.client}>
            <TextInput value={form.client} invalid={!!errors.client} onChange={e => setForm({ ...form, client: e.target.value })} />
          </Field>
          <Field label="Agreement Type" required error={errors.type}>
            <Select value={form.type} invalid={!!errors.type} onChange={e => setForm({ ...form, type: e.target.value })} options={AGREEMENT_TYPES} placeholder="Select Type" />
          </Field>
          <Field label="Start Date" required error={errors.startDate} hint="YYYY-MM-DD">
            <TextInput value={form.startDate} invalid={!!errors.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
          </Field>
          <Field label="End Date" required error={errors.endDate} hint="YYYY-MM-DD">
            <TextInput value={form.endDate} invalid={!!errors.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} />
          </Field>
          <Field label="Billing Frequency" required error={errors.billingFreq}>
            <Select value={form.billingFreq} invalid={!!errors.billingFreq} onChange={e => setForm({ ...form, billingFreq: e.target.value })} options={BILLING_FREQS} placeholder="Select Frequency" />
          </Field>
          <Field label="Contract Value" required error={errors.value}>
            <TextInput value={form.value} invalid={!!errors.value} onChange={e => setForm({ ...form, value: e.target.value })} />
          </Field>
          <Field label="Auto-Renew" required error={errors.autoRenew}>
            <Select value={form.autoRenew} invalid={!!errors.autoRenew} onChange={e => setForm({ ...form, autoRenew: e.target.value })} options={AUTO_RENEW} placeholder="Select" />
          </Field>
        </div>
      </Modal>

      {/* New rate card */}
      <Modal
        open={rateOpen}
        onOpenChange={(o) => { setRateOpen(o); if (!o) { setRateForm(emptyRateForm); setRateErrors({}) } }}
        title="New Rate Card"
        description="Add a billable service rate to the catalogue"
        footer={<ModalActions onCancel={() => setRateOpen(false)} onSubmit={createRate} submitLabel="Add Rate Card" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Rate Card Name" required error={rateErrors.name}>
            <TextInput value={rateForm.name} invalid={!!rateErrors.name} onChange={e => setRateForm({ ...rateForm, name: e.target.value })} placeholder="e.g. Standard Pallet Storage" />
          </Field>
          <Field label="Service" required error={rateErrors.service}>
            <Select value={rateForm.service} invalid={!!rateErrors.service} onChange={e => setRateForm({ ...rateForm, service: e.target.value })} options={SERVICES} placeholder="Select Service" />
          </Field>
          <Field label="Unit of Measure" required error={rateErrors.uom}>
            <Select value={rateForm.uom} invalid={!!rateErrors.uom} onChange={e => setRateForm({ ...rateForm, uom: e.target.value })} options={UOMS} placeholder="Select UOM" />
          </Field>
          <Field label="Rate (₹)" required error={rateErrors.rate}>
            <TextInput value={rateForm.rate} invalid={!!rateErrors.rate} onChange={e => setRateForm({ ...rateForm, rate: e.target.value })} placeholder="e.g. 45" inputMode="decimal" />
          </Field>
          <Field label="Applies To" required error={rateErrors.appliesTo}>
            <Select value={rateForm.appliesTo} invalid={!!rateErrors.appliesTo} onChange={e => setRateForm({ ...rateForm, appliesTo: e.target.value })} options={AGREEMENT_TYPES} placeholder="Select Agreement Type" />
          </Field>
        </div>
      </Modal>

      {/* Agreement detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="3PL agreement detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Agreement ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Type" value={detail.type} />
            <DetailRow label="Start Date" value={detail.startDate} />
            <DetailRow label="End Date" value={detail.endDate} />
            <DetailRow label="Status" value={
              <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", statusConfig[detail.status].bg, statusConfig[detail.status].text)}>
                {statusConfig[detail.status].icon}{statusConfig[detail.status].label}
              </span>} />
            <DetailRow label="Days Left" value={detail.daysLeft < 0 ? `${Math.abs(detail.daysLeft)} days ago` : `${detail.daysLeft} days`} />
            <DetailRow label="Billing Frequency" value={detail.billingFreq} />
            <DetailRow label="Contract Value" value={detail.value} />
            <DetailRow label="Auto-Renew" value={detail.autoRenew ? "Enabled" : "Disabled"} />
            {detail.zone && <DetailRow label="Warehouse Zone" value={detail.zone} />}
            {detail.allocatedSqft && <DetailRow label="Allocated Area" value={`${detail.allocatedSqft.toLocaleString()} sqft`} />}
            {detail.slaProfile && <DetailRow label="SLA Profile" value={detail.slaProfile} />}
            {detail.rateCardId && <DetailRow label="Rate Card" value={<span className="font-mono text-brand">{detail.rateCardId}</span>} />}
            {detail.deposit && <DetailRow label="Security Deposit" value={detail.deposit} />}
          </div>
        )}
      </Drawer>

      {/* Terminate confirmation */}
      <ConfirmDialog
        open={!!terminateTarget}
        onOpenChange={(o) => !o && setTerminateTarget(null)}
        title="Terminate this agreement?"
        message={`${terminateTarget?.id} with ${terminateTarget?.client} will be marked expired and auto-renew disabled. This cannot be undone.`}
        confirmLabel="Terminate"
        cancelLabel="Keep Active"
        onConfirm={() => terminateTarget && terminate(terminateTarget)}
      />

      {/* Rate card delete confirmation */}
      <ConfirmDialog
        open={!!rateDeleteTarget}
        onOpenChange={(o) => !o && setRateDeleteTarget(null)}
        title="Delete this rate card?"
        message={`${rateDeleteTarget?.name} (₹${rateDeleteTarget?.rate}/${rateDeleteTarget?.uom}) will be removed from the catalogue.`}
        confirmLabel="Delete"
        onConfirm={() => rateDeleteTarget && deleteRate(rateDeleteTarget)}
      />
    </div>
  )
}
