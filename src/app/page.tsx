'use client'

import { useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Board } from '@/components/board/Board'
import { CalendarView } from '@/components/views/CalendarView'
import { TableView } from '@/components/views/TableView'
import { TimelineView } from '@/components/views/TimelineView'
import { StatsGrid } from '@/components/stats/StatsGrid'
import { FilterBar } from '@/components/filters/FilterBar'
import { ActivityFeed } from '@/components/activity/ActivityFeed'
import { CommandPalette } from '@/components/CommandPalette'
import { useTaskStore } from '@/hooks/useTaskStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import { useAuth } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function HomePage() {
  const { user, loading: authLoading } = useAuth()
  const { currentView, fetchTasks, loading: tasksLoading, error } = useTaskStore()
  useKeyboardShortcuts()

  useEffect(() => {
    // Fetch tasks when user is authenticated
    if (user && !authLoading) {
      fetchTasks()
    }
  }, [user, authLoading, fetchTasks])

  // Show loading state
  if (authLoading || (user && tasksLoading)) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-400">Loading your workspace...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-center">
          <p className="text-red-500 mb-4">Error loading tasks: {error}</p>
          <button 
            onClick={() => fetchTasks()} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (currentView) {
      case 'calendar':
        return <CalendarView />
      case 'table':
        return <TableView />
      case 'timeline':
        return <TimelineView />
      default:
        return <Board />
    }
  }

  return (
    <>
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 overflow-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Sprint Board</h1>
              <p className="text-gray-400">Track and manage your current sprint tasks</p>
            </div>
            
            <StatsGrid />
            <FilterBar />
            
            {renderView()}
          </div>
        </div>

        {/* Right Sidebar - Activity Feed */}
        <aside className="w-80 bg-gray-950 border-l border-gray-800 p-4 overflow-y-auto hidden xl:block">
          <ActivityFeed />
        </aside>
      </div>

      <CommandPalette />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}