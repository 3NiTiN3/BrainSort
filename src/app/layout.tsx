import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Providers } from './providers'
import { MobileNav } from '@/components/layout/MobileNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Rootzz - Advanced Project Management',
  description: 'Modern project management tool with real-time collaboration',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <Providers>
          <div className="flex h-screen bg-gray-950">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block">
              <Sidebar />
            </div>
            
            {/* Main Content */}
            <main className="flex-1 overflow-hidden flex flex-col">
              {children}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
          </div>
        </Providers>
      </body>
    </html>
  )
}