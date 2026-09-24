"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function MHEOperationsLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="mhe">{children}</ModuleLayout>
}
