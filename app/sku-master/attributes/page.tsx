"use client"
import { Plus, Settings } from "lucide-react"

const attributes = [
  { id:"ATTR-001",name:"Colour",type:"Text",required:false,skus:287,example:"Red, Blue, Green"},
  { id:"ATTR-002",name:"Size",type:"Text",required:false,skus:312,example:"S, M, L, XL"},
  { id:"ATTR-003",name:"Material",type:"Text",required:false,skus:142,example:"Cotton, Polyester"},
  { id:"ATTR-004",name:"Shelf Life",type:"Number",required:true,skus:412,example:"180 (days)"},
  { id:"ATTR-005",name:"Storage Temp",type:"Select",required:true,skus:204,example:"Ambient, Cold, Frozen"},
  { id:"ATTR-006",name:"Hazardous",type:"Boolean",required:true,skus:98,example:"Yes / No"},
  { id:"ATTR-007",name:"Country of Origin",type:"Text",required:false,skus:1420,example:"India, China, USA"},
]

export default function SKUAttributesPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">SKU Attributes</h1><p className="text-sm text-muted-foreground mt-1">Custom attributes and metadata fields for products</p></div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors"><Plus className="w-4 h-4" /> Add Attribute</button>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50"><tr>{["ID","Attribute","Type","Required","SKUs Using","Example Values"].map(h=><th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr></thead>
          <tbody className="divide-y divide-border">
            {attributes.map(a=>(
              <tr key={a.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs text-brand">{a.id}</td>
                <td className="px-4 py-3 font-medium text-foreground flex items-center gap-2"><Settings className="w-3.5 h-3.5 text-muted-foreground" />{a.name}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-muted text-xs font-mono text-muted-foreground">{a.type}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-xs font-medium ${a.required?"bg-brand/10 text-brand":"bg-muted text-muted-foreground"}`}>{a.required?"Required":"Optional"}</span></td>
                <td className="px-4 py-3 text-muted-foreground">{a.skus.toLocaleString()}</td>
                <td className="px-4 py-3 text-muted-foreground text-xs">{a.example}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
