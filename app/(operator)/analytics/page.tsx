"use client"

import { useState } from "react"
import {
  BarChart2, TrendingUp, TrendingDown, Package, ShoppingCart,
  Truck, DollarSign, Users, Calendar
} from "lucide-react"
import { ExportButton } from "@/components/wms/export-button"
import { Modal } from "@/components/ui/modal"
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts"
import { cn } from "@/lib/utils"

const throughputData = [
  { day: "Mon", inbound: 320, outbound: 280 },
  { day: "Tue", inbound: 450, outbound: 390 },
  { day: "Wed", inbound: 280, outbound: 310 },
  { day: "Thu", inbound: 510, outbound: 470 },
  { day: "Fri", inbound: 620, outbound: 580 },
  { day: "Sat", inbound: 380, outbound: 320 },
  { day: "Sun", inbound: 200, outbound: 190 },
]

const orderFulfillmentData = [
  { month: "Jul", fulfilled: 1240, slaBreached: 12 },
  { month: "Aug", fulfilled: 1380, slaBreached: 8 },
  { month: "Sep", fulfilled: 1520, slaBreached: 15 },
  { month: "Oct", fulfilled: 1690, slaBreached: 9 },
  { month: "Nov", fulfilled: 1830, slaBreached: 6 },
  { month: "Dec", fulfilled: 980, slaBreached: 3 },
]

const inventoryTrendData = [
  { week: "W47", value: 42000 },
  { week: "W48", value: 43500 },
  { week: "W49", value: 41200 },
  { week: "W50", value: 44800 },
  { week: "W51", value: 46200 },
  { week: "W52", value: 45600 },
]

const categoryData = [
  { name: "Grains & Flour", value: 35 },
  { name: "Edible Oils", value: 20 },
  { name: "Pulses", value: 18 },
  { name: "Processed Foods", value: 15 },
  { name: "Others", value: 12 },
]

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
]

const kpis = [
  { label: "Inventory Accuracy", value: "99.1%", trend: "+0.3%", positive: true, icon: <Package className="w-5 h-5" /> },
  { label: "Order Fill Rate", value: "98.4%", trend: "+1.2%", positive: true, icon: <ShoppingCart className="w-5 h-5" /> },
  { label: "On-Time Dispatch", value: "97.8%", trend: "-0.5%", positive: false, icon: <Truck className="w-5 h-5" /> },
  { label: "Storage Utilization", value: "87%", trend: "+4%", positive: false, icon: <BarChart2 className="w-5 h-5" /> },
  { label: "Avg Pick Accuracy", value: "99.2%", trend: "+0.1%", positive: true, icon: <Users className="w-5 h-5" /> },
  { label: "Revenue (MTD)", value: "₹3.78L", trend: "+12%", positive: true, icon: <DollarSign className="w-5 h-5" /> },
]

const periods = ["This Week", "This Month", "Last 3 Months", "This Year"]

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type SkuMovement = {
  sku: string; name: string; client: string
  inbound: number; outbound: number; stock: number; turns: string
}

/** Full movement ledger — the dashboard table shows the top 5, "View All" shows every row. */
const skuMovement: SkuMovement[] = [
  { sku: "SKU-001239", name: "Iodized Salt 1kg", client: "Salt Works", inbound: 3200, outbound: 2900, stock: 2800, turns: "8.2x" },
  { sku: "SKU-001234", name: "Basmati Rice 5kg", client: "Acme Foods", inbound: 2100, outbound: 1950, stock: 1250, turns: "6.4x" },
  { sku: "SKU-001237", name: "Chickpea Lentils 25kg", client: "Agro Corp", inbound: 800, outbound: 680, stock: 320, turns: "4.8x" },
  { sku: "SKU-001240", name: "Tomato Puree 400g", client: "Fresh Farms", inbound: 560, outbound: 490, stock: 156, turns: "3.9x" },
  { sku: "SKU-001236", name: "Sunflower Oil 5L", client: "Global Oils", inbound: 150, outbound: 142, stock: 8, turns: "2.1x" },
  { sku: "SKU-001241", name: "Wheat Flour 10kg", client: "Sweet Mills", inbound: 1400, outbound: 1310, stock: 640, turns: "5.6x" },
  { sku: "SKU-001242", name: "Turmeric Powder 500g", client: "Agro Corp", inbound: 720, outbound: 655, stock: 288, turns: "4.1x" },
  { sku: "SKU-001243", name: "Mustard Oil 2L", client: "Global Oils", inbound: 480, outbound: 402, stock: 190, turns: "3.4x" },
  { sku: "SKU-001244", name: "Toor Dal 25kg", client: "Agro Corp", inbound: 540, outbound: 512, stock: 96, turns: "5.1x" },
  { sku: "SKU-001245", name: "Rock Salt 2kg", client: "Salt Works", inbound: 980, outbound: 890, stock: 410, turns: "6.9x" },
  { sku: "SKU-001246", name: "Ghee 1L", client: "Fresh Farms", inbound: 260, outbound: 231, stock: 74, turns: "3.1x" },
  { sku: "SKU-001247", name: "Poha 5kg", client: "Sweet Mills", inbound: 340, outbound: 298, stock: 120, turns: "2.8x" },
]

const topSkus = skuMovement.slice(0, 5)

export default function AnalyticsPage() {
  const [period, setPeriod] = useState("This Month")
  const [allSkusOpen, setAllSkusOpen] = useState(false)

  return (
    <div className="h-full overflow-y-auto">
      <div className="w-full p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Analytics & Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Performance metrics and operational dashboards</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap",
                    period === p ? "bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-background/60"
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
            <ExportButton data={[...throughputData, ...orderFulfillmentData, ...inventoryTrendData, ...categoryData]} filename="analytics-report" label="Export" />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {kpis.map((kpi, i) => (
            <div key={i} className="p-4 rounded-2xl border border-border bg-card">
              <div className="flex items-start justify-between mb-2">
                <span className="text-brand">{kpi.icon}</span>
                <span className={cn("flex items-center gap-0.5 text-[10px] font-semibold", kpi.positive ? "text-success" : "text-danger")}>
                  {kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {kpi.trend}
                </span>
              </div>
              <p className="text-xl font-bold text-foreground">{kpi.value}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Throughput */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Weekly Throughput</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Inbound vs Outbound units</p>
              </div>
              <Calendar className="w-4 h-4 text-muted-foreground" />
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={throughputData} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
                  itemStyle={{ color: "var(--color-muted-foreground)" }}
                />
                <Bar dataKey="inbound" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} name="Inbound" />
                <Bar dataKey="outbound" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} name="Outbound" />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Stock by Category</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Percentage distribution</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                    {categoryData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                    formatter={(value) => [`${value}%`, ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {categoryData.map((cat, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <span className="text-xs text-muted-foreground flex-1 truncate">{cat.name}</span>
                    <span className="text-xs font-semibold text-foreground">{cat.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Order Fulfillment */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Order Fulfillment Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Monthly fulfilled vs SLA breached</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={orderFulfillmentData} barGap={4} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
                />
                <Bar dataKey="fulfilled" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} name="Fulfilled" />
                <Bar dataKey="slaBreached" fill={CHART_COLORS[3]} radius={[4, 4, 0, 0]} name="SLA Breached" />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Inventory Trend */}
          <div className="p-5 rounded-2xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-sm text-foreground">Inventory Value Trend</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Weekly stock value in units</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={inventoryTrendData}>
                <defs>
                  <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} axisLine={false} tickLine={false} width={48} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }}
                  labelStyle={{ color: "var(--color-foreground)", fontWeight: 600 }}
                  // Recharts types the value as `ValueType | undefined`, so widen the
                  // parameter and coerce rather than assuming `number`.
                  formatter={(v) => [typeof v === "number" ? v.toLocaleString() : String(v ?? ""), "Units"]}
                />
                <Area type="monotone" dataKey="value" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#invGrad)" name="Inventory" dot={{ fill: CHART_COLORS[0], r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top SKUs table */}
        <div className="p-5 rounded-2xl border border-border bg-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm text-foreground">Top 5 SKUs by Movement</h3>
            <button onClick={() => setAllSkusOpen(true)} title="View all SKU movement" className="text-xs text-brand hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["SKU", "Product", "Client", "Inbound", "Outbound", "Stock", "Turns"].map((h) => (
                    <th key={h} className="pb-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topSkus.map((row, i) => (
                  <tr key={row.sku} className={cn("border-b border-border/50 last:border-0", i % 2 === 1 ? "bg-muted/10" : "")}>
                    <td className="py-3 pr-6 text-brand text-xs font-mono whitespace-nowrap">{row.sku}</td>
                    <td className="py-3 pr-6 font-medium text-foreground max-w-40 truncate">{row.name}</td>
                    <td className="py-3 pr-6 text-muted-foreground whitespace-nowrap text-xs">{row.client}</td>
                    <td className="py-3 pr-6 text-foreground font-semibold whitespace-nowrap">{row.inbound.toLocaleString()}</td>
                    <td className="py-3 pr-6 text-foreground whitespace-nowrap">{row.outbound.toLocaleString()}</td>
                    <td className="py-3 pr-6 text-foreground whitespace-nowrap">{row.stock.toLocaleString()}</td>
                    <td className="py-3 pr-6 whitespace-nowrap">
                      <span className="font-bold text-brand">{row.turns}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* All SKU movement */}
      <Modal
        open={allSkusOpen}
        onOpenChange={setAllSkusOpen}
        title="All SKUs by Movement"
        description={`${skuMovement.length} SKUs — ${period.toLowerCase()}`}
        size="xl"
        footer={
          <>
            <ExportButton data={skuMovement} filename="sku-movement" label="Export All" />
            <button onClick={() => setAllSkusOpen(false)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">Close</button>
          </>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {["SKU", "Product", "Client", "Inbound", "Outbound", "Stock", "Turns"].map((h) => (
                  <th key={h} className="pb-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap pr-6">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {skuMovement.map((row, i) => (
                <tr key={row.sku} className={cn("border-b border-border/50 last:border-0", i % 2 === 1 ? "bg-muted/10" : "")}>
                  <td className="py-2.5 pr-6 text-brand text-xs font-mono whitespace-nowrap">{row.sku}</td>
                  <td className="py-2.5 pr-6 font-medium text-foreground">{row.name}</td>
                  <td className="py-2.5 pr-6 text-muted-foreground whitespace-nowrap text-xs">{row.client}</td>
                  <td className="py-2.5 pr-6 text-foreground font-semibold whitespace-nowrap">{row.inbound.toLocaleString()}</td>
                  <td className="py-2.5 pr-6 text-foreground whitespace-nowrap">{row.outbound.toLocaleString()}</td>
                  <td className="py-2.5 pr-6 text-foreground whitespace-nowrap">{row.stock.toLocaleString()}</td>
                  <td className="py-2.5 pr-6 whitespace-nowrap"><span className="font-bold text-brand">{row.turns}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  )
}
