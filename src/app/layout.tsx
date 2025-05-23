import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'  // This must be here
import { Sidebar } from '@/components/layout/Sidebar'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'BrainSort - Advanced Project Management',
  description: 'Modern project management tool inspired by Jira',
  icons: {
    icon: '/favicon.ico',
  },
  
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
            <Sidebar />
            <main className="flex-1 overflow-hidden">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  )
}