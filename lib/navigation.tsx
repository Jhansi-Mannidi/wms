/**
 * Single source of truth for the application's information architecture.
 *
 * Every module and every page lives here, grouped in the order work flows
 * through a warehouse: goods arrive (Inbound), are stored (Inventory), leave
 * (Outbound), specialised freight streams run alongside, and supporting
 * resources, finance, insights and administration follow.
 *
 * The module rail, each module's menu, the Home page, breadcrumbs and global
 * search all read from this file — add a page here and it appears everywhere.
 */

import {
  Home, DoorOpen, ClipboardList, Package, Tag, Boxes, Thermometer, ShoppingCart,
  Layers, Ship, Plane, Archive, Building, Users, Forklift, CalendarClock, Wallet,
  Globe, BarChart3, ShieldCheck, Warehouse, Settings,
  LayoutDashboard, MapPin, Hash, RefreshCw, ArrowUpDown, Truck, PackageCheck,
  ArrowLeftRight, PackageMinus, BarChart2, Clock, Waves, AlertTriangle, Upload,
  FileText, LogIn, LogOut, Plus, Settings2, Box, RefreshCcw, Activity,
  Handshake, Inbox, Wrench, DollarSign, FileCheck, Container, GitBranch,
  PackagePlus, FilePlus, Undo2, LibraryBig, Grid3x3, CalendarDays, ClipboardCheck,
  UserPlus, History, Zap, Receipt, CreditCard, TrendingUp, User, Download,
  FileSearch, Filter, Map, Building2,
  type LucideIcon,
} from "lucide-react"

export type BadgeVariant = "brand" | "warning" | "danger" | "success"

export interface NavPage {
  label: string
  href: string
  icon: LucideIcon
  badge?: number | string
  badgeVariant?: BadgeVariant
}

export interface NavPageSection {
  title: string
  pages: NavPage[]
}

export interface NavModule {
  id: string
  /** Short label shown under the rail icon. */
  short: string
  /** Full name shown in the module menu header, Home cards and breadcrumbs. */
  title: string
  /** One-line description of what the module is for. */
  desc: string
  /** Landing page of the module. */
  href: string
  icon: LucideIcon
  /** Highlight shown on the Home card. */
  homeBadge?: { value: string; type: "count" | "new" | "percent" | "alert" }
  /** Module menu. Omitted for single-page modules (Home, Settings). */
  sections?: NavPageSection[]
}

export interface NavGroup {
  id: string
  title: string
  /** Compact label for the narrow module rail. */
  short: string
  /** Plain-language explanation of the group, shown on Home. */
  desc: string
  modules: NavModule[]
}

export const HOME_MODULE: NavModule = {
  id: "home",
  short: "Home",
  title: "Home",
  desc: "Dashboard & module launcher",
  href: "/home",
  icon: Home,
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: "inbound",
    title: "Inbound",
    short: "Inbound",
    desc: "Receive vehicles and goods into the warehouse",
    modules: [
      {
        id: "gate", short: "Gate", title: "Gate Management", desc: "Vehicle entry & exit",
        href: "/gate-management", icon: DoorOpen, homeBadge: { value: "5", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Gate Overview", href: "/gate-management", icon: Truck, badge: 5 },
          ] },
          { title: "Gate Operations", pages: [
            { label: "Dock Scheduler", href: "/gate-management/dock", icon: CalendarClock },
            { label: "Entry Register", href: "/gate-management/entry", icon: LogIn },
            { label: "Exit Register", href: "/gate-management/exit", icon: LogOut },
          ] },
          { title: "Records & Reports", pages: [
            { label: "Vehicle Log", href: "/gate-management/log", icon: ClipboardList },
            { label: "Gate Analytics", href: "/gate-management/analytics", icon: BarChart3 },
          ] },
        ],
      },
      {
        id: "grn", short: "GRN", title: "Goods Receipt (GRN)", desc: "Receive, verify & put away goods",
        href: "/grn", icon: ClipboardList, homeBadge: { value: "24", type: "count" },
        sections: [
          { title: "Receiving Flow", pages: [
            { label: "Inbound Trucks", href: "/grn/trucks", icon: Truck },
            { label: "New GRN", href: "/grn", icon: FileText },
            { label: "Putaway Queue", href: "/grn/putaway", icon: PackageCheck },
          ] },
          { title: "Records & Reports", pages: [
            { label: "GRN Register", href: "/grn/register", icon: ClipboardList },
            { label: "GRN Analytics", href: "/grn/analytics", icon: BarChart3 },
          ] },
        ],
      },
    ],
  },
  {
    id: "inventory",
    title: "Inventory",
    short: "Inventory",
    desc: "Know what is stored, where, and in what condition",
    modules: [
      {
        id: "inventory", short: "Inventory", title: "Inventory Management", desc: "Real-time stock tracking",
        href: "/inventory", icon: Package, homeBadge: { value: "2,450", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Stock Overview", href: "/inventory", icon: LayoutDashboard },
          ] },
          { title: "Stock", pages: [
            { label: "Location Browser", href: "/inventory/locations", icon: MapPin },
            { label: "Batch Management", href: "/inventory/batches", icon: Layers },
            { label: "Serial Tracking", href: "/inventory/serials", icon: Hash },
          ] },
          { title: "Inbound", pages: [
            { label: "Expected Receipts", href: "/inventory/expected-receipts", icon: Truck, badge: 8 },
            { label: "GRN History", href: "/inventory/grn-history", icon: PackageCheck },
          ] },
          { title: "Stock Control", pages: [
            { label: "Transfer Orders", href: "/inventory/transfers", icon: ArrowLeftRight, badge: 5 },
            { label: "Cycle Counts", href: "/inventory/cycle-counts", icon: RefreshCw, badge: 3 },
            { label: "Stock Adjustments", href: "/inventory/adjustments", icon: ArrowUpDown },
            { label: "Write-offs", href: "/inventory/write-offs", icon: PackageMinus },
          ] },
          { title: "Reports", pages: [
            { label: "Inventory Reports", href: "/inventory/reports", icon: BarChart2 },
          ] },
        ],
      },
      {
        id: "sku-master", short: "SKUs", title: "SKU Master", desc: "Product definitions & mappings",
        href: "/sku-master", icon: Tag, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Overview", pages: [
            { label: "All SKUs", href: "/sku-master", icon: Tag },
          ] },
          { title: "Manage SKUs", pages: [
            { label: "Add SKU", href: "/sku-master/add", icon: Plus },
            { label: "Bulk Import", href: "/sku-master/import", icon: Upload },
          ] },
          { title: "Setup", pages: [
            { label: "Categories", href: "/sku-master/categories", icon: Layers },
            { label: "Attributes", href: "/sku-master/attributes", icon: Settings2 },
          ] },
        ],
      },
      {
        id: "pallets", short: "Pallets", title: "Pallet Tracking", desc: "Pallet lifecycle management",
        href: "/pallet-tracking", icon: Boxes, homeBadge: { value: "890", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Pallet Register", href: "/pallet-tracking", icon: Box, badge: 890 },
          ] },
          { title: "Tracking", pages: [
            { label: "Live Locations", href: "/pallet-tracking/locations", icon: MapPin },
            { label: "Pallet History", href: "/pallet-tracking/history", icon: RefreshCcw },
          ] },
          { title: "Reports", pages: [
            { label: "Pallet Analytics", href: "/pallet-tracking/analytics", icon: BarChart3 },
          ] },
          { title: "Setup", pages: [
            { label: "Stacking Rules", href: "/pallet-tracking/rules", icon: Layers },
          ] },
        ],
      },
      {
        id: "cold-chain", short: "Cold", title: "Cold Chain", desc: "Temperature monitoring",
        href: "/cold-chain", icon: Thermometer, homeBadge: { value: "2", type: "alert" },
        sections: [
          { title: "Overview", pages: [
            { label: "Dashboard", href: "/cold-chain", icon: Thermometer, badge: 2 },
          ] },
          { title: "Monitoring", pages: [
            { label: "Live Sensors", href: "/cold-chain/sensors", icon: Activity },
            { label: "Breach Log", href: "/cold-chain/breaches", icon: AlertTriangle },
          ] },
          { title: "Compliance & Reports", pages: [
            { label: "Compliance", href: "/cold-chain/compliance", icon: ClipboardList },
            { label: "Cold Chain Analytics", href: "/cold-chain/analytics", icon: BarChart3 },
          ] },
        ],
      },
    ],
  },
  {
    id: "outbound",
    title: "Outbound",
    short: "Outbound",
    desc: "Pick, pack and ship customer orders",
    modules: [
      {
        id: "orders", short: "Orders", title: "Order Management", desc: "Process & fulfill orders",
        href: "/orders", icon: ShoppingCart, homeBadge: { value: "28", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "All Orders", href: "/orders", icon: ShoppingCart },
          ] },
          { title: "Fulfilment Pipeline", pages: [
            { label: "Pending Allocation", href: "/orders/pending", icon: Clock, badge: 28 },
            { label: "Ready to Pick", href: "/orders/ready-to-pick", icon: Package },
            { label: "In Progress", href: "/orders/in-progress", icon: Waves, badge: 45 },
            { label: "Packed", href: "/orders/packed", icon: PackageCheck },
            { label: "Ready to Ship", href: "/orders/ready-to-ship", icon: Truck, badge: 34 },
          ] },
          { title: "Exceptions", pages: [
            { label: "SLA Breached", href: "/orders/sla-breached", icon: AlertTriangle, badge: 3, badgeVariant: "danger" },
          ] },
          { title: "Tools & Reports", pages: [
            { label: "Bulk Import", href: "/orders/import", icon: Upload },
            { label: "Order Reports", href: "/orders/reports", icon: BarChart2 },
          ] },
        ],
      },
    ],
  },
  {
    id: "freight",
    title: "Freight Services",
    short: "Freight",
    desc: "Specialised service lines: 3PL, sea (LCL), air and self-storage",
    modules: [
      {
        id: "3pl", short: "3PL", title: "3PL Operations", desc: "Multi-client 3PL operations",
        href: "/3pl", icon: Layers, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Clients", pages: [
            { label: "Client Directory", href: "/3pl", icon: Users },
            { label: "Agreements", href: "/3pl/agreements", icon: Handshake },
          ] },
          { title: "Client Operations", pages: [
            { label: "ASN / Inbound Board", href: "/3pl/asn", icon: Inbox, badge: 8, badgeVariant: "warning" },
            { label: "Owned Stock Explorer", href: "/3pl/stock", icon: Package },
            { label: "VAS Work Orders", href: "/3pl/vas", icon: Wrench, badge: 3 },
            { label: "Ship-Out Queue", href: "/3pl/ship-out", icon: ShoppingCart, badge: 14 },
          ] },
          { title: "Billing", pages: [
            { label: "Billable Events", href: "/3pl/billable-events", icon: DollarSign, badge: 28, badgeVariant: "warning" },
            { label: "Invoice Run", href: "/3pl/invoices", icon: FileCheck },
          ] },
        ],
      },
      {
        id: "lcl", short: "LCL", title: "LCL Consolidation", desc: "CBM-based sea cargo consolidation",
        href: "/lcl", icon: Ship, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Overview", pages: [
            { label: "LCL Dashboard", href: "/lcl", icon: LayoutDashboard },
          ] },
          { title: "Export · Receive", pages: [
            { label: "Capture Cargo Receipt", href: "/lcl/cargo-receipt", icon: FilePlus },
            { label: "Cargo Receipts", href: "/lcl/cargo-receipts", icon: Package, badge: 9 },
            { label: "Consolidation Planner", href: "/lcl/consolidation", icon: Layers, badge: 3 },
          ] },
          { title: "Export · Build & Ship", pages: [
            { label: "Load Plan", href: "/lcl/load-plan", icon: Container },
            { label: "Manifest & Docs", href: "/lcl/manifest", icon: FileText },
          ] },
          { title: "Import", pages: [
            { label: "De-Consolidation", href: "/lcl/deconsolidation", icon: ArrowLeftRight },
          ] },
          { title: "Tracking & Reports", pages: [
            { label: "Cargo Tracking", href: "/lcl/tracking", icon: MapPin },
            { label: "LCL Reports", href: "/lcl/reports", icon: BarChart2 },
          ] },
        ],
      },
      {
        id: "air", short: "Air", title: "Air Handling", desc: "Local delivery & export routing",
        href: "/air-handling", icon: Plane, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Overview", pages: [
            { label: "Air Dashboard", href: "/air-handling", icon: LayoutDashboard },
          ] },
          { title: "Inbound", pages: [
            { label: "Package Capture", href: "/air-handling/capture", icon: Package },
            { label: "Routing Board", href: "/air-handling/routing", icon: GitBranch, badge: 12 },
          ] },
          { title: "Local Delivery", pages: [
            { label: "Courier Console", href: "/air-handling/courier", icon: Truck, badge: 8 },
          ] },
          { title: "Export", pages: [
            { label: "ULD Build & MAWB", href: "/air-handling/uld", icon: Container },
          ] },
          { title: "Tracking", pages: [
            { label: "Shipment Tracking", href: "/air-handling/tracking", icon: MapPin },
          ] },
        ],
      },
      {
        id: "storage", short: "Storage", title: "Storage-as-a-Service", desc: "Mini-warehouse & sub-lease",
        href: "/storage-saas", icon: Archive, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Overview", pages: [
            { label: "Dashboard", href: "/storage-saas", icon: LayoutDashboard },
            { label: "Customers", href: "/storage-saas/customers", icon: Users },
          ] },
          { title: "Operations", pages: [
            { label: "Quick Drop-Off", href: "/storage-saas/drop-off", icon: PackagePlus },
            { label: "Space & Sub-Lease", href: "/storage-saas/space", icon: Layers },
            { label: "Customer Stock", href: "/storage-saas/stock", icon: Package },
            { label: "Stock Release", href: "/storage-saas/releases", icon: Undo2 },
          ] },
          { title: "Finance", pages: [
            { label: "Storage Billing", href: "/storage-saas/billing", icon: DollarSign },
            { label: "Revenue & Margin", href: "/storage-saas/billing-saas", icon: TrendingUp },
          ] },
          { title: "Reports", pages: [
            { label: "Inventory Report", href: "/storage-saas/report", icon: FileText },
            { label: "Reports Library", href: "/storage-saas/reports", icon: LibraryBig },
          ] },
        ],
      },
    ],
  },
  {
    id: "resources",
    title: "Facility & Resources",
    short: "Resources",
    desc: "Space, people, equipment and scheduled jobs",
    modules: [
      {
        id: "space", short: "Space", title: "Space Management", desc: "Facility & tenant management",
        href: "/space-management", icon: Building, homeBadge: { value: "87%", type: "percent" },
        sections: [
          { title: "Overview", pages: [
            { label: "Overview", href: "/space-management", icon: Building },
            { label: "Floor Plan", href: "/space-management/floor-plan", icon: Grid3x3 },
          ] },
          { title: "Tenants & Leases", pages: [
            { label: "Tenants", href: "/space-management/tenants", icon: Users },
            { label: "Leases", href: "/space-management/leases", icon: DollarSign },
          ] },
          { title: "Setup", pages: [
            { label: "Configuration", href: "/space-management/config", icon: Settings2 },
          ] },
        ],
      },
      {
        id: "workforce", short: "Workforce", title: "Workforce", desc: "Shift & task management",
        href: "/workforce", icon: Users, homeBadge: { value: "45", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Overview", href: "/workforce", icon: Users, badge: 45 },
          ] },
          { title: "Planning", pages: [
            { label: "Shift Scheduler", href: "/workforce/shifts", icon: CalendarDays },
            { label: "Task Assignment", href: "/workforce/tasks", icon: ClipboardCheck },
          ] },
          { title: "Staff", pages: [
            { label: "Attendance", href: "/workforce/attendance", icon: Clock },
            { label: "Add Staff", href: "/workforce/add", icon: UserPlus },
          ] },
          { title: "Reports", pages: [
            { label: "Productivity", href: "/workforce/productivity", icon: BarChart3 },
          ] },
        ],
      },
      {
        id: "mhe", short: "MHE", title: "MHE Operations", desc: "Material handling equipment",
        href: "/mhe-operations", icon: Forklift, homeBadge: { value: "12", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Fleet Overview", href: "/mhe-operations", icon: Forklift, badge: 12 },
          ] },
          { title: "Operations", pages: [
            { label: "Live Tracking", href: "/mhe-operations/tracking", icon: Activity },
            { label: "Maintenance", href: "/mhe-operations/maintenance", icon: Wrench },
            { label: "Incidents", href: "/mhe-operations/incidents", icon: AlertTriangle },
          ] },
          { title: "Reports", pages: [
            { label: "Utilization", href: "/mhe-operations/utilization", icon: BarChart3 },
          ] },
        ],
      },
      {
        id: "scheduler", short: "Scheduler", title: "Scheduler", desc: "Jobs, SLAs & automation",
        href: "/scheduler", icon: CalendarClock, homeBadge: { value: "8", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Job Queue", href: "/scheduler", icon: Clock, badge: 8 },
          ] },
          { title: "Planning", pages: [
            { label: "Calendar View", href: "/scheduler/calendar", icon: CalendarDays },
            { label: "Run History", href: "/scheduler/history", icon: History },
          ] },
          { title: "Setup", pages: [
            { label: "Automation Rules", href: "/scheduler/automation", icon: Zap },
            { label: "SLA Config", href: "/scheduler/sla", icon: Settings2 },
          ] },
        ],
      },
    ],
  },
  {
    id: "finance",
    title: "Finance & Customers",
    short: "Finance",
    desc: "Invoicing, payments and the client-facing portal",
    modules: [
      {
        id: "billing", short: "Billing", title: "Billing & Invoicing", desc: "Invoices & payments",
        href: "/billing", icon: Wallet, homeBadge: { value: "12", type: "count" },
        sections: [
          { title: "Overview", pages: [
            { label: "Overview", href: "/billing", icon: DollarSign, badge: 12 },
          ] },
          { title: "Transactions", pages: [
            { label: "Invoices", href: "/billing/invoices", icon: FileText },
            { label: "Payments", href: "/billing/payments", icon: CreditCard },
          ] },
          { title: "Reports", pages: [
            { label: "Revenue Reports", href: "/billing/reports", icon: TrendingUp },
          ] },
          { title: "Setup", pages: [
            { label: "Rate Cards", href: "/billing/rate-cards", icon: Receipt },
            { label: "Billing Config", href: "/billing/config", icon: Settings2 },
          ] },
        ],
      },
      {
        id: "portal", short: "Portal", title: "Customer Portal", desc: "Client-facing inventory & orders",
        href: "/portal", icon: Globe, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Overview", pages: [
            { label: "Portal Home", href: "/portal", icon: Home },
          ] },
          { title: "My Goods", pages: [
            { label: "My Inventory", href: "/portal/inventory", icon: Package },
            { label: "Inbound (ASN)", href: "/portal/asn", icon: Inbox },
            { label: "Ship-Out", href: "/portal/ship-out", icon: Truck },
            { label: "Tracking", href: "/portal/tracking", icon: MapPin },
            { label: "VAS Requests", href: "/portal/vas", icon: Wrench },
          ] },
          { title: "My Account", pages: [
            { label: "Billing", href: "/portal/billing", icon: DollarSign },
            { label: "Reports & Docs", href: "/portal/reports", icon: FileText },
            { label: "Profile & Users", href: "/portal/profile", icon: User },
          ] },
        ],
      },
    ],
  },
  {
    id: "insights",
    title: "Insights",
    short: "Insights",
    desc: "Cross-module reports, KPIs and compliance logs",
    modules: [
      {
        id: "analytics", short: "Analytics", title: "Analytics", desc: "Dashboards & insights",
        href: "/analytics", icon: BarChart3, homeBadge: { value: "New", type: "new" },
        sections: [
          { title: "Overview", pages: [
            { label: "Overview", href: "/analytics", icon: BarChart2 },
            { label: "Performance KPIs", href: "/analytics/kpis", icon: TrendingUp },
          ] },
          { title: "Reports", pages: [
            { label: "Inventory Report", href: "/analytics/inventory", icon: Package },
            { label: "Order Report", href: "/analytics/orders", icon: ShoppingCart },
            { label: "Workforce Report", href: "/analytics/workforce", icon: Users },
          ] },
          { title: "Tools", pages: [
            { label: "Export Reports", href: "/analytics/export", icon: Download },
          ] },
        ],
      },
      {
        id: "audit", short: "Audit", title: "Audit Trail", desc: "Compliance & logging",
        href: "/audit-trail", icon: ShieldCheck,
        sections: [
          { title: "Overview", pages: [
            { label: "All Logs", href: "/audit-trail", icon: ShieldCheck },
          ] },
          { title: "Tools", pages: [
            { label: "Search Logs", href: "/audit-trail/search", icon: FileSearch },
            { label: "Audit Filters", href: "/audit-trail/filters", icon: Filter },
            { label: "Export Audit", href: "/audit-trail/export", icon: Download },
          ] },
        ],
      },
    ],
  },
  {
    id: "admin",
    title: "Administration",
    short: "Admin",
    desc: "Configure warehouses, clients and the system",
    modules: [
      {
        id: "warehouse-setup", short: "Setup", title: "Warehouse Setup", desc: "Configure warehouses & zones",
        href: "/warehouse-setup", icon: Warehouse,
        sections: [
          { title: "Overview", pages: [
            { label: "Warehouses", href: "/warehouse-setup", icon: Warehouse },
          ] },
          { title: "Layout", pages: [
            { label: "Zones & Aisles", href: "/warehouse-setup/zones", icon: Grid3x3 },
            { label: "Location Map", href: "/warehouse-setup/map", icon: Map },
          ] },
          { title: "Business", pages: [
            { label: "Clients", href: "/warehouse-setup/clients", icon: Building2 },
          ] },
          { title: "Setup", pages: [
            { label: "Configuration", href: "/warehouse-setup/config", icon: Settings2 },
          ] },
        ],
      },
      {
        id: "settings", short: "Settings", title: "Settings", desc: "Profile, security & system preferences",
        href: "/settings", icon: Settings,
      },
    ],
  },
]

/** Every module in rail order (excluding Home). */
export const ALL_MODULES: NavModule[] = NAV_GROUPS.flatMap((g) => g.modules)

export function getModule(id: string): NavModule {
  const mod = id === HOME_MODULE.id ? HOME_MODULE : ALL_MODULES.find((m) => m.id === id)
  if (!mod) throw new Error(`Unknown navigation module "${id}"`)
  return mod
}

export function getGroupOf(moduleId: string): NavGroup | undefined {
  return NAV_GROUPS.find((g) => g.modules.some((m) => m.id === moduleId))
}

export function isUnder(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}

/** Flat index of every page, used by global search. */
export const SEARCH_INDEX: { label: string; href: string; module: NavModule; group: string; section?: string }[] =
  NAV_GROUPS.flatMap((g) =>
    g.modules.flatMap((m) =>
      m.sections
        ? m.sections.flatMap((s) => s.pages.map((p) => ({ label: p.label, href: p.href, module: m, group: g.title, section: s.title })))
        : [{ label: m.title, href: m.href, module: m, group: g.title }],
    ),
  )
