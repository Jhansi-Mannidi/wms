"use client"

import { useState } from "react"
import { User, Mail, Phone, Building2, Shield, Bell, Key, Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

const tabs = ["Company Profile", "Users & Access", "Notifications", "API & Integrations"]

const users = [
  { name: "Vikram Sharma", email: "vikram.sharma@apexpharma.in", role: "Admin", status: "Active", last: "Today" },
  { name: "Priya Nair", email: "priya.nair@apexpharma.in", role: "Ops Manager", status: "Active", last: "Yesterday" },
  { name: "Rahul Mehta", email: "rahul.mehta@apexpharma.in", role: "Viewer", status: "Active", last: "Jul 18" },
  { name: "Anita Desai", email: "anita.desai@apexpharma.in", role: "Finance", status: "Inactive", last: "Jul 10" },
]

const roleStyle: Record<string, string> = {
  Admin: "bg-danger/15 text-danger",
  "Ops Manager": "bg-brand/15 text-brand",
  Viewer: "bg-muted text-muted-foreground",
  Finance: "bg-success/15 text-success",
}

export default function PortalProfilePage() {
  const [tab, setTab] = useState("Company Profile")
  const [editing, setEditing] = useState(false)

  return (
    <div className="p-4 sm:p-6 space-y-5 w-full">
      <div>
        <h1 className="text-xl font-bold text-[#1E3A5F] dark:text-foreground">Profile &amp; Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your company profile, users, and notification preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-0.5 rounded-xl bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border flex-wrap">
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors",
              tab === t ? "bg-[#1E3A5F] dark:bg-brand text-white shadow-sm" : "text-muted-foreground hover:text-[#1E3A5F] dark:hover:text-foreground"
            )}>
            {t}
          </button>
        ))}
      </div>

      {/* Company Profile */}
      {tab === "Company Profile" && (
        <div className="space-y-4">
          {/* Avatar + name */}
          <div className="flex items-center gap-4 p-5 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-2xl font-bold shrink-0">AP</div>
            <div className="flex-1">
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">Apex Pharma Ltd</p>
              <p className="text-sm text-muted-foreground">Client ID: CLT-0412 · Since Jan 2024</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold bg-success/15 text-success px-2 py-0.5 rounded-full">Active</span>
                <span className="text-[10px] font-semibold bg-brand/15 text-brand px-2 py-0.5 rounded-full">Pharma</span>
                <span className="text-[10px] font-semibold bg-purple-400/15 text-purple-400 px-2 py-0.5 rounded-full">Cold Chain</span>
              </div>
            </div>
            <button
              onClick={() => setEditing(v => !v)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted text-xs font-medium text-[#1E3A5F] dark:text-foreground hover:bg-[#E4E9F0] dark:hover:bg-muted/70 transition-colors shrink-0"
            >
              <Edit2 className="w-3.5 h-3.5" /> {editing ? "Cancel" : "Edit"}
            </button>
          </div>

          {/* Fields */}
          <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
            <div className="px-5 py-3 border-b border-[#E4E9F0] dark:border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Company Information</p>
            </div>
            <div className="divide-y divide-[#E4E9F0] dark:divide-border">
              {[
                { icon: <Building2 className="w-4 h-4" />, label: "Legal Name", value: "Apex Pharma Ltd" },
                { icon: <Building2 className="w-4 h-4" />, label: "Trade Name", value: "Apex Pharma" },
                { icon: <Mail className="w-4 h-4" />, label: "Primary Email", value: "operations@apexpharma.in" },
                { icon: <Phone className="w-4 h-4" />, label: "Phone", value: "+91 40 6677 8800" },
                { icon: <Building2 className="w-4 h-4" />, label: "Registered Address", value: "Plot 24, Pharma City, Genome Valley, Hyderabad — 500 078" },
                { icon: <Shield className="w-4 h-4" />, label: "GSTIN", value: "36AABCA1234F1ZP" },
                { icon: <User className="w-4 h-4" />, label: "Account Manager", value: "Suresh Kumar (VoltusFreight)" },
              ].map((f, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center text-[#1E3A5F] dark:text-brand shrink-0">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    {editing ? (
                      <input defaultValue={f.value} className="mt-0.5 w-full text-sm text-[#1E3A5F] dark:text-foreground bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border rounded-lg px-2 py-1 outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors" />
                    ) : (
                      <p className="text-sm text-[#1E3A5F] dark:text-foreground truncate">{f.value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {editing && (
              <div className="px-5 py-3 border-t border-[#E4E9F0] dark:border-border flex justify-end gap-2">
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-4 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
                <button onClick={() => setEditing(false)} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">
                  <Check className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Warehouse access */}
          <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-5">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Allocated Warehouse Space</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Zone A — Pharma", alloc: "500 Pallets", used: "362", pct: 72 },
                { label: "Zone B — OTC", alloc: "300 Pallets", used: "174", pct: 58 },
                { label: "Zone C — Cold", alloc: "80 Pallets", used: "73", pct: 91 },
                { label: "Zone D — Bulk", alloc: "200 Pallets", used: "70", pct: 35 },
              ].map((z, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#F7F9FC] dark:bg-muted/30 border border-[#E4E9F0] dark:border-border">
                  <p className="text-[10px] font-semibold text-[#1E3A5F] dark:text-foreground/80 mb-1 truncate">{z.label}</p>
                  <p className="text-base font-bold text-[#1E3A5F] dark:text-foreground">{z.used} <span className="text-xs font-normal text-muted-foreground">/ {z.alloc}</span></p>
                  <div className="mt-1.5 h-1.5 bg-[#E4E9F0] dark:bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full", z.pct > 85 ? "bg-danger" : z.pct > 60 ? "bg-warning" : "bg-success")}
                      style={{ width: `${z.pct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{z.pct}% used</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users & Access */}
      {tab === "Users & Access" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-[#1E3A5F] dark:text-foreground">{users.length} portal users</p>
            <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">
              <Plus className="w-3.5 h-3.5" /> Invite User
            </button>
          </div>
          <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E4E9F0] dark:border-border bg-[#F7F9FC] dark:bg-muted/30">
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground">User</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Role</th>
                    <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Status</th>
                    <th className="px-4 py-3 text-left font-semibold text-muted-foreground hidden md:table-cell">Last Active</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E4E9F0] dark:divide-border">
                  {users.map((u, i) => (
                    <tr key={i} className="hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#1E3A5F] dark:bg-brand flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {u.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <span className="font-semibold text-[#1E3A5F] dark:text-foreground">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", roleStyle[u.role] ?? "bg-muted text-muted-foreground")}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", u.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.last}</td>
                      <td className="px-4 py-3">
                        <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger/10 hover:text-danger text-muted-foreground transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="p-4 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <p className="text-xs font-bold text-[#1E3A5F] dark:text-foreground mb-1">Role Permissions</p>
            <p className="text-xs text-muted-foreground">Admin can manage users and access all sections. Ops Manager can view and submit requests. Finance can access billing only. Viewer has read-only access to inventory and orders.</p>
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === "Notifications" && (
        <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-[#E4E9F0] dark:border-border">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Notification Preferences</p>
          </div>
          <div className="divide-y divide-[#E4E9F0] dark:divide-border">
            {[
              { label: "ASN Received", desc: "When your inbound shipment is received at the warehouse", enabled: true },
              { label: "Order Dispatched", desc: "When a ship-out order is dispatched with AWB details", enabled: true },
              { label: "Order Delivered", desc: "When delivery is confirmed at the destination", enabled: true },
              { label: "Low Stock Alert", desc: "When any SKU drops below the reorder level", enabled: true },
              { label: "Invoice Issued", desc: "When a new invoice is generated", enabled: true },
              { label: "Invoice Overdue", desc: "When a payment is overdue", enabled: true },
              { label: "VAS Job Completed", desc: "When a VAS work order is completed", enabled: false },
              { label: "Expiry Alert", desc: "When stock is within 60 days of expiry", enabled: false },
              { label: "Weekly Stock Summary", desc: "Weekly email with stock levels and activity", enabled: true },
            ].map((n, i) => (
              <div key={i} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-[#1E3A5F] dark:text-brand shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A5F] dark:text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                </div>
                <div className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0", n.enabled ? "bg-[#1E3A5F] dark:bg-brand" : "bg-[#E4E9F0] dark:bg-muted")}>
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", n.enabled ? "left-6" : "left-1")} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* API & Integrations */}
      {tab === "API & Integrations" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Key className="w-5 h-5 text-[#1E3A5F] dark:text-brand" />
              <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground">API Access Token</p>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border font-mono text-xs text-muted-foreground">
              <span className="flex-1 truncate">vf_live_••••••••••••••••••••••••••••••••</span>
              <button className="text-[#1E3A5F] dark:text-brand text-[10px] font-semibold hover:underline shrink-0">Reveal</button>
              <button className="text-[#1E3A5F] dark:text-brand text-[10px] font-semibold hover:underline shrink-0">Copy</button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Use this token to integrate your ERP or WMS with the VoltusFreight API. Keep it confidential.</p>
            <div className="flex gap-2 mt-3">
              <button className="px-3 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Regenerate Token</button>
              <button className="px-3 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">View API Docs</button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-5">
            <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground mb-3">Webhook Endpoints</p>
            <div className="space-y-2">
              {[
                { event: "asn.received", url: "https://api.apexpharma.in/webhook/asn", active: true },
                { event: "order.dispatched", url: "https://api.apexpharma.in/webhook/dispatch", active: true },
                { event: "invoice.issued", url: "-", active: false },
              ].map((w, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9FC] dark:bg-muted/30 border border-[#E4E9F0] dark:border-border">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", w.active ? "bg-success" : "bg-muted-foreground")} />
                  <span className="font-mono text-xs text-[#1E3A5F] dark:text-brand shrink-0">{w.event}</span>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{w.url}</span>
                  <button className="text-[10px] text-[#1E3A5F] dark:text-brand hover:underline shrink-0">Edit</button>
                </div>
              ))}
            </div>
            <button className="mt-3 flex items-center gap-1.5 text-xs text-[#1E3A5F] dark:text-brand font-medium hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add Webhook
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
