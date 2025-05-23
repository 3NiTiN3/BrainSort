'use client'

import { useState } from 'react'
import { Search, Plus, LayoutGrid, Calendar, Table2, GitBranch } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CreateTaskModal } from '@/components/board/CreateTaskModal'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useTaskStore } from '@/hooks/useTaskStore'
import { cn } from '@/lib/utils'

export function Header() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { currentView, setCurrentView } = useTaskStore()

  const views = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'table', label: 'Table', icon: Table2 },
    { id: 'timeline', label: 'Timeline', icon: GitBranch },
  ]

  return (
    <>
      <header className="sticky top-0 z-30 bg-gray-900 border-b border-gray-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                  id="search-input"
                  type="text"
                  placeholder="Search tasks, projects, or team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg 
                           text-white placeholder-gray-500 focus:outline-none focus:border-primary 
                           focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationCenter />
              <Button variant="secondary">Quick Actions</Button>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} />
                Create Task
              </Button>
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="px-6 pb-4">
          <div className="flex items-center gap-2">
            {views.map((view) => (
              <button
                key={view.id}
                onClick={() => setCurrentView(view.id as any)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                  currentView === view.id
                    ? "bg-primary text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <view.icon size={16} />
                {view.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />
    </>
  )
}