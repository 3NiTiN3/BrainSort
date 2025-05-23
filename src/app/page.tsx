'use client'

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
import { Toaster } from 'react-hot-toast'

export default function HomePage() {
  const { currentView } = useTaskStore()
  useKeyboardShortcuts()

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
      <Toaster position="bottom-right" />
    </>
  )
}