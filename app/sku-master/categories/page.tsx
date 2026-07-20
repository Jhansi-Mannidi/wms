"use client"
import { Tag, Plus } from "lucide-react"

const categories = [
  { id:"CAT-001",name:"Food & Beverage",parent:null,skus:412,active:true},
  { id:"CAT-002",name:"FMCG",parent:null,skus:318,active:true},
  { id:"CAT-003",name:"Pharma",parent:null,skus:204,active:true},
  { id:"CAT-004",name:"Electronics",parent:null,skus:156,active:true},
  { id:"CAT-005",name:"Apparel",parent:null,skus:287,active:true},
  { id:"CAT-006",name:"Industrial",parent:null,skus:98,active:true},
  { id:"CAT-007",name:"Beverages",parent:"Food & Beverage",skus:82,active:true},
  { id:"CAT-008",name:"Dairy",parent:"Food & Beverage",skus:55,active:false},
]

export default function SKUCategoriesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">SKU Categories</h1><p className="text-sm text-muted-foreground mt-1">Manage product category hierarchy</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Category</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Category","Parent","SKU Count","Status"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {categories.map(c=>(
              <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{c.id}</td>
                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2"><Tag className="w-4 h-4 text-muted-foreground" />{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.parent ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.skus}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.active?"bg-success/10 text-success":"bg-muted text-muted-foreground"}`}>{c.active?"Active":"Inactive"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
