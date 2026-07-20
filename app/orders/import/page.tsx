"use client"
import { useState } from "react"
import { Upload, FileText, CheckCircle2, AlertTriangle, Download } from "lucide-react"

export default function OrderImportPage() {
  const [dragging, setDragging] = useState(false)
  const logs = [
    { file: "orders_batch_20240720.csv", rows: 48, success: 46, errors: 2, time: "09:14 AM", status: "Completed" },
    { file: "orders_batch_20240719.csv", rows: 32, success: 32, errors: 0, time: "Yesterday 08:55 AM", status: "Completed" },
    { file: "orders_emergency_20240718.csv", rows: 5, success: 5, errors: 0, time: "2024-07-18 14:00", status: "Completed" },
  ]
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bulk Import</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Import orders in bulk via CSV upload</p>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragging ? "border-brand bg-brand/5" : "border-border"}`}
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false) }}>
          <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold text-foreground">Drag & drop your CSV file here</p>
          <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
          <button className="mt-4 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">Browse File</button>
        </div>
        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <p className="font-semibold text-foreground">Template & Requirements</p>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Required columns: <span className="font-mono text-xs text-foreground">order_id, client, sku, qty, ship_to, sla_date</span></p>
            <p>Optional columns: <span className="font-mono text-xs text-foreground">priority, courier, notes</span></p>
            <p>Max file size: 10 MB</p>
            <p>Max rows per file: 5,000</p>
          </div>
          <button className="flex items-center gap-2 text-brand text-sm font-medium hover:underline">
            <Download className="w-4 h-4" /> Download template CSV
          </button>
        </div>
      </div>
      <div>
        <p className="font-semibold text-foreground mb-3">Recent Imports</p>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/30">
              <tr>{["File", "Rows", "Success", "Errors", "Time", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {logs.map(l => (
                <tr key={l.file} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 flex items-center gap-2 text-foreground"><FileText className="w-4 h-4 text-muted-foreground" />{l.file}</td>
                  <td className="px-4 py-3 text-foreground">{l.rows}</td>
                  <td className="px-4 py-3 text-success font-semibold">{l.success}</td>
                  <td className="px-4 py-3"><span className={l.errors > 0 ? "text-danger font-semibold" : "text-muted-foreground"}>{l.errors}</span></td>
                  <td className="px-4 py-3 text-muted-foreground">{l.time}</td>
                  <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success">{l.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
