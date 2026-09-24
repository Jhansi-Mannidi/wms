"use client"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Drawer } from "@/components/ui/modal"
import { DetailRow } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

// `type` (not `interface`) so rows stay assignable to ExportButton's Record<string, unknown>
type CalEvent = { date: string; day: string; time: string; label: string; type: string }

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]

/** Monday of the seeded week — 14 Jul 2025. */
const BASE_WEEK = new Date(2025, 6, 14)

const events: Record<number, { time: string; label: string; type: string }[]> = {
  1: [{ time:"06:00", label:"Morning Shift", type:"shift" }, { time:"14:00", label:"Stock Count - Zone A", type:"task" }],
  2: [{ time:"06:00", label:"Morning Shift", type:"shift" }, { time:"10:00", label:"GRN — Acme Foods", type:"grn" }],
  3: [{ time:"06:00", label:"Morning Shift", type:"shift" }, { time:"14:00", label:"Afternoon Shift", type:"shift" }],
  4: [{ time:"06:00", label:"Morning Shift", type:"shift" }],
  5: [{ time:"06:00", label:"Morning Shift", type:"shift" }, { time:"14:00", label:"Afternoon Shift", type:"shift" }, { time:"16:00", label:"Stock Replenishment", type:"task" }],
  6: [{ time:"08:00", label:"Weekend Shift", type:"shift" }],
  7: [],
}
const colors: Record<string, string> = { shift:"bg-brand/10 text-brand", task:"bg-amber-50 text-amber-700", grn:"bg-success/10 text-success" }
const typeLabels: Record<string, string> = { shift: "Shift", task: "Task", grn: "Goods Receipt" }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function addDays(base: Date, n: number) {
  const d = new Date(base)
  d.setDate(d.getDate() + n)
  return d
}

export default function SchedulerCalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [detail, setDetail] = useState<CalEvent | null>(null)

  const weekStart = addDays(BASE_WEEK, weekOffset * 7)
  const weekLabel = `Week of ${weekStart.getDate()} ${MONTHS[weekStart.getMonth()]} ${weekStart.getFullYear()}`
  const dayDates = days.map((_, i) => addDays(weekStart, i))

  function shiftWeek(delta: number) {
    const next = weekOffset + delta
    setWeekOffset(next)
    const start = addDays(BASE_WEEK, next * 7)
    notify.info("Week changed", `Showing week of ${start.getDate()} ${MONTHS[start.getMonth()]} ${start.getFullYear()}.`)
  }

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Schedule Calendar</h1><p className="text-sm text-muted-foreground mt-1">Week view of shifts, tasks and planned activities</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => shiftWeek(-1)} title="Previous week" className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium px-3">{weekLabel}</span>
          <button onClick={() => shiftWeek(1)} title="Next week" className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      {weekOffset !== 0 && (
        <button onClick={() => { setWeekOffset(0); notify.info("Back to current week", "Showing week of 14 Jul 2025.") }} className="text-xs text-brand hover:underline">
          Back to current week
        </button>
      )}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map((d,i)=>(
            <div key={d} className={cn("px-3 py-3 border-r last:border-r-0 border-border",i===0&&"bg-brand/5")}>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{d}</p>
              <p className="text-lg font-bold text-foreground">{dayDates[i].getDate()}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-48">
          {days.map((d,i)=>(
            <div key={i} className="border-r last:border-r-0 border-border p-2 space-y-1.5">
              {(events[i+1]||[]).map((ev,j)=>(
                <button
                  key={j}
                  onClick={() => setDetail({
                    date: `${dayDates[i].getDate()} ${MONTHS[dayDates[i].getMonth()]} ${dayDates[i].getFullYear()}`,
                    day: d, time: ev.time, label: ev.label, type: ev.type,
                  })}
                  title={`View ${ev.label}`}
                  className={cn("w-full text-left px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80",colors[ev.type])}
                >
                  <p className="opacity-70 text-[10px]">{ev.time}</p>
                  <p>{ev.label}</p>
                </button>
              ))}
              {(events[i+1]||[]).length === 0 && (
                <p className="text-[10px] text-muted-foreground/60 px-2 py-1">No events</p>
              )}
            </div>
          ))}
        </div>
      </div>

      <Drawer
        open={!!detail}
        onOpenChange={(o) => !o && setDetail(null)}
        title={detail?.label ?? ""}
        description="Calendar event detail"
        footer={
          <button onClick={() => setDetail(null)} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            Close
          </button>
        }
      >
        {detail && (
          <div className="space-y-1">
            <DetailRow label="Event" value={detail.label} />
            <DetailRow label="Type" value={<span className={cn("px-2 py-0.5 rounded text-xs font-medium", colors[detail.type])}>{typeLabels[detail.type] ?? detail.type}</span>} />
            <DetailRow label="Day" value={detail.day} />
            <DetailRow label="Date" value={detail.date} />
            <DetailRow label="Start Time" value={detail.time} />
          </div>
        )}
      </Drawer>
    </div>
  )
}
