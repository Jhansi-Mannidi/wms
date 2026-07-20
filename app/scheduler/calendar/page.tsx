"use client"
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
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

export default function SchedulerCalendarPage() {
  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-foreground">Schedule Calendar</h1><p className="text-sm text-muted-foreground mt-1">Week view of shifts, tasks and planned activities</p></div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-medium px-3">Week of 14 Jul 2025</span>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-border">
          {days.map((d,i)=>(
            <div key={d} className={cn("px-3 py-3 border-r last:border-r-0 border-border",i===0&&"bg-brand/5")}>
              <p className="text-xs font-semibold text-muted-foreground uppercase">{d}</p>
              <p className="text-lg font-bold text-foreground">{14+i}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-48">
          {days.map((_,i)=>(
            <div key={i} className="border-r last:border-r-0 border-border p-2 space-y-1.5">
              {(events[i+1]||[]).map((ev,j)=>(
                <div key={j} className={cn("px-2 py-1 rounded text-xs font-medium",colors[ev.type])}>
                  <p className="opacity-70 text-[10px]">{ev.time}</p>
                  <p>{ev.label}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
