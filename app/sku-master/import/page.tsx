"use client"
import { Upload, Download, FileText, CheckCircle2, AlertTriangle } from "lucide-react"

export default function SKUImportPage() {
  return (
    <div className="p-6 space-y-6">
      <div><h1 className="text-2xl font-bold text-foreground">Import SKUs</h1><p className="text-sm text-muted-foreground mt-1">Bulk upload products via CSV or Excel template</p></div>
      <div className="grid grid-cols-3 gap-5">
        <div className="col-span-2 space-y-5">
          <div className="bg-card border border-border rounded-xl p-6">
            <p className="font-semibold text-sm text-foreground mb-4">Upload File</p>
            <div className="border-2 border-dashed border-border rounded-xl p-10 flex flex-col items-center justify-center gap-3 hover:border-brand/50 transition-colors cursor-pointer">
              <Upload className="w-10 h-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Drop CSV or Excel file here</p>
              <p className="text-xs text-muted-foreground">Supports .csv, .xlsx — max 10 MB</p>
              <button className="px-4 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">Browse File</button>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-semibold text-sm text-foreground mb-3">Last Import — Jul 14 2025</p>
            <div className="space-y-2">
              {[{ icon:<CheckCircle2 className="w-4 h-4 text-success"/>, text:"480 SKUs imported successfully"},{icon:<AlertTriangle className="w-4 h-4 text-amber-500"/>, text:"12 rows skipped — missing required fields"},{icon:<AlertTriangle className="w-4 h-4 text-danger"/>, text:"3 duplicate SKU codes rejected"}].map((r,i)=>(
                <div key={i} className="flex items-center gap-2 text-sm">{r.icon}<span className="text-muted-foreground">{r.text}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="font-semibold text-sm text-foreground mb-3">Download Template</p>
            <p className="text-xs text-muted-foreground mb-4">Use our official template to ensure correct column mapping</p>
            {["CSV Template","Excel Template"].map(t=>(
              <button key={t} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors mb-2">
                <Download className="w-4 h-4 text-brand" />{t}
              </button>
            ))}
          </div>
          <div className="bg-muted/40 border border-border rounded-xl p-4">
            <p className="font-semibold text-xs text-foreground mb-2">Required Columns</p>
            {["SKU Code","Product Name","Category","UOM","Weight (kg)"].map(c=>(
              <p key={c} className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1"><span className="w-1 h-1 rounded-full bg-brand inline-block" />{c}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
