import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TopNav } from '@/components/layout/top-nav'
import { StatusBar } from '@/components/layout/status-bar'
import { ToastProvider } from '@/components/ui/toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'VoltusFreight WMS — Warehouse Management System',
  description: 'Professional Warehouse Management System for real-time inventory, order, logistics, and operations management.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f7' },
    { media: '(prefers-color-scheme: dark)', color: '#0e1117' },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider>
          <ToastProvider>
            <div className="flex flex-col h-screen overflow-hidden">
              <TopNav />
              <div className="flex-1 overflow-hidden mt-14 mb-10">
                {children}
              </div>
              <StatusBar />
            </div>
          </ToastProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
