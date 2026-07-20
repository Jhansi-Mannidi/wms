"use client"

import { useState } from "react"
import { FileText, Download, BarChart2, Package, Truck, DollarSign, Clock, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

const reportCategories = ["All", "Inventory", "Inbound", "Outbound", "Billing", "VAS"]

type Report = {
  id: string; name: string; category: string; desc: string
  format: string; generated: string; icon: React.ReactNode
}

const reports: Report[] = [
  { id: "RPT-INV-01", name: "Stock Ledger Report", category: "Inventory", desc: "Complete SKU-wise stock movement ledger with opening, receipts, issues, and closing balance", format: "XLSX", generated: "Jul 20, 09:00 AM", icon: <Package className="w-4 h-4" /> },
  { id: "RPT-INV-02", name: "Ageing Report", category: "Inventory", desc: "Stock ageing by days in warehouse — highlights slow-moving and near-expiry items", format: "XLSX", generated: "Jul 20, 09:00 AM", icon: <Clock className="w-4 h-4" /> },
  { id: "RPT-INV-03", name: "Zone Utilisation Report", category: "Inventory", desc: "Space utilisation by zone, rack, and tier with occupancy percentages", format: "PDF", generated: "Jul 20, 09:00 AM", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-IB-01", name: "ASN Receipts Summary", category: "Inbound", desc: "All inbound receipts for the selected period with GRN references and discrepancies", format: "XLSX", generated: "Jul 20, 09:00 AM", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-IB-02", name: "Put-away Performance Report", category: "Inbound", desc: "Time-to-putaway KPIs by product category and warehouse zone", format: "PDF", generated: "Jul 19, 09:00 AM", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-OB-01", name: "Dispatch Summary", category: "Outbound", desc: "All dispatched orders with carrier, AWB, SLA compliance, and delivery confirmation", format: "XLSX", generated: "Jul 20, 09:00 AM", icon: <Truck className="w-4 h-4" /> },
  { id: "RPT-OB-02", name: "Order Fill Rate Report", category: "Outbound", desc: "Line fill rate and order fill rate by SKU and customer segment", format: "XLSX", generated: "Jul 19, 09:00 AM", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-BIL-01", name: "Invoice Statement", category: "Billing", desc: "Consolidated billing statement with line-item breakdowns for storage, handling, and VAS charges", format: "PDF", generated: "Jul 16, 10:00 AM", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-BIL-02", name: "Transaction Ledger", category: "Billing", desc: "Every chargeable event — receipts, issues, VAS — with timestamps and rates applied", format: "XLSX", generated: "Jul 16, 10:00 AM", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-VAS-01", name: "VAS Work Order Summary", category: "VAS", desc: "All VAS jobs with completion status, unit counts, and turnaround time", format: "XLSX", generated: "Jul 18, 09:00 AM", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-INV-04", name: "Batch & Expiry Register", category: "Inventory", desc: "Batch-wise stock with manufacturing and expiry dates, flagging lots inside the 90-day expiry window", format: "XLSX", generated: "Jul 20, 09:00 AM", icon: <Clock className="w-4 h-4" /> },
  { id: "RPT-INV-05", name: "Cycle Count Variance Report", category: "Inventory", desc: "System vs counted quantity by bin location with variance value and adjustment references", format: "XLSX", generated: "Jul 19, 09:00 AM", icon: <Package className="w-4 h-4" /> },
  { id: "RPT-INV-06", name: "Cold Chain Excursion Log", category: "Inventory", desc: "Temperature excursions recorded in cold rooms and reefer bays with duration and affected batches", format: "PDF", generated: "Jul 20, 07:00 AM", icon: <Clock className="w-4 h-4" /> },
  { id: "RPT-INV-07", name: "Stock Reconciliation Statement", category: "Inventory", desc: "Period-end reconciliation of physical stock against book stock with signed-off adjustments", format: "CSV", generated: "Jul 16, 06:00 PM", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-IB-03", name: "GRN Discrepancy Report", category: "Inbound", desc: "Short receipts, excess receipts, and damaged units logged against each GRN with vendor details", format: "XLSX", generated: "Jul 19, 09:00 AM", icon: <FileText className="w-4 h-4" /> },
  { id: "RPT-IB-04", name: "Vendor Delivery Compliance", category: "Inbound", desc: "On-time and in-full performance by vendor with appointment adherence and dock waiting time", format: "PDF", generated: "Jul 18, 09:00 AM", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-IB-05", name: "Inbound Quarantine Register", category: "Inbound", desc: "Consignments held in quarantine pending QC release, with age and release decisions", format: "CSV", generated: "Jul 20, 08:00 AM", icon: <Package className="w-4 h-4" /> },
  { id: "RPT-OB-03", name: "Carrier Performance Report", category: "Outbound", desc: "Transit time, delivery success, and delay reasons by carrier — Blue Dart, Delhivery, Gati, DTDC, Safexpress", format: "PDF", generated: "Jul 20, 09:00 AM", icon: <Truck className="w-4 h-4" /> },
  { id: "RPT-OB-04", name: "SLA Breach Report", category: "Outbound", desc: "Orders that missed the committed delivery window, with breach hours and root-cause tagging", format: "XLSX", generated: "Jul 20, 09:00 AM", icon: <Clock className="w-4 h-4" /> },
  { id: "RPT-OB-05", name: "Pick-Pack Productivity Report", category: "Outbound", desc: "Lines picked and cartons packed per operator per shift with accuracy percentages", format: "XLSX", generated: "Jul 19, 07:00 PM", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-OB-06", name: "Returns & RTO Summary", category: "Outbound", desc: "Customer returns and RTO consignments with reason codes and putaway disposition", format: "CSV", generated: "Jul 18, 09:00 AM", icon: <Package className="w-4 h-4" /> },
  { id: "RPT-BIL-03", name: "Storage Charges Breakdown", category: "Billing", desc: "Daily occupied pallet positions by zone with applicable storage slab and accrued charges", format: "XLSX", generated: "Jul 16, 10:00 AM", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-BIL-04", name: "Handling & Freight Recovery", category: "Billing", desc: "Inbound handling, outbound handling, and freight recovered per consignment with rate card applied", format: "PDF", generated: "Jul 16, 10:00 AM", icon: <Truck className="w-4 h-4" /> },
  { id: "RPT-BIL-05", name: "GST Summary Statement", category: "Billing", desc: "Tax-wise summary of invoices raised with HSN/SAC codes for the selected reporting period", format: "PDF", generated: "Jul 15, 11:00 AM", icon: <DollarSign className="w-4 h-4" /> },
  { id: "RPT-VAS-02", name: "VAS Turnaround Analysis", category: "VAS", desc: "Average and worst-case turnaround by service type — relabelling, kitting, repacking, QC", format: "PDF", generated: "Jul 18, 09:00 AM", icon: <BarChart2 className="w-4 h-4" /> },
  { id: "RPT-VAS-03", name: "Kitting BOM Consumption", category: "VAS", desc: "Component consumption against kit bills of material with scrap and shortfall lines", format: "CSV", generated: "Jul 17, 09:00 AM", icon: <Package className="w-4 h-4" /> },
]

const periodOptions = ["Last 7 Days", "Last 15 Days", "Last 30 Days", "This Month", "Last Month", "Custom Range"]

const formatStyle: Record<string, string> = {
  XLSX: "bg-success/15 text-success",
  PDF: "bg-danger/15 text-danger",
  CSV: "bg-brand/15 text-brand",
}

export default function PortalReportsPage() {
  const [category, setCategory] = useState("All")
  const [period, setPeriod] = useState("Last 30 Days")
  const [search, setSearch] = useState("")
  const [detail, setDetail] = useState<Report | null>(null)
  const [downloaded, setDownloaded] = useState<string[]>([])

  const filtered = reports.filter(r => {
    const matchCat = category === "All" || r.category === category
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.desc.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function download(r: Report) {
    setDownloaded(prev => prev.includes(r.id) ? prev : [...prev, r.id])
    notify.success("Report downloaded", `${r.name} (${r.format}) for ${period} saved to your downloads.`)
  }

  function downloadAll() {
    if (filtered.length === 0) {
      notify.warning("Nothing to download", "No reports match your current filters.")
      return
    }
    setDownloaded(prev => Array.from(new Set([...prev, ...filtered.map(r => r.id)])))
    notify.success("Bundle downloaded", `${filtered.length} report${filtered.length === 1 ? "" : "s"} for ${period} packaged as a ZIP.`)
  }

  function runSchedule(name: string, dest: string) {
    notify.info("Schedule triggered", `${name} is being generated now and will be emailed to ${dest}.`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Reports &amp; Documents</h1>
          <p className="text-sm text-muted-foreground">Download inventory, billing, and operational reports</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card text-xs font-medium text-[#1E3A5F] dark:text-foreground outline-none cursor-pointer"
          >
            {periodOptions.map(p => <option key={p}>{p}</option>)}
          </select>
          <button
            onClick={downloadAll}
            title="Download all listed reports"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
          >
            <Download className="w-3.5 h-3.5" /> Download All
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Inventory Reports", count: reports.filter(r => r.category === "Inventory").length, icon: <Package className="w-4 h-4" />, color: "text-brand", bg: "bg-brand/15" },
          { label: "Inbound / Outbound", count: reports.filter(r => r.category === "Inbound" || r.category === "Outbound").length, icon: <Truck className="w-4 h-4" />, color: "text-warning", bg: "bg-warning/15" },
          { label: "Billing Reports", count: reports.filter(r => r.category === "Billing").length, icon: <DollarSign className="w-4 h-4" />, color: "text-success", bg: "bg-success/15" },
          { label: "VAS Reports", count: reports.filter(r => r.category === "VAS").length, icon: <FileText className="w-4 h-4" />, color: "text-purple-400", bg: "bg-purple-400/15" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", s.bg, s.color)}>{s.icon}</div>
            <div>
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{s.count}</p>
              <p className="text-[10px] text-muted-foreground">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1 p-0.5 rounded-lg bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border flex-wrap">
          {reportCategories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={cn("px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                category === c ? "bg-[#1E3A5F] dark:bg-brand text-white" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground"
              )}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
          <Search className="w-3.5 h-3.5 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search reports..." className="bg-transparent outline-none text-xs w-40 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground" />
        </div>
      </div>

      {/* Report grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map(r => (
          <div key={r.id} onClick={() => setDetail(r)} className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-4 hover:border-[#1E3A5F]/30 dark:hover:border-brand/30 transition-all group cursor-pointer">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center text-[#1E3A5F] dark:text-brand shrink-0 group-hover:bg-[#1E3A5F]/20 dark:group-hover:bg-brand/25 transition-colors">
                {r.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">{r.name}</p>
                  <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", formatStyle[r.format] ?? "bg-muted text-muted-foreground")}>{r.format}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{r.desc}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" /> {r.generated}</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); download(r) }}
                    title={`Download ${r.name}`}
                    className="flex items-center gap-1 text-xs text-[#1E3A5F] dark:text-brand font-medium hover:underline"
                  >
                    <Download className="w-3 h-3" /> {downloaded.includes(r.id) ? "Downloaded" : "Download"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground text-sm">No reports found.</div>
        )}
      </div>

      {/* Schedule section */}
      <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-5">
        <h2 className="text-sm font-bold text-[#1E3A5F] dark:text-foreground mb-3">Scheduled Reports</h2>
        <div className="space-y-2">
          {[
            { name: "Weekly Stock Ledger", freq: "Every Monday, 8:00 AM", format: "XLSX", dest: "apex.operations@pharma.in" },
            { name: "Monthly Invoice Statement", freq: "1st of every month, 9:00 AM", format: "PDF", dest: "accounts@apexpharma.in" },
            { name: "Daily Dispatch Summary", freq: "Every day, 7:00 PM", format: "XLSX", dest: "logistics@apexpharma.in" },
            { name: "Daily Batch & Expiry Register", freq: "Every day, 6:30 AM", format: "XLSX", dest: "quality@apexpharma.in" },
            { name: "Weekly SLA Breach Report", freq: "Every Friday, 5:00 PM", format: "XLSX", dest: "logistics@apexpharma.in" },
            { name: "Weekly Cold Chain Excursion Log", freq: "Every Monday, 7:00 AM", format: "PDF", dest: "compliance@apexpharma.in" },
            { name: "Fortnightly Ageing Report", freq: "1st & 16th, 8:00 AM", format: "XLSX", dest: "planning@apexpharma.in" },
            { name: "Monthly Carrier Performance", freq: "1st of every month, 10:00 AM", format: "PDF", dest: "logistics@apexpharma.in" },
            { name: "Monthly Storage Charges Breakdown", freq: "1st of every month, 9:30 AM", format: "XLSX", dest: "finance@apexpharma.in" },
            { name: "Monthly GST Summary Statement", freq: "5th of every month, 11:00 AM", format: "PDF", dest: "accounts@apexpharma.in" },
            { name: "Weekly VAS Work Order Summary", freq: "Every Saturday, 6:00 PM", format: "XLSX", dest: "warehouse@apexpharma.in" },
            { name: "Weekly Cycle Count Variance", freq: "Every Wednesday, 8:00 AM", format: "CSV", dest: "supplychain@apexpharma.in" },
          ].map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F7F9FC] dark:bg-muted/30 border border-[#E4E9F0] dark:border-border">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#1E3A5F] dark:text-brand shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-[#1E3A5F] dark:text-foreground">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.freq} · {s.dest}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => runSchedule(s.name, s.dest)}
                  title={`Run ${s.name} now`}
                  className="text-[10px] font-semibold text-[#1E3A5F] dark:text-brand hover:underline"
                >
                  Run now
                </button>
                <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded", formatStyle[s.format] ?? "bg-muted text-muted-foreground")}>{s.format}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Report detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.name ?? ""}
        description="Report detail"
        footer={
          <>
            <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
              Close
            </button>
            {detail && (
              <button onClick={() => download(detail)} className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand/90">
                Download {detail.format}
              </button>
            )}
          </>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Report ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="Name" value={detail.name} />
            <DetailRow label="Category" value={detail.category} />
            <DetailRow label="Description" value={detail.desc} />
            <DetailRow label="Format" value={<span className={cn("px-1.5 py-0.5 rounded text-xs font-semibold", formatStyle[detail.format] ?? "bg-muted text-muted-foreground")}>{detail.format}</span>} />
            <DetailRow label="Last Generated" value={detail.generated} />
            <DetailRow label="Reporting Period" value={period} />
            <DetailRow label="Downloaded" value={downloaded.includes(detail.id) ? "Yes — this session" : "Not yet"} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
