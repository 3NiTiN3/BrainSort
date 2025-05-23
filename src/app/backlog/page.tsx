'use client'

import { useState, useEffect } from 'react'
import { Plus, Filter, Search } from 'lucide-react'
import { useTaskStore } from '@/hooks/useTaskStore'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { CreateTaskModal } from '@/components/board/CreateTaskModal'
import { Task } from '@/lib/types'
import { cn } from '@/lib/utils'

export default function BacklogPage() {
  const { user } = useAuth()
  const { tasks, fetchTasks, loading } = useTaskStore()
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')

  useEffect(() => {
    if (user) {
      fetchTasks()
    }
  }, [user])

  // Filter tasks that are in backlog (todo status)
  const backlogTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    return task.status === 'todo' && matchesSearch && matchesPriority
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50'
      case 'high': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'medium': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Product Backlog</h1>
        <p className="text-gray-400">Manage and prioritize upcoming tasks</p>
      </div>

      {/* Filters and Actions */}
      <div className="mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input
              type="text"
              placeholder="Search backlog items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus size={16} />
            Add to Backlog
          </Button>
        </div>
      </div>

      {/* Backlog Items */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-400">Loading backlog...</div>
        ) : backlogTasks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400 mb-4">No items in backlog</p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus size={16} />
              Create First Task
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {backlogTasks.map((task) => (
              <div
                key={task.id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-gray-500 font-medium">{task.id}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded border font-semibold",
                        getPriorityColor(task.priority)
                      )}>
                        {task.priority.toUpperCase()}
                      </span>
                      {task.storyPoints && (
                        <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-400">
                          {task.storyPoints} SP
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium mb-2">{task.title}</h3>
                    {task.description && (
                      <p className="text-gray-400 text-sm mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      {task.labels.length > 0 && (
                        <div className="flex gap-2">
                          {task.labels.map((label) => (
                            <span key={label} className="px-2 py-1 bg-gray-800 rounded text-gray-400">
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                      {task.assignee && (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs font-bold text-white">
                            {task.assignee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-gray-400">{task.assignee.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      // Move to sprint functionality
                    }}
                  >
                    Move to Sprint
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateTaskModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        defaultStatus="todo"
      />
    </div>
  )
}