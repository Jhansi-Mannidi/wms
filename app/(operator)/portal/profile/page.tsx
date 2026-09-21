"use client"

import { useState } from "react"
import { User, Mail, Phone, Building2, Shield, Bell, Key, Plus, Trash2, Edit2, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, Select, ModalActions } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

const tabs = ["Company Profile", "Users & Access", "Notifications", "API & Integrations"]

// `type` (not `interface`) so rows stay assignable to Record<string, unknown> consumers
type PortalUser = { name: string; email: string; role: string; status: string; last: string }
type Webhook = { event: string; url: string; active: boolean }
type NotificationPref = { label: string; desc: string; enabled: boolean }

const initialUsers: PortalUser[] = [
  { name: "Vikram Sharma", email: "vikram.sharma@apexpharma.in", role: "Admin", status: "Active", last: "Today" },
  { name: "Priya Nair", email: "priya.nair@apexpharma.in", role: "Ops Manager", status: "Active", last: "Yesterday" },
  { name: "Rahul Mehta", email: "rahul.mehta@apexpharma.in", role: "Viewer", status: "Active", last: "Jul 18" },
  { name: "Anita Desai", email: "anita.desai@apexpharma.in", role: "Finance", status: "Inactive", last: "Jul 10" },
  { name: "Kavitha Rao", email: "kavitha.rao@apexpharma.in", role: "Ops Manager", status: "Active", last: "Today" },
  { name: "Suresh Yadav", email: "suresh.yadav@apexpharma.in", role: "Viewer", status: "Active", last: "Today" },
  { name: "Meena Patel", email: "meena.patel@apexpharma.in", role: "Finance", status: "Active", last: "Yesterday" },
  { name: "Arjun Nair", email: "arjun.nair@apexpharma.in", role: "Viewer", status: "Active", last: "Yesterday" },
  { name: "Deepa Menon", email: "deepa.menon@apexpharma.in", role: "Ops Manager", status: "Active", last: "Jul 18" },
  { name: "Sanjay Gupta", email: "sanjay.gupta@apexpharma.in", role: "Admin", status: "Active", last: "Jul 17" },
  { name: "Neha Joshi", email: "neha.joshi@apexpharma.in", role: "Finance", status: "Active", last: "Jul 16" },
  { name: "Ravi Kumar", email: "ravi.kumar@apexpharma.in", role: "Viewer", status: "Inactive", last: "Jul 12" },
  { name: "Karthik Iyer", email: "karthik.iyer@apexpharma.in", role: "Viewer", status: "Inactive", last: "Jun 30" },
]

const initialCompany = [
  { key: "legal", icon: <Building2 className="w-4 h-4" />, label: "Legal Name", value: "Apex Pharma Ltd" },
  { key: "trade", icon: <Building2 className="w-4 h-4" />, label: "Trade Name", value: "Apex Pharma" },
  { key: "email", icon: <Mail className="w-4 h-4" />, label: "Primary Email", value: "operations@apexpharma.in" },
  { key: "phone", icon: <Phone className="w-4 h-4" />, label: "Phone", value: "+91 40 6677 8800" },
  { key: "address", icon: <Building2 className="w-4 h-4" />, label: "Registered Address", value: "Plot 24, Pharma City, Genome Valley, Hyderabad — 500 078" },
  { key: "gstin", icon: <Shield className="w-4 h-4" />, label: "GSTIN", value: "36AABCA1234F1ZP" },
  { key: "manager", icon: <User className="w-4 h-4" />, label: "Account Manager", value: "Suresh Kumar (VoltusFreight)" },
]

const initialNotifications: NotificationPref[] = [
  { label: "ASN Received", desc: "When your inbound shipment is received at the warehouse", enabled: true },
  { label: "Order Dispatched", desc: "When a ship-out order is dispatched with AWB details", enabled: true },
  { label: "Order Delivered", desc: "When delivery is confirmed at the destination", enabled: true },
  { label: "Low Stock Alert", desc: "When any SKU drops below the reorder level", enabled: true },
  { label: "Invoice Issued", desc: "When a new invoice is generated", enabled: true },
  { label: "Invoice Overdue", desc: "When a payment is overdue", enabled: true },
  { label: "VAS Job Completed", desc: "When a VAS work order is completed", enabled: false },
  { label: "Expiry Alert", desc: "When stock is within 60 days of expiry", enabled: false },
  { label: "Weekly Stock Summary", desc: "Weekly email with stock levels and activity", enabled: true },
  { label: "ASN Exception Raised", desc: "When an inbound shipment is short, damaged, or mismatched", enabled: true },
  { label: "Putaway Completed", desc: "When received stock has been putaway to its storage bin", enabled: false },
  { label: "Monthly Billing Statement", desc: "Monthly summary of storage, handling and VAS charges", enabled: true },
]

const initialWebhooks: Webhook[] = [
  { event: "asn.received", url: "https://api.apexpharma.in/webhook/asn", active: true },
  { event: "order.dispatched", url: "https://api.apexpharma.in/webhook/dispatch", active: true },
  { event: "invoice.issued", url: "-", active: false },
  { event: "order.delivered", url: "https://api.apexpharma.in/webhook/delivery", active: true },
  { event: "vas.completed", url: "https://api.apexpharma.in/webhook/vas", active: false },
  { event: "stock.low", url: "https://api.apexpharma.in/webhook/stock-alerts", active: true },
]

const roleStyle: Record<string, string> = {
  Admin: "bg-danger/15 text-danger",
  "Ops Manager": "bg-brand/15 text-brand",
  Viewer: "bg-muted text-muted-foreground",
  Finance: "bg-success/15 text-success",
}

const ROLES = ["Admin", "Ops Manager", "Finance", "Viewer"] as const
const WEBHOOK_EVENTS = ["asn.received", "order.dispatched", "order.delivered", "invoice.issued", "vas.completed", "stock.low"] as const
const WEBHOOK_STATES = ["Active", "Paused"] as const

const REAL_TOKEN = "vf_live_8c41a7fd92b64e0fa53d17be6c290x4k"
const MASKED_TOKEN = "vf_live_••••••••••••••••••••••••••••••••"

const emptyInvite = { name: "", email: "", role: "" }
const emptyWebhook = { event: "", url: "", state: "Active" }

export default function PortalProfilePage() {
  const [tab, setTab] = useState("Company Profile")

  // Company profile
  const [company, setCompany] = useState(initialCompany)
  const [draft, setDraft] = useState<Record<string, string>>({})
  const [editing, setEditing] = useState(false)

  // Users
  const [users, setUsers] = useState<PortalUser[]>(initialUsers)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [invite, setInvite] = useState(emptyInvite)
  const [inviteErrors, setInviteErrors] = useState<Record<string, string>>({})
  const [removeTarget, setRemoveTarget] = useState<PortalUser | null>(null)

  // Notifications
  const [notifications, setNotifications] = useState<NotificationPref[]>(initialNotifications)

  // API & integrations
  const [tokenRevealed, setTokenRevealed] = useState(false)
  const [token, setToken] = useState(REAL_TOKEN)
  const [regenOpen, setRegenOpen] = useState(false)
  const [webhooks, setWebhooks] = useState<Webhook[]>(initialWebhooks)
  const [webhookOpen, setWebhookOpen] = useState(false)
  const [webhookIndex, setWebhookIndex] = useState<number | null>(null)
  const [webhookForm, setWebhookForm] = useState(emptyWebhook)
  const [webhookErrors, setWebhookErrors] = useState<Record<string, string>>({})

  /* ---------- Company profile ---------- */

  function startEditing() {
    setDraft(Object.fromEntries(company.map(f => [f.key, f.value])))
    setEditing(true)
  }

  function saveCompany() {
    const blank = company.find(f => !(draft[f.key] ?? "").trim())
    if (blank) {
      notify.error("Cannot save", `${blank.label} cannot be empty.`)
      return
    }
    setCompany(prev => prev.map(f => ({ ...f, value: draft[f.key].trim() })))
    setEditing(false)
    notify.success("Profile updated", "Your company information has been saved.")
  }

  /* ---------- Users ---------- */

  function validateInvite() {
    const e: Record<string, string> = {}
    if (!invite.name.trim()) e.name = "Full name is required"
    if (!invite.email.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invite.email.trim())) e.email = "Enter a valid email address"
    else if (users.some(u => u.email.toLowerCase() === invite.email.trim().toLowerCase())) e.email = "This user already has portal access"
    if (!invite.role) e.role = "Select a role"
    setInviteErrors(e)
    return Object.keys(e).length === 0
  }

  function sendInvite() {
    if (!validateInvite()) return
    const next: PortalUser = {
      name: invite.name.trim(),
      email: invite.email.trim().toLowerCase(),
      role: invite.role,
      status: "Inactive",
      last: "Invited",
    }
    setUsers(prev => [...prev, next])
    setInviteOpen(false)
    setInvite(emptyInvite)
    setInviteErrors({})
    notify.success("Invitation sent", `${next.name} has been invited as ${next.role}.`)
  }

  function removeUser(u: PortalUser) {
    setUsers(prev => prev.filter(x => x.email !== u.email))
    notify.warning("User removed", `${u.name} no longer has portal access.`)
  }

  function toggleUserStatus(u: PortalUser) {
    const next = u.status === "Active" ? "Inactive" : "Active"
    setUsers(prev => prev.map(x => x.email === u.email ? { ...x, status: next } : x))
    notify.success(`User ${next.toLowerCase()}`, `${u.name} is now ${next.toLowerCase()}.`)
  }

  /* ---------- Notifications ---------- */

  function toggleNotification(i: number) {
    setNotifications(prev => prev.map((n, idx) => idx === i ? { ...n, enabled: !n.enabled } : n))
    const n = notifications[i]
    notify.success(n.enabled ? "Notification disabled" : "Notification enabled",
      `${n.label} emails are now ${n.enabled ? "off" : "on"}.`)
  }

  /* ---------- API & integrations ---------- */

  function copyToken() {
    navigator.clipboard?.writeText(token).catch(() => {})
    notify.success("Token copied", "Your API token is on the clipboard. Keep it confidential.")
  }

  function regenerateToken() {
    const rand = Array.from({ length: 24 }, () => "abcdef0123456789"[Math.floor(Math.random() * 16)]).join("")
    setToken(`vf_live_${rand}`)
    setTokenRevealed(true)
    notify.success("Token regenerated", "The previous token has been revoked — update your integrations.")
  }

  function openWebhook(index: number | null) {
    if (index === null) {
      setWebhookForm(emptyWebhook)
    } else {
      const w = webhooks[index]
      setWebhookForm({ event: w.event, url: w.url === "-" ? "" : w.url, state: w.active ? "Active" : "Paused" })
    }
    setWebhookIndex(index)
    setWebhookErrors({})
    setWebhookOpen(true)
  }

  function saveWebhook() {
    const e: Record<string, string> = {}
    if (!webhookForm.event) e.event = "Select an event"
    else if (webhookIndex === null && webhooks.some(w => w.event === webhookForm.event)) e.event = "A webhook for this event already exists"
    if (!webhookForm.url.trim()) e.url = "Endpoint URL is required"
    else if (!/^https:\/\/.+\..+/.test(webhookForm.url.trim())) e.url = "Must be an https:// URL"
    setWebhookErrors(e)
    if (Object.keys(e).length > 0) return

    const next: Webhook = {
      event: webhookForm.event,
      url: webhookForm.url.trim(),
      active: webhookForm.state === "Active",
    }
    if (webhookIndex === null) {
      setWebhooks(prev => [...prev, next])
      notify.success("Webhook added", `${next.event} will POST to ${next.url}.`)
    } else {
      setWebhooks(prev => prev.map((w, i) => i === webhookIndex ? next : w))
      notify.success("Webhook updated", `${next.event} endpoint saved.`)
    }
    setWebhookOpen(false)
    setWebhookIndex(null)
    setWebhookForm(emptyWebhook)
    setWebhookErrors({})
  }

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
          <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card">
            <div className="w-16 h-16 rounded-2xl bg-[#1E3A5F] flex items-center justify-center text-white text-2xl font-bold shrink-0">AP</div>
            <div className="flex-1">
              <p className="text-lg font-bold text-[#1E3A5F] dark:text-foreground">{company.find(f => f.key === "legal")?.value}</p>
              <p className="text-sm text-muted-foreground">Client ID: CLT-0412 · Since Jan 2024</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-semibold bg-success/15 text-success px-2 py-0.5 rounded-full">Active</span>
                <span className="text-[10px] font-semibold bg-brand/15 text-brand px-2 py-0.5 rounded-full">Pharma</span>
                <span className="text-[10px] font-semibold bg-purple-400/15 text-purple-400 px-2 py-0.5 rounded-full">Cold Chain</span>
              </div>
            </div>
            <button
              onClick={() => editing ? setEditing(false) : startEditing()}
              title={editing ? "Discard changes" : "Edit company profile"}
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
              {company.map(f => (
                <div key={f.key} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/10 dark:bg-brand/15 flex items-center justify-center text-[#1E3A5F] dark:text-brand shrink-0">
                    {f.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</p>
                    {editing ? (
                      <input
                        value={draft[f.key] ?? ""}
                        onChange={e => setDraft(prev => ({ ...prev, [f.key]: e.target.value }))}
                        className="mt-0.5 w-full text-sm text-[#1E3A5F] dark:text-foreground bg-[#F7F9FC] dark:bg-muted/40 border border-[#E4E9F0] dark:border-border rounded-lg px-2 py-1 outline-none focus:border-[#1E3A5F] dark:focus:border-brand transition-colors"
                      />
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
                <button onClick={saveCompany} className="flex items-center gap-1 px-4 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">
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
            <button onClick={() => setInviteOpen(true)} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity">
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
                  {users.map((u) => (
                    <tr key={u.email} className="hover:bg-[#F7F9FC] dark:hover:bg-muted/20 transition-colors">
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
                        <button
                          onClick={() => toggleUserStatus(u)}
                          title={u.status === "Active" ? "Deactivate user" : "Activate user"}
                          className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full transition-opacity hover:opacity-80", u.status === "Active" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}
                        >
                          {u.status}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{u.last}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setRemoveTarget(u)}
                          title="Remove user"
                          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-danger/10 hover:text-danger text-muted-foreground transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No portal users — invite someone to get started.</td></tr>
                  )}
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
          <div className="px-5 py-3 border-b border-[#E4E9F0] dark:border-border flex items-center justify-between gap-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Notification Preferences</p>
            <p className="text-[10px] text-muted-foreground">{notifications.filter(n => n.enabled).length} of {notifications.length} enabled</p>
          </div>
          <div className="divide-y divide-[#E4E9F0] dark:divide-border">
            {notifications.map((n, i) => (
              <div key={n.label} className="flex items-center justify-between px-5 py-3.5 gap-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-[#1E3A5F] dark:text-brand shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-[#1E3A5F] dark:text-foreground">{n.label}</p>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleNotification(i)}
                  title={`${n.enabled ? "Disable" : "Enable"} ${n.label} emails`}
                  aria-pressed={n.enabled}
                  className={cn("w-11 h-6 rounded-full relative cursor-pointer transition-colors shrink-0", n.enabled ? "bg-[#1E3A5F] dark:bg-brand" : "bg-[#E4E9F0] dark:bg-muted")}
                >
                  <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white transition-all", n.enabled ? "left-6" : "left-1")} />
                </button>
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
              <span className="flex-1 truncate">{tokenRevealed ? token : MASKED_TOKEN}</span>
              <button
                onClick={() => setTokenRevealed(v => !v)}
                title={tokenRevealed ? "Hide token" : "Reveal token"}
                className="text-[#1E3A5F] dark:text-brand text-[10px] font-semibold hover:underline shrink-0"
              >
                {tokenRevealed ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={copyToken}
                title="Copy token to clipboard"
                className="text-[#1E3A5F] dark:text-brand text-[10px] font-semibold hover:underline shrink-0"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Use this token to integrate your ERP or WMS with the VoltusFreight API. Keep it confidential.</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => setRegenOpen(true)} className="px-3 py-2 rounded-xl border border-[#E4E9F0] dark:border-border text-xs font-medium text-muted-foreground hover:bg-[#F7F9FC] dark:hover:bg-muted transition-colors">Regenerate Token</button>
              <button
                onClick={() => notify.info("API documentation", "The VoltusFreight REST API reference has opened in a new tab.")}
                className="px-3 py-2 rounded-xl bg-[#1E3A5F] dark:bg-brand text-white text-xs font-medium hover:opacity-90 transition-opacity"
              >
                View API Docs
              </button>
            </div>
          </div>
          <div className="rounded-2xl border border-[#E4E9F0] dark:border-border bg-white dark:bg-card p-5">
            <p className="text-sm font-bold text-[#1E3A5F] dark:text-foreground mb-3">Webhook Endpoints</p>
            <div className="space-y-2">
              {webhooks.map((w, i) => (
                <div key={w.event} className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F9FC] dark:bg-muted/30 border border-[#E4E9F0] dark:border-border">
                  <div className={cn("w-2 h-2 rounded-full shrink-0", w.active ? "bg-success" : "bg-muted-foreground")} />
                  <span className="font-mono text-xs text-[#1E3A5F] dark:text-brand shrink-0">{w.event}</span>
                  <span className="text-xs text-muted-foreground flex-1 truncate">{w.url}</span>
                  <button
                    onClick={() => openWebhook(i)}
                    title={`Edit ${w.event} webhook`}
                    className="text-[10px] text-[#1E3A5F] dark:text-brand hover:underline shrink-0"
                  >
                    Edit
                  </button>
                </div>
              ))}
              {webhooks.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">No webhooks configured yet.</p>
              )}
            </div>
            <button onClick={() => openWebhook(null)} className="mt-3 flex items-center gap-1.5 text-xs text-[#1E3A5F] dark:text-brand font-medium hover:underline">
              <Plus className="w-3.5 h-3.5" /> Add Webhook
            </button>
          </div>
        </div>
      )}

      {/* Invite user modal */}
      <Modal
        open={inviteOpen}
        onOpenChange={(o) => { setInviteOpen(o); if (!o) { setInvite(emptyInvite); setInviteErrors({}) } }}
        title="Invite Portal User"
        description="Send a portal invitation to a colleague"
        footer={<ModalActions onCancel={() => setInviteOpen(false)} onSubmit={sendInvite} submitLabel="Send Invite" />}
      >
        <div className="space-y-4">
          <Field label="Full Name" required error={inviteErrors.name}>
            <TextInput value={invite.name} invalid={!!inviteErrors.name} onChange={e => setInvite({ ...invite, name: e.target.value })} placeholder="e.g. Kavya Reddy" />
          </Field>
          <Field label="Work Email" required error={inviteErrors.email}>
            <TextInput value={invite.email} invalid={!!inviteErrors.email} onChange={e => setInvite({ ...invite, email: e.target.value })} placeholder="name@apexpharma.in" />
          </Field>
          <Field label="Role" required error={inviteErrors.role} hint="Role determines which portal sections the user can access.">
            <Select value={invite.role} invalid={!!inviteErrors.role} onChange={e => setInvite({ ...invite, role: e.target.value })} options={ROLES} placeholder="Select Role" />
          </Field>
        </div>
      </Modal>

      {/* Webhook modal */}
      <Modal
        open={webhookOpen}
        onOpenChange={(o) => { setWebhookOpen(o); if (!o) { setWebhookForm(emptyWebhook); setWebhookErrors({}); setWebhookIndex(null) } }}
        title={webhookIndex === null ? "Add Webhook" : "Edit Webhook"}
        description="POST a JSON payload to your endpoint when this event fires"
        footer={<ModalActions onCancel={() => setWebhookOpen(false)} onSubmit={saveWebhook} submitLabel={webhookIndex === null ? "Add Webhook" : "Save Changes"} />}
      >
        <div className="space-y-4">
          <Field label="Event" required error={webhookErrors.event}>
            <Select value={webhookForm.event} invalid={!!webhookErrors.event} onChange={e => setWebhookForm({ ...webhookForm, event: e.target.value })} options={WEBHOOK_EVENTS} placeholder="Select Event" />
          </Field>
          <Field label="Endpoint URL" required error={webhookErrors.url}>
            <TextInput value={webhookForm.url} invalid={!!webhookErrors.url} onChange={e => setWebhookForm({ ...webhookForm, url: e.target.value })} placeholder="https://api.apexpharma.in/webhook/..." />
          </Field>
          <Field label="State" required>
            <Select value={webhookForm.state} onChange={e => setWebhookForm({ ...webhookForm, state: e.target.value })} options={WEBHOOK_STATES} />
          </Field>
        </div>
      </Modal>

      {/* Remove user confirmation */}
      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(o) => !o && setRemoveTarget(null)}
        title="Remove this user?"
        message={`${removeTarget?.name} (${removeTarget?.email}) will immediately lose access to the portal. This cannot be undone.`}
        confirmLabel="Remove User"
        cancelLabel="Keep Access"
        onConfirm={() => removeTarget && removeUser(removeTarget)}
      />

      {/* Regenerate token confirmation */}
      <ConfirmDialog
        open={regenOpen}
        onOpenChange={setRegenOpen}
        title="Regenerate API token?"
        message="Your current token will be revoked immediately. Any integration still using it will stop working until you update the credentials."
        confirmLabel="Regenerate"
        cancelLabel="Keep Current"
        onConfirm={regenerateToken}
      />
    </div>
  )
}
