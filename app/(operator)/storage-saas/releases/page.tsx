"use client"

import { useState } from "react"
import { CheckCircle2, Camera, Package, Truck, ShoppingBag, UserCircle, Plus, Eye, Check } from "lucide-react"
import { Modal, Drawer } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions, DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"
import { cn } from "@/lib/utils"

const customers2 = ["Priya Fashion Store", "TechGadgets Ltd", "Spice & Grain Co.", "MedEquip Traders", "Rajesh Kumar"]

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type StockRow = { id: string; lotRef: string; desc: string; pieces: number; location: string; days: number; condition: string; selected: boolean }

type Dispatch = {
  id: string; customer: string; lots: string; pieces: number
  mode: string; destination: string; pod: string; charge: number; time: string
}

const stockData: StockRow[] = [
  { id: "s1", lotRef: "PF-LOT-001", desc: "Cotton Sarees (Assorted)", pieces: 24, location: "Zone A / Rack 3", days: 42, condition: "Good", selected: false },
  { id: "s2", lotRef: "PF-LOT-002", desc: "Silk Dupattas", pieces: 36, location: "Zone A / Rack 4", days: 38, condition: "Good", selected: false },
  { id: "s3", lotRef: "PF-LOT-003", desc: "Embroidered Blouses", pieces: 28, location: "Zone B / Shelf 2", days: 15, condition: "Good", selected: false },
  { id: "s4", lotRef: "PF-LOT-004", desc: "Printed Kurtis (Mixed Sizes)", pieces: 42, location: "Zone A / Rack 5", days: 26, condition: "Good", selected: false },
  { id: "s5", lotRef: "PF-LOT-005", desc: "Bridal Lehenga Sets", pieces: 12, location: "Zone C / Vault 1", days: 74, condition: "Good", selected: false },
  { id: "s6", lotRef: "PF-LOT-006", desc: "Chiffon Sarees", pieces: 30, location: "Zone A / Rack 6", days: 55, condition: "Good", selected: false },
  { id: "s7", lotRef: "PF-LOT-007", desc: "Cotton Kurta Pyjama Sets", pieces: 48, location: "Zone B / Shelf 4", days: 9, condition: "Good", selected: false },
  { id: "s8", lotRef: "PF-LOT-008", desc: "Woollen Shawls", pieces: 22, location: "Zone C / Rack 2", days: 96, condition: "Fair", selected: false },
  { id: "s9", lotRef: "PF-LOT-009", desc: "Banarasi Silk Sarees", pieces: 16, location: "Zone C / Vault 2", days: 63, condition: "Good", selected: false },
  { id: "s10", lotRef: "PF-LOT-010", desc: "Kids Ethnic Wear", pieces: 54, location: "Zone B / Shelf 6", days: 21, condition: "Good", selected: false },
  { id: "s11", lotRef: "PF-LOT-011", desc: "Georgette Anarkali Suits", pieces: 26, location: "Zone A / Rack 7", days: 44, condition: "Good", selected: false },
  { id: "s12", lotRef: "PF-LOT-012", desc: "Handloom Stoles", pieces: 38, location: "Zone B / Shelf 8", days: 12, condition: "Good", selected: false },
  { id: "s13", lotRef: "PF-LOT-013", desc: "Designer Blouse Pieces", pieces: 60, location: "Zone A / Rack 9", days: 33, condition: "Good", selected: false },
  { id: "s14", lotRef: "PF-LOT-014", desc: "Chikankari Kurtis", pieces: 34, location: "Zone B / Shelf 10", days: 68, condition: "Good", selected: false },
  { id: "s15", lotRef: "PF-LOT-015", desc: "Festive Gift Packs", pieces: 18, location: "Zone C / Rack 4", days: 105, condition: "Fair", selected: false },
  { id: "s16", lotRef: "PF-LOT-016", desc: "Linen Shirting Rolls", pieces: 44, location: "Zone A / Rack 11", days: 7, condition: "Good", selected: false },
  { id: "s17", lotRef: "PF-LOT-017", desc: "Bandhani Dupattas", pieces: 29, location: "Zone B / Shelf 12", days: 48, condition: "Good", selected: false },
  { id: "s18", lotRef: "PF-LOT-018", desc: "Velvet Sherwani Sets", pieces: 14, location: "Zone C / Vault 3", days: 82, condition: "Good", selected: false },
  { id: "s19", lotRef: "PF-LOT-019", desc: "Cotton Nightwear Bundles", pieces: 56, location: "Zone A / Rack 13", days: 19, condition: "Good", selected: false },
  { id: "s20", lotRef: "PF-LOT-020", desc: "Kanjivaram Silk Sarees", pieces: 20, location: "Zone C / Vault 4", days: 118, condition: "Fair", selected: false },
  { id: "s21", lotRef: "PF-LOT-021", desc: "Readymade Palazzo Sets", pieces: 40, location: "Zone B / Shelf 14", days: 37, condition: "Good", selected: false },
  { id: "s22", lotRef: "PF-LOT-022", desc: "Embroidered Sherwani Stoles", pieces: 25, location: "Zone A / Rack 15", days: 58, condition: "Good", selected: false },
  { id: "s23", lotRef: "PF-LOT-023", desc: "Winter Jacket Cartons", pieces: 32, location: "Zone C / Rack 6", days: 91, condition: "Good", selected: false },
  { id: "s24", lotRef: "PF-LOT-024", desc: "Cotton Bedsheet Sets", pieces: 46, location: "Zone B / Shelf 16", days: 4, condition: "Good", selected: false },
]

const initialDispatches: Dispatch[] = [
  { id: "REL-2012", customer: "Priya Fashion Store", lots: "PF-LOT-041", pieces: 34, mode: "Local Delivery", destination: "Shop 14, Commercial Street, Bengaluru", pod: "POD-482913", charge: 850, time: "16:40" },
  { id: "REL-2011", customer: "TechGadgets Ltd", lots: "TG-LOT-018, TG-LOT-019", pieces: 52, mode: "Courier", destination: "Plot 22, Electronic City Phase 2, Bengaluru", pod: "POD-471206", charge: 1300, time: "15:05" },
  { id: "REL-2010", customer: "Spice & Grain Co.", lots: "SG-LOT-007", pieces: 28, mode: "Pickup", destination: "Counter pickup", pod: "POD-463887", charge: 700, time: "14:20" },
  { id: "REL-2009", customer: "MedEquip Traders", lots: "ME-LOT-012, ME-LOT-013", pieces: 18, mode: "Local Delivery", destination: "Apollo Annexe, Bannerghatta Road, Bengaluru", pod: "POD-455140", charge: 450, time: "13:35" },
  { id: "REL-2008", customer: "Rajesh Kumar", lots: "RK-LOT-004", pieces: 12, mode: "Pickup", destination: "Counter pickup", pod: "POD-448762", charge: 300, time: "12:10" },
  { id: "REL-2007", customer: "Priya Fashion Store", lots: "PF-LOT-038, PF-LOT-039", pieces: 46, mode: "Courier", destination: "Warehouse 3, Hosur Road, Bengaluru", pod: "POD-437519", charge: 1150, time: "11:45" },
  { id: "REL-2006", customer: "Spice & Grain Co.", lots: "SG-LOT-005, SG-LOT-006", pieces: 64, mode: "Local Delivery", destination: "Mandi Block C, Yeshwanthpur, Bengaluru", pod: "POD-429084", charge: 1600, time: "10:55" },
  { id: "REL-2005", customer: "TechGadgets Ltd", lots: "TG-LOT-015", pieces: 24, mode: "Pickup", destination: "Counter pickup", pod: "POD-418337", charge: 600, time: "10:15" },
  { id: "REL-2004", customer: "MedEquip Traders", lots: "ME-LOT-009", pieces: 30, mode: "Courier", destination: "Manipal Supply Depot, Old Airport Road, Bengaluru", pod: "POD-406215", charge: 750, time: "09:40" },
  { id: "REL-2003", customer: "Rajesh Kumar", lots: "RK-LOT-002, RK-LOT-003", pieces: 16, mode: "Local Delivery", destination: "No. 8, Jayanagar 4th Block, Bengaluru", pod: "—", charge: 400, time: "09:05" },
  { id: "REL-2002", customer: "Priya Fashion Store", lots: "PF-LOT-035", pieces: 22, mode: "Pickup", destination: "Counter pickup", pod: "POD-394471", charge: 550, time: "08:30" },
  { id: "REL-2001", customer: "Spice & Grain Co.", lots: "SG-LOT-002", pieces: 40, mode: "Courier", destination: "Godown 7, Peenya Industrial Area, Bengaluru", pod: "POD-388006", charge: 1000, time: "08:00" },
]

const modes = [
  { id: "pickup", label: "Pickup", icon: <ShoppingBag className="w-4 h-4" /> },
  { id: "local", label: "Local Delivery", icon: <Truck className="w-4 h-4" /> },
  { id: "courier", label: "Courier", icon: <Package className="w-4 h-4" /> },
]

const MODE_LABEL: Record<string, string> = { pickup: "Pickup", local: "Local Delivery", courier: "Courier" }
const HANDLING_PER_PIECE = 25

const emptyDispatchForm = { customer: "", lotRef: "", desc: "", pieces: "", location: "", mode: "", destination: "" }

export default function StorageReleasesPage() {
  const [customer, setCustomer] = useState("Priya Fashion Store")
  const [stock, setStock] = useState<StockRow[]>(stockData)
  const [mode, setMode] = useState("")
  const [shipto, setShipto] = useState("")
  const [pod, setPod] = useState("")
  const [released, setReleased] = useState(false)
  const [releasedPieces, setReleasedPieces] = useState(0)

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [lotDetail, setLotDetail] = useState<StockRow | null>(null)

  const [dispatches, setDispatches] = useState<Dispatch[]>(initialDispatches)
  const [dispatchDetail, setDispatchDetail] = useState<Dispatch | null>(null)

  const [dispatchOpen, setDispatchOpen] = useState(false)
  const [dispatchForm, setDispatchForm] = useState(emptyDispatchForm)
  const [dispatchErrors, setDispatchErrors] = useState<Record<string, string>>({})

  const toggleRow = (id: string) => setStock(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r))
  const toggleAll = () => {
    const allSelected = stock.every(r => r.selected)
    setStock(prev => prev.map(r => ({ ...r, selected: !allSelected })))
  }

  const selected = stock.filter(r => r.selected)
  const totalPieces = selected.reduce((s, r) => s + r.pieces, 0)
  const kpiPieces = stock.reduce((s, r) => s + r.pieces, 0)
  const oldestDays = stock.length ? Math.max(...stock.map(r => r.days)) : 0
  const charges = stock.reduce((s, r) => s + r.pieces * r.days * 5, 0)

  const capturePod = () => {
    const ref = `POD-${Math.floor(100000 + Math.random() * 900000)}`
    setPod(ref)
    notify.success("POD captured", `Signature and photo stored against reference ${ref}.`)
  }

  const handleRelease = () => {
    if (!selected.length || !mode) return
    setConfirmOpen(true)
  }

  const confirmRelease = () => {
    const lots = selected.map(r => r.lotRef).join(", ")
    const pieces = totalPieces
    const destination = mode === "pickup" ? "Counter pickup" : shipto.trim() || "Not specified"
    const next: Dispatch = {
      id: `REL-${String(dispatches.length + 2001)}`,
      customer,
      lots,
      pieces,
      mode: MODE_LABEL[mode] ?? mode,
      destination,
      pod: pod.trim() || "—",
      charge: pieces * HANDLING_PER_PIECE,
      time: new Date().toTimeString().slice(0, 5),
    }
    setDispatches(prev => [next, ...prev])
    setStock(prev => prev.filter(r => !r.selected))
    setReleasedPieces(pieces)
    setReleased(true)
    notify.success("Release confirmed", `${next.id} — ${pieces} pieces released to ${customer} via ${next.mode}.`)
  }

  function validateDispatch() {
    const e: Record<string, string> = {}
    if (!dispatchForm.customer) e.customer = "Select a customer"
    if (!dispatchForm.lotRef.trim()) e.lotRef = "Lot reference is required"
    if (!dispatchForm.desc.trim()) e.desc = "Description is required"
    if (!dispatchForm.pieces.trim()) e.pieces = "Piece count is required"
    else if (!/^\d+$/.test(dispatchForm.pieces) || Number(dispatchForm.pieces) < 1) e.pieces = "Enter a positive whole number"
    if (!dispatchForm.location.trim()) e.location = "Location is required"
    if (!dispatchForm.mode) e.mode = "Select a release mode"
    if (dispatchForm.mode && dispatchForm.mode !== "Pickup" && !dispatchForm.destination.trim()) {
      e.destination = "Ship-to address is required for delivery and courier"
    }
    setDispatchErrors(e)
    return Object.keys(e).length === 0
  }

  function createDispatch() {
    if (!validateDispatch()) return
    const pieces = Number(dispatchForm.pieces)
    const next: Dispatch = {
      id: `REL-${String(dispatches.length + 2001)}`,
      customer: dispatchForm.customer,
      lots: dispatchForm.lotRef.trim().toUpperCase(),
      pieces,
      mode: dispatchForm.mode,
      destination: dispatchForm.mode === "Pickup" ? "Counter pickup" : dispatchForm.destination.trim(),
      pod: "—",
      charge: pieces * HANDLING_PER_PIECE,
      time: new Date().toTimeString().slice(0, 5),
    }
    setDispatches(prev => [next, ...prev])
    setDispatchOpen(false)
    setDispatchForm(emptyDispatchForm)
    setDispatchErrors({})
    notify.success("Release dispatched", `${next.id} — ${pieces} pieces for ${next.customer} via ${next.mode}.`)
  }

  return (
    <div className="p-6 w-full">
      <div className="mb-5 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-foreground">Customer Stock &amp; Release</h1>
          <p className="text-sm text-muted-foreground mt-0.5">View per-customer stock and confirm piece releases</p>
        </div>
        <button
          onClick={() => { setDispatchForm({ ...emptyDispatchForm, customer }); setDispatchErrors({}); setDispatchOpen(true) }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
          <Plus className="w-4 h-4" /> New Release Dispatch
        </button>
      </div>

      {/* Customer selector */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-border bg-card">
        <UserCircle className="w-5 h-5 text-brand shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</span>
        <select value={customer} onChange={e => { setCustomer(e.target.value); setReleased(false); setReleasedPieces(0); setStock(stockData); setMode(""); setShipto(""); setPod("") }}
          className="flex-1 max-w-xs px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand">
          {customers2.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Pieces On Hand", value: kpiPieces, color: "text-brand" },
          { label: "Oldest Lot (Days)", value: `${oldestDays}d`, color: "text-warning" },
          { label: "Charges To Date", value: `₹${charges.toLocaleString()}`, color: "text-foreground" },
        ].map(k => (
          <div key={k.label} className="p-3 rounded-xl border border-border bg-card text-center">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-xl font-bold", k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Stock table */}
        <div className="xl:col-span-2">
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border flex items-center justify-between">
              <h2 className="text-sm font-bold text-foreground">Stock Lots</h2>
              {selected.length > 0 && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-brand/15 text-brand font-semibold">
                  {totalPieces} pcs selected
                </span>
              )}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    <th className="w-10 px-4 py-3">
                      <input type="checkbox" onChange={toggleAll} checked={stock.length > 0 && stock.every(r => r.selected)}
                        title="Select all lots"
                        className="w-3.5 h-3.5 rounded accent-[#F7941D]" />
                    </th>
                    {["Lot Ref", "Description", "Pieces", "Location", "Days", "Condition", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stock.map((row) => (
                    <tr key={row.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors cursor-pointer", row.selected && "bg-brand/5")}
                      onClick={() => toggleRow(row.id)}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={row.selected} onChange={() => toggleRow(row.id)} onClick={e => e.stopPropagation()}
                          title={`Select ${row.lotRef}`}
                          className="w-3.5 h-3.5 rounded accent-[#F7941D]" />
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-brand font-semibold">{row.lotRef}</td>
                      <td className="px-4 py-3 text-xs font-medium text-foreground">{row.desc}</td>
                      <td className="px-4 py-3 text-sm font-bold text-foreground">{row.pieces}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{row.location}</td>
                      <td className="px-4 py-3">
                        <span className={cn("text-xs font-semibold", row.days > 60 ? "text-danger" : row.days > 30 ? "text-warning" : "text-foreground")}>
                          {row.days}d
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">{row.condition}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={e => { e.stopPropagation(); setLotDetail(row) }} title="View lot details"
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {stock.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No stock lots on hand for {customer}.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Release history */}
          <div className="mt-6 rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-border">
              <h2 className="text-sm font-bold text-foreground">Release History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/20">
                    {["Release", "Customer", "Lots", "Pieces", "Mode", "Charge", "Time", ""].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dispatches.map((d, i) => (
                    <tr key={d.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{d.id}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-foreground">{d.customer}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-muted-foreground">{d.lots}</td>
                      <td className="px-4 py-3 text-sm font-bold text-foreground">{d.pieces}</td>
                      <td className="px-4 py-3 text-xs text-foreground">{d.mode}</td>
                      <td className="px-4 py-3 text-xs font-bold text-brand">₹{d.charge.toLocaleString()}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{d.time}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => setDispatchDetail(d)} title="View release details"
                          className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {dispatches.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-10 text-center text-sm text-muted-foreground">No releases dispatched yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Release panel */}
        <div className="space-y-4">
          <div className={cn("rounded-xl border bg-card p-5 transition-all",
            selected.length > 0 ? "border-brand/40 shadow-sm shadow-brand/10" : "border-border opacity-60")}>
            <h3 className="text-sm font-bold text-foreground mb-4">Release Panel</h3>
            {selected.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Select pieces from the stock table to proceed</p>
            ) : (
              <>
                <div className="p-3 rounded-lg bg-brand/10 border border-brand/20 mb-4">
                  <p className="text-xs text-brand font-semibold">{totalPieces} pieces from {selected.length} lot(s) selected</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Customer: {customer}</p>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Release Mode</p>
                  <div className="space-y-2">
                    {modes.map(m => (
                      <button key={m.id} onClick={() => setMode(m.id)}
                        className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg border transition-all text-sm font-medium",
                          mode === m.id ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground")}>
                        <span className={mode === m.id ? "text-brand" : "text-muted-foreground"}>{m.icon}</span>
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(mode === "local" || mode === "courier") && (
                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ship-To Address</label>
                    <input value={shipto} onChange={e => setShipto(e.target.value)} placeholder="Enter delivery address..."
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                  </div>
                )}

                {mode === "pickup" && (
                  <div className="mb-4">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">POD Capture</label>
                    <button onClick={capturePod} title="Capture proof of delivery"
                      className={cn("w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed text-sm transition-colors",
                        pod ? "border-success/50 text-success" : "border-border text-muted-foreground hover:border-brand/40 hover:text-foreground")}>
                      {pod ? <Check className="w-4 h-4" /> : <Camera className="w-4 h-4" />} {pod ? "POD Captured" : "Photo / Signature / OTP"}
                    </button>
                    <input value={pod} onChange={e => setPod(e.target.value)} placeholder="OTP or signature ref..."
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                  </div>
                )}

                <button onClick={handleRelease} disabled={!mode}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#F7941D]/20">
                  <CheckCircle2 className="w-4 h-4" /> Confirm Release
                </button>
              </>
            )}
          </div>

          {released && (
            <>
              <div className="py-3 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-bold text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Released Successfully
              </div>
              <div className="p-4 rounded-xl border border-border bg-card">
                <p className="text-xs font-bold text-foreground mb-2">Handling Charge</p>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Release handling</span>
                  <span className="font-bold text-brand">₹{(releasedPieces * HANDLING_PER_PIECE).toLocaleString()}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1.5">Emitted as billable event · {releasedPieces} pcs × ₹{HANDLING_PER_PIECE}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New release dispatch */}
      <Modal
        open={dispatchOpen}
        onOpenChange={(o) => { setDispatchOpen(o); if (!o) { setDispatchForm(emptyDispatchForm); setDispatchErrors({}) } }}
        title="New Release Dispatch"
        description="Raise a release dispatch against customer stock"
        footer={<ModalActions onCancel={() => setDispatchOpen(false)} onSubmit={createDispatch} submitLabel="Dispatch Release" />}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Customer" required error={dispatchErrors.customer}>
            <Select value={dispatchForm.customer} invalid={!!dispatchErrors.customer} onChange={e => setDispatchForm({ ...dispatchForm, customer: e.target.value })} options={customers2} placeholder="Select Customer" />
          </Field>
          <Field label="Lot Reference" required error={dispatchErrors.lotRef}>
            <TextInput value={dispatchForm.lotRef} invalid={!!dispatchErrors.lotRef} onChange={e => setDispatchForm({ ...dispatchForm, lotRef: e.target.value })} placeholder="e.g. PF-LOT-004" />
          </Field>
          <Field label="Description" required error={dispatchErrors.desc}>
            <TextInput value={dispatchForm.desc} invalid={!!dispatchErrors.desc} onChange={e => setDispatchForm({ ...dispatchForm, desc: e.target.value })} placeholder="e.g. Cotton Sarees (Assorted)" />
          </Field>
          <Field label="Pieces" required error={dispatchErrors.pieces}>
            <TextInput value={dispatchForm.pieces} invalid={!!dispatchErrors.pieces} onChange={e => setDispatchForm({ ...dispatchForm, pieces: e.target.value })} placeholder="e.g. 24" inputMode="numeric" />
          </Field>
          <Field label="Pick Location" required error={dispatchErrors.location}>
            <TextInput value={dispatchForm.location} invalid={!!dispatchErrors.location} onChange={e => setDispatchForm({ ...dispatchForm, location: e.target.value })} placeholder="e.g. Zone A / Rack 3" />
          </Field>
          <Field label="Release Mode" required error={dispatchErrors.mode}>
            <Select value={dispatchForm.mode} invalid={!!dispatchErrors.mode} onChange={e => setDispatchForm({ ...dispatchForm, mode: e.target.value })} options={["Pickup", "Local Delivery", "Courier"]} placeholder="Select Mode" />
          </Field>
          {dispatchForm.mode && dispatchForm.mode !== "Pickup" && (
            <Field label="Ship-To Address" required error={dispatchErrors.destination}>
              <TextInput value={dispatchForm.destination} invalid={!!dispatchErrors.destination} onChange={e => setDispatchForm({ ...dispatchForm, destination: e.target.value })} placeholder="Enter delivery address..." />
            </Field>
          )}
        </div>
      </Modal>

      {/* Stock lot detail */}
      <Drawer
        open={!!lotDetail}
        onOpenChange={(o) => !o && setLotDetail(null)}
        title={lotDetail?.lotRef ?? ""}
        description="Customer stock lot detail"
        footer={
          <button onClick={() => setLotDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {lotDetail && (
          <div className="space-y-1">
            <DetailRow label="Lot Reference" value={<span className="font-mono text-brand">{lotDetail.lotRef}</span>} />
            <DetailRow label="Customer" value={customer} />
            <DetailRow label="Description" value={lotDetail.desc} />
            <DetailRow label="Pieces" value={`${lotDetail.pieces} pcs`} />
            <DetailRow label="Location" value={lotDetail.location} />
            <DetailRow label="Days Stored" value={
              <span className={cn("font-semibold", lotDetail.days > 60 ? "text-danger" : lotDetail.days > 30 ? "text-warning" : "text-foreground")}>{lotDetail.days}d</span>
            } />
            <DetailRow label="Condition" value={
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-success/15 text-success font-semibold">{lotDetail.condition}</span>
            } />
            <DetailRow label="Storage Charge" value={`₹${(lotDetail.pieces * lotDetail.days * 5).toLocaleString()}`} />
            <DetailRow label="Handling If Released" value={`₹${(lotDetail.pieces * HANDLING_PER_PIECE).toLocaleString()}`} />
          </div>
        )}
      </Drawer>

      {/* Dispatch detail */}
      <Drawer
        open={!!dispatchDetail}
        onOpenChange={(o) => !o && setDispatchDetail(null)}
        title={dispatchDetail?.id ?? ""}
        description="Release dispatch detail"
        footer={
          <button onClick={() => setDispatchDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {dispatchDetail && (
          <div className="space-y-1">
            <DetailRow label="Release ID" value={<span className="font-mono text-brand">{dispatchDetail.id}</span>} />
            <DetailRow label="Customer" value={dispatchDetail.customer} />
            <DetailRow label="Lots" value={<span className="font-mono text-xs">{dispatchDetail.lots}</span>} />
            <DetailRow label="Pieces" value={`${dispatchDetail.pieces} pcs`} />
            <DetailRow label="Release Mode" value={dispatchDetail.mode} />
            <DetailRow label="Destination" value={dispatchDetail.destination} />
            <DetailRow label="POD Reference" value={<span className="font-mono text-xs">{dispatchDetail.pod}</span>} />
            <DetailRow label="Handling Charge" value={<span className="font-bold text-brand">₹{dispatchDetail.charge.toLocaleString()}</span>} />
            <DetailRow label="Dispatched At" value={dispatchDetail.time} />
          </div>
        )}
      </Drawer>

      {/* Release confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm this release?"
        message={`${totalPieces} pieces across ${selected.length} lot(s) will be released to ${customer} via ${MODE_LABEL[mode] ?? mode}. A ₹${(totalPieces * HANDLING_PER_PIECE).toLocaleString()} handling charge will be raised. This cannot be undone.`}
        confirmLabel="Confirm Release"
        cancelLabel="Go Back"
        tone="brand"
        onConfirm={confirmRelease}
      />
    </div>
  )
}
