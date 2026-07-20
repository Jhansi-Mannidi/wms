"use client"

import { useState } from "react"
import { Search, Truck, Package, CheckCircle2, Clock, MapPin, ArrowRight, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type TrackEvent = { time: string; location: string; event: string; done: boolean }
type Shipment = {
  id: string; awb: string; dest: string; carrier: string; status: string
  updated: string; eta: string; events: TrackEvent[]
}

const initialShipments: Shipment[] = [
  { id: "SO-3841", awb: "AWB-7712441", dest: "Apollo Hospitals, Hyderabad", carrier: "Blue Dart", status: "Out for Delivery", updated: "Jul 20, 10:45 AM", eta: "Today by 6 PM",
    events: [
      { time: "Jul 20, 10:45 AM", location: "Hyderabad Hub", event: "Out for delivery", done: true },
      { time: "Jul 20, 06:30 AM", location: "Hyderabad Hub", event: "Arrived at destination facility", done: true },
      { time: "Jul 19, 08:00 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
      { time: "Jul 19, 05:30 PM", location: "CFS Zone A", event: "Packed & labelled", done: true },
      { time: "Jul 19, 03:00 PM", location: "CFS Zone A", event: "Picking started", done: true },
    ]
  },
  { id: "SO-3840", awb: "-", dest: "KIMS Hospital, Secunderabad", carrier: "-", status: "Packing", updated: "Jul 20, 09:00 AM", eta: "Jul 21",
    events: [
      { time: "Jul 20, 09:00 AM", location: "CFS Zone A — Pack Station", event: "Packing in progress", done: true },
      { time: "Jul 19, 06:00 PM", location: "CFS Zone A", event: "Picking complete", done: true },
      { time: "Jul 19, 04:00 PM", location: "CFS Zone A", event: "Order released to floor", done: true },
    ]
  },
  { id: "SO-3824", awb: "-", dest: "Yashoda Hospitals, Somajiguda", carrier: "-", status: "Packing", updated: "Jul 20, 08:15 AM", eta: "Jul 22",
    events: [
      { time: "Jul 20, 08:15 AM", location: "CFS Zone B — Pack Station", event: "Packing in progress", done: true },
      { time: "Jul 19, 07:30 PM", location: "CFS Zone B", event: "Picking complete", done: true },
      { time: "Jul 19, 02:15 PM", location: "CFS Zone B", event: "Order released to floor", done: true },
      { time: "Jul 16, 11:00 AM", location: "Portal", event: "Order received", done: true },
    ]
  },
  { id: "SO-3806", awb: "AWB-7712240", dest: "Medicover Hospitals, Hitec City", carrier: "Blue Dart", status: "Out for Delivery", updated: "Jul 20, 09:20 AM", eta: "Today by 4 PM",
    events: [
      { time: "Jul 20, 09:20 AM", location: "Madhapur Delivery Centre", event: "Out for delivery", done: true },
      { time: "Jul 20, 05:45 AM", location: "Hyderabad Hub", event: "Arrived at destination facility", done: true },
      { time: "Jul 19, 09:10 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
      { time: "Jul 19, 06:00 PM", location: "CFS Zone A", event: "Packed & labelled", done: true },
    ]
  },
  { id: "SO-3819", awb: "AWB-7712310", dest: "AIG Hospitals, Gachibowli", carrier: "Blue Dart", status: "Dispatched", updated: "Jul 19, 08:40 PM", eta: "Jul 21",
    events: [
      { time: "Jul 19, 08:40 PM", location: "Hyderabad Hub", event: "In transit to destination facility", done: true },
      { time: "Jul 19, 03:20 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
      { time: "Jul 19, 12:10 PM", location: "CFS Zone A", event: "Packed & labelled", done: true },
      { time: "Jul 18, 04:30 PM", location: "CFS Zone A", event: "Picking started", done: true },
    ]
  },
  { id: "SO-3814", awb: "AWB-7712288", dest: "Star Hospitals, Banjara Hills", carrier: "Gati", status: "Dispatched", updated: "Jul 19, 06:15 PM", eta: "Jul 21",
    events: [
      { time: "Jul 19, 06:15 PM", location: "Uppal Transit Point", event: "In transit", done: true },
      { time: "Jul 19, 01:05 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
      { time: "Jul 18, 07:40 PM", location: "CFS Zone A", event: "Packed & labelled", done: true },
    ]
  },
  { id: "SO-3793", awb: "AWB-7712166", dest: "PharmEasy Hub, Pune", carrier: "VRL Logistics", status: "Dispatched", updated: "Jul 19, 02:30 PM", eta: "Jul 21 (delayed)",
    events: [
      { time: "Jul 19, 02:30 PM", location: "Solapur Transit Hub", event: "Delayed — vehicle breakdown reported", done: true },
      { time: "Jul 17, 09:00 PM", location: "Hyderabad Hub", event: "In transit to Pune", done: true },
      { time: "Jul 16, 08:20 PM", location: "CFS Zone C — Dispatch Bay", event: "Shipment dispatched", done: true },
      { time: "Jul 16, 03:50 PM", location: "CFS Zone C", event: "Packed & labelled", done: true },
    ]
  },
  { id: "SO-3830", awb: "AWB-7712398", dest: "Rainbow Children's Hospital, Banjara Hills", carrier: "Blue Dart", status: "Delivered", updated: "Jul 18, 04:20 PM", eta: "Delivered Jul 18",
    events: [
      { time: "Jul 18, 04:20 PM", location: "Banjara Hills", event: "Delivered — signed by Pharmacy Head", done: true },
      { time: "Jul 18, 09:10 AM", location: "Banjara Hills Delivery Centre", event: "Out for delivery", done: true },
      { time: "Jul 17, 10:30 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
      { time: "Jul 17, 06:00 PM", location: "CFS Zone A", event: "Packed & labelled", done: true },
    ]
  },
  { id: "SO-3825", awb: "AWB-7712351", dest: "Wellness Forever, Jubilee Hills", carrier: "Delhivery", status: "Delivered", updated: "Jul 18, 12:05 PM", eta: "Delivered Jul 18",
    events: [
      { time: "Jul 18, 12:05 PM", location: "Jubilee Hills", event: "Delivered — signed by Front Desk", done: true },
      { time: "Jul 18, 08:40 AM", location: "Jubilee Hills Delivery Centre", event: "Out for delivery", done: true },
      { time: "Jul 17, 07:15 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
    ]
  },
  { id: "SO-3812", awb: "AWB-7712271", dest: "Aster Prime Hospital, Ameerpet", carrier: "Blue Dart", status: "Delivered", updated: "Jul 15, 03:45 PM", eta: "Delivered Jul 15",
    events: [
      { time: "Jul 15, 03:45 PM", location: "Ameerpet", event: "Delivered — signed by Dr. Priya Sharma", done: true },
      { time: "Jul 15, 08:55 AM", location: "Hyderabad Hub", event: "Out for delivery", done: true },
      { time: "Jul 14, 08:30 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
    ]
  },
  { id: "SO-3808", awb: "AWB-7712254", dest: "Omni Hospitals, Kothapet", carrier: "DTDC", status: "Delivered", updated: "Jul 16, 01:30 PM", eta: "Delivered Jul 16",
    events: [
      { time: "Jul 16, 01:30 PM", location: "Kothapet", event: "Delivered — signed by Suresh Yadav", done: true },
      { time: "Jul 16, 09:15 AM", location: "Dilsukhnagar Delivery Centre", event: "Out for delivery", done: true },
      { time: "Jul 15, 06:50 PM", location: "Hyderabad Hub", event: "Arrived at destination facility", done: true },
      { time: "Jul 14, 09:00 PM", location: "CFS Zone B — Dispatch Bay", event: "Shipment dispatched", done: true },
    ]
  },
  { id: "SO-3803", awb: "AWB-7712229", dest: "Basavatarakam Cancer Hospital, Banjara Hills", carrier: "TCI Express", status: "Delivered", updated: "Jul 14, 11:20 AM", eta: "Delivered Jul 14",
    events: [
      { time: "Jul 14, 11:20 AM", location: "Banjara Hills", event: "Delivered — signed by Dr. Arjun Nair", done: true },
      { time: "Jul 14, 07:30 AM", location: "Banjara Hills Delivery Centre", event: "Out for delivery", done: true },
      { time: "Jul 13, 09:40 PM", location: "CFS Zone A — Dispatch Bay", event: "Shipment dispatched", done: true },
    ]
  },
  { id: "SO-3801", awb: "AWB-7712215", dest: "Netmeds Fulfilment Centre, Chennai", carrier: "Safexpress", status: "Delivered", updated: "Jul 15, 05:10 PM", eta: "Delivered Jul 15",
    events: [
      { time: "Jul 15, 05:10 PM", location: "Chennai", event: "Delivered — signed by Inward Desk", done: true },
      { time: "Jul 15, 10:00 AM", location: "Chennai Hub", event: "Out for delivery", done: true },
      { time: "Jul 14, 04:25 PM", location: "Nellore Transit Point", event: "In transit", done: true },
      { time: "Jul 13, 08:15 PM", location: "CFS Zone C — Dispatch Bay", event: "Shipment dispatched", done: true },
    ]
  },
  { id: "SO-3795", awb: "AWB-7712178", dest: "Kauvery Hospital, Chennai", carrier: "Safexpress", status: "Delivered", updated: "Jul 13, 02:55 PM", eta: "Delivered Jul 13",
    events: [
      { time: "Jul 13, 02:55 PM", location: "Chennai", event: "Delivered — signed by Rahul Mehta", done: true },
      { time: "Jul 13, 08:30 AM", location: "Chennai Hub", event: "Out for delivery", done: true },
      { time: "Jul 11, 09:05 PM", location: "CFS Zone C — Dispatch Bay", event: "Shipment dispatched", done: true },
    ]
  },
]

const statusStyle: Record<string, string> = {
  "Out for Delivery": "bg-brand/15 text-brand",
  Packing: "bg-warning/15 text-warning",
  Dispatched: "bg-orange-400/15 text-orange-400",
  Delivered: "bg-success/15 text-success",
}

export default function PortalTrackingPage() {
  const [shipments, setShipments] = useState<Shipment[]>(initialShipments)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState(initialShipments[0].id)
  const [detail, setDetail] = useState<Shipment | null>(null)

  const filtered = shipments.filter(s =>
    !query || s.id.toLowerCase().includes(query.toLowerCase()) || s.awb.toLowerCase().includes(query.toLowerCase())
  )

  const selected = shipments.find(s => s.id === selectedId) ?? shipments[0]

  function refresh() {
    const now = new Date()
    const stamp = now.toLocaleDateString("en-IN", { month: "short", day: "numeric" }) + ", " +
      now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
    setShipments(prev => prev.map(s => ({ ...s, updated: stamp })))
    notify.info("Tracking refreshed", `Latest carrier scans pulled at ${stamp}.`)
  }

  function downloadPod(s: Shipment) {
    if (s.status !== "Delivered") {
      notify.warning("POD not available yet", `${s.id} is currently "${s.status}". Proof of delivery is issued after delivery is confirmed.`)
      return
    }
    notify.success("POD downloaded", `Proof of delivery for ${s.id} (${s.awb}) saved to your downloads.`)
  }

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Shipment Tracking</h1>
          <p className="text-sm text-muted-foreground">Live status and event timeline for your orders</p>
        </div>
        <button
          onClick={refresh}
          title="Refresh tracking"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card text-xs font-medium text-[#1E3A5F] dark:text-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card max-w-md">
        <Search className="w-4 h-4 text-muted-foreground shrink-0" />
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by Order ID or AWB number..."
          className="bg-transparent outline-none text-sm flex-1 placeholder:text-muted-foreground text-[#1E3A5F] dark:text-foreground"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Shipment list */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map(s => (
            <div
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all",
                selected.id === s.id
                  ? "border-[#1E3A5F] dark:border-brand bg-[#1E3A5F]/5 dark:bg-brand/5"
                  : "border-[#E4E9F0] dark:border-border bg-white dark:bg-card hover:border-[#1E3A5F]/40 dark:hover:border-brand/40"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">{s.id}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{s.awb !== "-" ? s.awb : "AWB pending"}</p>
                </div>
                <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0", statusStyle[s.status] ?? "bg-muted text-muted-foreground")}>{s.status}</span>
              </div>
              <p className="text-xs text-[#1E3A5F] dark:text-foreground/80 flex items-center gap-1"><MapPin className="w-3 h-3 text-muted-foreground" />{s.dest}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Truck className="w-3 h-3" />{s.carrier !== "-" ? s.carrier : "Carrier not assigned"}</p>
                <p className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />ETA: {s.eta}</p>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setDetail(s) }}
                title="View shipment details"
                className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-[#1E3A5F] dark:text-brand hover:underline"
              >
                View details <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="p-8 rounded-2xl border border-dashed border-[#E4E9F0] dark:border-border text-center text-xs text-muted-foreground">
              No shipments match &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="lg:col-span-3 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#E4E9F0] dark:border-border">
            <div>
              <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">{selected.id} — Tracking Timeline</p>
              <p className="text-xs text-muted-foreground mt-0.5">{selected.dest}</p>
            </div>
            <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", statusStyle[selected.status] ?? "bg-muted text-muted-foreground")}>{selected.status}</span>
          </div>

          {/* ETA banner */}
          <div className="flex items-center justify-between px-5 py-3 bg-[#1E3A5F]/5 dark:bg-brand/5 border-b border-[#E4E9F0] dark:border-border">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#1E3A5F] dark:text-brand" />
              <p className="text-xs font-semibold text-[#1E3A5F] dark:text-foreground">Estimated Delivery: <span className="text-brand">{selected.eta}</span></p>
            </div>
            {selected.awb !== "-" && (
              <p className="text-xs text-muted-foreground font-mono">{selected.awb}</p>
            )}
          </div>

          {/* Events */}
          <div className="p-5">
            <div className="relative">
              <div className="absolute left-3.5 top-3 bottom-3 w-px bg-[#E4E9F0] dark:bg-border" />
              <div className="space-y-5">
                {selected.events.map((ev, i) => (
                  <div key={i} className="flex gap-4 relative">
                    <div className={cn(
                      "w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white dark:bg-card",
                      ev.done
                        ? "border-[#1E3A5F] dark:border-brand bg-[#1E3A5F]/10 dark:bg-brand/15"
                        : "border-[#E4E9F0] dark:border-border"
                    )}>
                      {ev.done
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-[#1E3A5F] dark:text-brand" />
                        : <Clock className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    <div className="flex-1 pb-2">
                      <p className={cn("text-sm font-semibold", ev.done ? "text-[#1E3A5F] dark:text-foreground" : "text-muted-foreground")}>{ev.event}</p>
                      <div className="flex flex-wrap gap-2 mt-0.5">
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{ev.location}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{ev.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-[#E4E9F0] dark:border-border flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Last updated: {selected.updated}</p>
            <button
              onClick={() => downloadPod(selected)}
              title="Download proof of delivery"
              className="flex items-center gap-1 text-xs text-[#1E3A5F] dark:text-brand hover:underline"
            >
              Download POD <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Shipment detail drawer */}
      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.id ?? ""}
        description="Shipment detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Order ID" value={<span className="font-mono text-brand">{detail.id}</span>} />
            <DetailRow label="AWB" value={<span className="font-mono">{detail.awb !== "-" ? detail.awb : "Not assigned"}</span>} />
            <DetailRow label="Destination" value={detail.dest} />
            <DetailRow label="Carrier" value={detail.carrier !== "-" ? detail.carrier : "Not assigned"} />
            <DetailRow label="Status" value={<span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", statusStyle[detail.status] ?? "bg-muted text-muted-foreground")}>{detail.status}</span>} />
            <DetailRow label="ETA" value={detail.eta} />
            <DetailRow label="Last Updated" value={detail.updated} />
            <DetailRow label="Scan Events" value={`${detail.events.length} recorded`} />
            <DetailRow label="Latest Scan" value={<span className="flex items-center gap-1 justify-end"><Package className="w-3 h-3" />{detail.events[0]?.event ?? "—"}</span>} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
