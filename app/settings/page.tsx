"use client"

import { useState } from "react"
import {
  Settings, User, Bell, Shield, Database, Palette, Globe, Key,
  ChevronRight, Save, Mail, Phone, Building2, MapPin,
  Eye, EyeOff, Check
} from "lucide-react"
import { cn } from "@/lib/utils"

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
  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000) }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Profile</h2>
        <p className="text-sm text-muted-foreground">Manage your personal information</p>
      </div>
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-brand flex items-center justify-center text-white text-xl font-bold shrink-0">VJ</div>
        <div>
          <button className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm text-foreground hover:bg-muted transition-colors">
            Change Photo
          </button>
          <p className="text-xs text-muted-foreground mt-1">JPG, PNG or GIF. Max 2MB.</p>
        </div>
      </div>
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
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background focus-within:border-brand/50 focus-within:ring-1 focus-within:ring-brand/20 transition-all">
              <span className="text-muted-foreground shrink-0">{f.icon}</span>
              <input defaultValue={f.value} className="bg-transparent text-sm outline-none flex-1 text-foreground" />
            </div>
          </div>
        ))}
      </div>
      <div>
        <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">Role / Title</label>
        <div className="relative">
          <select className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none cursor-pointer">
            <option>Warehouse Manager</option>
            <option>Operations Supervisor</option>
            <option>Floor Supervisor</option>
            <option>Admin</option>
            <option>Viewer</option>
          </select>
          <ChevronRight className="w-4 h-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
        </div>
      </div>
      <button onClick={handleSave} className={cn("flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors", saved ? "bg-success text-white" : "bg-brand text-white hover:bg-brand/90")}>
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
        <div key={g.title} className="rounded-2xl border border-border bg-card overflow-hidden">
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

function SecuritySection() {
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [twoFA, setTwoFA] = useState(true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">Security</h2>
        <p className="text-sm text-muted-foreground">Manage your account security settings</p>
      </div>
      {/* Password */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <p className="text-sm font-semibold text-foreground">Change Password</p>
        {[
          { label: "Current Password", show: showOld, onToggle: () => setShowOld(v => !v) },
          { label: "New Password", show: showNew, onToggle: () => setShowNew(v => !v) },
          { label: "Confirm New Password", show: showNew, onToggle: () => setShowNew(v => !v) },
        ].map((f) => (
          <div key={f.label}>
            <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background focus-within:border-brand/50 transition-all">
              <input type={f.show ? "text" : "password"} placeholder="••••••••" className="bg-transparent text-sm outline-none flex-1 text-foreground" />
              <button onClick={f.onToggle} className="text-muted-foreground hover:text-foreground transition-colors">
                {f.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand text-white text-sm font-medium hover:bg-brand/90 transition-colors">
          <Save className="w-4 h-4" /> Update Password
        </button>
      </div>
      {/* 2FA */}
      <div className="rounded-2xl border border-border bg-card p-5">
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
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/20">
          <p className="text-sm font-semibold text-foreground">Active Sessions</p>
        </div>
        {[
          { device: "Chrome — Windows 11", location: "Bengaluru, India", time: "Current session", current: true },
          { device: "Safari — iPhone 14", location: "Bengaluru, India", time: "2 hours ago", current: false },
          { device: "Chrome — MacBook Pro", location: "Mumbai, India", time: "1 day ago", current: false },
        ].map((s, i) => (
          <div key={i} className="flex items-center justify-between px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">{s.device}</p>
              <p className="text-xs text-muted-foreground">{s.location} · {s.time}</p>
            </div>
            {s.current ? (
              <span className="px-2 py-0.5 rounded-full text-xs bg-success/15 text-success font-medium">Active</span>
            ) : (
              <button className="text-xs text-danger hover:underline">Revoke</button>
            )}
          </div>
        ))}
      </div>
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
      <div className="rounded-2xl border border-border bg-card p-5 space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Table Density</p>
          <div className="flex gap-3">
            {["compact", "comfortable", "spacious"].map((d) => (
              <button
                key={d}
                onClick={() => setDensity(d)}
                className={cn(
                  "flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors",
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
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none">
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
            <select className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none">
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

function ApiSection() {
  const tokens = [
    { name: "Production API Key", key: "vwms_prod_••••••••••••••••4a2f", created: "Dec 1, 2024", lastUsed: "2 mins ago" },
    { name: "Staging API Key", key: "vwms_stg_••••••••••••••••8c31", created: "Nov 15, 2024", lastUsed: "1 day ago" },
  ]
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-foreground">API &amp; Tokens</h2>
        <p className="text-sm text-muted-foreground">Manage API keys for external integrations</p>
      </div>
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 flex items-center justify-between border-b border-border bg-muted/20">
          <p className="text-sm font-semibold text-foreground">API Keys</p>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-medium hover:bg-brand/90 transition-colors">
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
                <button className="text-xs text-danger hover:underline mt-0.5">Revoke</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-5">
        <p className="text-sm font-semibold text-foreground mb-2">Webhook URL</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border bg-background">
          <input defaultValue="https://hooks.acmelogistics.com/wms/events" className="bg-transparent text-sm font-mono outline-none flex-1 text-foreground" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Events will be POSTed to this URL on order and inventory changes.</p>
      </div>
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
    integrations: (
      <div className="space-y-4">
        <div><h2 className="text-lg font-bold text-foreground">Integrations</h2><p className="text-sm text-muted-foreground">Connect third-party services</p></div>
        {[
          { name: "Tally ERP", desc: "Accounting & billing sync", connected: true },
          { name: "Shopify", desc: "E-commerce order sync", connected: false },
          { name: "FedEx / Blue Dart", desc: "Shipping label & tracking", connected: true },
          { name: "WhatsApp Business", desc: "Dispatch notifications", connected: false },
          { name: "SAP B1", desc: "ERP integration", connected: false },
        ].map((int) => (
          <div key={int.name} className="flex items-center justify-between p-4 rounded-2xl border border-border bg-card hover:bg-muted/20 transition-colors">
            <div>
              <p className="text-sm font-semibold text-foreground">{int.name}</p>
              <p className="text-xs text-muted-foreground">{int.desc}</p>
            </div>
            <button className={cn("px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors", int.connected ? "bg-success/15 text-success hover:bg-success/25" : "bg-brand text-white hover:bg-brand/90")}>
              {int.connected ? "Connected" : "Connect"}
            </button>
          </div>
        ))}
      </div>
    ),
    localization: (
      <div className="space-y-4">
        <div><h2 className="text-lg font-bold text-foreground">Localization</h2><p className="text-sm text-muted-foreground">Regional and currency settings</p></div>
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
          {[
            { label: "Currency", value: "INR — Indian Rupee (₹)", options: ["INR — Indian Rupee (₹)", "USD — US Dollar ($)", "EUR — Euro (€)"] },
            { label: "Timezone", value: "Asia/Kolkata (IST +5:30)", options: ["Asia/Kolkata (IST +5:30)", "UTC", "America/New_York"] },
            { label: "Weight Unit", value: "Kilograms (kg)", options: ["Kilograms (kg)", "Pounds (lb)", "Metric Tons (MT)"] },
          ].map((f) => (
            <div key={f.label}>
              <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
              <div className="relative">
                <select defaultValue={f.value} className="w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border bg-background text-sm text-foreground outline-none">
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
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left",
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
