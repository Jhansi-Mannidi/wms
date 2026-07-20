"use client"

import { useState } from "react"
import { Search, AlertTriangle, RefreshCw, ChevronDown, Eye, Plus, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { ExportButton } from "@/components/wms/export-button"
import { AvatarChip } from "@/components/wms/avatar-chip"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type Stock = {
  sku: string; name: string; client: string; category: string
  qoh: number; reserved: number; available: number
  location: string; expiry: string | null; status: string; belowReorder: boolean
}

type Lot = {
  id: string; sku: string; client: string; qty: number; mfgDate: string; expiry: string; location: string
}

const initialStocks: Stock[] = [
  { sku: "APH-001", name: "Amoxicillin 500mg Strip x10", client: "Apex Pharma Ltd", category: "Pharma", qoh: 12000, reserved: 2400, available: 9600, location: "R-A3-12", expiry: "2026-03-15", status: "ok", belowReorder: false },
  { sku: "APH-002", name: "Paracetamol 650mg Strip x10", client: "Apex Pharma Ltd", category: "Pharma", qoh: 450, reserved: 450, available: 0, location: "R-A3-14", expiry: "2025-12-01", status: "out", belowReorder: false },
  { sku: "GTF-101", name: "Cotton Fabric Roll 1.2m", client: "Hindustan Unilever", category: "FMCG", qoh: 380, reserved: 40, available: 340, location: "B-B2-05", expiry: null, status: "ok", belowReorder: false },
  { sku: "GTF-102", name: "Synthetic Blend Roll 0.9m", client: "Hindustan Unilever", category: "FMCG", qoh: 28, reserved: 0, available: 28, location: "B-B2-06", expiry: null, status: "low", belowReorder: true },
  { sku: "SE-201", name: "USB-C Hub 7-Port", client: "Amazon Seller Svc", category: "Electronics", qoh: 800, reserved: 320, available: 480, location: "E-C1-01", expiry: null, status: "ok", belowReorder: false },
  { sku: "SE-202", name: "HDMI Cable 2m Braided", client: "Amazon Seller Svc", category: "Electronics", qoh: 1240, reserved: 600, available: 640, location: "E-C1-02", expiry: null, status: "ok", belowReorder: false },
  { sku: "MS-301", name: "Surgical Gloves (M) Box/100", client: "Tata Consumer Products", category: "Medical", qoh: 5200, reserved: 1200, available: 4000, location: "R-D4-08", expiry: "2025-09-30", status: "expiry", belowReorder: false },
  { sku: "AI-401", name: "Brake Pad Set Front", client: "D-Mart Avenue", category: "Auto", qoh: 60, reserved: 12, available: 48, location: "M-E1-03", expiry: null, status: "ok", belowReorder: false },
]

const initialLots: Lot[] = [
  { id: "LOT-8801", sku: "APH-001", client: "Apex Pharma Ltd", qty: 6000, mfgDate: "2024-03-15", expiry: "2026-03-15", location: "R-A3-12" },
  { id: "LOT-8802", sku: "APH-001", client: "Apex Pharma Ltd", qty: 6000, mfgDate: "2024-06-01", expiry: "2026-06-01", location: "R-A3-13" },
  { id: "LOT-8803", sku: "APH-002", client: "Apex Pharma Ltd", qty: 450, mfgDate: "2023-12-01", expiry: "2025-12-01", location: "R-A3-14" },
  { id: "LOT-8804", sku: "MS-301", client: "Tata Consumer Products", qty: 5200, mfgDate: "2023-09-30", expiry: "2025-09-30", location: "R-D4-08" },
]

const categories = ["All", "Pharma", "FMCG", "Electronics", "Medical", "Auto"]
const CATEGORIES = ["Pharma", "FMCG", "Electronics", "Medical", "Auto"] as const
const CLIENTS = ["Apex Pharma Ltd", "Hindustan Unilever", "Amazon Seller Svc", "Tata Consumer Products", "D-Mart Avenue"] as const

const tabs = ["All SKUs", "Below Reorder", "Near Expiry", "Out of Stock", "Lot Tracking"] as const
type Tab = typeof tabs[number]

const statusInfo: Record<string, { bg: string; text: string; label: string }> = {
  ok:     { bg: "bg-success/15", text: "text-success",  label: "In Stock" },
  low:    { bg: "bg-warning/15", text: "text-warning",  label: "Low Stock" },
  out:    { bg: "bg-danger/15",  text: "text-danger",   label: "Out of Stock" },
  expiry: { bg: "bg-amber-500/15", text: "text-amber-400", label: "Near Expiry" },
}

const emptyLotForm = { sku: "", client: "", qty: "", mfgDate: "", expiry: "", location: "" }

function StockBar({ qoh, reserved }: { qoh: number; reserved: number }) {
  const pct = qoh > 0 ? (reserved / qoh) * 100 : 0
  return (
    <div className="flex items-center gap-1.5 min-w-[70px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full bg-brand/50 rounded-full" style={{ width: "100%" }}>
          <div className="h-full bg-brand rounded-full" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <span className="text-[10px] text-muted-foreground">{Math.round(pct)}%</span>
    </div>
  )
}

export default function OwnedStockExplorerPage() {
  const [stocks, setStocks] = useState<Stock[]>(initialStocks)
  const [lots, setLots] = useState<Lot[]>(initialLots)
  const [search, setSearch] = useState("")
  const [cat, setCat] = useState("All")
  const [tab, setTab] = useState<Tab>("All SKUs")

  const [clientOpen, setClientOpen] = useState(false)
  const [clientFilter, setClientFilter] = useState("All Clients")
  const [draftClient, setDraftClient] = useState("All Clients")

  const [detail, setDetail] = useState<Stock | null>(null)
  const [adjustTarget, setAdjustTarget] = useState<Stock | null>(null)
  const [adjustForm, setAdjustForm] = useState({ qoh: "", reserved: "", location: "" })
  const [adjustErrors, setAdjustErrors] = useState<Record<string, string>>({})

  const [lotOpen, setLotOpen] = useState(false)
  const [lotForm, setLotForm] = useState(emptyLotForm)
  const [lotErrors, setLotErrors] = useState<Record<string, string>>({})
  const [lotDeleteTarget, setLotDeleteTarget] = useState<Lot | null>(null)

  const tabMatch = (s: Stock) => {
    if (tab === "Below Reorder") return s.belowReorder
    if (tab === "Near Expiry") return s.status === "expiry"
    if (tab === "Out of Stock") return s.available === 0
    return true
  }

  const filtered = stocks.filter(s =>
    (cat === "All" || s.category === cat) &&
    (clientFilter === "All Clients" || s.client === clientFilter) &&
    tabMatch(s) &&
    (s.sku.toLowerCase().includes(search.toLowerCase()) ||
     s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.client.toLowerCase().includes(search.toLowerCase()))
  )

  const filteredLots = lots.filter(l =>
    (clientFilter === "All Clients" || l.client === clientFilter) &&
    (l.id.toLowerCase().includes(search.toLowerCase()) ||
     l.sku.toLowerCase().includes(search.toLowerCase()) ||
     l.client.toLowerCase().includes(search.toLowerCase()))
  )

  const kpis = [
    { label: "Total SKUs on Hand", value: stocks.length.toLocaleString(), sub: `Across ${new Set(stocks.map(s => s.client)).size} clients`, color: "brand" },
    { label: "Total QoH (Units)", value: stocks.reduce((s, x) => s + x.qoh, 0).toLocaleString(), sub: `${stocks.reduce((s, x) => s + x.available, 0).toLocaleString()} available`, color: "success" },
    { label: "SKUs Below Reorder", value: String(stocks.filter(s => s.belowReorder).length), sub: "Action required", color: "warning" },
    { label: "Expired / Near Expiry", value: String(stocks.filter(s => s.status === "expiry").length), sub: "Lot-level alert", color: "danger" },
  ]

  function statusFor(available: number, belowReorder: boolean, expiry: string | null) {
    if (available === 0) return "out"
    if (belowReorder) return "low"
    if (expiry && new Date(expiry).getTime() - Date.now() < 180 * 86_400_000) return "expiry"
    return "ok"
  }

  function openAdjust(s: Stock) {
    setAdjustForm({ qoh: String(s.qoh), reserved: String(s.reserved), location: s.location })
    setAdjustErrors({})
    setAdjustTarget(s)
  }

  function saveAdjust() {
    if (!adjustTarget) return
    const e: Record<string, string> = {}
    if (!adjustForm.qoh.trim()) e.qoh = "Quantity on hand is required"
    else if (!/^\d+$/.test(adjustForm.qoh)) e.qoh = "Enter a whole number"
    if (!adjustForm.reserved.trim()) e.reserved = "Reserved quantity is required"
    else if (!/^\d+$/.test(adjustForm.reserved)) e.reserved = "Enter a whole number"
    else if (Number(adjustForm.reserved) > Number(adjustForm.qoh || 0)) e.reserved = "Reserved cannot exceed QoH"
    if (!adjustForm.location.trim()) e.location = "Location is required"
    setAdjustErrors(e)
    if (Object.keys(e).length) return

    const qoh = Number(adjustForm.qoh)
    const reserved = Number(adjustForm.reserved)
    const available = qoh - reserved
    const belowReorder = available > 0 && available < 50
    setStocks(prev => prev.map(s => s.sku === adjustTarget.sku ? {
      ...s, qoh, reserved, available, belowReorder,
      location: adjustForm.location.trim().toUpperCase(),
      status: statusFor(available, belowReorder, s.expiry),
    } : s))
    notify.success("Stock adjusted", `${adjustTarget.sku} — QoH ${qoh.toLocaleString()}, available ${available.toLocaleString()}.`)
    setAdjustTarget(null)
  }

  function validateLot() {
    const e: Record<string, string> = {}
    if (!lotForm.sku) e.sku = "Select a SKU"
    if (!lotForm.client) e.client = "Select a client"
    if (!lotForm.qty.trim()) e.qty = "Quantity is required"
    else if (!/^\d+$/.test(lotForm.qty) || Number(lotForm.qty) < 1) e.qty = "Enter a positive whole number"
    if (!lotForm.mfgDate.trim()) e.mfgDate = "Manufacture date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(lotForm.mfgDate)) e.mfgDate = "Use YYYY-MM-DD"
    if (!lotForm.expiry.trim()) e.expiry = "Expiry date is required"
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(lotForm.expiry)) e.expiry = "Use YYYY-MM-DD"
    else if (lotForm.mfgDate && lotForm.expiry <= lotForm.mfgDate) e.expiry = "Expiry must be after manufacture date"
    if (!lotForm.location.trim()) e.location = "Location is required"
    setLotErrors(e)
    return Object.keys(e).length === 0
  }

  function createLot() {
    if (!validateLot()) return
    const next: Lot = {
      id: `LOT-${8801 + lots.length}`,
      sku: lotForm.sku,
      client: lotForm.client,
      qty: Number(lotForm.qty),
      mfgDate: lotForm.mfgDate,
      expiry: lotForm.expiry,
      location: lotForm.location.trim().toUpperCase(),
    }
    setLots(prev => [next, ...prev])
    setLotOpen(false)
    setLotForm(emptyLotForm)
    setLotErrors({})
    notify.success("Lot recorded", `${next.id} — ${next.qty.toLocaleString()} units of ${next.sku}`)
  }

  function deleteLot(l: Lot) {
    setLots(prev => prev.filter(x => x.id !== l.id))
    notify.warning("Lot removed", `${l.id} written off from lot tracking.`)
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
            <div key={k.label} className={cn("bg-card border rounded-lg px-4 py-3",
              k.color === "danger" ? "border-danger/25" : k.color === "warning" ? "border-warning/25" : "border-border"
            )}>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-bold mt-1", `text-${k.color}`)}>{k.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">{k.sub}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-muted/40 flex-1 min-w-[180px] max-w-xs">
            <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={tab === "Lot Tracking" ? "Lot, SKU, client…" : "SKU, name, client…"}
              className="bg-transparent text-[12px] outline-none w-full placeholder:text-muted-foreground/60" />
          </div>
          {tab !== "Lot Tracking" && (
            <div className="flex gap-1 flex-wrap">
              {categories.map(c => (
                <button key={c} onClick={() => setCat(c)} className={cn(
                  "px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap",
                  cat === c ? "bg-brand text-white" : "border border-border bg-card text-muted-foreground hover:text-foreground"
                )}>{c}</button>
              ))}
            </div>
          )}
          <button
            onClick={() => { setDraftClient(clientFilter); setClientOpen(true) }}
            title="Filter by client"
            className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-card text-[12px] transition-colors ml-auto",
              clientFilter !== "All Clients" ? "border-brand text-brand" : "border-border text-muted-foreground hover:text-foreground")}>
            <span>{clientFilter === "All Clients" ? "Client" : clientFilter}</span><ChevronDown className="w-3 h-3" />
          </button>
          {tab === "Lot Tracking" ? (
            <>
              <ExportButton data={filteredLots.map(l => ({ id: l.id, sku: l.sku, client: l.client, qty: l.qty, mfgDate: l.mfgDate, expiry: l.expiry, location: l.location }))} filename="3pl-lots" />
              <button onClick={() => { setLotForm(emptyLotForm); setLotErrors({}); setLotOpen(true) }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-[12px] font-semibold hover:bg-brand/90 transition-colors">
                <Plus className="w-3.5 h-3.5" /> New Lot
              </button>
            </>
          ) : (
            <ExportButton data={filtered.map(s => ({ sku: s.sku, name: s.name, client: s.client, category: s.category, qoh: s.qoh, reserved: s.reserved, available: s.available, location: s.location, expiry: s.expiry ?? "", status: s.status, belowReorder: s.belowReorder }))} filename="3pl-stock" />
          )}
          <button
            onClick={() => notify.info("Stock refreshed", `Re-synced ${tab === "Lot Tracking" ? `${lots.length} lots` : `${stocks.length} SKUs`} from the WMS inventory ledger.`)}
            title="Refresh stock"
            className="p-1.5 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {tab === "Lot Tracking" ? (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["Lot ID", "SKU", "Client", "Qty", "Manufactured", "Expiry", "Location", ""].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredLots.map((l, i) => {
                  const daysToExpiry = Math.round((new Date(l.expiry).getTime() - Date.now()) / 86_400_000)
                  return (
                    <tr key={l.id} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                      <td className="px-4 py-3 font-mono text-[11px] text-brand font-semibold">{l.id}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-foreground">{l.sku}</td>
                      <td className="px-4 py-3"><AvatarChip name={l.client} size="xs" /></td>
                      <td className="px-4 py-3 font-semibold">{l.qty.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{l.mfgDate}</td>
                      <td className="px-4 py-3">
                        <span className={cn("font-semibold", daysToExpiry < 0 ? "text-danger" : daysToExpiry < 180 ? "text-warning" : "text-muted-foreground")}>{l.expiry}</span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{l.location}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setLotDeleteTarget(l)} title="Write off lot"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-danger hover:bg-danger/10 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {filteredLots.length === 0 && (
                  <tr><td colSpan={8} className="px-4 py-10 text-center text-[12px] text-muted-foreground">No lots match your filters.</td></tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Showing {filteredLots.length} of {lots.length} lots</span>
              <span className="text-[11px] font-semibold text-foreground">Total Qty: {filteredLots.reduce((s, l) => s + l.qty, 0).toLocaleString()}</span>
            </div>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  {["SKU / Name", "Client", "Cat.", "QoH", "Reserved", "Available", "Reserve %", "Location", "Expiry", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const info = statusInfo[s.status]
                  return (
                    <tr key={s.sku} className={cn("border-b border-border/50 hover:bg-muted/20 transition-colors", i % 2 !== 0 && "bg-muted/5")}>
                      <td className="px-4 py-3">
                        <p className="font-mono text-[11px] text-brand font-semibold">{s.sku}</p>
                        <p className="text-[11px] text-foreground leading-tight mt-0.5 max-w-[140px] truncate">{s.name}</p>
                      </td>
                      <td className="px-4 py-3"><AvatarChip name={s.client} size="xs" /></td>
                      <td className="px-4 py-3 text-muted-foreground">{s.category}</td>
                      <td className="px-4 py-3 font-semibold">{s.qoh.toLocaleString()}</td>
                      <td className="px-4 py-3 text-muted-foreground">{s.reserved.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={cn("font-bold", s.available === 0 ? "text-danger" : s.available < 50 ? "text-warning" : "text-success")}>{s.available.toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3"><StockBar qoh={s.qoh} reserved={s.reserved} /></td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{s.location}</td>
                      <td className="px-4 py-3">
                        {s.expiry
                          ? <span className="text-[11px] text-warning">{s.expiry}</span>
                          : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", info.bg, info.text)}>
                          {s.belowReorder && <AlertTriangle className="w-2.5 h-2.5" />}
                          {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setDetail(s)} title="View stock detail" className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-brand hover:bg-brand/10 transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                          <button onClick={() => openAdjust(s)} title="Adjust stock" className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"><RefreshCw className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} className="px-4 py-10 text-center text-[12px] text-muted-foreground">No SKUs match your filters.</td></tr>
                )}
              </tbody>
            </table>
            <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">Showing {filtered.length} of {stocks.length} SKUs</span>
              <span className="text-[11px] font-semibold text-foreground">Total QoH: {filtered.reduce((s, x) => s + x.qoh, 0).toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Client filter modal */}
      <Modal
        open={clientOpen}
        onOpenChange={setClientOpen}
        title="Filter by Client"
        description="Show stock owned by a single 3PL client"
        size="sm"
        footer={
          <ModalActions
            onCancel={() => { setClientFilter("All Clients"); setClientOpen(false); notify.info("Client filter cleared", "Showing stock for all clients.") }}
            cancelLabel="Clear"
            onSubmit={() => { setClientFilter(draftClient); setClientOpen(false); notify.success("Client filter applied", draftClient) }}
            submitLabel="Apply"
          />
        }
      >
        <Field label="Client">
          <Select value={draftClient} onChange={e => setDraftClient(e.target.value)} options={["All Clients", ...CLIENTS]} />
        </Field>
      </Modal>

      {/* Adjust stock modal */}
      <Modal
        open={!!adjustTarget}
        onOpenChange={(o) => { if (!o) { setAdjustTarget(null); setAdjustErrors({}) } }}
        title={`Adjust ${adjustTarget?.sku ?? ""}`}
        description={adjustTarget?.name}
        size="sm"
        footer={<ModalActions onCancel={() => setAdjustTarget(null)} onSubmit={saveAdjust} submitLabel="Save Adjustment" />}
      >
        <div className="space-y-4">
          <Field label="Quantity on Hand" required error={adjustErrors.qoh}>
            <TextInput value={adjustForm.qoh} invalid={!!adjustErrors.qoh} onChange={e => setAdjustForm({ ...adjustForm, qoh: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Reserved" required error={adjustErrors.reserved}>
            <TextInput value={adjustForm.reserved} invalid={!!adjustErrors.reserved} onChange={e => setAdjustForm({ ...adjustForm, reserved: e.target.value })} inputMode="numeric" />
          </Field>
          <Field label="Location" required error={adjustErrors.location}>
            <TextInput value={adjustForm.location} invalid={!!adjustErrors.location} onChange={e => setAdjustForm({ ...adjustForm, location: e.target.value })} placeholder="e.g. R-A3-12" />
          </Field>
        </div>
      </Modal>

      {/* New lot modal */}
      <Modal
        open={lotOpen}
        onOpenChange={(o) => { setLotOpen(o); if (!o) { setLotForm(emptyLotForm); setLotErrors({}) } }}
        title="New Lot"
        description="Record a lot-tracked receipt against a client SKU"
        footer={<ModalActions onCancel={() => setLotOpen(false)} onSubmit={createLot} submitLabel="Record Lot" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="SKU" required error={lotErrors.sku}>
            <Select value={lotForm.sku} invalid={!!lotErrors.sku} onChange={e => setLotForm({ ...lotForm, sku: e.target.value })} options={stocks.map(s => s.sku)} placeholder="Select SKU" />
          </Field>
          <Field label="Client" required error={lotErrors.client}>
            <Select value={lotForm.client} invalid={!!lotErrors.client} onChange={e => setLotForm({ ...lotForm, client: e.target.value })} options={CLIENTS} placeholder="Select Client" />
          </Field>
          <Field label="Quantity" required error={lotErrors.qty}>
            <TextInput value={lotForm.qty} invalid={!!lotErrors.qty} onChange={e => setLotForm({ ...lotForm, qty: e.target.value })} placeholder="e.g. 6000" inputMode="numeric" />
          </Field>
          <Field label="Location" required error={lotErrors.location}>
            <TextInput value={lotForm.location} invalid={!!lotErrors.location} onChange={e => setLotForm({ ...lotForm, location: e.target.value })} placeholder="e.g. R-A3-12" />
          </Field>
          <Field label="Manufacture Date" required error={lotErrors.mfgDate} hint="YYYY-MM-DD">
            <TextInput value={lotForm.mfgDate} invalid={!!lotErrors.mfgDate} onChange={e => setLotForm({ ...lotForm, mfgDate: e.target.value })} placeholder="2025-01-01" />
          </Field>
          <Field label="Expiry Date" required error={lotErrors.expiry} hint="YYYY-MM-DD">
            <TextInput value={lotForm.expiry} invalid={!!lotErrors.expiry} onChange={e => setLotForm({ ...lotForm, expiry: e.target.value })} placeholder="2027-01-01" />
          </Field>
        </div>
      </Modal>

      {/* Stock detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.sku ?? ""}
        description="Owned stock detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="SKU" value={<span className="font-mono text-brand">{detail.sku}</span>} />
            <DetailRow label="Product" value={detail.name} />
            <DetailRow label="Client" value={detail.client} />
            <DetailRow label="Category" value={detail.category} />
            <DetailRow label="Quantity on Hand" value={detail.qoh.toLocaleString()} />
            <DetailRow label="Reserved" value={detail.reserved.toLocaleString()} />
            <DetailRow label="Available" value={detail.available.toLocaleString()} />
            <DetailRow label="Location" value={<span className="font-mono">{detail.location}</span>} />
            <DetailRow label="Expiry" value={detail.expiry ?? "—"} />
            <DetailRow label="Below Reorder" value={detail.belowReorder ? <span className="text-warning font-semibold">Yes</span> : "No"} />
            <DetailRow label="Status" value={
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusInfo[detail.status].bg, statusInfo[detail.status].text)}>
                {statusInfo[detail.status].label}
              </span>} />
            <DetailRow label="Tracked Lots" value={String(lots.filter(l => l.sku === detail.sku).length)} />
          </div>
        )}
      </Drawer>

      {/* Lot write-off confirmation */}
      <ConfirmDialog
        open={!!lotDeleteTarget}
        onOpenChange={(o) => !o && setLotDeleteTarget(null)}
        title="Write off this lot?"
        message={`${lotDeleteTarget?.id} (${lotDeleteTarget?.qty.toLocaleString()} units of ${lotDeleteTarget?.sku}) will be removed from lot tracking. This cannot be undone.`}
        confirmLabel="Write Off"
        cancelLabel="Keep Lot"
        onConfirm={() => lotDeleteTarget && deleteLot(lotDeleteTarget)}
      />
    </div>
  )
}
