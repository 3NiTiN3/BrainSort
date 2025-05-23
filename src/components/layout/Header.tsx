'use client'

import { useState } from 'react'
import { Search, Plus, LayoutGrid, Calendar, Table2, GitBranch, LogOut, User, Settings } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CreateTaskModal } from '@/components/board/CreateTaskModal'
import { NotificationCenter } from '@/components/notifications/NotificationCenter'
import { useTaskStore } from '@/hooks/useTaskStore'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function Header() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const { currentView, setCurrentView } = useTaskStore()
  const { user, signOut } = useAuth()
  const router = useRouter()

  const views = [
    { id: 'board', label: 'Board', icon: LayoutGrid },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'table', label: 'Table', icon: Table2 },
    { id: 'timeline', label: 'Timeline', icon: GitBranch },
  ]

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const getUserInitials = () => {
    if (user?.email) {
      return user.email.split('@')[0].substring(0, 2).toUpperCase()
    }
    return 'U'
  }

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
              
              {/* User Menu */}
              <div className="relative">
                <button 
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getUserInitials()}
                  </div>
                  <span className="text-sm text-gray-300 hidden md:block">
                    {user?.email?.split('@')[0]}
                  </span>
                </button>
                
                {isUserMenuOpen && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-20">
                      <div className="p-2">
                        <div className="px-3 py-2 border-b border-gray-800">
                          <p className="text-sm font-medium text-white">
                            {user?.email?.split('@')[0]}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {user?.email}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => router.push('/profile')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors mt-1"
                        >
                          <User size={16} />
                          Profile
                        </button>
                        
                        <button
                          onClick={() => router.push('/settings')}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                        >
                          <Settings size={16} />
                          Settings
                        </button>
                        
                        <div className="border-t border-gray-800 mt-1 pt-1">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800 rounded transition-colors"
                          >
                            <LogOut size={16} />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
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