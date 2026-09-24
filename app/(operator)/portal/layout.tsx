"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="portal" subtitle="Apex Pharma Ltd — Client Account">{children}</ModuleLayout>
}
