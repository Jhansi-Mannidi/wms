"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function GateManagementLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="gate">{children}</ModuleLayout>
}
