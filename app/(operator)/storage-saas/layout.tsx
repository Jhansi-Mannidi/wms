"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function StorageSaaSLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="storage">{children}</ModuleLayout>
}
