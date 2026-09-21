import { TopNav } from '@/components/layout/top-nav'
import { StatusBar } from '@/components/layout/status-bar'

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="flex-1 overflow-hidden mt-14 mb-10">
        {children}
      </div>
      <StatusBar />
    </div>
  )
}
