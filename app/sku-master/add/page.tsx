"use client"
import { Save, X } from "lucide-react"
import Link from "next/link"

export default function SKUAddPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Add New SKU</h1><p className="text-sm text-muted-foreground mt-1">Create a new product record in the SKU master</p></div>
        <div className="flex gap-2">
          <Link href="/sku-master"><button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors"><X className="w-4 h-4" /> Cancel</button></Link>
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Save className="w-4 h-4" /> Save SKU</button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-5">
        {[
          { group:"Basic Information", fields:[{label:"SKU Code",placeholder:"e.g. SKU-001242"},{label:"Product Name",placeholder:"Full product name"},{label:"Category",placeholder:"Select category"},{label:"Brand",placeholder:"Brand name"}]},
          { group:"Dimensions & Weight", fields:[{label:"Length (cm)",placeholder:"0.00"},{label:"Width (cm)",placeholder:"0.00"},{label:"Height (cm)",placeholder:"0.00"},{label:"Weight (kg)",placeholder:"0.00"}]},
          { group:"Storage", fields:[{label:"Storage Type",placeholder:"Ambient / Cold / Frozen"},{label:"Reorder Point",placeholder:"Min quantity to trigger reorder"},{label:"Max Stock",placeholder:"Maximum stock level"},{label:"Shelf Life (days)",placeholder:"Leave blank if N/A"}]},
          { group:"Identification", fields:[{label:"Barcode / EAN",placeholder:"13-digit barcode"},{label:"HSN Code",placeholder:"Harmonised code"},{label:"Unit of Measure",placeholder:"PCS / KG / LTR"},{label:"MRP (₹)",placeholder:"Maximum retail price"}]},
        ].map(g=>(
          <div key={g.group} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-border"><p className="font-semibold text-sm text-foreground">{g.group}</p></div>
            <div className="p-4 space-y-3">
              {g.fields.map(f=>(
                <div key={f.label}>
                  <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
                  <input placeholder={f.placeholder} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-brand/30" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
