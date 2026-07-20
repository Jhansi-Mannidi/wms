"use client"

import { useState } from "react"
import { Search, Plus, Filter, Eye, Edit, MoreHorizontal, UserCircle, Phone, Mail } from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { cn } from "@/lib/utils"

const customers = [
  { id: "CS001", name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@example.com", pieces: 24, days: 15, charges: 3600, initials: "RK", color: "bg-blue-500", status: "Active" },
  { id: "CS002", name: "Priya Fashion Store", phone: "+91 87654 32109", email: "priya@fashionstore.in", pieces: 88, days: 42, charges: 21120, initials: "PF", color: "bg-emerald-500", status: "Active" },
  { id: "CS003", name: "TechGadgets Ltd", phone: "+91 76543 21098", email: "info@techgadgets.co", pieces: 12, days: 7, charges: 1680, initials: "TG", color: "bg-violet-500", status: "Active" },
  { id: "CS004", name: "Spice & Grain Co.", phone: "+91 65432 10987", email: "spicegrain@gmail.com", pieces: 56, days: 28, charges: 10080, initials: "SG", color: "bg-amber-500", status: "Active" },
  { id: "CS005", name: "HomeDecor Palace", phone: "+91 54321 09876", email: "palace@homedecor.in", pieces: 0, days: 90, charges: 14400, initials: "HD", color: "bg-rose-500", status: "Inactive" },
  { id: "CS006", name: "MedEquip Traders", phone: "+91 43210 98765", email: "medequip@traders.com", pieces: 34, days: 21, charges: 7140, initials: "ME", color: "bg-orange-500", status: "Active" },
]

export default function StorageCustomersPage() {
  const [search, setSearch] = useState("")
  const [view, setView] = useState<"table" | "card">("table")

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  )

  const active = customers.filter(c => c.status === "Active").length
  const totalPieces = customers.reduce((s, c) => s + c.pieces, 0)
  const totalRevenue = customers.reduce((s, c) => s + c.charges, 0)

  return (
    <div className="p-6">
      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Customers", value: active, sub: `${customers.length} total`, color: "text-brand" },
          { label: "Total Pieces On Hand", value: totalPieces, sub: "Across all customers", color: "text-foreground" },
          { label: "Revenue MTD", value: `₹${(totalRevenue / 1000).toFixed(1)}K`, sub: "Accrued charges", color: "text-success" },
          { label: "Overdue Accounts", value: 1, sub: "Requires attention", color: "text-danger" },
        ].map(k => (
          <div key={k.label} className="p-4 rounded-xl border border-border bg-card">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={cn("text-2xl font-bold", k.color)}>{k.value}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-xs px-3 py-2 rounded-lg border border-border bg-card">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..."
            className="bg-transparent text-sm outline-none w-full placeholder:text-muted-foreground/60" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-card text-sm text-muted-foreground hover:text-foreground">
          <Filter className="w-4 h-4" /> Filter
        </button>
        <ExportButton data={filtered.map(c => ({ id: c.id, name: c.name, phone: c.phone, email: c.email, pieces: c.pieces, days: c.days, charges: c.charges, status: c.status }))} filename="storage-customers" />
        <div className="flex gap-1 ml-auto">
          {(["table","card"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={cn("px-3 py-2 rounded-lg border text-xs font-medium capitalize transition-colors",
                view === v ? "bg-brand border-brand text-white" : "border-border text-muted-foreground")}>
              {v}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#F7941D] text-white text-sm font-medium hover:bg-[#F7941D]/90">
          <Plus className="w-4 h-4" /> New Customer
        </button>
      </div>

      {view === "table" ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/20">
                  {["Customer", "Contact", "Pieces On Hand", "Days Stored", "Charges (₹)", "Status", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id} className={cn("border-b border-border/40 hover:bg-muted/20 transition-colors", i % 2 === 1 && "bg-muted/5")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0", c.color)}>{c.initials}</div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{c.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Phone className="w-2.5 h-2.5" />{c.phone}</div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Mail className="w-2.5 h-2.5" />{c.email}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-foreground">{c.pieces}</td>
                    <td className="px-4 py-3 text-sm text-foreground">{c.days}d</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground">₹{c.charges.toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full",
                        c.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-brand transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                        <button className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground transition-colors"><MoreHorizontal className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Showing 1–{filtered.length} of {filtered.length} customers</span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(c => (
            <div key={c.id} className="p-5 rounded-xl border border-border bg-card hover:border-brand/40 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-full flex items-center justify-center text-white font-bold", c.color)}>{c.initials}</div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground font-mono">{c.id}</p>
                  </div>
                </div>
                <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-semibold", c.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>{c.status}</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-muted-foreground"><span>Pieces On Hand</span><span className="font-bold text-foreground">{c.pieces}</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Days Stored</span><span className="text-foreground">{c.days}d</span></div>
                <div className="flex justify-between text-muted-foreground"><span>Accrued Charges</span><span className="font-bold text-brand">₹{c.charges.toLocaleString()}</span></div>
              </div>
              <div className="mt-3 pt-3 border-t border-border flex gap-2">
                <button className="flex-1 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:border-brand/40 transition-colors">View Stock</button>
                <button className="flex-1 py-1.5 rounded-lg bg-[#F7941D] text-white text-xs font-medium hover:bg-[#F7941D]/90 transition-colors">Release</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
