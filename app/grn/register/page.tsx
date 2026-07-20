"use client"
import { useState } from "react"
import { Plus, Truck, Save } from "lucide-react"

export default function GRNRegisterPage() {
  const [items, setItems] = useState([{ sku: "", product: "", expectedQty: "", receivedQty: "", condition: "Good" }])

  const addItem = () => setItems(prev => [...prev, { sku: "", product: "", expectedQty: "", receivedQty: "", condition: "Good" }])

  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">New GRN</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Register a new goods receipt note</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="font-semibold text-foreground">Shipment Details</p>
          {[
            { label: "ASN / PO Number", placeholder: "e.g. ASN-2024-0881" },
            { label: "Supplier", placeholder: "Supplier name" },
            { label: "Truck / Vehicle No.", placeholder: "e.g. TS 09 AB 1234" },
            { label: "Dock", placeholder: "e.g. Dock 1" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
          ))}
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="font-semibold text-foreground">Receipt Info</p>
          {[
            { label: "Received Date", type: "date" },
            { label: "Received Time", type: "time" },
            { label: "Received By", placeholder: "Staff name" },
          ].map(f => (
            <div key={f.label}>
              <label className="text-xs font-medium text-muted-foreground block mb-1">{f.label}</label>
              <input type={f.type || "text"} placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">Notes</label>
            <textarea rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-brand/30 resize-none" />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-foreground">Line Items</p>
          <button onClick={addItem} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand/10 text-brand text-sm font-medium hover:bg-brand/20 transition-colors"><Plus className="w-4 h-4" /> Add Item</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border"><tr>{["SKU", "Product Name", "Expected Qty", "Received Qty", "Condition"].map(h => <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody className="divide-y divide-border">
              {items.map((item, i) => (
                <tr key={i}>
                  <td className="px-3 py-2"><input value={item.sku} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, sku: e.target.value } : it))} placeholder="SKU-XXXXXX" className="w-28 px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30" /></td>
                  <td className="px-3 py-2"><input value={item.product} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, product: e.target.value } : it))} placeholder="Product name" className="w-48 px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30" /></td>
                  <td className="px-3 py-2"><input value={item.expectedQty} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, expectedQty: e.target.value } : it))} placeholder="0" className="w-20 px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30" /></td>
                  <td className="px-3 py-2"><input value={item.receivedQty} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, receivedQty: e.target.value } : it))} placeholder="0" className="w-20 px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none focus:ring-1 focus:ring-brand/30" /></td>
                  <td className="px-3 py-2">
                    <select value={item.condition} onChange={e => setItems(p => p.map((it, idx) => idx === i ? { ...it, condition: e.target.value } : it))} className="px-2 py-1 rounded border border-border bg-background text-xs focus:outline-none">
                      {["Good", "Damaged", "Short", "Excess"].map(c => <option key={c}>{c}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button className="px-4 py-2 rounded-lg border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save GRN</button>
      </div>
    </div>
  )
}
