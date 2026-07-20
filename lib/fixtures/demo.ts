/** Cross-module demo seed data for pages that start with empty client-side lists. */

export type DemoWave = { id: string; zone: string; orders: number; picker: string; created: string }

export const DEMO_ORDER_WAVES: DemoWave[] = [
  { id: "WAVE-2024-088", zone: "Zone A — Ambient", orders: 12, picker: "Ravi Kumar", created: "2024-12-16 07:15" },
  { id: "WAVE-2024-087", zone: "Zone B — Cold", orders: 8, picker: "Priya Sharma", created: "2024-12-16 06:45" },
  { id: "WAVE-2024-086", zone: "Zone C — Bulk", orders: 5, picker: "Arjun Nair", created: "2024-12-15 22:30" },
  { id: "WAVE-2024-085", zone: "Zone A — Ambient", orders: 14, picker: "Meena Patel", created: "2024-12-15 18:00" },
  { id: "WAVE-2024-084", zone: "Zone D — Hazmat", orders: 3, picker: "Vijay Kumar", created: "2024-12-15 14:20" },
]

export type DemoReportRun = { id: string; report: string; format: string; period: string; ranAt: string; rows: number }

export const DEMO_ORDER_REPORT_RUNS: DemoReportRun[] = [
  { id: "RUN-0001", report: "Order Fulfilment Rate", format: "CSV", period: "Today", ranAt: "2024-12-16 06:00", rows: 312 },
  { id: "RUN-0002", report: "SLA Breach Report", format: "PDF", period: "Yesterday", ranAt: "2024-12-15 07:00", rows: 18 },
  { id: "RUN-0003", report: "Picker Productivity", format: "Excel", period: "Last 7 days", ranAt: "2024-12-15 07:30", rows: 245 },
  { id: "RUN-0004", report: "Throughput by Hour", format: "CSV", period: "Last 30 days", ranAt: "2024-12-14 11:00", rows: 720 },
]

export type DemoSavedFilter = { id: string; name: string; module: string; action: string; user: string; from: string; to: string }

export const DEMO_AUDIT_SAVED_FILTERS: DemoSavedFilter[] = [
  { id: "SF-001", name: "Inventory changes this week", module: "Inventory", action: "Updated", user: "Vijay Kumar", from: "2025-07-14", to: "2025-07-20" },
  { id: "SF-002", name: "GRN approvals", module: "GRN", action: "Approved", user: "All Users", from: "2025-07-01", to: "2025-07-20" },
  { id: "SF-003", name: "Billing exports", module: "Billing", action: "Exported", user: "Admin", from: "2025-07-01", to: "" },
  { id: "SF-004", name: "Order rejections", module: "Orders", action: "Rejected", user: "Priya Sharma", from: "2025-06-01", to: "2025-07-20" },
]

export const DEMO_AUDIT_RECENT_SEARCHES = [
  "ORD-2025-4421",
  "GRN-2025-0892",
  "SKU-001234",
  "INV-2025-0774",
  "ADJ-0021",
]

export type DemoAirReceived = {
  id: string; shipper: string; consignee: string; service: string
  route: string; pieces: number; actual: number; volumetric: number
  chargeable: number; hold: string; receivedAt: string
  attachments: { id: string; name: string; kind: "photo" | "document"; at: string }[]
}

export const DEMO_AIR_RECEIVED: DemoAirReceived[] = [
  { id: "PKG-0438", shipper: "Apex Pharma Ltd", consignee: "PharmaDist Mumbai", service: "Express", route: "local", pieces: 4, actual: 12.4, volumetric: 14.2, chargeable: 14.2, hold: "None", receivedAt: "2025-07-20 08:22", attachments: [{ id: "a1", name: "Package photo", kind: "photo", at: "08:22" }] },
  { id: "PKG-0439", shipper: "GlobalTex Fabrics", consignee: "Buyer Co. Dubai", service: "Standard", route: "export", pieces: 2, actual: 28.0, volumetric: 22.0, chargeable: 28.0, hold: "None", receivedAt: "2025-07-20 07:55", attachments: [{ id: "a2", name: "Commercial Invoice", kind: "document", at: "07:55" }] },
  { id: "PKG-0440", shipper: "Sunrise Electronics", consignee: "TechRetail Pune", service: "Express", route: "local", pieces: 1, actual: 5.6, volumetric: 7.2, chargeable: 7.2, hold: "None", receivedAt: "2025-07-19 18:10", attachments: [] },
  { id: "PKG-0442", shipper: "MediSupply Corp", consignee: "Al-Shifa Hospital", service: "Priority Overnight", route: "export", pieces: 3, actual: 8.0, volumetric: 6.5, chargeable: 8.0, hold: "DG Screening", receivedAt: "2025-07-19 16:40", attachments: [{ id: "a3", name: "DG Declaration", kind: "document", at: "16:40" }] },
  { id: "PKG-0443", shipper: "FreshFarm Organics", consignee: "Organic Mart", service: "Standard", route: "local", pieces: 6, actual: 22.5, volumetric: 20.0, chargeable: 22.5, hold: "None", receivedAt: "2025-07-19 14:05", attachments: [{ id: "a4", name: "Packing List", kind: "document", at: "14:05" }] },
  { id: "PKG-0444", shipper: "Nova Textiles Pvt", consignee: "Fashion Hub Delhi", service: "Standard", route: "local", pieces: 5, actual: 16.4, volumetric: 18.9, chargeable: 18.9, hold: "None", receivedAt: "2025-07-19 11:28", attachments: [] },
]

export type DemoAwaitingPkg = {
  id: string; shipper: string; shipperInit: string; shipperColor: string
  consignee: string; consigneeCity: string; actualKg: number; volKg: number
  service: string; dg: boolean
}

/** Pre-routed packages for the air-handling routing board demo. */
export const DEMO_AIR_ROUTING_LOCAL: DemoAwaitingPkg[] = [
  { id: "PKG-0435", shipper: "BlueLeaf Cosmetics", shipperInit: "BL", shipperColor: "bg-pink-500", consignee: "Salon Chain Delhi", consigneeCity: "Delhi, IN", actualKg: 4.4, volKg: 6.8, service: "Express", dg: false },
  { id: "PKG-0436", shipper: "AutoParts India", shipperInit: "AI", shipperColor: "bg-cyan-500", consignee: "Workshop Nashik", consigneeCity: "Nashik, IN", actualKg: 25.1, volKg: 21.0, service: "Standard", dg: false },
  { id: "PKG-0437", shipper: "Apex Pharma Ltd", shipperInit: "AP", shipperColor: "bg-blue-500", consignee: "ClinicChain Nagpur", consigneeCity: "Nagpur, IN", actualKg: 6.2, volKg: 8.4, service: "Priority", dg: false },
]

export const DEMO_AIR_ROUTING_EXPORT: DemoAwaitingPkg[] = [
  { id: "PKG-0431", shipper: "Orient Spices Co", shipperInit: "OS", shipperColor: "bg-orange-500", consignee: "Importer Singapore", consigneeCity: "Singapore, SG", actualKg: 61.5, volKg: 54.0, service: "Standard", dg: false },
  { id: "PKG-0432", shipper: "Vertex Tools Ltd", shipperInit: "VT", shipperColor: "bg-indigo-500", consignee: "Hardware Rajkot", consigneeCity: "Rajkot, IN", actualKg: 33.7, volKg: 29.5, service: "Standard", dg: false },
  { id: "PKG-0433", shipper: "GlobalTex Fabrics", shipperInit: "GT", shipperColor: "bg-amber-500", consignee: "Retail Group Doha", consigneeCity: "Doha, QA", actualKg: 44.2, volKg: 47.0, service: "Standard", dg: false },
  { id: "PKG-0434", shipper: "MediSupply Corp", shipperInit: "MS", shipperColor: "bg-rose-500", consignee: "Distributor Muscat", consigneeCity: "Muscat, OM", actualKg: 29.6, volKg: 26.2, service: "Priority", dg: false },
]

export type DemoUldPkg = { id: string; ref: string; consignee: string; weight: number; dest: string; initials: string; color: string }

export const DEMO_ULD_LOADED: DemoUldPkg[] = [
  { id: "p1", ref: "AIR-EXP-001", consignee: "TechParts GmbH", weight: 18.4, dest: "FRA", initials: "TG", color: "bg-blue-500" },
  { id: "p2", ref: "AIR-EXP-002", consignee: "MedDevice UK", weight: 5.2, dest: "LHR", initials: "MD", color: "bg-rose-500" },
  { id: "p5", ref: "AIR-EXP-005", consignee: "SingTech Pte", weight: 8.9, dest: "SIN", initials: "ST", color: "bg-violet-500" },
  { id: "p7", ref: "AIR-EXP-007", consignee: "Nordic Traders AS", weight: 14.8, dest: "OSL", initials: "NT", color: "bg-blue-500" },
]
