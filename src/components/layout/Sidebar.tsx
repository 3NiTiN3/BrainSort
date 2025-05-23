'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  LayoutDashboard, 
  ListTodo, 
  Zap, 
  Code2, 
  TrendingUp,
  BarChart3,
  Menu,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    title: 'Planning',
    items: [
      { name: 'Board', href: '/', icon: LayoutDashboard },
      { name: 'Backlog', href: '/backlog', icon: ListTodo },
      { name: 'Sprints', href: '/sprints', icon: Zap },
    ],
  },
  {
    title: 'Development',
    items: [
      { name: 'Code', href: '/code', icon: Code2 },
      { name: 'Releases', href: '/releases', icon: TrendingUp },
    ],
  },
  {
    title: 'Analytics',
    items: [
      { name: 'Reports', href: '/reports', icon: BarChart3 },
      { name: 'Insights', href: '/insights', icon: TrendingUp },
    ],
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-900 border border-gray-800"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform lg:transform-none",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6">
            <div className="flex items-center gap-3 text-primary">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold">R</span>
              </div>
              <span className="text-2xl font-bold text-white">Rootzz</span>
            </div>
          </div>

          <nav className="flex-1 px-4 pb-4 space-y-8">
            {navigation.map((section) => (
              <div key={section.title}>
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
                <div className="mt-3 space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary text-white"
                            : "text-gray-400 hover:text-white hover:bg-gray-800"
                        )}
                      >
                        <item.icon size={20} />
                        <span className="font-medium">{item.name}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  )
}