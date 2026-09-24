"use client"

import { useState } from "react"
import {
  Settings, User, Bell, Shield, Database, Palette, Globe, Key,
  ChevronRight, Save, Mail, Phone, Building2, MapPin,
  Eye, EyeOff, Check, Upload
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Modal } from "@/components/ui/modal"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Field, TextInput, ModalActions } from "@/components/ui/form"
import { notify } from "@/components/ui/toast"

type ApiToken = { name: string; key: string; created: string; lastUsed: string }
type Session = { device: string; location: string; time: string; current: boolean }
type Integration = { name: string; desc: string; connected: boolean }

/** Deterministic pastel swatches offered as stand-ins for a real avatar upload. */
const AVATAR_PRESETS = [
  { id: "brand", label: "Brand", cls: "bg-brand" },
  { id: "emerald", label: "Emerald", cls: "bg-emerald-500" },
  { id: "violet", label: "Violet", cls: "bg-violet-500" },
  { id: "amber", label: "Amber", cls: "bg-amber-500" },
  { id: "rose", label: "Rose", cls: "bg-rose-500" },
  { id: "slate", label: "Slate", cls: "bg-slate-500" },
] as const

const sections = [
  { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
  { id: "notifications", label: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "security", label: "Security", icon: <Shield className="w-4 h-4" /> },
  { id: "appearance", label: "Appearance", icon: <Palette className="w-4 h-4" /> },
  { id: "integrations", label: "Integrations", icon: <Database className="w-4 h-4" /> },
  { id: "localization", label: "Localization", icon: <Globe className="w-4 h-4" /> },
  { id: "api", label: "API & Tokens", icon: <Key className="w-4 h-4" /> },
]

function Toggle2({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        "relative w-10 h-5 rounded-full transition-colors shrink-0",
        checked ? "bg-brand" : "bg-muted"
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  )
}

function ProfileSection() {
  const [saved, setSaved] = useState(false)
  const handleSave = () => {
    setSaved(true)
    notify.success("Profile updated", "Your personal details have been saved.")
    setTimeout(() => setSaved(false), 2000)
  }

  // Avatar state — `initials`/`color` are what the page renders; the modal edits drafts.
  const [initials, setInitials] = useState("VJ")
  const [color, setColor] = useState<string>("bg-brand")
  const [photoOpen, setPhotoOpen] = useState(false)
  const [draftInitials, setDraftInitials] = useState("VJ")
  const [draftColor, setDraftColor] = useState<string>("bg-brand")
  const [draftFile, setDraftFile] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState("")

  function openPhoto() {
    setDraftInitials(initials)
    setDraftColor(color)
    setDraftFile(null)
    setPhotoError("")
    setPhotoOpen(true)
  }

  function applyPhoto() {
    const next = draftInitials.trim().toUpperCase()
    if (!next) { setPhotoError("Enter 1–2 initials for the avatar"); return }
    if (!/^[A-Z]{1,2}$/.test(next)) { setPhotoError("Use 1–2 letters only"); return }
    setInitials(next)
    setColor(draftColor)
    setPhotoOpen(false)
    setPhotoError("")
    notify.success("Photo updated", draftFile ? `${draftFile} applied to your profile.` : "Avatar style applied to your profile.")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className={cn("w-16 h-16 rounded-xl flex items-center justify-center text-white text-xl font-bold shrink-0", color)}>{initials}</div>
        <div>
          <button onClick={openPhoto} className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            Change Photo
          </button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>

      {/* Change photo — simulated upload with live preview */}
      <Modal
        open={photoOpen}
        onOpenChange={(o) => { setPhotoOpen(o); if (!o) setPhotoError("") }}
        title="Change Profile Photo"
        description="Upload an image or pick an avatar style"
        footer={<ModalActions onCancel={() => setPhotoOpen(false)} onSubmit={applyPhoto} submitLabel="Apply Photo" />}
      >
        <div className="space-y-5">
          {/* Live preview */}
          <div className="flex items-center gap-4">
            <div className={cn("w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold shrink-0", draftColor)}>
              {draftInitials.trim().toUpperCase() || "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">Preview</p>
              <p className="text-xs text-muted-foreground mt-0.5 break-words">
                {draftFile ? `Selected: ${draftFile}` : "No file selected — using initials avatar."}
              </p>
            </div>
          </div>

          <div>
            <label
              className="flex items-center justify-center gap-2 w-full px-3 py-6 rounded-xl border border-dashed border-border bg-background text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              title="Choose an image file"
            >
              <Upload className="w-4 h-4" />
              {draftFile ? "Choose a different image" : "Click to upload JPG, PNG or GIF"}
              <input
                type="file"
                accept="image/png,image/jpeg,image/gif"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (!f) return
                  if (f.size > 2 * 1024 * 1024) {
                    setPhotoError("File exceeds the 2MB limit")
                    notify.error("File too large", `${f.name} is over the 2MB limit.`)
                    return
                  }
                  setPhotoError("")
                  setDraftFile(f.name)
                  // No backend to store the binary — derive initials from the filename so the preview reacts.
                  const stem = f.name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z]/g, "")
                  if (stem) setDraftInitials(stem.slice(0, 2).toUpperCase())
                  notify.info("Image selected", `${f.name} ready to apply.`)
                }}
              />
            </label>
            {photoError && <p className="mt-1 text-xs text-danger">{photoError}</p>}
          </div>

          <Field label="Initials" required error={photoError && !draftFile ? photoError : undefined} hint="Shown when no image is set">
            <TextInput
              value={draftInitials}
              invalid={!!photoError}
              maxLength={2}
              onChange={(e) => { setDraftInitials(e.target.value); setPhotoError("") }}
              placeholder="e.g. VJ"
            />
          </Field>

          <div>
            <p className="mb-1.5 block text-sm font-medium text-foreground">Background</p>
            <div className="flex flex-wrap gap-2">
              {AVATAR_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setDraftColor(p.cls)}
                  title={p.label}
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    p.cls,
                    draftColor === p.cls ? "ring-2 ring-offset-2 ring-brand ring-offset-background" : "opacity-80 hover:opacity-100"
                  )}
                >
                  {draftColor === p.cls && <Check className="w-4 h-4 text-white" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>
      {/* Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { label: "First Name", value: "Vijay", icon: <User className="w-4 h-4" /> },
          { label: "Last Name", value: "Kumar", icon: <User className="w-4 h-4" /> },
          { label: "Email Address", value: "vijay.kumar@acmelogistics.com", icon: <Mail className="w-4 h-4" /> },
          { label: "Phone Number", value: "+91 98765 43210", icon: <Phone className="w-4 h-4" /> },
          { label: "Company", value: "Acme Logistics", icon: <Building2 className="w-4 h-4" /> },
          { label: "Location", value: "Bengaluru, India", icon: <MapPin className="w-4 h-4" /> },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20 transition-all">
              <span className="text-muted-foreground shrink-0">{f.icon}</span>
              <input defaultValue={f.value} className="bg-transparent text-sm outline-none flex-1 text-foreground" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Role / Title</label>
        <div className="relative">
          <select className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none cursor-pointer">
            <option>Warehouse Manager</option>
            <option>Operations Supervisor</option>
            <option>Floor Supervisor</option>
            <option>Admin</option>
            <option>Viewer</option>
          </select>
          <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
        </div>
      </div>
      <button onClick={handleSave} className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors", saved ? "bg-success text-white" : "bg-brand text-white hover:bg-brand/90")}>
        {saved ? <><Check className="w-4 h-4" /> Saved!</> : <><Save className="w-4 h-4" /> Save Changes</>}
      </button>
    </div>
  )
}

function NotificationsSection() {
  const [prefs, setPrefs] = useState({
    email_orders: true, email_alerts: true, email_billing: false,
    push_orders: true, push_gate: true, push_cold: true, push_sla: true,
    sms_critical: false,
  })
  const toggle = (k: keyof typeof prefs) => setPrefs(p => ({ ...p, [k]: !p[k] }))

  const groups = [
    {
      title: "Email Notifications", items: [
        { key: "email_orders" as const, label: "Order Updates", desc: "New orders, status changes, fulfillment" },
        { key: "email_alerts" as const, label: "Inventory Alerts", desc: "Low stock, expiry, critical levels" },
        { key: "email_billing" as const, label: "Billing & Invoices", desc: "Invoice generated, payment due" },
      ]
    },
    {
      title: "Push Notifications", items: [
        { key: "push_orders" as const, label: "Order Events", desc: "Real-time order lifecycle changes" },
        { key: "push_gate" as const, label: "Gate Activity", desc: "Vehicle entry/exit at gate" },
        { key: "push_cold" as const, label: "Cold Chain Breaches", desc: "Temperature excursions" },
        { key: "push_sla" as const, label: "SLA Breach Warnings", desc: "Orders approaching SLA deadline" },
      ]
    },
    {
      title: "SMS Notifications", items: [
        { key: "sms_critical" as const, label: "Critical Alerts Only", desc: "SMS for urgent system events" },
      ]
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Notifications</h2>
        <p className="text-sm text-muted-foreground">Control how and when you receive alerts</p>
      </div>
      {groups.map((g) => (
        <div key={g.title} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/20">
            <p className="text-sm font-semibold text-foreground">{g.title}</p>
          </div>
          <div className="divide-y divide-border/50">
            {g.items.map((item) => (
              <div key={item.key} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20 transition-colors">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <Toggle2 checked={prefs[item.key]} onChange={() => toggle(item.key)} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

const initialSessions: Session[] = [
  { device: "Chrome — Windows 11", location: "Bengaluru, India", time: "Current session", current: true },
  { device: "Safari — iPhone 14", location: "Bengaluru, India", time: "2 hours ago", current: false },
  { device: "Chrome — MacBook Pro", location: "Mumbai, India", time: "1 day ago", current: false },
  { device: "Edge — Windows 10", location: "Pune, India", time: "2 days ago", current: false },
  { device: "Firefox — Ubuntu 24.04", location: "Hyderabad, India", time: "3 days ago", current: false },
  { device: "Safari — iPad Air", location: "Chennai, India", time: "5 days ago", current: false },
  { device: "Chrome — Android (Pixel 8)", location: "Delhi, India", time: "1 week ago", current: false },
  { device: "Zebra TC52 Scanner — Dock 3", location: "Bengaluru, India", time: "2 weeks ago", current: false },
]

function SecuritySection() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [twoFA, setTwoFA] = useState(true)

  const [pw, setPw] = useState({ current: "", next: "", confirm: "" })
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({})
  const [sessions, setSessions] = useState<Session[]>(initialSessions)
  const [revokeTarget, setRevokeTarget] = useState<Session | null>(null)

  function updatePassword() {
    const e: Record<string, string> = {}
    if (!pw.current) e.current = "Enter your current password"
    if (!pw.next) e.next = "Enter a new password"
    else if (pw.next.length < 8) e.next = "Must be at least 8 characters"
    else if (pw.next === pw.current) e.next = "New password must differ from the current one"
    if (!pw.confirm) e.confirm = "Re-enter the new password"
    else if (pw.confirm !== pw.next) e.confirm = "Passwords do not match"
    setPwErrors(e)
    if (Object.keys(e).length > 0) return
    setPw({ current: "", next: "", confirm: "" })
    notify.success("Password updated", "Use your new password at next sign-in.")
  }

  function revokeSession(s: Session) {
    setSessions(prev => prev.filter(x => x.device !== s.device))
    notify.warning("Session revoked", `${s.device} has been signed out.`)
  }

  const passwordFields = [
    { key: "current" as const, label: "Current Password", show: showOld, onToggle: () => setShowOld(v => !v) },
    { key: "next" as const, label: "New Password", show: showNew, onToggle: () => setShowNew(v => !v) },
    { key: "confirm" as const, label: "Confirm New Password", show: showNew, onToggle: () => setShowNew(v => !v) },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">Manage your account security settings</p>
      </div>
      {/* Password */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Change Password</p>
        {passwordFields.map((f) => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
            <div className={cn("flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-background focus-within:border-brand/50 transition-all", pwErrors[f.key] ? "border-danger" : "border-border")}>
              <input
                type={f.show ? "text" : "password"}
                placeholder="••••••••"
                value={pw[f.key]}
                onChange={(e) => { setPw({ ...pw, [f.key]: e.target.value }); setPwErrors(prev => ({ ...prev, [f.key]: "" })) }}
                className="bg-transparent text-sm outline-none flex-1 text-foreground"
              />
              <button onClick={f.onToggle} title={f.show ? "Hide password" : "Show password"} className="text-muted-foreground hover:text-foreground transition-colors">
                {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {pwErrors[f.key] && <p className="mt-1 text-xs text-danger">{pwErrors[f.key]}</p>}
          </div>
        ))}
        <button onClick={updatePassword} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
          <Save className="w-4 h-4" /> Update Password
        </button>
      </div>
      {/* 2FA */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">Two-Factor Authentication</p>
            <p className="text-xs text-muted-foreground mt-0.5">Add an extra layer of security to your account</p>
          </div>
          <Toggle2 checked={twoFA} onChange={setTwoFA} />
        </div>
        {twoFA && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-success font-medium flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" /> 2FA is active — Authenticator app configured
            </p>
          </div>
        )}
      </div>
      {/* Sessions */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-sm font-semibold text-foreground">Active Sessions</p>
        </div>
        {sessions.map((s, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
            </div>
            {s.current ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-success/15 text-success font-medium">Active</span>
            ) : (
              <button onClick={() => setRevokeTarget(s)} title={`Revoke ${s.device}`} className="text-xs text-danger hover:underline">Revoke</button>
            )}
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="px-5 py-10 text-center text-sm text-muted-foreground">No active sessions.</div>
        )}
      </div>

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        title="Revoke this session?"
        message={`${revokeTarget?.device} (${revokeTarget?.location}) will be signed out immediately.`}
        confirmLabel="Revoke Session"
        cancelLabel="Keep Signed In"
        onConfirm={() => revokeTarget && revokeSession(revokeTarget)}
      />
    </div>
  )
}

function AppearanceSection() {
  const [density, setDensity] = useState("comfortable")
  const [language, setLanguage] = useState("en")

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Appearance</h2>
        <p className="text-sm text-muted-foreground">Customize how the application looks</p>
      </div>
      <div className="rounded-xl border border-border bg-card p-5 space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Table Density</p>
          <div className="flex gap-3">
            {["compact", "comfortable", "spacious"].map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={cn(
                  "flex-1 py-2.5 rounded-lg border text-sm font-medium capitalize transition-colors",
                  density === d ? "border-brand bg-brand/10 text-brand" : "border-border text-muted-foreground hover:border-foreground/30"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Language</p>
          <div className="relative">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none">
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="ta">Tamil</option>
              <option value="te">Telugu</option>
            </select>
            <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground mb-1">Date Format</p>
          <div className="relative">
            <select className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
            <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  )
}

const initialTokens: ApiToken[] = [
  { name: "Production API Key", key: "vwms_prod_••••••••••••••••4a2f", created: "Dec 1, 2024", lastUsed: "2 mins ago" },
  { name: "Staging API Key", key: "vwms_stg_••••••••••••••••8c31", created: "Nov 15, 2024", lastUsed: "1 day ago" },
  { name: "Mobile Scanner Key", key: "vwms_scanner_••••••••••••••••b7d9", created: "Oct 28, 2024", lastUsed: "18 mins ago" },
  { name: "Tally Sync Key", key: "vwms_tally_••••••••••••••••1e64", created: "Sep 12, 2024", lastUsed: "6 hours ago" },
  { name: "Reporting API Key", key: "vwms_reporting_••••••••••••••••9f05", created: "Aug 3, 2024", lastUsed: "3 days ago" },
  { name: "Legacy Import Key", key: "vwms_legacy_••••••••••••••••2a88", created: "Jun 21, 2024", lastUsed: "Never" },
]

function ApiSection() {
  const [tokens, setTokens] = useState<ApiToken[]>(initialTokens)
  const [genOpen, setGenOpen] = useState(false)
  const [keyName, setKeyName] = useState("")
  const [keyError, setKeyError] = useState("")
  const [revokeTarget, setRevokeTarget] = useState<ApiToken | null>(null)
  const [webhook, setWebhook] = useState("https://hooks.acmelogistics.com/wms/events")

  function generateKey() {
    const name = keyName.trim()
    if (!name) { setKeyError("Key name is required"); return }
    if (tokens.some(t => t.name.toLowerCase() === name.toLowerCase())) { setKeyError("A key with that name already exists"); return }
    const suffix = Math.random().toString(16).slice(2, 6)
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 12) || "key"
    const next: ApiToken = {
      name,
      key: `vwms_${slug}_••••••••••••••••${suffix}`,
      created: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      lastUsed: "Never",
    }
    setTokens(prev => [next, ...prev])
    setGenOpen(false)
    setKeyName("")
    setKeyError("")
    notify.success("API key generated", `${next.name} — copy it now, it won't be shown again.`)
  }

  function revokeToken(t: ApiToken) {
    setTokens(prev => prev.filter(x => x.name !== t.name))
    notify.warning("API key revoked", `${t.name} can no longer authenticate.`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">API &amp; Tokens</h2>
        <p className="text-sm text-muted-foreground">Manage API keys for external integrations</p>
      </div>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-border bg-muted/20">
          <p className="text-sm font-semibold text-foreground">API Keys</p>
          <button onClick={() => { setKeyName(""); setKeyError(""); setGenOpen(true) }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors">
            <Key className="w-3.5 h-3.5" /> Generate Key
          </button>
        </div>
        <div className="divide-y divide-border/50">
          {tokens.map((t) => (
            <div key={t.name} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs font-mono text-muted-foreground mt-0.5">{t.key}</p>
                  <p className="text-xs text-muted-foreground mt-1">Created {t.created} · Last used {t.lastUsed}</p>
                </div>
                <button onClick={() => setRevokeTarget(t)} title={`Revoke ${t.name}`} className="text-xs text-danger hover:underline mt-0.5">Revoke</button>
              </div>
            </div>
          ))}
          {tokens.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">No API keys. Generate one to get started.</div>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground mb-2">Webhook URL</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-border bg-background">
          <input value={webhook} onChange={(e) => setWebhook(e.target.value)} className="bg-transparent text-sm font-mono outline-none flex-1 text-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Events will be POSTed to this URL on order and inventory changes.</p>
      </div>

      {/* Generate API key */}
      <Modal
        open={genOpen}
        onOpenChange={(o) => { setGenOpen(o); if (!o) { setKeyName(""); setKeyError("") } }}
        title="Generate API Key"
        description="Create a new key for an external integration"
        footer={<ModalActions onCancel={() => setGenOpen(false)} onSubmit={generateKey} submitLabel="Generate Key" />}
      >
        <Field label="Key Name" required error={keyError} hint="e.g. Warehouse Sync, Mobile Scanner">
          <TextInput
            value={keyName}
            invalid={!!keyError}
            onChange={(e) => { setKeyName(e.target.value); setKeyError("") }}
            placeholder="e.g. Reporting API Key"
          />
        </Field>
      </Modal>

      <ConfirmDialog
        open={!!revokeTarget}
        onOpenChange={(o) => !o && setRevokeTarget(null)}
        title="Revoke this API key?"
        message={`${revokeTarget?.name} will stop working immediately. Any integration using it will fail. This cannot be undone.`}
        confirmLabel="Revoke Key"
        cancelLabel="Keep Key"
        onConfirm={() => revokeTarget && revokeToken(revokeTarget)}
      />
    </div>
  )
}

const initialIntegrations: Integration[] = [
  { name: "Tally ERP", desc: "Accounting & billing sync", connected: true },
  { name: "Shopify", desc: "E-commerce order sync", connected: false },
  { name: "FedEx / Blue Dart", desc: "Shipping label & tracking", connected: true },
  { name: "WhatsApp Business", desc: "Dispatch notifications", connected: false },
  { name: "SAP B1", desc: "ERP integration", connected: false },
  { name: "Zoho Books", desc: "Invoice & GST reconciliation", connected: true },
  { name: "Delhivery", desc: "Last-mile courier manifests", connected: true },
  { name: "Amazon Seller Central", desc: "Marketplace order intake", connected: false },
  { name: "Razorpay", desc: "Payment capture for COD settlements", connected: true },
  { name: "Twilio SMS", desc: "Driver & gate-pass alerts", connected: false },
]

function IntegrationsSection() {
  const [integrations, setIntegrations] = useState<Integration[]>(initialIntegrations)
  const [disconnectTarget, setDisconnectTarget] = useState<Integration | null>(null)

  function connect(int: Integration) {
    setIntegrations(prev => prev.map(x => x.name === int.name ? { ...x, connected: true } : x))
    notify.success("Integration connected", `${int.name} is now syncing.`)
  }

  function disconnect(int: Integration) {
    setIntegrations(prev => prev.map(x => x.name === int.name ? { ...x, connected: false } : x))
    notify.warning("Integration disconnected", `${int.name} will no longer sync.`)
  }

  return (
    <div className="space-y-4">
      <div><h2 className="text-lg font-bold text-foreground">Integrations</h2><p className="text-sm text-muted-foreground">Connect third-party services</p></div>
      {integrations.map((int) => (
        <div key={int.name} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/20 transition-colors">
          <div>
            <p className="text-sm font-semibold text-foreground">{int.name}</p>
            <p className="text-xs text-muted-foreground">{int.desc}</p>
          </div>
          <button
            onClick={() => int.connected ? setDisconnectTarget(int) : connect(int)}
            title={int.connected ? `Disconnect ${int.name}` : `Connect ${int.name}`}
            className={cn("px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors", int.connected ? "bg-success/15 text-success hover:bg-success/25" : "bg-brand text-white hover:bg-brand/90")}
          >
            {int.connected ? "Connected" : "Connect"}
          </button>
        </div>
      ))}

      <ConfirmDialog
        open={!!disconnectTarget}
        onOpenChange={(o) => !o && setDisconnectTarget(null)}
        title="Disconnect this integration?"
        message={`${disconnectTarget?.name} will stop syncing (${disconnectTarget?.desc?.toLowerCase()}). You can reconnect at any time.`}
        confirmLabel="Disconnect"
        cancelLabel="Stay Connected"
        onConfirm={() => disconnectTarget && disconnect(disconnectTarget)}
      />
    </div>
  )
}

export default function SettingsPage() {
  const [active, setActive] = useState("profile")

  const content: Record<string, React.ReactNode> = {
    profile: <ProfileSection />,
    notifications: <NotificationsSection />,
    security: <SecuritySection />,
    appearance: <AppearanceSection />,
    api: <ApiSection />,
    integrations: <IntegrationsSection />,
    localization: (
      <div className="space-y-4">
        <div><h2 className="text-lg font-bold text-foreground">Localization</h2><p className="text-sm text-muted-foreground">Regional and currency settings</p></div>
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          {[
            { label: "Currency", value: "INR — Indian Rupee (₹)", options: ["INR — Indian Rupee (₹)", "USD — US Dollar ($)", "EUR — Euro (€)"] },
            { label: "Timezone", value: "Asia/Kolkata (IST +5:30)", options: ["Asia/Kolkata (IST +5:30)", "UTC", "America/New_York"] },
            { label: "Weight Unit", value: "Kilograms (kg)", options: ["Kilograms (kg)", "Pounds (lb)", "Metric Tons (MT)"] },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
              <div className="relative">
                <select defaultValue={f.value} className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground outline-none">
                  {f.options.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  }

  return (
    <div className="flex h-full">
      {/* Side nav */}
      <aside className="w-56 shrink-0 border-r border-border bg-card overflow-y-auto">
        <div className="p-4 border-b border-border">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Settings</p>
        </div>
        <nav className="p-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActive(s.id)}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                active === s.id ? "bg-brand/10 text-brand" : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {s.icon}
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="w-full">
          {content[active] ?? null}
        </div>
      </main>
    </div>
  )
}
