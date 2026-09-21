/**
 * Single shared mock-data module — the canonical client universe for the prototype.
 * Every screen that shows a client's SKU count, dues, open orders, or agreement status
 * should import from here instead of restating its own literal, so the same client
 * (e.g. Apex Pharma Ltd) always shows the same numbers everywhere it appears.
 */

/** App-wide "today" — all sample dates are authored relative to this. */
export const TODAY = new Date("2026-07-20")

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
export type Client = {
  id: string; name: string; gstin: string; avatarColor: string; initials: string
  agreement: "Active" | "Renewal-Due" | "Expired"; spaceUsed: number; skus: number
  openOrders: number; dues: number; kam: string; kamInitials: string; lastActivity: string
}

export const CLIENTS: Client[] = [
  { id: "C001", name: "Apex Pharma Ltd", gstin: "29AAPCA1234A1Z5", avatarColor: "bg-blue-500", initials: "AP", agreement: "Active", spaceUsed: 78, skus: 234, openOrders: 12, dues: 1565, kam: "Rahul M.", kamInitials: "RM", lastActivity: "2h ago" },
  { id: "C002", name: "Sunrise Electronics", gstin: "27BBBCE5678B2Y4", avatarColor: "bg-emerald-500", initials: "SE", agreement: "Renewal-Due", spaceUsed: 45, skus: 89, openOrders: 6, dues: 142500, kam: "Priya S.", kamInitials: "PS", lastActivity: "4h ago" },
  { id: "C003", name: "GlobalTex Fabrics", gstin: "06CCCGT9012C3X3", avatarColor: "bg-amber-500", initials: "GT", agreement: "Active", spaceUsed: 92, skus: 512, openOrders: 24, dues: 0, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "30m ago" },
  { id: "C004", name: "FreshFarm Organics", gstin: "24DDDFF3456D4W2", avatarColor: "bg-orange-500", initials: "FF", agreement: "Active", spaceUsed: 33, skus: 67, openOrders: 3, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "1d ago" },
  { id: "C005", name: "TechCore Systems", gstin: "33EEETE7890E5V1", avatarColor: "bg-violet-500", initials: "TC", agreement: "Expired", spaceUsed: 0, skus: 0, openOrders: 0, dues: 89000, kam: "Rahul M.", kamInitials: "RM", lastActivity: "5d ago" },
  { id: "C006", name: "MediSupply Corp", gstin: "07FFFMS2345F6U0", avatarColor: "bg-rose-500", initials: "MS", agreement: "Active", spaceUsed: 61, skus: 178, openOrders: 9, dues: 0, kam: "Priya S.", kamInitials: "PS", lastActivity: "6h ago" },
  { id: "C007", name: "AutoParts India", gstin: "19GGGAP6789G7T9", avatarColor: "bg-cyan-500", initials: "AI", agreement: "Active", spaceUsed: 55, skus: 320, openOrders: 17, dues: 55200, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "3h ago" },
  { id: "C008", name: "Acme Foods Pvt Ltd", gstin: "29HHHAF1122H8S8", avatarColor: "bg-blue-500", initials: "AF", agreement: "Active", spaceUsed: 71, skus: 296, openOrders: 14, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "1h ago" },
  { id: "C009", name: "Global Oils Trading", gstin: "27IIIGO3344I9R7", avatarColor: "bg-emerald-500", initials: "GO", agreement: "Active", spaceUsed: 64, skus: 141, openOrders: 8, dues: 0, kam: "Priya S.", kamInitials: "PS", lastActivity: "5h ago" },
  { id: "C010", name: "Agro Corp Industries", gstin: "24JJJAC5566J1Q6", avatarColor: "bg-amber-500", initials: "AC", agreement: "Renewal-Due", spaceUsed: 88, skus: 405, openOrders: 21, dues: 76400, kam: "Rahul M.", kamInitials: "RM", lastActivity: "2h ago" },
  { id: "C011", name: "Sweet Mills Confectionery", gstin: "33KKKSM7788K2P5", avatarColor: "bg-orange-500", initials: "SM", agreement: "Active", spaceUsed: 42, skus: 118, openOrders: 5, dues: 0, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "8h ago" },
  { id: "C012", name: "Salt Works Ltd", gstin: "06LLLSW9900L3O4", avatarColor: "bg-violet-500", initials: "SW", agreement: "Active", spaceUsed: 29, skus: 54, openOrders: 2, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "1d ago" },
  { id: "C013", name: "Fresh Farms Produce", gstin: "07MMMFF2233M4N3", avatarColor: "bg-rose-500", initials: "FF", agreement: "Active", spaceUsed: 83, skus: 267, openOrders: 19, dues: 31800, kam: "Priya S.", kamInitials: "PS", lastActivity: "45m ago" },
  { id: "C014", name: "Tropical Co Exports", gstin: "32NNNTC4455N5M2", avatarColor: "bg-cyan-500", initials: "TC", agreement: "Renewal-Due", spaceUsed: 57, skus: 189, openOrders: 7, dues: 118900, kam: "Rahul M.", kamInitials: "RM", lastActivity: "3h ago" },
  { id: "C015", name: "Kaveri Textiles", gstin: "29OOOKT6677O6L1", avatarColor: "bg-blue-500", initials: "KT", agreement: "Active", spaceUsed: 66, skus: 372, openOrders: 11, dues: 0, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "6h ago" },
  { id: "C016", name: "Nova Beverages", gstin: "27PPPNB8899P7K0", avatarColor: "bg-emerald-500", initials: "NB", agreement: "Active", spaceUsed: 74, skus: 203, openOrders: 13, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "2h ago" },
  { id: "C017", name: "Deccan Steel Works", gstin: "36QQQDS1010Q8J9", avatarColor: "bg-amber-500", initials: "DS", agreement: "Expired", spaceUsed: 0, skus: 0, openOrders: 0, dues: 214300, kam: "Priya S.", kamInitials: "PS", lastActivity: "12d ago" },
  { id: "C018", name: "Vega Cosmetics", gstin: "19RRRVC1212R9I8", avatarColor: "bg-orange-500", initials: "VC", agreement: "Active", spaceUsed: 38, skus: 96, openOrders: 4, dues: 0, kam: "Rahul M.", kamInitials: "RM", lastActivity: "9h ago" },
  { id: "C019", name: "Himalaya Spices", gstin: "05SSSHS1414S1H7", avatarColor: "bg-violet-500", initials: "HS", agreement: "Active", spaceUsed: 51, skus: 158, openOrders: 9, dues: 0, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "4h ago" },
  { id: "C020", name: "Orbit Appliances", gstin: "24TTTOA1616T2G6", avatarColor: "bg-rose-500", initials: "OA", agreement: "Renewal-Due", spaceUsed: 79, skus: 288, openOrders: 16, dues: 64750, kam: "Meera K.", kamInitials: "MK", lastActivity: "1h ago" },
  { id: "C021", name: "Sagar Seafoods", gstin: "33UUUSS1818U3F5", avatarColor: "bg-cyan-500", initials: "SS", agreement: "Active", spaceUsed: 91, skus: 132, openOrders: 22, dues: 0, kam: "Priya S.", kamInitials: "PS", lastActivity: "25m ago" },
  { id: "C022", name: "Zenith Polymers", gstin: "27VVVZP2020V4E4", avatarColor: "bg-blue-500", initials: "ZP", agreement: "Active", spaceUsed: 47, skus: 214, openOrders: 6, dues: 0, kam: "Rahul M.", kamInitials: "RM", lastActivity: "7h ago" },
  { id: "C023", name: "Konkan Rubber Ltd", gstin: "29WWWKR2222W5D3", avatarColor: "bg-emerald-500", initials: "KR", agreement: "Expired", spaceUsed: 0, skus: 0, openOrders: 0, dues: 47600, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "18d ago" },
  { id: "C024", name: "Lumen Lighting", gstin: "06XXXLL2424X6C2", avatarColor: "bg-amber-500", initials: "LL", agreement: "Active", spaceUsed: 35, skus: 174, openOrders: 8, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "1d ago" },
  { id: "C025", name: "Sunder Paper Mills", gstin: "23YYYSP2626Y7B1", avatarColor: "bg-orange-500", initials: "SP", agreement: "Active", spaceUsed: 68, skus: 241, openOrders: 12, dues: 22950, kam: "Priya S.", kamInitials: "PS", lastActivity: "3h ago" },
  { id: "C026", name: "Ambar Ceramics", gstin: "08ZZZAC2828Z8A0", avatarColor: "bg-violet-500", initials: "AC", agreement: "Active", spaceUsed: 59, skus: 163, openOrders: 10, dues: 0, kam: "Rahul M.", kamInitials: "RM", lastActivity: "5h ago" },
  { id: "C027", name: "Nilgiri Tea Estates", gstin: "32AAANT3030A9Z9", avatarColor: "bg-rose-500", initials: "NT", agreement: "Renewal-Due", spaceUsed: 44, skus: 87, openOrders: 3, dues: 39400, kam: "Ankit J.", kamInitials: "AJ", lastActivity: "2d ago" },
  { id: "C028", name: "Prime Logistics Parts", gstin: "19BBBPL3232B1Y8", avatarColor: "bg-cyan-500", initials: "PL", agreement: "Active", spaceUsed: 86, skus: 358, openOrders: 18, dues: 0, kam: "Meera K.", kamInitials: "MK", lastActivity: "50m ago" },
]

export function getClientByName(name: string): Client | undefined {
  return CLIENTS.find(c => c.name === name)
}

export function getClientById(id: string): Client | undefined {
  return CLIENTS.find(c => c.id === id)
}
