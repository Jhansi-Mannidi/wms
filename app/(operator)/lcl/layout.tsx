"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function LCLLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="lcl">{children}</ModuleLayout>
}
