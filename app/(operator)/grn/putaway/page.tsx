"use client"
import { cn } from "@/lib/utils"
import { PackageCheck } from "lucide-react"

const tasks = [
  { id: "PUT-2024-0441", grn: "GRN-2024-1050", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 500, suggestedLoc: "A-12-03", assignedTo: "Ravi Kumar", started: "10:15 AM", status: "In Progress" },
  { id: "PUT-2024-0440", grn: "GRN-2024-1050", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 2000, suggestedLoc: "A-04-11", assignedTo: "Priya Sharma", started: "10:30 AM", status: "Pending" },
  { id: "PUT-2024-0439", grn: "GRN-2024-1049", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 200, suggestedLoc: "A-12-04", assignedTo: "Suresh Yadav", started: "09:00 AM", status: "Completed" },
  { id: "PUT-2024-0438", grn: "GRN-2024-1049", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 100, suggestedLoc: "C-03-07", assignedTo: "Meena Patel", started: "09:00 AM", status: "Completed" },
  { id: "PUT-2024-0437", grn: "GRN-2024-1048", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 320, suggestedLoc: "B-07-02", assignedTo: "Arjun Nair", started: "10:45 AM", status: "In Progress" },
  { id: "PUT-2024-0436", grn: "GRN-2024-1048", sku: "SKU-001243", product: "Mustard Oil 2L", qty: 480, suggestedLoc: "B-07-05", assignedTo: "Kavitha Rao", started: "11:00 AM", status: "Pending" },
  { id: "PUT-2024-0435", grn: "GRN-2024-1047", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 150, suggestedLoc: "D-02-09", assignedTo: "Vikram Sharma", started: "08:40 AM", status: "Completed" },
  { id: "PUT-2024-0434", grn: "GRN-2024-1047", sku: "SKU-001244", product: "Jaggery Blocks 1kg", qty: 900, suggestedLoc: "D-02-12", assignedTo: "Anita Desai", started: "08:55 AM", status: "Completed" },
  { id: "PUT-2024-0433", grn: "GRN-2024-1046", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 1200, suggestedLoc: "C-08-04", assignedTo: "Rahul Mehta", started: "10:20 AM", status: "In Progress" },
  { id: "PUT-2024-0432", grn: "GRN-2024-1046", sku: "SKU-001241", product: "Coconut Milk 400ml", qty: 840, suggestedLoc: "C-08-06", assignedTo: "Deepa Menon", started: "10:35 AM", status: "Pending" },
  { id: "PUT-2024-0431", grn: "GRN-2024-1045", sku: "SKU-001242", product: "Toor Dal 5kg", qty: 260, suggestedLoc: "C-03-10", assignedTo: "Sanjay Gupta", started: "08:15 AM", status: "Completed" },
  { id: "PUT-2024-0430", grn: "GRN-2024-1045", sku: "SKU-001245", product: "Black Pepper 500g", qty: 640, suggestedLoc: "A-04-14", assignedTo: "Ravi Kumar", started: "08:30 AM", status: "Completed" },
  { id: "PUT-2024-0429", grn: "GRN-2024-1044", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 420, suggestedLoc: "A-12-06", assignedTo: "Priya Sharma", started: "09:45 AM", status: "In Progress" },
  { id: "PUT-2024-0428", grn: "GRN-2024-1044", sku: "SKU-001235", product: "Organic Wheat Flour 10kg", qty: 180, suggestedLoc: "A-12-08", assignedTo: "Suresh Yadav", started: "10:00 AM", status: "Pending" },
  { id: "PUT-2024-0427", grn: "GRN-2024-1043", sku: "SKU-001239", product: "Iodized Salt 1kg", qty: 1500, suggestedLoc: "A-04-05", assignedTo: "Meena Patel", started: "07:50 AM", status: "Completed" },
  { id: "PUT-2024-0426", grn: "GRN-2024-1043", sku: "SKU-001237", product: "Chickpea Lentils 25kg", qty: 80, suggestedLoc: "C-03-03", assignedTo: "Arjun Nair", started: "08:05 AM", status: "Completed" },
  { id: "PUT-2024-0425", grn: "GRN-2024-1042", sku: "SKU-001236", product: "Refined Sunflower Oil 5L", qty: 280, suggestedLoc: "B-07-09", assignedTo: "Kavitha Rao", started: "07:30 AM", status: "Completed" },
  { id: "PUT-2024-0424", grn: "GRN-2024-1042", sku: "SKU-001238", product: "Brown Sugar 10kg", qty: 220, suggestedLoc: "D-02-04", assignedTo: "Vikram Sharma", started: "07:45 AM", status: "Completed" },
  { id: "PUT-2024-0423", grn: "GRN-2024-1041", sku: "SKU-001240", product: "Tomato Puree 400g", qty: 960, suggestedLoc: "C-08-11", assignedTo: "Anita Desai", started: "11:15 AM", status: "In Progress" },
  { id: "PUT-2024-0422", grn: "GRN-2024-1041", sku: "SKU-001243", product: "Mustard Oil 2L", qty: 360, suggestedLoc: "B-07-13", assignedTo: "Rahul Mehta", started: "11:30 AM", status: "Pending" },
  { id: "PUT-2024-0421", grn: "GRN-2024-1040", sku: "SKU-001234", product: "Premium Basmati Rice 5kg", qty: 500, suggestedLoc: "A-12-02", assignedTo: "Deepa Menon", started: "07:15 AM", status: "Completed" },
  { id: "PUT-2024-0420", grn: "GRN-2024-1040", sku: "SKU-001241", product: "Coconut Milk 400ml", qty: 720, suggestedLoc: "C-08-02", assignedTo: "Sanjay Gupta", started: "07:25 AM", status: "Completed" },
  { id: "PUT-2024-0419", grn: "GRN-2024-1039", sku: "SKU-001244", product: "Jaggery Blocks 1kg", qty: 1100, suggestedLoc: "D-02-15", assignedTo: "Ravi Kumar", started: "06:50 AM", status: "Completed" },
  { id: "PUT-2024-0418", grn: "GRN-2024-1039", sku: "SKU-001245", product: "Black Pepper 500g", qty: 580, suggestedLoc: "A-04-17", assignedTo: "Priya Sharma", started: "07:05 AM", status: "Completed" },
]

const statusStyle: Record<string, string> = {
  Pending: "bg-muted text-muted-foreground",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Completed: "bg-success/10 text-success",
}

export default function PutawayPage() {
  return (
    <div className="w-full p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Putaway</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Assign and track putaway tasks from received GRNs</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[{ label: "Open Tasks", value: "2" }, { label: "In Progress", value: "1", cls: "text-blue-600" }, { label: "Completed Today", value: "14", cls: "text-success" }, { label: "Avg Putaway Time", value: "12m" }].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.cls || "text-foreground")}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-muted/30">
            <tr>{["Task ID", "GRN", "Product", "Qty", "Suggested Location", "Assigned To", "Started", "Status"].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map(t => (
              <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-brand">{t.id}</td>
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{t.grn}</td>
                <td className="px-4 py-3"><p className="text-xs text-brand font-mono">{t.sku}</p><p className="text-xs text-foreground">{t.product}</p></td>
                <td className="px-4 py-3 font-semibold text-foreground">{t.qty}</td>
                <td className="px-4 py-3 font-mono text-xs text-foreground">{t.suggestedLoc}</td>
                <td className="px-4 py-3 text-foreground">{t.assignedTo}</td>
                <td className="px-4 py-3 text-muted-foreground">{t.started}</td>
                <td className="px-4 py-3"><span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[t.status])}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
