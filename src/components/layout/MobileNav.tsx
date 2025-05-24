'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ListTodo, 
  Zap, 
  BarChart3,
  Menu
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

const mobileNavigation = [
  { name: 'Board', href: '/', icon: LayoutDashboard },
  { name: 'Backlog', href: '/backlog', icon: ListTodo },
  { name: 'Sprints', href: '/sprints', icon: Zap },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Menu', href: '#', icon: Menu },
]

export function MobileNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      {/* Bottom Navigation for Mobile */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="grid grid-cols-5 h-16">
          {mobileNavigation.map((item) => {
            const isActive = pathname === item.href
            
            if (item.name === 'Menu') {
              return (
                <button
                  key={item.name}
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex flex-col items-center justify-center text-gray-400 hover:text-white"
                >
                  <item.icon size={20} />
                  <span className="text-xs mt-1">{item.name}</span>
                </button>
              )
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center",
                  isActive
                    ? "text-primary"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Menu Drawer */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-16 w-64 bg-gray-900 border-l border-gray-800 z-50 lg:hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Menu</h3>
              {/* Add additional menu items here */}
            </div>
          </div>
        </>
      )}
    </>
  )
}