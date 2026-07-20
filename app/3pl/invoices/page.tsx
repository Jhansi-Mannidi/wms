"use client"

import { useState } from "react"
import { FileCheck, Send, ChevronDown, ChevronRight, CheckCircle2, Clock, AlertCircle, Package, Truck, Wrench, DollarSign, Plus } from "lucide-react"
import { cn } from "@/lib/utils"

const draftInvoices = [
  { id: "INV-2025-089", client: "Apex Pharma Ltd", clientInit: "AP", clientColor: "bg-blue-500", total: 24680, gst: 4442, grandTotal: 29122, status: "Draft", period: "Jul 2025" },
  { id: "INV-2025-090", client: "GlobalTex Fabrics", clientInit: "GT", clientColor: "bg-amber-500", total: 18450, gst: 3321, grandTotal: 21771, status: "Draft", period: "Jul 2025" },
  { id: "INV-2025-091", client: "AutoParts India", clientInit: "AI", clientColor: "bg-cyan-500", total: 11200, gst: 2016, grandTotal: 13216, status: "Under Review", period: "Jul 2025" },
  { id: "INV-2025-092", client: "MediSupply Corp", clientInit: "MS", clientColor: "bg-rose-500", total: 32000, gst: 5760, grandTotal: 37760, status: "Draft", period: "Jul 2025" },
]

const lineItems = {
  Storage: [
    { desc: "Pallet storage (24 pallet-days @ ₹45)", qty: 24, rate: 45, amount: 1080 },
    { desc: "Rack storage (180 pallet-days @ ₹38)", qty: 180, rate: 38, amount: 6840 },
    { desc: "Cold storage (10 days @ ₹120)", qty: 10, rate: 120, amount: 1200 },
  ],
  Handling: [
    { desc: "Inbound receipt (480 pcs @ ₹2.5)", qty: 480, rate: 2.5, amount: 1200 },
    { desc: "Outbound dispatch (320 pcs @ ₹3)", qty: 320, rate: 3, amount: 960 },
  ],
  VAS: [
    { desc: "Kitting service (50 units @ ₹35)", qty: 50, rate: 35, amount: 1750 },
    { desc: "Labelling (200 units @ ₹8)", qty: 200, rate: 8, amount: 1600 },
  ],
  Ancillary: [
    { desc: "Temperature monitoring surcharge", qty: 1, rate: 5000, amount: 5000 },
  ],
}

const sectionIcons: Record<string, React.ReactNode> = {
  Storage: <Package className="w-4 h-4 text-blue-400" />,
  Handling: <Truck className="w-4 h-4 text-amber-400" />,
  VAS: <Wrench className="w-4 h-4 text-violet-400" />,
  Ancillary: <DollarSign className="w-4 h-4 text-rose-400" />,
}

const statusColors: Record<string, string> = {
  Draft: "bg-muted text-muted-foreground",
  "Under Review": "bg-warning/15 text-warning",
  Issued: "bg-success/15 text-success",
}

export default function InvoiceRunPage() {
  const [selectedInv, setSelectedInv] = useState(draftInvoices[0])
  const [expanded, setExpanded] = useState<string[]>(["Storage", "Handling"])
  const [discount, setDiscount] = useState(0)

  const subtotal = Object.values(lineItems).flat().reduce((s, l) => s + l.amount, 0)
  const gst = Math.round((subtotal - discount) * 0.18)
  const grandTotal = subtotal - discount + gst

  const toggleSection = (s: string) =>
    setExpanded(e => e.includes(s) ? e.filter(x => x !== s) : [...e, s])

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex gap-5 h-full">
        {/* Left — draft invoice list */}
        <div className="w-72 shrink-0 flex flex-col gap-3">
          <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-bold text-foreground">Draft Invoices</p>
            <span className="text-xs text-muted-foreground">Jul 2025</span>
          </div>
          {draftInvoices.map(inv => (
            <button key={inv.id} onClick={() => setSelectedInv(inv)}
              className={cn("w-full text-left p-4 rounded-xl border transition-all", selectedInv.id === inv.id ? "border-brand bg-brand/10" : "border-border bg-card hover:border-brand/40")}>
              <div className="flex items-center gap-2 mb-2">
                <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0", inv.clientColor)}>{inv.clientInit}</div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{inv.client}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{inv.id}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-foreground">₹{inv.grandTotal.toLocaleString()}</span>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", statusColors[inv.status])}>{inv.status}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Right — invoice builder */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {/* Invoice header */}
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileCheck className="w-5 h-5 text-brand" />
                  <span className="font-bold text-foreground">{selectedInv.id}</span>
                  <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", statusColors[selectedInv.status])}>{selectedInv.status}</span>
                </div>
                <p className="text-xs text-muted-foreground">Period: {selectedInv.period} · GSTIN: 29AAPCA1234A1Z5 · Place of Supply: Maharashtra</p>
              </div>
              <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold", selectedInv.clientColor)}>{selectedInv.clientInit}</div>
            </div>
            <p className="text-sm font-semibold text-foreground">{selectedInv.client}</p>
          </div>

          {/* Line item sections */}
          <div className="flex-1 space-y-3">
            {(Object.keys(lineItems) as Array<keyof typeof lineItems>).map(section => (
              <div key={section} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => toggleSection(section)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors">
                  <div className="flex items-center gap-2">
                    {sectionIcons[section]}
                    <span className="text-sm font-semibold text-foreground">{section}</span>
                    <span className="text-xs text-muted-foreground">({lineItems[section].length} items)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">₹{lineItems[section].reduce((s, l) => s + l.amount, 0).toLocaleString()}</span>
                    {expanded.includes(section) ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {expanded.includes(section) && (
                  <div className="border-t border-border">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-border/50 bg-muted/20">
                          {["Description", "Qty", "Rate (₹)", "Amount (₹)"].map(h => (
                            <th key={h} className="px-4 py-2 text-left text-[11px] font-semibold text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lineItems[section].map((l, i) => (
                          <tr key={i} className="border-b border-border/30 last:border-0 hover:bg-muted/10">
                            <td className="px-4 py-2 text-foreground">{l.desc}</td>
                            <td className="px-4 py-2 text-muted-foreground">{l.qty}</td>
                            <td className="px-4 py-2 text-muted-foreground">₹{l.rate}</td>
                            <td className="px-4 py-2 font-semibold text-foreground">₹{l.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Summary panel */}
          <div className="p-5 rounded-xl border border-brand/30 bg-brand/5">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold text-foreground">₹{subtotal.toLocaleString()}</span></div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Discount / Adjustment</span>
                <div className="flex items-center gap-1">
                  <span className="text-muted-foreground">₹</span>
                  <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} className="w-24 text-right bg-background border border-border rounded-md px-2 py-1 text-sm outline-none focus:border-brand" />
                </div>
              </div>
              <div className="flex justify-between"><span className="text-muted-foreground">GST @ 18% (HSN 9965)</span><span className="font-semibold text-foreground">₹{gst.toLocaleString()}</span></div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold text-foreground">Grand Total</span>
                <span className="text-xl font-bold text-brand">₹{grandTotal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90 transition-colors">
              <CheckCircle2 className="w-4 h-4" /> Approve & Issue
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Send className="w-4 h-4" /> Send to Client Portal
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
              <Plus className="w-4 h-4" /> Post to Accounting
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
