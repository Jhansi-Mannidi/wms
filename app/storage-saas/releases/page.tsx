"use client"

import { useState } from "react"
import { CheckCircle2, Camera, Package, Truck, ShoppingBag, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const customers2 = ["Priya Fashion Store", "TechGadgets Ltd", "Spice & Grain Co.", "MedEquip Traders", "Rajesh Kumar"]

interface StockRow { id: string; lotRef: string; desc: string; pieces: number; location: string; days: number; condition: string; selected: boolean }

const stockData: StockRow[] = [
  { id: "s1", lotRef: "PF-LOT-001", desc: "Cotton Sarees (Assorted)", pieces: 24, location: "Zone A / Rack 3", days: 42, condition: "Good", selected: false },
  { id: "s2", lotRef: "PF-LOT-002", desc: "Silk Dupattas", pieces: 36, location: "Zone A / Rack 4", days: 38, condition: "Good", selected: false },
  { id: "s3", lotRef: "PF-LOT-003", desc: "Embroidered Blouses", pieces: 28, location: "Zone B / Shelf 2", days: 15, condition: "Good", selected: false },
]

const modes = [
  { id: "pickup", label: "Pickup", icon: <ShoppingBag className="w-4 h-4" /> },
  { id: "local", label: "Local Delivery", icon: <Truck className="w-4 h-4" /> },
  { id: "courier", label: "Courier", icon: <Package className="w-4 h-4" /> },
]

export default function StorageReleasesPage() {
  const [customer, setCustomer] = useState("Priya Fashion Store")
  const [stock, setStock] = useState<StockRow[]>(stockData)
  const [mode, setMode] = useState("")
  const [shipto, setShipto] = useState("")
  const [pod, setPod] = useState("")
  const [released, setReleased] = useState(false)

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

  const handleRelease = () => { if (selected.length && mode) setReleased(true) }

  return (
    <div className="p-6 w-full">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground">Customer Stock & Release</h1>
        <p className="text-sm text-muted-foreground mt-0.5">View per-customer stock and confirm piece releases</p>
      </div>

      {/* Customer selector */}
      <div className="flex items-center gap-3 mb-6 p-4 rounded-xl border border-border bg-card">
        <UserCircle className="w-5 h-5 text-brand shrink-0" />
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</span>
        <select value={customer} onChange={e => { setCustomer(e.target.value); setReleased(false); setStock(stockData) }}
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
          <div key={k.label} className="p-4 rounded-xl border border-border bg-card text-center">
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
                        className="w-3.5 h-3.5 rounded accent-[#F7941D]" />
                    </th>
                    {["Lot Ref", "Description", "Pieces", "Location", "Days", "Condition"].map(h => (
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
                    </tr>
                  ))}
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
                    <button className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border text-muted-foreground text-sm hover:border-brand/40 hover:text-foreground transition-colors">
                      <Camera className="w-4 h-4" /> Photo / Signature / OTP
                    </button>
                    <input value={pod} onChange={e => setPod(e.target.value)} placeholder="OTP or signature ref..."
                      className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-sm outline-none focus:border-brand" />
                  </div>
                )}

                {!released ? (
                  <button onClick={handleRelease} disabled={!mode}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F7941D] text-white text-sm font-bold hover:bg-[#F7941D]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-lg shadow-[#F7941D]/20">
                    <CheckCircle2 className="w-4 h-4" /> Confirm Release
                  </button>
                ) : (
                  <div className="py-3 rounded-xl bg-success/15 border border-success/30 text-success text-sm font-bold text-center flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Released Successfully
                  </div>
                )}
              </>
            )}
          </div>

          {released && (
            <div className="p-4 rounded-xl border border-border bg-card">
              <p className="text-xs font-bold text-foreground mb-2">Handling Charge</p>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Release handling</span>
                <span className="font-bold text-brand">₹{(totalPieces * 25).toLocaleString()}</span>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">Emitted as billable event · {totalPieces} pcs × ₹25</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
