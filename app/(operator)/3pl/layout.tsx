"use client"

import { ModuleLayout } from "@/components/layout/module-layout"

// Menu, header and breadcrumbs come from lib/navigation.tsx.
export default function ThreePLLayout({ children }: { children: React.ReactNode }) {
  return <ModuleLayout moduleId="3pl">{children}</ModuleLayout>
}
