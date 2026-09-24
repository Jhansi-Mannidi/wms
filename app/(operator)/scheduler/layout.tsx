"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function SchedulerLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="scheduler">{children}</ModuleLayout>
}
