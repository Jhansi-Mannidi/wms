"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function AuditTrailLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="audit">{children}</ModuleLayout>
}
