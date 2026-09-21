/** Shared LCL demo seed data — keeps IDs consistent across load-plan, consolidation, manifest, tracking. */

export type LclShipperLine = { id: string; shipper: string; cbm: number; kg: number; pieces: number }

export type LclContainerPlan = {
  id: string
  route: string
  vessel: string
  voyage: string
  etd: string
  eta: string
  cbm: number
  kg: number
  shippers: LclShipperLine[]
  status: string
}

export type LclLoadPlanTemplate = { name: string; route: string; vessel: string; voyage: string; description: string }

export type LclPoolReceipt = {
  id: string; shipper: string; shipperInit: string; shipperColor: string
  cbm: number; pieces: number; kg: number; pod: string; dwell: number; hazmat?: boolean
}

export type LclConsol = {
  id: string; route: string; mode: string; cutoff: string
  cbmMax: number; kgMax: number; status: string; items: LclPoolReceipt[]
}

export type LclCargoReceiptRow = {
  id: string; shipper: string; pieces: number; weight: string; cbm: string
  eta: string; status: string; lot: string
}

export type LclManifestLine = {
  ref: string; shipper: string; hbl: string; pieces: number; cbm: number; kg: number; pod: string
}

export type LclManifestDoc = { name: string; type: string; status: string }

export type LclExpectedLine = {
  ref: string; consignee: string; initials: string; color: string
  expectedPcs: number; expectedCbm: number; expectedWt: number; status: string
}

export type LclShipment = {
  ref: string; shipper: string; initials: string; color: string; pod: string
  pieces: number; cbm: number; eta: string; stage: number; mode: string; consol: string
}

export type LclDashboardConsol = {
  id: string; route: string; cbm: number; cbmMax: number; kg: number; kgMax: number
  shippers: number; status: string; cutoff: string
}

export type LclDashboardReceipt = { id: string; shipper: string; cbm: number; pieces: number; status: string; time: string }

export type LclReport = { id: string; name: string; period: string; size: string; status: string }

const poolSlice = (ids: string[]) => LCL_RECEIPT_POOL.filter(r => ids.includes(r.id))

export const LCL_RECEIPT_POOL: LclPoolReceipt[] = [
  { id: "CR-0891", shipper: "Apex Pharma", shipperInit: "AP", shipperColor: "bg-blue-500", cbm: 2.4, pieces: 18, kg: 960, pod: "CNSHA", dwell: 4 },
  { id: "CR-0892", shipper: "GlobalTex", shipperInit: "GT", shipperColor: "bg-amber-500", cbm: 5.6, pieces: 40, kg: 2800, pod: "CNSHA", dwell: 2 },
  { id: "CR-0893", shipper: "Nova Textiles", shipperInit: "NT", shipperColor: "bg-violet-500", cbm: 3.8, pieces: 28, kg: 1420, pod: "CNSHA", dwell: 6 },
  { id: "CR-0894", shipper: "AutoParts India", shipperInit: "AI", shipperColor: "bg-cyan-500", cbm: 8.3, pieces: 62, kg: 4150, pod: "SGSIN", dwell: 1 },
  { id: "CR-0895", shipper: "MediSupply", shipperInit: "MS", shipperColor: "bg-rose-500", cbm: 1.8, pieces: 12, kg: 540, pod: "AEDXB", dwell: 5, hazmat: true },
  { id: "CR-0896", shipper: "FreshFarm", shipperInit: "FF", shipperColor: "bg-orange-500", cbm: 3.2, pieces: 24, kg: 1600, pod: "CNSHA", dwell: 3 },
  { id: "CR-0897", shipper: "Sunrise Elec.", shipperInit: "SE", shipperColor: "bg-emerald-500", cbm: 4.1, pieces: 30, kg: 2050, pod: "CNSHA", dwell: 2 },
  { id: "CR-0898", shipper: "Orient Spices", shipperInit: "OS", shipperColor: "bg-yellow-500", cbm: 2.9, pieces: 22, kg: 1180, pod: "SGSIN", dwell: 3 },
  { id: "CR-0899", shipper: "AutoParts India", shipperInit: "AI", shipperColor: "bg-cyan-500", cbm: 7.1, pieces: 52, kg: 7390, pod: "CNSHA", dwell: 1 },
  { id: "CR-0900", shipper: "BlueLeaf Cosmetics", shipperInit: "BL", shipperColor: "bg-pink-500", cbm: 1.5, pieces: 14, kg: 420, pod: "NLRTM", dwell: 7 },
  { id: "CR-0901", shipper: "Vertex Tools", shipperInit: "VT", shipperColor: "bg-slate-500", cbm: 6.2, pieces: 44, kg: 3100, pod: "USNYC", dwell: 2 },
  { id: "CR-0902", shipper: "Deccan Ceramics", shipperInit: "DC", shipperColor: "bg-teal-500", cbm: 9.4, pieces: 36, kg: 5200, pod: "CNSHA", dwell: 4 },
  { id: "CR-0903", shipper: "Kirloskar Spares", shipperInit: "KS", shipperColor: "bg-indigo-500", cbm: 4.7, pieces: 31, kg: 2280, pod: "AEDXB", dwell: 5 },
  { id: "CR-0904", shipper: "Sweet Mills", shipperInit: "SM", shipperColor: "bg-lime-500", cbm: 3.3, pieces: 26, kg: 1760, pod: "SGSIN", dwell: 2 },
  { id: "CR-0905", shipper: "GlobalTex", shipperInit: "GT", shipperColor: "bg-amber-500", cbm: 5.1, pieces: 38, kg: 2540, pod: "CNSHA", dwell: 1 },
  { id: "CR-0906", shipper: "Apex Pharma", shipperInit: "AP", shipperColor: "bg-blue-500", cbm: 2.2, pieces: 16, kg: 880, pod: "NLRTM", dwell: 3 },
  { id: "CR-0907", shipper: "MediSupply", shipperInit: "MS", shipperColor: "bg-rose-500", cbm: 2.6, pieces: 20, kg: 920, pod: "SGSIN", dwell: 4, hazmat: true },
  { id: "CR-0908", shipper: "FreshFarm", shipperInit: "FF", shipperColor: "bg-orange-500", cbm: 4.4, pieces: 32, kg: 1980, pod: "CNSHA", dwell: 2 },
]

export const LCL_LOAD_PLAN_CONTAINERS: LclContainerPlan[] = [
  {
    id: "LCL-CON-0041", route: "INBOM → CNSHA", vessel: "EVER GIVEN", voyage: "2025W31",
    etd: "Jul 28, 2025", eta: "Aug 14, 2025", cbm: 22.4, kg: 14800,
    shippers: [
      { id: "CR-0891", shipper: "Apex Pharma", cbm: 2.4, kg: 960, pieces: 18 },
      { id: "CR-0892", shipper: "GlobalTex", cbm: 5.6, kg: 2800, pieces: 40 },
      { id: "CR-0896", shipper: "FreshFarm", cbm: 3.2, kg: 1600, pieces: 24 },
      { id: "CR-0897", shipper: "Sunrise Elec.", cbm: 4.1, kg: 2050, pieces: 30 },
      { id: "CR-0899", shipper: "AutoParts India", cbm: 7.1, kg: 7390, pieces: 52 },
    ],
    status: "confirmed",
  },
  {
    id: "LCL-CON-0042", route: "INBOM → SGSIN", vessel: "MSC DIANA", voyage: "2025W32",
    etd: "Aug 4, 2025", eta: "Aug 11, 2025", cbm: 8.3, kg: 4150,
    shippers: [{ id: "CR-0894", shipper: "AutoParts India", cbm: 8.3, kg: 4150, pieces: 62 }],
    status: "building",
  },
  {
    id: "LCL-CON-0043", route: "INMAA → AEDXB", vessel: "MAERSK KOTKA", voyage: "2025W33",
    etd: "Aug 8, 2025", eta: "Aug 18, 2025", cbm: 12.6, kg: 6820,
    shippers: [
      { id: "CR-0895", shipper: "MediSupply", cbm: 1.8, kg: 540, pieces: 12 },
      { id: "CR-0903", shipper: "Kirloskar Spares", cbm: 4.7, kg: 2280, pieces: 31 },
      { id: "CR-0907", shipper: "MediSupply", cbm: 2.6, kg: 920, pieces: 20 },
      { id: "CR-0893", shipper: "Nova Textiles", cbm: 3.5, kg: 2080, pieces: 26 },
    ],
    status: "building",
  },
  {
    id: "LCL-CON-0044", route: "INBOM → USNYC", vessel: "CMA CGM MARCO POLO", voyage: "2025W34",
    etd: "Aug 12, 2025", eta: "Sep 2, 2025", cbm: 6.2, kg: 3100,
    shippers: [{ id: "CR-0901", shipper: "Vertex Tools", cbm: 6.2, kg: 3100, pieces: 44 }],
    status: "planned",
  },
  {
    id: "LCL-CON-0045", route: "INNSA → NLRTM", vessel: "OOCL SPAIN", voyage: "2025W30",
    etd: "Jul 15, 2025", eta: "Aug 5, 2025", cbm: 4.1, kg: 2100,
    shippers: [
      { id: "CR-0900", shipper: "BlueLeaf Cosmetics", cbm: 1.5, kg: 420, pieces: 14 },
      { id: "CR-0906", shipper: "Apex Pharma", cbm: 2.2, kg: 880, pieces: 16 },
    ],
    status: "confirmed",
  },
  {
    id: "LCL-CON-0038", route: "INBOM → CNSHA", vessel: "EVER GIVEN", voyage: "2025W28",
    etd: "Jul 10, 2025", eta: "Jul 28, 2025", cbm: 24.8, kg: 16200,
    shippers: [
      { id: "CR-0881", shipper: "GlobalTex", cbm: 8.2, kg: 4200, pieces: 58 },
      { id: "CR-0882", shipper: "Apex Pharma", cbm: 6.4, kg: 3100, pieces: 42 },
      { id: "CR-0883", shipper: "Sunrise Elec.", cbm: 10.2, kg: 8900, pieces: 64 },
    ],
    status: "completed",
  },
  {
    id: "LCL-CON-0039", route: "INBOM → SGSIN", vessel: "MSC DIANA", voyage: "2025W29",
    etd: "Jul 18, 2025", eta: "Jul 26, 2025", cbm: 18.5, kg: 11400,
    shippers: [
      { id: "CR-0884", shipper: "AutoParts India", cbm: 9.1, kg: 5600, pieces: 72 },
      { id: "CR-0885", shipper: "FreshFarm", cbm: 9.4, kg: 5800, pieces: 48 },
    ],
    status: "completed",
  },
  {
    id: "LCL-CON-0040", route: "INMAA → AEDXB", vessel: "MAERSK KOTKA", voyage: "2025W27",
    etd: "Jul 5, 2025", eta: "Jul 16, 2025", cbm: 15.2, kg: 9200,
    shippers: [
      { id: "CR-0886", shipper: "MediSupply", cbm: 4.2, kg: 2100, pieces: 28 },
      { id: "CR-0887", shipper: "Orient Spices", cbm: 11.0, kg: 7100, pieces: 86 },
    ],
    status: "completed",
  },
  {
    id: "LCL-CON-0035", route: "INBOM → CNSHA", vessel: "EVER GIVEN", voyage: "2025W25",
    etd: "Jun 20, 2025", eta: "Jul 8, 2025", cbm: 0, kg: 0, shippers: [],
    status: "cancelled",
  },
  {
    id: "LCL-CON-0036", route: "INBOM → USNYC", vessel: "OOCL SPAIN", voyage: "2025W26",
    etd: "Jun 28, 2025", eta: "Jul 22, 2025", cbm: 3.8, kg: 1940,
    shippers: [{ id: "CR-0878", shipper: "Vertex Tools", cbm: 3.8, kg: 1940, pieces: 22 }],
    status: "cancelled",
  },
  {
    id: "LCL-CON-0037", route: "INNSA → NLRTM", vessel: "CMA CGM MARCO POLO", voyage: "2025W24",
    etd: "Jun 12, 2025", eta: "Jul 1, 2025", cbm: 7.6, kg: 4200,
    shippers: [
      { id: "CR-0879", shipper: "BlueLeaf Cosmetics", cbm: 2.1, kg: 980, pieces: 18 },
      { id: "CR-0880", shipper: "Deccan Ceramics", cbm: 5.5, kg: 3220, pieces: 24 },
    ],
    status: "cancelled",
  },
]

export const LCL_LOAD_PLAN_TEMPLATES: LclLoadPlanTemplate[] = [
  { name: "Bombay → Shanghai weekly", route: "INBOM → CNSHA", vessel: "EVER GIVEN", voyage: "2025W33", description: "Standard 40' HC, Thursday cutoff" },
  { name: "Bombay → Singapore express", route: "INBOM → SGSIN", vessel: "MSC DIANA", voyage: "2025W33", description: "7-day transit, Monday cutoff" },
  { name: "Chennai → Dubai", route: "INMAA → AEDXB", vessel: "MAERSK KOTKA", voyage: "2025W34", description: "Consol box, DG-friendly" },
  { name: "Bombay → New York", route: "INBOM → USNYC", vessel: "CMA CGM MARCO POLO", voyage: "2025W35", description: "Transatlantic LCL, 21-day transit" },
  { name: "Nhava → Rotterdam", route: "INNSA → NLRTM", vessel: "OOCL SPAIN", voyage: "2025W35", description: "EU lane, weekly sailing" },
  { name: "Chennai → Shanghai", route: "INMAA → CNSHA", vessel: "EVER GIVEN", voyage: "2025W36", description: "South India feed into Shanghai hub" },
]

// Excludes receipts already committed to a load-plan container (CR-0891/0892/0894/0896/0897/0899)
// and receipts already sitting inside one of the initial consolidations below, so the same
// cargo receipt never appears as "available" in the pool while already allocated.
export const LCL_CONSOLIDATION_POOL: LclPoolReceipt[] = LCL_RECEIPT_POOL.filter(r =>
  !["CR-0891", "CR-0892", "CR-0894", "CR-0896", "CR-0897", "CR-0899",
    "CR-0898", "CR-0900", "CR-0903", "CR-0904", "CR-0905", "CR-0906"].includes(r.id)
)

export const LCL_INITIAL_CONSOLS: LclConsol[] = [
  {
    id: "CON-001", route: "INBOM → CNSHA", mode: "FCL 20'", cutoff: "2025-07-28",
    cbmMax: 25, kgMax: 18000, status: "Building",
    items: poolSlice(["CR-0897", "CR-0905"]),
  },
  {
    id: "CON-002", route: "INBOM → SGSIN", mode: "LCL", cutoff: "2025-08-04",
    cbmMax: 25, kgMax: 18000, status: "Confirmed",
    items: poolSlice(["CR-0904", "CR-0898"]),
  },
  {
    id: "CON-003", route: "INMAA → AEDXB", mode: "FCL 40'", cutoff: "2025-08-10",
    cbmMax: 55, kgMax: 26000, status: "Building",
    items: poolSlice(["CR-0903"]),
  },
  {
    id: "CON-004", route: "INNSA → NLRTM", mode: "LCL", cutoff: "2025-07-20",
    cbmMax: 25, kgMax: 18000, status: "Closed",
    items: poolSlice(["CR-0900", "CR-0906"]),
  },
]

export const LCL_CARGO_RECEIPTS: LclCargoReceiptRow[] = [
  { id: "CR-001", shipper: "Global Exports Ltd", pieces: 48, weight: "1,240 kg", cbm: "8.4", eta: "2025-07-20", status: "Received", lot: "LOT-2025-0441" },
  { id: "CR-002", shipper: "Acme Trade Co", pieces: 120, weight: "3,100 kg", cbm: "22.1", eta: "2025-07-20", status: "Partially Received", lot: "LOT-2025-0442" },
  { id: "CR-003", shipper: "Pacific Goods", pieces: 30, weight: "820 kg", cbm: "5.2", eta: "2025-07-21", status: "Expected", lot: "LOT-2025-0443" },
  { id: "CR-004", shipper: "Delta Shippers", pieces: 200, weight: "4,800 kg", cbm: "34.0", eta: "2025-07-21", status: "Expected", lot: "LOT-2025-0444" },
  { id: "CR-005", shipper: "Prime Logistics", pieces: 60, weight: "1,580 kg", cbm: "11.2", eta: "2025-07-19", status: "Received", lot: "LOT-2025-0440" },
  { id: "CR-006", shipper: "Apex Pharma Ltd", pieces: 36, weight: "960 kg", cbm: "2.4", eta: "2025-07-22", status: "Expected", lot: "LOT-2025-0445" },
  { id: "CR-007", shipper: "GlobalTex Fabrics", pieces: 88, weight: "2,800 kg", cbm: "5.6", eta: "2025-07-22", status: "Partially Received", lot: "LOT-2025-0446" },
  { id: "CR-008", shipper: "Sunrise Electronics", pieces: 42, weight: "2,050 kg", cbm: "4.1", eta: "2025-07-23", status: "Expected", lot: "LOT-2025-0447" },
  { id: "CR-009", shipper: "MediSupply Corp", pieces: 24, weight: "540 kg", cbm: "1.8", eta: "2025-07-23", status: "Received", lot: "LOT-2025-0448" },
  { id: "CR-010", shipper: "FreshFarm Organics", pieces: 52, weight: "1,600 kg", cbm: "3.2", eta: "2025-07-24", status: "Expected", lot: "LOT-2025-0449" },
  { id: "CR-011", shipper: "AutoParts India", pieces: 96, weight: "7,390 kg", cbm: "7.1", eta: "2025-07-24", status: "Partially Received", lot: "LOT-2025-0450" },
  { id: "CR-012", shipper: "Nova Textiles", pieces: 44, weight: "1,420 kg", cbm: "3.8", eta: "2025-07-25", status: "Expected", lot: "LOT-2025-0451" },
  { id: "CR-013", shipper: "Orient Spices Co", pieces: 72, weight: "2,900 kg", cbm: "2.9", eta: "2025-07-25", status: "Received", lot: "LOT-2025-0452" },
  { id: "CR-014", shipper: "Vertex Tools Ltd", pieces: 58, weight: "3,100 kg", cbm: "6.2", eta: "2025-07-26", status: "Expected", lot: "LOT-2025-0453" },
  { id: "CR-015", shipper: "BlueLeaf Cosmetics", pieces: 28, weight: "420 kg", cbm: "1.5", eta: "2025-07-26", status: "Received", lot: "LOT-2025-0454" },
  { id: "CR-016", shipper: "Deccan Ceramics", pieces: 38, weight: "5,200 kg", cbm: "9.4", eta: "2025-07-27", status: "Expected", lot: "LOT-2025-0455" },
  { id: "CR-017", shipper: "Kirloskar Spares", pieces: 34, weight: "2,280 kg", cbm: "4.7", eta: "2025-07-27", status: "Partially Received", lot: "LOT-2025-0456" },
  { id: "CR-018", shipper: "Sweet Mills Pvt Ltd", pieces: 46, weight: "1,760 kg", cbm: "3.3", eta: "2025-07-28", status: "Expected", lot: "LOT-2025-0457" },
]

export const LCL_MANIFEST_LINES: LclManifestLine[] = [
  { ref: "CR-0891", shipper: "Apex Pharma", hbl: "HBL-2025-0891", pieces: 18, cbm: 2.4, kg: 960, pod: "CNSHA" },
  { ref: "CR-0892", shipper: "GlobalTex", hbl: "HBL-2025-0892", pieces: 40, cbm: 5.6, kg: 2800, pod: "CNSHA" },
  { ref: "CR-0896", shipper: "FreshFarm", hbl: "HBL-2025-0896", pieces: 24, cbm: 3.2, kg: 1600, pod: "CNSHA" },
  { ref: "CR-0897", shipper: "Sunrise Elec.", hbl: "HBL-2025-0897", pieces: 30, cbm: 4.1, kg: 2050, pod: "CNSHA" },
  { ref: "CR-0899", shipper: "AutoParts India", hbl: "HBL-2025-0899", pieces: 52, cbm: 7.1, kg: 7390, pod: "CNSHA" },
  { ref: "CR-0894", shipper: "AutoParts India", hbl: "HBL-2025-0894", pieces: 62, cbm: 8.3, kg: 4150, pod: "SGSIN" },
  { ref: "CR-0895", shipper: "MediSupply", hbl: "HBL-2025-0895", pieces: 12, cbm: 1.8, kg: 540, pod: "AEDXB" },
  { ref: "CR-0903", shipper: "Kirloskar Spares", hbl: "HBL-2025-0903", pieces: 31, cbm: 4.7, kg: 2280, pod: "AEDXB" },
  { ref: "CR-0901", shipper: "Vertex Tools", hbl: "HBL-2025-0901", pieces: 44, cbm: 6.2, kg: 3100, pod: "USNYC" },
  { ref: "CR-0902", shipper: "Deccan Ceramics", hbl: "HBL-2025-0902", pieces: 36, cbm: 9.4, kg: 5200, pod: "CNSHA" },
  { ref: "CR-0900", shipper: "BlueLeaf Cosmetics", hbl: "HBL-2025-0900", pieces: 14, cbm: 1.5, kg: 420, pod: "NLRTM" },
  { ref: "CR-0906", shipper: "Apex Pharma", hbl: "HBL-2025-0906", pieces: 16, cbm: 2.2, kg: 880, pod: "NLRTM" },
  { ref: "CR-0904", shipper: "Sweet Mills", hbl: "HBL-2025-0904", pieces: 26, cbm: 3.3, kg: 1760, pod: "SGSIN" },
  { ref: "CR-0908", shipper: "FreshFarm", hbl: "HBL-2025-0908", pieces: 32, cbm: 4.4, kg: 1980, pod: "CNSHA" },
  { ref: "CR-0905", shipper: "GlobalTex", hbl: "HBL-2025-0905", pieces: 38, cbm: 5.1, kg: 2540, pod: "CNSHA" },
]

export const LCL_MANIFEST_DOCS: LclManifestDoc[] = [
  { name: "Master Bill of Lading — EVER GIVEN 2025W31", type: "MBL", status: "Ready" },
  { name: "Container Packing List — LCL-CON-0041", type: "Packing List", status: "Ready" },
  { name: "Shipping Instructions — CNSHA", type: "SI", status: "Ready" },
  { name: "VGM Declaration — LCL-CON-0041", type: "VGM", status: "Pending" },
  { name: "Customs Entry Summary — INBOM", type: "Customs", status: "Ready" },
  { name: "Master Bill of Lading — MSC DIANA 2025W32", type: "MBL", status: "Pending" },
  { name: "Dangerous Goods Manifest — CR-0895", type: "DG", status: "Ready" },
  { name: "Commercial Invoice Pack — Consolidation", type: "Invoice", status: "Ready" },
]

export const LCL_DECONSOL_LINES: LclExpectedLine[] = [
  { ref: "CFS-2024-0451", consignee: "Apex Pharma Ltd", initials: "AP", color: "bg-blue-500", expectedPcs: 48, expectedCbm: 8.2, expectedWt: 1240, status: "De-Stuffed" },
  { ref: "CFS-2024-0452", consignee: "GlobalTex Fabrics", initials: "GT", color: "bg-amber-500", expectedPcs: 120, expectedCbm: 22.4, expectedWt: 3800, status: "De-Stuffed" },
  { ref: "CFS-2024-0453", consignee: "MediSupply Corp", initials: "MS", color: "bg-rose-500", expectedPcs: 36, expectedCbm: 4.6, expectedWt: 720, status: "Pending" },
  { ref: "CFS-2024-0454", consignee: "Sunrise Electronics", initials: "SE", color: "bg-emerald-500", expectedPcs: 24, expectedCbm: 5.1, expectedWt: 960, status: "Pending" },
  { ref: "CFS-2024-0455", consignee: "FreshFarm Organics", initials: "FF", color: "bg-orange-500", expectedPcs: 60, expectedCbm: 11.8, expectedWt: 2100, status: "Pending" },
  { ref: "CFS-2024-0456", consignee: "AutoParts India", initials: "AI", color: "bg-cyan-500", expectedPcs: 86, expectedCbm: 15.4, expectedWt: 6200, status: "De-Stuffed" },
  { ref: "CFS-2024-0457", consignee: "Nova Textiles", initials: "NT", color: "bg-violet-500", expectedPcs: 44, expectedCbm: 7.8, expectedWt: 1680, status: "Pending" },
  { ref: "CFS-2024-0458", consignee: "Orient Spices Co", initials: "OS", color: "bg-yellow-500", expectedPcs: 72, expectedCbm: 9.2, expectedWt: 2400, status: "Pending" },
  { ref: "CFS-2024-0459", consignee: "Vertex Tools Ltd", initials: "VT", color: "bg-slate-500", expectedPcs: 52, expectedCbm: 6.8, expectedWt: 1980, status: "De-Stuffed" },
  { ref: "CFS-2024-0460", consignee: "BlueLeaf Cosmetics", initials: "BL", color: "bg-pink-500", expectedPcs: 28, expectedCbm: 3.1, expectedWt: 640, status: "Pending" },
  { ref: "CFS-2024-0461", consignee: "Deccan Ceramics", initials: "DC", color: "bg-teal-500", expectedPcs: 38, expectedCbm: 9.4, expectedWt: 5200, status: "Pending" },
  { ref: "CFS-2024-0462", consignee: "Kirloskar Spares", initials: "KS", color: "bg-indigo-500", expectedPcs: 34, expectedCbm: 4.7, expectedWt: 2280, status: "Pending" },
]

export const LCL_SHIPMENTS: LclShipment[] = [
  { ref: "CFS-2024-0451", shipper: "Apex Pharma Ltd", initials: "AP", color: "bg-blue-500", pod: "INMUN", pieces: 48, cbm: 8.2, eta: "28 Jul 2026", stage: 5, mode: "LCL", consol: "CONSOL-2024-087" },
  { ref: "CFS-2024-0452", shipper: "GlobalTex Fabrics", initials: "GT", color: "bg-amber-500", pod: "INCKP", pieces: 120, cbm: 22.4, eta: "2 Aug 2026", stage: 2, mode: "LCL", consol: "CONSOL-2024-088" },
  { ref: "CFS-2024-0453", shipper: "MediSupply Corp", initials: "MS", color: "bg-rose-500", pod: "INHYD", pieces: 36, cbm: 4.6, eta: "31 Jul 2026", stage: 3, mode: "LCL", consol: "CONSOL-2024-087" },
  { ref: "CFS-2024-0454", shipper: "Sunrise Electronics", initials: "SE", color: "bg-emerald-500", pod: "INMUN", pieces: 24, cbm: 5.1, eta: "28 Jul 2026", stage: 4, mode: "LCL", consol: "CONSOL-2024-087" },
  { ref: "CFS-2024-0455", shipper: "FreshFarm Organics", initials: "FF", color: "bg-orange-500", pod: "INBLR", pieces: 60, cbm: 11.8, eta: "3 Aug 2026", stage: 1, mode: "LCL", consol: "CONSOL-2024-088" },
  { ref: "CFS-2024-0456", shipper: "AutoParts India", initials: "AI", color: "bg-cyan-500", pod: "INNSA", pieces: 86, cbm: 15.4, eta: "5 Aug 2026", stage: 0, mode: "LCL", consol: "CONSOL-2024-089" },
  { ref: "CFS-2024-0457", shipper: "Nova Textiles", initials: "NT", color: "bg-violet-500", pod: "INMAA", pieces: 44, cbm: 7.8, eta: "6 Aug 2026", stage: 2, mode: "LCL", consol: "CONSOL-2024-089" },
  { ref: "CFS-2024-0458", shipper: "Orient Spices Co", initials: "OS", color: "bg-yellow-500", pod: "INCCU", pieces: 72, cbm: 9.2, eta: "7 Aug 2026", stage: 3, mode: "LCL", consol: "CONSOL-2024-090" },
  { ref: "CFS-2024-0459", shipper: "Vertex Tools Ltd", initials: "VT", color: "bg-slate-500", pod: "INPNQ", pieces: 52, cbm: 6.8, eta: "8 Aug 2026", stage: 4, mode: "LCL", consol: "CONSOL-2024-090" },
  { ref: "CFS-2024-0460", shipper: "BlueLeaf Cosmetics", initials: "BL", color: "bg-pink-500", pod: "INBOM", pieces: 28, cbm: 3.1, eta: "9 Aug 2026", stage: 1, mode: "LCL", consol: "CONSOL-2024-091" },
  { ref: "CFS-2024-0461", shipper: "Deccan Ceramics", initials: "DC", color: "bg-teal-500", pod: "INHYD", pieces: 38, cbm: 9.4, eta: "10 Aug 2026", stage: 0, mode: "LCL", consol: "CONSOL-2024-091" },
  { ref: "CFS-2024-0462", shipper: "Kirloskar Spares", initials: "KS", color: "bg-indigo-500", pod: "INBLR", pieces: 34, cbm: 4.7, eta: "11 Aug 2026", stage: 5, mode: "LCL", consol: "CONSOL-2024-092" },
  { ref: "CFS-2024-0463", shipper: "Sweet Mills Pvt Ltd", initials: "SM", color: "bg-lime-500", pod: "INMUN", pieces: 46, cbm: 3.3, eta: "12 Aug 2026", stage: 2, mode: "LCL", consol: "CONSOL-2024-092" },
  { ref: "CFS-2024-0464", shipper: "GlobalTex Fabrics", initials: "GT", color: "bg-amber-500", pod: "INNSA", pieces: 64, cbm: 10.8, eta: "13 Aug 2026", stage: 3, mode: "LCL", consol: "CONSOL-2024-093" },
  { ref: "CFS-2024-0465", shipper: "Apex Pharma Ltd", initials: "AP", color: "bg-blue-500", pod: "INDEL", pieces: 22, cbm: 2.2, eta: "14 Aug 2026", stage: 4, mode: "LCL", consol: "CONSOL-2024-093" },
]

export const LCL_DASHBOARD_CONSOLS: LclDashboardConsol[] = [
  { id: "CON-001", route: "INBOM → CNSHA", cbm: 14.2, cbmMax: 25, kg: 11500, kgMax: 18000, shippers: 4, status: "Building", cutoff: "8h" },
  { id: "CON-002", route: "INBOM → SGSIN", cbm: 7.7, cbmMax: 25, kg: 8200, kgMax: 18000, shippers: 2, status: "Confirmed", cutoff: "23h" },
  { id: "CON-003", route: "INMAA → AEDXB", cbm: 9.4, cbmMax: 55, kg: 6800, kgMax: 26000, shippers: 1, status: "Building", cutoff: "2d" },
  { id: "CON-004", route: "INNSA → NLRTM", cbm: 3.7, cbmMax: 25, kg: 5400, kgMax: 18000, shippers: 2, status: "Closed", cutoff: "Done" },
  { id: "CON-005", route: "INBOM → USNYC", cbm: 6.2, cbmMax: 25, kg: 9100, kgMax: 18000, shippers: 1, status: "Building", cutoff: "4d" },
  { id: "CON-006", route: "INBOM → CNSHA", cbm: 22.4, cbmMax: 28, kg: 15200, kgMax: 24000, shippers: 5, status: "Confirmed", cutoff: "12h" },
  { id: "CON-007", route: "INMAA → CNSHA", cbm: 11.8, cbmMax: 25, kg: 12000, kgMax: 18000, shippers: 3, status: "Building", cutoff: "3d" },
  { id: "CON-008", route: "INNSA → SGSIN", cbm: 18.5, cbmMax: 25, kg: 7900, kgMax: 18000, shippers: 2, status: "Closed", cutoff: "Done" },
]

export const LCL_DASHBOARD_RECEIPTS: LclDashboardReceipt[] = [
  { id: "CR-0891", shipper: "Apex Pharma", cbm: 2.4, pieces: 18, status: "Allocated", time: "10 min ago" },
  { id: "CR-0892", shipper: "GlobalTex", cbm: 5.6, pieces: 40, status: "Allocated", time: "25 min ago" },
  { id: "CR-0898", shipper: "Orient Spices", cbm: 2.9, pieces: 22, status: "In Pool", time: "1 hr ago" },
  { id: "CR-0900", shipper: "BlueLeaf Cosmetics", cbm: 1.5, pieces: 14, status: "In Pool", time: "2 hr ago" },
  { id: "CR-0901", shipper: "Vertex Tools", cbm: 6.2, pieces: 44, status: "Received", time: "3 hr ago" },
  { id: "CR-0902", shipper: "Deccan Ceramics", cbm: 9.4, pieces: 36, status: "Received", time: "4 hr ago" },
  { id: "CR-0903", shipper: "Kirloskar Spares", cbm: 4.7, pieces: 31, status: "Allocated", time: "5 hr ago" },
  { id: "CR-0904", shipper: "Sweet Mills", cbm: 3.3, pieces: 26, status: "Allocated", time: "6 hr ago" },
  { id: "CR-0905", shipper: "GlobalTex", cbm: 5.1, pieces: 38, status: "In Pool", time: "Yesterday" },
  { id: "CR-0906", shipper: "Apex Pharma", cbm: 2.2, pieces: 16, status: "In Pool", time: "Yesterday" },
  { id: "CR-0907", shipper: "MediSupply", cbm: 2.6, pieces: 20, status: "Received", time: "Yesterday" },
  { id: "CR-0908", shipper: "FreshFarm", cbm: 4.4, pieces: 32, status: "Allocated", time: "2 days ago" },
]

export const LCL_REPORTS: LclReport[] = [
  { id: "RPT-001", name: "Consolidation Summary", period: "Jul 2025", size: "1.2 MB", status: "Ready" },
  { id: "RPT-002", name: "Cargo Receipt Register", period: "Jul 2025", size: "0.9 MB", status: "Ready" },
  { id: "RPT-003", name: "Load Plan Efficiency Report", period: "Jul 2025", size: "0.8 MB", status: "Generating" },
  { id: "RPT-004", name: "Manifest Reconciliation", period: "Jun 2025", size: "1.4 MB", status: "Ready" },
  { id: "RPT-005", name: "De-Consolidation Variance", period: "Jun 2025", size: "0.6 MB", status: "Ready" },
  { id: "RPT-006", name: "Shipper CBM Utilisation", period: "Q2 2025", size: "2.1 MB", status: "Ready" },
  { id: "RPT-007", name: "Transit Time Analysis", period: "Q2 2025", size: "1.8 MB", status: "Ready" },
  { id: "RPT-008", name: "HBL Status Report", period: "Jul 2025", size: "0.5 MB", status: "Generating" },
  { id: "RPT-009", name: "Cutoff Compliance", period: "Jul 2025", size: "0.7 MB", status: "Ready" },
  { id: "RPT-010", name: "POD Delivery Performance", period: "Jun 2025", size: "1.1 MB", status: "Ready" },
  { id: "RPT-011", name: "DG Cargo Manifest", period: "Jul 2025", size: "0.4 MB", status: "Ready" },
  { id: "RPT-012", name: "Weekly Ops Dashboard", period: "W31 2025", size: "1.6 MB", status: "Ready" },
]

export const LCL_CAPTURE_CLIENTS = [
  "Apex Pharma Ltd", "Sunrise Electronics", "GlobalTex Fabrics", "FreshFarm Organics",
  "MediSupply Corp", "AutoParts India", "Nova Textiles", "Orient Spices Co",
  "Vertex Tools Ltd", "BlueLeaf Cosmetics", "Deccan Ceramics Ltd", "Kirloskar Spares",
] as const

export type LclCapturedReceipt = {
  id: string; shipper: string; pod: string; service: string; awb: string
  pieces: number; weight: number; cbm: number; docs: string; capturedAt: string; location: string
}

export const LCL_CAPTURED_RECEIPTS: LclCapturedReceipt[] = [
  { id: "CAP-2025-0412", shipper: "Apex Pharma Ltd", pod: "INMUN – Mundra", service: "LCL-Standard", awb: "AWB-77881234", pieces: 18, weight: 960, cbm: 2.4, docs: "Invoice, Packing List", capturedAt: "2025-07-20 09:14", location: "CFS Bay A-12" },
  { id: "CAP-2025-0411", shipper: "GlobalTex Fabrics", pod: "INNSA – Nhava Sheva", service: "LCL-Express", awb: "AWB-77881201", pieces: 40, weight: 2800, cbm: 5.6, docs: "Invoice, Photo", capturedAt: "2025-07-20 08:42", location: "CFS Bay B-04" },
  { id: "CAP-2025-0410", shipper: "MediSupply Corp", pod: "INCKP – Chennai", service: "LCL-Standard", awb: "AWB-77881188", pieces: 12, weight: 540, cbm: 1.8, docs: "Invoice, DG Declaration", capturedAt: "2025-07-19 17:55", location: "DG Hold Zone" },
  { id: "CAP-2025-0409", shipper: "Sunrise Electronics", pod: "INHYD – Hyderabad ICD", service: "LCL-Express", awb: "AWB-77881172", pieces: 30, weight: 2050, cbm: 4.1, docs: "Invoice, Packing List", capturedAt: "2025-07-19 16:20", location: "CFS Bay A-08" },
  { id: "CAP-2025-0408", shipper: "FreshFarm Organics", pod: "INMUN – Mundra", service: "LCL-Standard", awb: "AWB-77881155", pieces: 24, weight: 1600, cbm: 3.2, docs: "Invoice, Fumigation Cert", capturedAt: "2025-07-19 14:08", location: "CFS Bay C-02" },
  { id: "CAP-2025-0407", shipper: "AutoParts India", pod: "INBLR – Bangalore ICD", service: "FCL", awb: "AWB-77881140", pieces: 62, weight: 4150, cbm: 8.3, docs: "Invoice, Packing List, Photo", capturedAt: "2025-07-19 11:33", location: "CFS Bay B-11" },
  { id: "CAP-2025-0406", shipper: "Nova Textiles", pod: "INNSA – Nhava Sheva", service: "LCL-Standard", awb: "AWB-77881122", pieces: 28, weight: 1420, cbm: 3.8, docs: "Invoice", capturedAt: "2025-07-18 18:47", location: "CFS Bay A-03" },
  { id: "CAP-2025-0405", shipper: "Orient Spices Co", pod: "INMUN – Mundra", service: "Break Bulk", awb: "AWB-77881105", pieces: 22, weight: 1180, cbm: 2.9, docs: "Invoice, Phytosanitary", capturedAt: "2025-07-18 15:12", location: "CFS Bay C-06" },
]
